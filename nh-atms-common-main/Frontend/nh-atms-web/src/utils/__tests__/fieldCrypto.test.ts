import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import forge from 'node-forge';
import { encryptField, fieldCryptoStatus, handleFieldCryptoError, resetFieldCrypto } from '@/utils/fieldCrypto';
import { setMockPublicKey } from '@/mocks/handlers/login';
import { AppError } from '@/api/errors';

/** 서버(FieldDecryptor)와 같은 방법으로 풀어 본다 — 형식·알고리즘(OAEP SHA-256/MGF1 SHA-256, AES-256-GCM)이 맞는지 */
const decrypt = (enc: string, priv: forge.pki.rsa.PrivateKey) => {
  const [prefix, kid, wrapped, iv, body] = enc.split('.');
  const aesKey = priv.decrypt(forge.util.decode64(wrapped), 'RSA-OAEP', { md: forge.md.sha256.create(), mgf1: { md: forge.md.sha256.create() } });
  const bytes = forge.util.decode64(body);
  const decipher = forge.cipher.createDecipher('AES-GCM', aesKey);
  decipher.start({ iv: forge.util.decode64(iv), tagLength: 128, tag: forge.util.createBuffer(bytes.slice(-16)) });
  decipher.update(forge.util.createBuffer(bytes.slice(0, -16)));
  expect(decipher.finish()).toBe(true);
  return { prefix, kid, plain: JSON.parse(forge.util.decodeUtf8(decipher.output.getBytes())) as { v: string; ts: number; n: string } };
};

describe('fieldCrypto — 비밀번호 암호화(node-forge)', () => {
  let keys: forge.pki.rsa.KeyPair;
  beforeAll(() => {
    keys = forge.pki.rsa.generateKeyPair({ bits: 1024, e: 0x10001 }); // 시험 속도 때문에 1024 (서버는 2048)
  });
  afterEach(() => {
    setMockPublicKey(null);
    resetFieldCrypto();
  });

  it('서버가 암호화를 켜면 ENC1 암호문을 만들고, 서버 방식으로 풀면 원래 값·시각·1회용 난수가 나온다', async () => {
    setMockPublicKey({ kid: 'test', publicKey: forge.pki.publicKeyToPem(keys.publicKey) });
    expect(await fieldCryptoStatus()).toEqual({ enabled: true, kid: 'test' });
    const enc = await encryptField('비밀번호!123');
    expect(enc.startsWith('ENC1.test.')).toBe(true);
    expect(enc.split('.')).toHaveLength(5);
    const { plain } = decrypt(enc, keys.privateKey);
    expect(plain.v).toBe('비밀번호!123');
    expect(Math.abs(plain.ts - Math.floor(Date.now() / 1000))).toBeLessThan(5);
    expect(plain.n).toMatch(/^[0-9a-f]{32}$/);
    expect(await encryptField('비밀번호!123')).not.toBe(enc); // 매번 다른 암호문(재전송 방지·난수)
  });

  it('서버가 암호화를 끄면 값을 그대로 돌려준다', async () => {
    expect(await encryptField('plain')).toBe('plain');
    expect((await fieldCryptoStatus()).enabled).toBe(false);
  });

  it('CRYPTO_* 오류면 공개키 캐시를 버린다', () => {
    expect(handleFieldCryptoError(new AppError('validation', 'x', { code: 'CRYPTO_KID' }))).toBe(true);
    expect(handleFieldCryptoError(new AppError('validation', 'x', { code: 'LGN_001' }))).toBe(false);
  });
});
