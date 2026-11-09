/**
 * 화면↔서버 민감필드 암호화 (HTTPS 미적용 환경) — API 계약 §7
 * [원본] nh-atms-server NH-ATMS `src/utils/fieldCrypto.ts` — 공개키 호출만 이 저장소 방식(`loginApi`)으로 바꿈.
 *
 * 필드값 = "ENC1.<kid>.<b64 RSA-OAEP-SHA256(AES키)>.<b64 IV>.<b64 AES-256-GCM 암호문+태그>"
 * 평문   = {"v": 값, "ts": 서버기준 epoch초, "n": 1회용 난수}  (서버가 시각·중복으로 재전송을 막음)
 *
 * 비유: 편지(값)를 일회용 자물쇠(AES 키)로 잠그고, 그 열쇠만 서버 공개키 봉투(RSA)에 넣어 보낸다. 봉투는 서버만 연다.
 * http 화면에서는 브라우저 crypto.subtle 을 쓸 수 없어 node-forge 로 암호화한다.
 * (난수는 forge 가 crypto.getRandomValues 를 사용 — 이것은 http 에서도 동작)
 */
import forge from 'node-forge';
import { loginApi } from '@/api/endpoints/login';
import { AppError } from '@/api/errors';

interface CachedKey {
  enabled: boolean;
  kid?: string;
  key?: forge.pki.rsa.PublicKey;
  clockOffset: number; // 서버시각 - 화면시각 (초)
}

let cached: Promise<CachedKey> | null = null;

const nowSec = () => Math.floor(Date.now() / 1000);

function loadKey(): Promise<CachedKey> {
  if (!cached) {
    cached = loginApi
      .publicKey()
      .then((info) => ({
        enabled: info.enabled,
        kid: info.kid,
        key: info.enabled && info.publicKey ? forge.pki.publicKeyFromPem(info.publicKey) : undefined,
        clockOffset: info.serverTime - nowSec(),
      }))
      .catch((e: unknown) => {
        cached = null;
        throw e;
      });
  }
  return cached;
}

/** 서버 키가 바뀌었을 때(CRYPTO_KID 등) 공개키를 다시 받도록 캐시를 버린다. */
export function resetFieldCrypto(): void {
  cached = null;
}

/** 오류가 암호화 관련(CRYPTO_*)이면 캐시를 버리고 true. 화면은 사용자에게 다시 시도하게 한다(문구는 서버가 띄움). */
export function handleFieldCryptoError(error: unknown): boolean {
  const code = error instanceof AppError ? error.code : undefined;
  if (typeof code === 'string' && code.startsWith('CRYPTO_')) {
    resetFieldCrypto();
    return true;
  }
  return false;
}

/** 지금 서버가 암호화를 쓰는지와 키 버전 — 화면 안내용 */
export async function fieldCryptoStatus(): Promise<{ enabled: boolean; kid?: string }> {
  const k = await loadKey();
  return { enabled: k.enabled && !!k.key, kid: k.kid };
}

/** 값을 ENC1 형식으로 암호화한다. 서버가 암호화를 끈 경우(enabled=false) 원래 값을 그대로 돌려준다. */
export async function encryptField(value: string): Promise<string> {
  if (!value) return value;
  const k = await loadKey();
  if (!k.enabled || !k.key || !k.kid) return value;

  const plain = JSON.stringify({
    v: value,
    ts: nowSec() + k.clockOffset,
    n: forge.util.bytesToHex(forge.random.getBytesSync(16)),
  });

  const aesKey = forge.random.getBytesSync(32);
  const iv = forge.random.getBytesSync(12);
  const cipher = forge.cipher.createCipher('AES-GCM', aesKey);
  cipher.start({ iv, tagLength: 128 });
  cipher.update(forge.util.createBuffer(forge.util.encodeUtf8(plain)));
  cipher.finish();
  const encrypted = cipher.output.getBytes() + cipher.mode.tag.getBytes();

  // OAEP 해시·MGF1 모두 SHA-256 (서버 FieldDecryptor.OAEP_SHA256 과 같아야 함)
  const wrapped = k.key.encrypt(aesKey, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
    mgf1: { md: forge.md.sha256.create() },
  });

  return ['ENC1', k.kid, forge.util.encode64(wrapped), forge.util.encode64(iv), forge.util.encode64(encrypted)].join('.');
}
