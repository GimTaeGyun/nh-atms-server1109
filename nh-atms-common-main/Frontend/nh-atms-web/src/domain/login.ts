/**
 * 로그인 + 민감필드 암호화 — API 계약 §7 와 글자까지 같게.
 * 백엔드: web/login/dto/LoginRequest·LoginResult, atms-common security/crypto FieldPublicKeyProvider
 */

/** GET /api/auth/public-key — enabled=false 면 화면은 평문으로 보낸다 */
export interface PublicKeyInfo {
  enabled: boolean;
  /** 서버 시각(epoch 초) — 화면 시계 보정용 */
  serverTime: number;
  kid?: string;
  alg?: string;
  /** RSA 공개키 PEM */
  publicKey?: string;
}

/** POST /api/auth/login 본문 — password 는 ENC1 암호문(암호화를 끈 서버면 평문) */
export interface LoginRequest {
  perNo: string;
  password: string;
}

/** POST /api/auth/login 응답 data */
export interface LoginResult {
  perNo: string;
  name: string;
}
