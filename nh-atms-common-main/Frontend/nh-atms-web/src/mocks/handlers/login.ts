import { http } from 'msw';
import type { LoginRequest, LoginResult, PublicKeyInfo } from '@/domain/login';
import { MOCK_ME } from './me';
import { LATENCY, fail, ok } from './_util';

/**
 * 로그인 견본 목 — 계약 §7. 목은 기본으로 암호화를 끈 서버처럼 답한다(enabled=false → 화면은 평문 전송).
 * 테스트는 setMockPublicKey 로 시험용 공개키를 넣어 암호화 경로를 확인한다.
 * 문구는 api-messages.tsv 와 같은 글(S012·S013·LGN_001).
 */
let mockKey: { kid: string; publicKey: string } | null = null;
export const setMockPublicKey = (v: { kid: string; publicKey: string } | null): void => {
  mockKey = v;
};

/** 목에서 로그인 실패를 시연하는 개인번호 */
export const MOCK_LOGIN_FAIL_PERNO = '000000000';
export const LGN_001_MESSAGE = '개인번호 또는 비밀번호를 확인하세요.';

/** 테스트용: 마지막으로 받은 로그인 본문(비밀번호가 암호문으로 왔는지 확인) */
export let lastLoginBody: LoginRequest | null = null;

export const loginHandlers = [
  http.get('/api/auth/public-key', async () => {
    await LATENCY();
    const body: PublicKeyInfo = mockKey
      ? { enabled: true, serverTime: Math.floor(Date.now() / 1000), kid: mockKey.kid, alg: 'RSA-OAEP-256/A256GCM', publicKey: mockKey.publicKey }
      : { enabled: false, serverTime: Math.floor(Date.now() / 1000) };
    return ok(body);
  }),
  http.post('/api/auth/login', async ({ request }) => {
    await LATENCY();
    const body = (await request.json()) as LoginRequest;
    lastLoginBody = body;
    if (!body.perNo || !body.password || body.perNo === MOCK_LOGIN_FAIL_PERNO) return fail(400, LGN_001_MESSAGE, 'LGN_001');
    const r: LoginResult = { perNo: body.perNo, name: MOCK_ME.name, loginEnabled: false };
    return ok(r, '로그인되었습니다.');
  }),
  http.post('/api/auth/logout', async () => {
    await LATENCY();
    return ok(null, '로그아웃되었습니다.');
  }),
];
