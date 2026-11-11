/**
 * 로그인 화면 옆에 보여 줄 테스트 계정 6명 (2026-11-11 사용자 결정: 화면 코드에 직접 적는다).
 *
 * ▶ 채우는 곳: 폐쇄망 내부 Gitea 사본에서만 아래 perNo 의 'CHANGE_ME_n' 을 실제 개인번호로 바꾼다.
 *   GitHub 에는 개인번호를 올리지 않는다(CLAUDE.md "비밀값(DB 비밀번호·개인번호·키)은 저장소에 넣지 않는다").
 *   'CHANGE_ME' 로 시작하는 줄은 화면에서 "개인번호 입력 필요"로 흐리게 보이고 클릭해도 채워지지 않는다.
 * ▶ 로그인되려면: 그 개인번호가 개발 DB TB_INSA 에 있어야 한다. 메뉴·버튼 권한은 TB_SCR_AUTH(권한코드 A·T·L)
 *   → TB_SCR_AUTH_MENU 를 따른다(db/seed/03_test_user_auth.sql). 아래 note 는 화면 안내용 메모일 뿐 권한을 정하지 않는다.
 * ▶ 비밀번호: 모두 TEST_PASSWORD 하나(잠정 Q-17 — TO-BE 테이블에 비밀번호 컬럼이 없음).
 *   서버 web/login/service/InsaLoginVerifier.TEST_PASSWORD 와 같아야 한다. 바꾸면 두 곳을 같이 바꾼다.
 */
export const TEST_PASSWORD = 'atms1234!';

export interface TestAccount {
  /** 개인번호 TB_INSA.PER_NO */
  perNo: string;
  /** 화면 표시용 이름(예: 관리자1). 실제 이름은 로그인 뒤 TB_INSA.NAME 으로 나온다 */
  label: string;
  /** 안내 메모 — 이 계정으로 무엇을 확인하나 */
  note: string;
}

export const TEST_ACCOUNTS: readonly TestAccount[] = [
  { perNo: 'CHANGE_ME_1', label: '관리자 1', note: '권한 A — 전체 메뉴·모든 버튼' },
  { perNo: 'CHANGE_ME_2', label: '관리자 2', note: '권한 A — 전체 메뉴·모든 버튼' },
  { perNo: 'CHANGE_ME_3', label: '업무 담당 1', note: '권한 T — 조회·등록·수정 (삭제·실행 안 됨)' },
  { perNo: 'CHANGE_ME_4', label: '업무 담당 2', note: '권한 T — 조회·등록·수정 (삭제·실행 안 됨)' },
  { perNo: 'CHANGE_ME_5', label: '조회 전용 1', note: '권한 L — 조회만' },
  { perNo: 'CHANGE_ME_6', label: '조회 전용 2', note: '권한 L — 조회만' },
];

/** 아직 실제 개인번호를 넣지 않은 줄인지 */
export const isPlaceholder = (a: TestAccount): boolean => a.perNo.indexOf('CHANGE_ME') === 0;
