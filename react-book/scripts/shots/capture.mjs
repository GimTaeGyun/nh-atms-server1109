#!/usr/bin/env node
/**
 * 책에 실을 화면 그림을 한 번에 찍는다.
 *
 *   node scripts/shots/capture.mjs                 전부 (가짜 백엔드 + 개발 서버를 띄우고, 찍고, 끈다)
 *   node scripts/shots/capture.mjs --only notice   이름이 notice 로 시작하는 그림만 (쉼표로 여러 개: --only login,home)
 *   node scripts/shots/capture.mjs --list          찍을 그림 이름만 보여 준다
 *   node scripts/shots/capture.mjs --index         찍지 않고 INDEX.md 만 다시 만든다(CATALOG 설명을 고쳤을 때)
 *   node scripts/shots/capture.mjs --verbose       개발 서버·가짜 백엔드 출력도 함께 본다
 *
 * 결과: react-book/img/shots/<이름>.png, 목록 INDEX.md, 기록 manifest.json
 * 끝날 때 "모르는 /api 주소"가 1건이라도 있거나 장면이 실패하면 종료 코드 1.
 * 그림 목록(이름·설명·만드는 법)은 아래 CATALOG 한 곳에 있다 — INDEX.md 는 여기서 만든다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SHOTS_DIR, IDS, freePort, startAll, startVite, launch, login, openScreen, settle, shot, clearToasts, parkMouse } from './lib.mjs';

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const ONLY = (opt('--only') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
const VERBOSE = flag('--verbose');
const wants = (name) => ONLY.length === 0 || ONLY.some((p) => name.startsWith(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ================================================================== 그림 목록 */
const ADMIN = '관리자 99000101 김하늘';
const R = { login: '/login', home: '/home', notice: '/sample/notice', mcnInfo: '/sample/mcn-info', mcnModel: '/sample/mcn-model', common: '/sample/common-modules', fault: '/mgmt/fault-status' };
/** group: window(창 전체) | part(부품만 잘라 찍음) | extra(주문 목록에 없던 덤) */
const CATALOG = [
  /* ---------- 로그인 · 홈 · 시작 ---------- */
  { name: 'login', group: 'window', route: R.login, desc: '로그인 화면 첫 모습 — 왼쪽 로그인 카드(암호화 안내), 오른쪽 테스트 계정 표(저장소 그대로 "입력 필요" 6줄)와 공통 비밀번호 표시', how: '로그인하지 않고 / 로 들어감 → MeGate 가 /api/me 401 ME_002 를 받고 /login 으로 보냄 → 공개키를 받은 뒤 찍음' },
  { name: 'login-masked', group: 'extra', route: R.login, desc: 'login 과 같되 오른쪽 위 공통 비밀번호 글자만 ●●● 로 가림(찍을 때 화면 글자만 바꿈, 소스 수정 없음)', how: 'login 과 같은 상태에서 비밀번호 태그 글자를 바꾼 뒤 찍음' },
  { name: 'login-filled', group: 'extra', route: R.login, desc: '개인번호 99000101 과 비밀번호(점으로 가려짐)를 친 로그인 화면. 공통 비밀번호 표시는 가림', how: '개인번호·비밀번호 칸에 직접 입력(테스트 계정 줄은 CHANGE_ME 라 눌러도 채워지지 않음)' },
  { name: 'login-error', group: 'extra', route: R.login, desc: '로그인 실패 — 서버 문구 "개인번호 또는 비밀번호를 확인하세요."(400 LGN_001) 빨간 알림', how: '없는 개인번호 000000000 으로 [로그인]' },
  { name: 'home-login-toast', group: 'extra', route: R.home, desc: '로그인 직후 홈 — 위쪽 가운데 초록 알림 "로그인되었습니다."(서버 문구 S012)가 떠 있음', how: `${ADMIN} 로 [로그인] → 홈으로 넘어온 직후` },
  { name: 'home', group: 'window', route: R.home, desc: '홈 — 인사말과 견본 화면 바로가기 카드 4개. 왼쪽은 아이콘 줄(1280 폭에서는 메뉴 패널이 접힌 상태가 기본)', how: `${ADMIN} 로그인 → 알림이 사라진 뒤` },
  { name: 'boot-loading', group: 'extra', route: R.home, desc: '앱 시작 중 — MeGate 가 /api/me 를 기다리는 동안의 "사용자 정보를 확인하는 중…" 로딩', how: '/api/me 응답을 2.5초 늦춘 뒤(브라우저 쪽에서 가로챔) /home 진입 직후' },
  { name: 'boot-backend-down', group: 'extra', route: R.home, desc: '백엔드가 꺼져 있을 때 — MeGate 오류 화면 "사용자 정보를 확인할 수 없습니다", 그 아래 "처리 중 오류가 발생했습니다. 반복되면 시스템 관리자에게 문의하세요."(응답코드 줄 없음) + [다시 시도]', how: '/api 프록시 대상이 죽은 포트인 개발 서버를 따로 띄워 /home 진입(프록시가 500 을 돌려줌)' },

  /* ---------- 레이아웃 ---------- */
  { name: 'layout-tabs', group: 'window', route: R.mcnInfo, desc: '탭 3개(홈·공지사항·기기정보)가 열린 모습 — 활성 탭은 기기정보(조회 결과 있음). 헤더·아이콘 줄·열린 탭 줄·본문', how: `${ADMIN} 로그인 → 공지사항 열고 [조회] → 기기정보 열고 [조회]` },
  { name: 'layout-panel', group: 'window', route: R.notice, desc: '왼쪽 메뉴 패널을 펼쳐 고정한 모습(1280×800) — 헤더, 메뉴 패널(즐겨찾기·견본 메뉴 4개·사용자·환경설정), 열린 탭 줄, 본문(공지 목록). 패널을 고정하면 아이콘 줄은 사라진다. 1280 폭에서는 본문 최소 폭(1050)이 모자라 오른쪽 30px 쯤이 잘린다(실제 동작) — 잘리지 않은 그림은 layout-panel-1440·layout-wide', how: '탭 3개 상태에서 공지사항 탭 → 아이콘 줄 맨 위 [»](패널 펼치기) 클릭' },
  { name: 'layout-panel-1440', group: 'extra', route: R.notice, desc: '창 1440×900 의 기본 모습(화면 구조 그림용으로 권함) — 창이 1366 이상이라 메뉴 패널이 처음부터 펼쳐져 있고 본문이 잘리지 않는다. 헤더에 시스템 이름도 보인다', how: `창 1440×900, ${ADMIN} 로그인 → 공지사항 [조회]` },
  { name: 'layout-flyout', group: 'extra', route: R.notice, desc: '패널을 접은 상태에서 아이콘 줄 "견본"에 마우스를 올려 메뉴가 옆으로 튀어나온 모습 — 헤더·아이콘 줄·튀어나온 메뉴 패널·탭 줄·본문이 한 장에', how: '패널 [«](패널 접기) → 아이콘 줄 "견본" 위에 마우스' },
  { name: 'layout-wide', group: 'extra', route: R.notice, desc: '넓은 창(1920×1080)에서의 기본 모습 — 메뉴 패널이 처음부터 펼쳐져 있고 헤더에 시스템 이름·검색 범위 콤보(전체)까지 다 보인다', how: `창 1920×1080, ${ADMIN} 로그인 → 공지사항 [조회]` },
  { name: 'tab-context-menu', group: 'extra', route: R.mcnInfo, desc: '열린 탭을 마우스 오른쪽 버튼으로 눌렀을 때의 메뉴(이 탭 닫기·다른 탭 모두 닫기·오른쪽 탭 닫기·전체 닫기)', how: '탭 3개 상태에서 "공지사항" 탭 오른쪽 클릭' },
  { name: 'global-search', group: 'window', route: R.notice, desc: '헤더 화면 검색에 "기기"를 친 모습 — 검색 결과 (2): 기기정보·기기모델코드, 일치 글자 강조와 경로 표시', how: '헤더 검색 칸에 "기기" 입력(드롭다운이 열린 상태)' },
  { name: 'settings-drawer', group: 'extra', route: R.notice, desc: '환경설정 서랍(오른쪽에서 나옴) — 창 1440×900', how: '창 1440×900 에서 메뉴 패널 아래 [환경설정] 클릭' },

  /* ---------- 공지사항 ---------- */
  { name: 'notice-initial', group: 'window', route: R.notice, desc: '공지사항을 막 연 모습(조회 전) — 조회조건 기본값(작성일 최근 1개월, 내 사무소), 표에는 "조회 조건을 입력하고 [조회]를 누르세요."', how: `${ADMIN} 로그인 → /sample/notice` },
  { name: 'notice-list', group: 'window', route: R.notice, desc: '[조회] 뒤 전체 모습 — 공지 목록 (45건) 1쪽 20줄과 맨 아래 페이지 줄(총 45건 · 1 2 3 · 20개씩 보기)까지. 20줄이 800 높이에 다 안 들어가 창 높이를 늘려 찍음', how: '조회조건 그대로 [조회] → 본문이 스크롤 없이 다 보이게 창 높이만 늘림' },
  { name: 'notice-list-top', group: 'extra', route: R.notice, desc: 'notice-list 와 같은 상태를 1280×800 창 그대로(스크롤 안 함) — 14번째 줄쯤에서 잘린다', how: '[조회] 직후 그대로' },
  { name: 'notice-list-bottom', group: 'extra', route: R.notice, desc: '같은 상태에서 본문을 맨 아래로 내린 모습(1280×800) — 마지막 줄들과 페이지 줄. 표 머리줄이 위에 붙어 따라오는데, 머리줄 위 16px 틈으로 지나가는 줄이 조금 비쳐 보인다(앱의 실제 모습)', how: '[조회] → 본문 영역을 맨 아래로 스크롤' },
  { name: 'notice-page2', group: 'extra', route: R.notice, desc: '2쪽으로 넘긴 모습(순번 21~40) — 창 높이 늘려 찍음', how: '페이지 줄에서 2 클릭' },
  { name: 'notice-selected', group: 'window', route: R.notice, desc: '첫 두 줄을 체크한 모습 — "공지 목록 (45건) 2건 선택", [삭제]가 켜지고 [수정]은 꺼짐(1건일 때만 켜짐)', how: '[조회] → 1·2번째 줄 체크' },
  { name: 'notice-delete-confirm', group: 'window', route: R.notice, desc: '[삭제]를 눌러 확인 풍선 "선택한 2건을 삭제하시겠습니까?"(취소·확인)가 뜬 모습', how: '두 줄 체크 → [삭제] 클릭' },
  { name: 'notice-view', group: 'window', route: R.notice, desc: '상세 팝업 "공지사항 상세" — 제목·번호·사무소·작성자·작성일·조회수·최종변경·내용, 아래 [닫기][수정]', how: '첫 줄의 제목 클릭(GET /api/notice/{no}?hit=Y — 조회수 +1)' },
  { name: 'notice-edit', group: 'window', route: R.notice, desc: '수정 팝업 "공지사항 수정" — 제목·사무소·작성자·내용이 채워져 있고 바이트 수 표시, [닫기][저장]', how: '첫 줄만 체크 → [수정]' },
  { name: 'notice-new', group: 'window', route: R.notice, desc: '등록 팝업 "공지사항 등록" 빈 폼 — 사무소는 내 사무소, 작성자는 로그인 사용자', how: '[등록] 클릭' },
  { name: 'notice-new-invalid', group: 'window', route: R.notice, desc: '등록 팝업에서 아무것도 안 쓰고 [저장] — 칸 아래 빨간 검증 문구("제목을 입력하세요." 등)', how: '[등록] → 바로 [저장]' },
  { name: 'notice-new-filled', group: 'extra', route: R.notice, desc: '등록 팝업에 제목·내용을 쓴 모습(저장 직전)', how: '[등록] → 제목·내용 입력' },
  { name: 'notice-toast', group: 'window', route: R.notice, desc: '등록 성공 직후 — 위쪽 가운데 초록 알림 "등록되었습니다."(서버 문구 S002), 팝업이 닫히고 목록 맨 위에 새 글(46건)', how: '등록 팝업에서 제목·내용 입력 → [저장]' },
  { name: 'notice-delete-toast', group: 'extra', route: R.notice, desc: '삭제 성공 직후 — 알림 "2건 삭제되었습니다."(S005), 목록이 다시 읽힘', how: '두 줄 체크 → [삭제] → [확인]' },
  { name: 'notice-search-keyword', group: 'extra', route: R.notice, desc: '검색구분 "제목" + 검색어 "점검" 으로 조회한 결과(검색어 칸이 켜짐)', how: '검색구분 콤보에서 제목 선택 → 검색어 "점검" → [조회]' },
  { name: 'notice-empty', group: 'extra', route: R.notice, desc: '결과가 없을 때 — "공지 목록 (0건)", 표에 "검색된 데이터가 없습니다."', how: '검색구분 제목 + 검색어 "없는말" → [조회]' },
  { name: 'notice-office-modal', group: 'extra', route: R.notice, desc: '조회조건 사무소 칸의 돋보기로 연 "사무소 검색" 팝업(16곳, 8줄씩)', how: '사무소 칸 오른쪽 돋보기 버튼 클릭' },
  { name: 'notice-daterange-open', group: 'extra', route: R.notice, desc: '작성일 칸을 눌러 달력이 열린 모습 — 왼쪽 빠른선택(오늘·1주·1개월·3개월)', how: '작성일 칸 클릭' },
  { name: 'notice-readonly', group: 'window', route: R.notice, desc: '조회 전용 사용자(99000303 박서진)의 공지사항 — 한 줄을 체크해도 [등록][수정][삭제]가 모두 흐림(관리자는 켜짐: notice-selected·part-actionbar-selected 와 비교)', how: '99000303 으로 로그인 → 공지사항 [조회] → 첫 줄 체크' },
  { name: 'notice-readonly-tooltip', group: 'extra', route: R.notice, desc: '조회 전용 사용자가 흐린 [등록] 위에 마우스를 올린 모습 — 툴팁 "권한이 없습니다."', how: 'notice-readonly 상태에서 [등록] 위에 마우스' },
  { name: 'notice-readonly-view', group: 'extra', route: R.notice, desc: '조회 전용 사용자의 상세 팝업 — [수정] 버튼이 흐림', how: '99000303 로그인 → 제목 클릭' },

  /* ---------- 기기정보 · 기기모델코드 · 공통 모듈 · 장애현황 ---------- */
  { name: 'mcn-info-initial', group: 'extra', route: R.mcnInfo, desc: '기기정보를 막 연 모습 — [목록][등록] 탭, 버튼줄, 조회조건 7개(2줄 + 필터 펼침)', how: `${ADMIN} 로그인 → /sample/mcn-info` },
  { name: 'mcn-info-list', group: 'window', route: R.mcnInfo, desc: '기기정보 [목록] 탭 조회 결과(22건) — 왼쪽 고정 칸(순번·사무소·기번), 코너·기종·기기사 등', how: '조회조건 그대로(가람지점, 사용여부 Y) [조회]' },
  { name: 'mcn-info-list-full', group: 'extra', route: R.mcnInfo, desc: 'mcn-info-list 를 페이지 줄까지 다 보이게 창 높이를 늘려 찍음', how: '[조회] → 창 높이만 늘림' },
  { name: 'mcn-info-selected', group: 'extra', route: R.mcnInfo, desc: '한 줄을 클릭해 고른 모습 — 줄이 강조되고 "1건 선택", [삭제]가 켜짐', how: '[조회] → 3번째 줄 클릭' },
  { name: 'mcn-info-edit', group: 'window', route: R.mcnInfo, desc: '기기정보 [수정] 탭 — 3열 폼(사무소·기번은 잠김), 최초등록·최종변경, 아래 [수정][삭제][목록]', how: '목록에서 3번째 줄 더블클릭' },
  { name: 'mcn-info-new', group: 'extra', route: R.mcnInfo, desc: '기기정보 [등록] 탭 — 빈 폼(사무소 = 내 사무소, 사용여부 Y), 아래 [등록][목록]', how: '목록 탭에서 [등록] 클릭' },
  { name: 'mcn-model', group: 'window', route: R.mcnModel, desc: '기기모델코드 — 왼쪽 기기사 3곳(모델 수), 오른쪽은 고른 기기사([10] 가상테크)의 모델 편집 표(행추가·행삭제·저장·취소)', how: `${ADMIN} 로그인 → /sample/mcn-model → [조회] → 왼쪽 첫 줄 클릭` },
  { name: 'mcn-model-initial', group: 'extra', route: R.mcnModel, desc: '기기모델코드를 막 연 모습(조회 전)', how: '/sample/mcn-model 진입 직후' },
  { name: 'mcn-model-editing', group: 'extra', route: R.mcnModel, desc: '표에서 바로 고치는 중 — 한 줄 추가(기기구분·모델코드·모델명 입력)하고 기존 줄의 모델명을 바꿈. 변경 내역 요약과 [저장] 켜짐', how: '[행추가] → 새 줄 입력, 첫 줄 모델명 수정' },
  { name: 'mcn-model-saved', group: 'extra', route: R.mcnModel, desc: '일괄 저장 직후 — 알림 "저장되었습니다."(S001)', how: 'mcn-model-editing 상태에서 [저장]' },
  { name: 'common-modules', group: 'window', route: R.common, desc: '공통 모듈 화면 첫 탭(날짜) — 탭 6개(날짜·콤보·팝업·표·출력·권한·메시지)', how: `${ADMIN} 로그인 → /sample/common-modules` },
  ...[['date', '날짜', '날짜 부품(단일일자·기간+빠른선택·년월·년도·시각…)과 휴일 표시'], ['combo', '콤보', '공통 조회 API 콤보(사무소→기번·코너·인원, 기기사→모델, 공통코드, 있는 값, 사용여부), 개인번호·금액 입력'], ['popup', '팝업', '검색 팝업 3종·상세 팝업·입력 팝업·주소·원문 열람·결재 견본'], ['grid', '표', '표 부품 견본 — DataGrid(G1·G2·G3), EditableGrid, MasterDetailGrids, MatrixGrid, 행 명령 버튼, 목록/편집 탭(자료는 소스 안 demoData)'], ['output', '출력', '엑셀 다운로드·인쇄·마스킹 표시·첨부파일·파일 올리기 견본'], ['auth', '권한·메시지', '나(/api/me)·화면 권한 5개·권한 미리보기·표준 버튼 12종·메시지 라인·서버 문구·확인창 문구·자동 새로고침·표시 부품(StatusTag·KpiCard 등)']].flatMap(([key, label, what]) => [
    { name: `common-modules-${key}`, group: 'window', route: R.common, desc: `공통 모듈 [${label}] 탭 — ${what}. 1280×800 창 그대로(윗부분만)`, how: `[${label}] 탭 클릭` },
    { name: `common-modules-${key}-full`, group: 'extra', route: R.common, desc: `공통 모듈 [${label}] 탭 전체(창 높이를 늘려 끝까지)`, how: `[${label}] 탭 클릭 → 창 높이만 늘림` },
  ]),
  { name: 'popup-office-search', group: 'extra', route: R.common, desc: '공통 "사무소 검색" 팝업(GET /api/lookup/offices)', how: '공통 모듈 [팝업] 탭 → [사무소 검색]' },
  { name: 'popup-person-search', group: 'extra', route: R.common, desc: '공통 "인원 검색" 팝업(GET /api/lookup/persons?ofcCode=) — 내 사무소 6명', how: '공통 모듈 [팝업] 탭 → [인원 검색]' },
  { name: 'popup-mcn-search', group: 'extra', route: R.common, desc: '공통 "기기 검색" 팝업(GET /api/lookup/machines?ofcCode=)', how: '공통 모듈 [팝업] 탭 → [기기 검색]' },
  { name: 'error-toast', group: 'extra', route: R.common, desc: '서버 오류 문구가 빨간 알림으로 뜬 모습 — "조회할 수 없는 항목입니다. (unknown)"(400 LKP_002). 화면 코드에는 try/catch 가 없다', how: '공통 모듈 [권한·메시지] 탭 → [400 LKP_002 부르기]' },
  { name: 'perm-preview-qry', group: 'extra', route: R.common, desc: '권한 미리보기를 "조회만"으로 바꾼 시연 카드 — 표준 버튼 12종 중 저장·등록·수정·삭제·긴급이 흐려지고, 권한 버튼·숨김형 버튼·AuthGuard 문구도 바뀜', how: '[권한·메시지] 탭 → 권한 미리보기 "조회만" 선택(그 시연 카드만 잘라 찍음)' },
  { name: 'fault-status', group: 'window', route: R.fault, desc: '장애현황 — 조회 뒤 격자 보기(기기 카드: 정상·운영장애·기기장애·통신단절·미개국), 위에 집계 줄', how: `${ADMIN} 로그인 → /mgmt/fault-status → [조회]` },
  { name: 'fault-status-full', group: 'extra', route: R.fault, desc: 'fault-status 를 카드 22장이 다 보이게 창 높이를 늘려 찍음', how: '[조회] → 창 높이만 늘림' },
  { name: 'fault-status-list', group: 'extra', route: R.fault, desc: '장애현황 목록 보기 — 코너별 묶음 줄, 상태 알약, 줄마다 실행 버튼 4개(1280 폭에서는 표 오른쪽이 잘려 버튼이 2개쯤만 보임)', how: '[조회] → 오른쪽 위 "목록 보기"' },
  { name: 'fault-status-selected', group: 'extra', route: R.fault, desc: '격자 보기에서 카드 2장을 고른 모습 — "2건 선택", 위쪽 명령 버튼(일반리셋 등)이 켜짐', how: '[조회] → 카드 2장 클릭' },

  /* ---------- 부품만 ---------- */
  { name: 'part-header', group: 'part', route: R.mcnInfo, desc: '앱 헤더만 — 로고·환경 배지(LOCAL)·1뎁스 메뉴(홈·종합 관리·견본)·화면 검색·사용자·로그아웃. 1280 폭에서는 시스템 이름이 숨는다', how: 'layout-tabs 상태에서 .app-header 만' },
  { name: 'part-header-wide', group: 'extra', route: R.notice, desc: '넓은 창(1920)의 헤더 — 시스템 이름 "자동화기기 종합관리시스템"과 검색 범위 콤보(전체)가 보인다(시스템 이름은 1440 이상, 검색 범위는 1760 이상에서만 보임)', how: 'layout-wide 상태에서 .app-header 만' },
  { name: 'part-opentabbar', group: 'part', route: R.mcnInfo, desc: '열린 탭 줄만 — 홈(고정)·공지사항·기기정보(활성, ×), 오른쪽 [전체 닫기]', how: 'layout-tabs 상태에서 .app-tabbar 만' },
  { name: 'part-sidepanel', group: 'part', route: R.notice, desc: '메뉴 패널만 — 즐겨찾기 상자, "견본" 제목과 접기 버튼, 화면 4개(공지사항 활성), 아래 사용자 카드·환경설정', how: 'layout-panel 상태에서 .app-panel 만' },
  { name: 'part-iconrail', group: 'extra', route: R.notice, desc: '아이콘 줄만(패널을 접었을 때) — 펼치기 버튼, 홈·종합관리·견본, 아래 즐겨찾기·검색·사용자', how: '패널을 접은 상태에서 .app-rail 만' },
  { name: 'part-global-search', group: 'extra', route: R.notice, desc: '화면 검색 칸과 열린 결과 목록만', how: 'global-search 상태에서 검색 칸 + 드롭다운만' },
  { name: 'part-pageframe-title', group: 'part', route: R.notice, desc: '화면 머리(PageFrame)만 — 경로(견본 > 공지사항), 제목·즐겨찾기 별, 마지막 업데이트·새로고침, 버튼줄', how: '공지사항 [조회] 뒤 .page-crumb + .page-title-row 만' },
  { name: 'part-searchform', group: 'part', route: R.notice, desc: '조회조건 폼(SearchForm)만 — 작성일·사무소·작성자·검색구분·검색어, 오른쪽 [조회]', how: '공지사항 조회 전 .search-panel 만' },
  { name: 'part-actionbar', group: 'part', route: R.notice, desc: '표준 버튼줄(ActionBar)만 — 조회·엑셀·출력·등록·수정·삭제. 줄을 고르지 않아 수정·삭제는 꺼져 있음', how: '공지사항 [조회] 뒤 제목 줄 오른쪽 버튼 묶음만' },
  { name: 'part-actionbar-selected', group: 'extra', route: R.notice, desc: '버튼줄 — 한 줄을 체크해 수정·삭제까지 모두 켜진 모습(관리자)', how: '공지사항 [조회] → 첫 줄 체크' },
  { name: 'part-actionbar-writer', group: 'extra', route: R.notice, desc: '버튼줄 — 권한 T 사용자(99000202 이도윤): 한 줄을 체크하면 수정은 켜지지만 삭제는 권한이 없어 흐림', how: '99000202 로그인 → 공지사항 [조회] → 첫 줄 체크' },
  { name: 'part-actionbar-readonly', group: 'extra', route: R.notice, desc: '버튼줄 — 조회 전용 사용자: 등록·수정·삭제가 모두 흐림', how: 'notice-readonly 상태에서 버튼 묶음만' },
  { name: 'part-resultheader', group: 'part', route: R.notice, desc: '결과 머리(ResultHeader)만 — "공지 목록 (45건)" + 안내문 + [엑셀 다운로드]', how: '공지사항 [조회] 뒤 .result-header 만' },
  { name: 'part-resultheader-selected', group: 'extra', route: R.notice, desc: '결과 머리 — 두 줄을 체크해 "2건 선택"이 붙은 모습', how: '두 줄 체크 뒤 .result-header 만' },
  { name: 'part-datagrid', group: 'part', route: R.notice, desc: '표(DataGrid)만 — 머리줄·체크 칸·20줄과 페이지 줄(총 45건 · ‹ 이전 1 2 3 다음 › · 20개씩 보기)', how: '공지사항 [조회] 뒤 .data-grid 만(창 높이를 늘려 끝까지)' },
  { name: 'part-pagination', group: 'extra', route: R.notice, desc: '표 아래 페이지 줄만', how: '공지사항 [조회] 뒤 .grid-foot 만' },
  { name: 'part-toast-success', group: 'extra', route: R.notice, desc: '초록 성공 알림만 — "등록되었습니다."', how: 'notice-toast 상태에서 알림만' },
  { name: 'part-popconfirm', group: 'extra', route: R.notice, desc: '삭제 확인 풍선만 — "선택한 2건을 삭제하시겠습니까?" [취소][확인]', how: 'notice-delete-confirm 상태에서 풍선과 [삭제] 버튼만' },
];
const CAT = new Map(CATALOG.map((c) => [c.name, c]));

if (flag('--list')) {
  for (const c of CATALOG) if (wants(c.name)) console.log(`${c.name.padEnd(30)} ${c.group.padEnd(7)} ${c.desc}`);
  process.exit(0);
}

/* ================================================================== 작은 도우미 */
// (--index 처리는 아래 writeIndex 정의 뒤에 있다)
const searchBtn = (screen) => screen.locator('.search-panel button[type="submit"]').first();
const rows = (screen) => screen.locator('.ant-table-tbody > tr.ant-table-row');
/** [조회]를 누르고 줄이 보일 때까지 */
const search = async (page, screen, { expectRows = true } = {}) => {
  await searchBtn(screen).click();
  if (expectRows) await rows(screen).first().waitFor({ state: 'visible', timeout: 15_000 });
  await settle(page);
};
const modal = (page, title) => page.locator('.ant-modal-wrap:visible .ant-modal', { hasText: title }).first();
const openModal = async (page, title) => {
  const m = modal(page, title);
  await m.waitFor({ state: 'visible', timeout: 10_000 });
  await settle(page);
  return m;
};
const closeModal = async (page, m) => {
  await m.locator('.ant-modal-close').click();
  await m.waitFor({ state: 'hidden', timeout: 10_000 });
  await settle(page);
};
const checkRow = (screen, i) => rows(screen).nth(i).locator('input[type="checkbox"]').check();
const uncheckRow = (screen, i) => rows(screen).nth(i).locator('input[type="checkbox"]').uncheck();
const scrollContent = (page, where) => page.locator('.app-content').evaluate((el, w) => el.scrollTo(0, w === 'bottom' ? el.scrollHeight : 0), where);
const actionBar = (screen) => screen.locator('.page-actions .ant-space').first();
/** 글자가 정확히 name 인 버튼(antd 버튼은 아이콘 이름이 접근성 이름에 섞여 getByRole exact 가 안 맞는다) */
const btn = (scope, name) => scope.locator('button').filter({ hasText: new RegExp(`^\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`) }).first();

/* ================================================================== 장면 */
/** 장면 = 브라우저 한 번(로그인 한 번)으로 이어서 찍는 묶음. shots = 이 장면이 만드는 그림 이름 */
const SCENES = [
  {
    id: 'login',
    shots: ['login', 'login-masked', 'login-filled', 'login-error', 'home-login-toast', 'home'],
    async run({ open, snap }) {
      const { page } = await open({ login: false });
      await page.goto('/');
      await page.locator('.login-page').waitFor({ state: 'visible' });
      await page.locator('[data-testid="crypto-status"]').waitFor({ state: 'visible' });
      await page.locator('#perNo').blur(); // 자동 포커스 테두리 없이
      await snap(page, 'login');
      // 공통 비밀번호 글자만 가린다(화면 글자만 바꿈 — 소스는 그대로)
      await page.evaluate(() => {
        const tag = document.querySelector('[data-testid="test-accounts"] .ant-card-extra .ant-tag');
        if (tag) tag.textContent = '●●●●●●●●';
      });
      await snap(page, 'login-masked');
      await page.locator('#perNo').fill(IDS.full);
      await page.locator('#password').fill('mock-pass');
      await page.locator('#password').blur();
      await snap(page, 'login-filled');
      await page.locator('#perNo').fill('000000000');
      await page.locator('.login-page button[type="submit"]').click();
      await page.locator('.ant-message-error').first().waitFor({ state: 'visible' });
      await snap(page, 'login-error');
      await clearToasts(page);
      await login(page, { id: IDS.full, keepToast: true });
      await snap(page, 'home-login-toast');
      await clearToasts(page);
      await snap(page, 'home');
    },
  },
  {
    id: 'boot',
    shots: ['boot-loading', 'boot-backend-down'],
    async run({ open, snap, mock, appDir }) {
      if (wants('boot-loading')) {
        const { page } = await open();
        await page.route('**/api/me', async (route) => {
          await sleep(2500);
          await route.continue().catch(() => undefined);
        });
        await page.goto('/home', { waitUntil: 'commit' });
        await page.getByText('사용자 정보를 확인하는 중').waitFor({ state: 'visible', timeout: 15_000 });
        await page.evaluate(() => document.fonts.ready.then(() => true));
        await sleep(300);
        await snap(page, 'boot-loading', { wait: false });
        await page.locator('.app-shell').waitFor({ state: 'visible', timeout: 15_000 });
      }
      if (wants('boot-backend-down')) {
        // 백엔드가 꺼진 것과 같은 상황: /api 프록시 대상이 아무도 듣지 않는 포트
        const dead = await freePort(mock.port + 500);
        const vite2 = await startVite({ appDir, port: await freePort(3500), apiTarget: `http://127.0.0.1:${dead}`, quiet: !VERBOSE });
        try {
          const { page } = await open({ login: false, baseURL: vite2.url });
          await page.goto('/home');
          await page.locator('[data-testid="me-error"]').waitFor({ state: 'visible', timeout: 30_000 });
          await snap(page, 'boot-backend-down');
        } finally {
          await vite2.stop();
        }
      }
    },
  },
  {
    id: 'layout',
    shots: ['layout-tabs', 'part-opentabbar', 'part-header', 'tab-context-menu', 'layout-panel', 'part-sidepanel', 'layout-flyout', 'part-iconrail', 'global-search', 'part-global-search'],
    async run({ open, snap }) {
      const { page } = await open();
      const notice = await openScreen(page, R.notice);
      await search(page, notice);
      const mcn = await openScreen(page, R.mcnInfo);
      await search(page, mcn);
      await snap(page, 'layout-tabs');
      await snap(page, 'part-opentabbar', { locator: '.app-tabbar', padding: 0 });
      await snap(page, 'part-header', { locator: '.app-header', padding: 0 });

      await page.locator('.open-tab', { hasText: '공지사항' }).click({ button: 'right' });
      await page.locator('.ant-dropdown:visible .ant-dropdown-menu').waitFor({ state: 'visible' });
      await snap(page, 'tab-context-menu', { keepMouse: true });
      await page.keyboard.press('Escape');
      await page.locator('.app-content').click({ position: { x: 600, y: 500 } });
      await page.locator('.ant-dropdown:visible').waitFor({ state: 'hidden' }).catch(() => undefined);

      await openScreen(page, R.notice);
      await snap(page, 'part-iconrail', { locator: '.app-rail', padding: 0 });
      await page.getByRole('button', { name: '패널 펼치기' }).click();
      await page.locator('.app-panel:not(.flyout)').waitFor({ state: 'visible' });
      await snap(page, 'layout-panel');
      await snap(page, 'part-sidepanel', { locator: '.app-panel', padding: 0 });

      await page.getByRole('button', { name: '패널 접기' }).click();
      await page.locator('.app-rail').waitFor({ state: 'visible' });
      await parkMouse(page);
      await settle(page);
      await page.locator('.rail-btn', { hasText: '견본' }).hover();
      await page.locator('.app-panel.flyout').waitFor({ state: 'visible' });
      await snap(page, 'layout-flyout', { keepMouse: true });
      await parkMouse(page);
      await page.locator('.app-panel.flyout').waitFor({ state: 'hidden' }).catch(() => undefined);

      await page.locator('#global-screen-search').click();
      await page.locator('#global-screen-search').fill('기기');
      await page.locator('.gs-popup').waitFor({ state: 'visible' });
      await page.locator('.gs-item').first().waitFor({ state: 'visible' });
      await snap(page, 'global-search');
      await snap(page, 'part-global-search', { locator: ['.global-search', '.gs-popup'], padding: 10 });
      await page.keyboard.press('Escape');
    },
  },
  {
    id: 'layout-wide',
    shots: ['layout-wide', 'part-header-wide', 'layout-panel-1440', 'settings-drawer'],
    async run({ open, snap }) {
      if (wants('layout-wide') || wants('part-header-wide')) {
        const { page } = await open({ width: 1920, height: 1080 });
        const notice = await openScreen(page, R.notice);
        await search(page, notice);
        await snap(page, 'layout-wide');
        await snap(page, 'part-header-wide', { locator: '.app-header', padding: 0 });
      }
      const { page } = await open({ width: 1440, height: 900 });
      const notice = await openScreen(page, R.notice);
      await search(page, notice);
      await snap(page, 'layout-panel-1440');
      await page.locator('.panel-settings').click();
      await page.locator('.ant-drawer-content-wrapper').waitFor({ state: 'visible' });
      await snap(page, 'settings-drawer');
    },
  },
  {
    id: 'notice',
    shots: [
      'notice-initial', 'part-searchform', 'notice-daterange-open', 'notice-office-modal', 'notice-list', 'notice-list-top', 'notice-list-bottom', 'part-pageframe-title', 'part-actionbar', 'part-resultheader',
      'part-datagrid', 'part-pagination', 'notice-page2', 'notice-selected', 'part-resultheader-selected', 'notice-delete-confirm', 'part-popconfirm', 'part-actionbar-selected', 'notice-view', 'notice-edit', 'notice-new', 'notice-new-invalid',
      'notice-new-filled', 'notice-toast', 'part-toast-success', 'notice-delete-toast', 'notice-search-keyword', 'notice-empty',
    ],
    async run({ open, snap }) {
      const { page } = await open();
      const s = await openScreen(page, R.notice);
      await snap(page, 'notice-initial');
      await snap(page, 'part-searchform', { locator: s.locator('.search-panel') });

      // 달력(빠른선택)
      await s.locator('.search-panel .ant-picker-range').click();
      await page.locator('.ant-picker-dropdown:visible .ant-picker-presets').waitFor({ state: 'visible' });
      await snap(page, 'notice-daterange-open');
      await page.keyboard.press('Escape');
      await s.locator('.page-title h1').click();
      await page.locator('.ant-picker-dropdown:visible').waitFor({ state: 'hidden' }).catch(() => undefined);

      // 사무소 검색 팝업
      await s.locator('.search-panel').getByRole('button', { name: '사무소 검색' }).click();
      let m = await openModal(page, '사무소 검색');
      await m.locator('.ant-table-row').first().waitFor({ state: 'visible' });
      await m.locator('input').first().blur();
      await snap(page, 'notice-office-modal');
      await closeModal(page, m);

      // 조회
      await search(page, s);
      await snap(page, 'notice-list', { tall: true });
      await snap(page, 'notice-list-top');
      await snap(page, 'part-pageframe-title', { locator: [s.locator('.page-crumb'), s.locator('.page-title-row')] });
      await snap(page, 'part-actionbar', { locator: actionBar(s) });
      await snap(page, 'part-resultheader', { locator: s.locator('.result-header') });
      await snap(page, 'part-datagrid', { locator: s.locator('.data-grid'), tall: true });
      await snap(page, 'part-pagination', { locator: s.locator('.grid-foot'), tall: true });
      await scrollContent(page, 'bottom');
      await snap(page, 'notice-list-bottom');
      await scrollContent(page, 'top');

      // 2쪽
      await s.locator('.grid-foot .ant-pagination-item-2').click();
      await s.locator('.ant-table-tbody > tr.ant-table-row >> text=/^21$/').first().waitFor({ state: 'visible' });
      await snap(page, 'notice-page2', { tall: true });
      await s.locator('.grid-foot .ant-pagination-item-1').click();
      await rows(s).first().locator('td', { hasText: /^1$/ }).first().waitFor({ state: 'visible' });
      await settle(page);
      await scrollContent(page, 'top');

      // 한 줄 선택 → 버튼줄
      await checkRow(s, 0);
      await snap(page, 'part-actionbar-selected', { locator: actionBar(s) });
      // 두 줄 선택
      await checkRow(s, 1);
      await snap(page, 'notice-selected');
      await snap(page, 'part-resultheader-selected', { locator: s.locator('.result-header') });
      // 삭제 확인
      await btn(actionBar(s), '삭제').click();
      const pop = page.locator('.ant-popconfirm:visible');
      await pop.waitFor({ state: 'visible' });
      await snap(page, 'notice-delete-confirm');
      await snap(page, 'part-popconfirm', { locator: [pop, btn(actionBar(s), '삭제')], padding: 10 });
      await pop.getByRole('button', { name: '취소' }).click();
      await pop.waitFor({ state: 'hidden' });
      await uncheckRow(s, 1);
      await uncheckRow(s, 0);

      // 상세
      await rows(s).first().locator('a.ant-typography').click();
      m = await openModal(page, '공지사항 상세');
      await m.locator('.detail-grid').waitFor({ state: 'visible' });
      await snap(page, 'notice-view');
      await closeModal(page, m);

      // 수정
      await checkRow(s, 0);
      await btn(actionBar(s), '수정').click();
      m = await openModal(page, '공지사항 수정');
      await m.getByLabel('제목').waitFor({ state: 'visible' });
      await m.getByLabel('제목').blur();
      await snap(page, 'notice-edit');
      await closeModal(page, m);
      await uncheckRow(s, 0);

      // 등록
      await btn(actionBar(s), '등록').click();
      m = await openModal(page, '공지사항 등록');
      await m.getByLabel('제목').waitFor({ state: 'visible' });
      await snap(page, 'notice-new');
      await btn(m, '저장').click();
      await m.locator('.ant-form-item-explain-error').first().waitFor({ state: 'visible' });
      await snap(page, 'notice-new-invalid');
      await m.getByLabel('제목').fill('3호기 화면 보호 필름 교체 안내');
      await m.getByLabel('내용').fill('3호기 화면 보호 필름이 낡아 새것으로 바꿉니다.\n\n1. 일시: 이번 주 금요일 영업 종료 뒤\n2. 대상: 영업점 365코너 3호기\n3. 내용: 작업 20분 동안 3호기를 세웁니다. 옆 기기 이용을 안내해 주세요.');
      await m.getByLabel('내용').blur();
      await snap(page, 'notice-new-filled');
      await btn(m, '저장').click();
      await page.locator('.ant-message-success').first().waitFor({ state: 'visible' });
      await m.waitFor({ state: 'hidden' });
      await snap(page, 'notice-toast');
      await snap(page, 'part-toast-success', { locator: page.locator('.ant-message-notice-content').first(), padding: 12, wait: false });
      await clearToasts(page);

      // 삭제(2건) → 알림
      await checkRow(s, 1);
      await checkRow(s, 2);
      await btn(actionBar(s), '삭제').click();
      await pop.waitFor({ state: 'visible' });
      await pop.getByRole('button', { name: '확인' }).click();
      await page.locator('.ant-message-success').first().waitFor({ state: 'visible' });
      await snap(page, 'notice-delete-toast');
      await clearToasts(page);

      // 검색구분 + 검색어
      await s.locator('.search-panel .ant-form-item', { hasText: '검색구분' }).locator('.ant-select').click();
      await page.locator('.ant-select-dropdown:visible .ant-select-item-option', { hasText: /^제목$/ }).click();
      await s.getByLabel('검색어').fill('점검');
      await search(page, s);
      await snap(page, 'notice-search-keyword');
      await s.getByLabel('검색어').fill('없는말');
      await search(page, s, { expectRows: false });
      await s.locator('.grid-empty').waitFor({ state: 'visible' });
      await snap(page, 'notice-empty');
    },
  },
  {
    id: 'notice-readonly',
    shots: ['notice-readonly', 'part-actionbar-readonly', 'notice-readonly-tooltip', 'notice-readonly-view'],
    async run({ open, snap }) {
      const { page } = await open({ id: IDS.readonly });
      const s = await openScreen(page, R.notice);
      await search(page, s);
      await checkRow(s, 0);
      await snap(page, 'notice-readonly');
      await snap(page, 'part-actionbar-readonly', { locator: actionBar(s) });
      await actionBar(s).locator('.auth-denied', { hasText: '등록' }).hover();
      await page.locator('.ant-tooltip:visible', { hasText: '권한이 없습니다.' }).waitFor({ state: 'visible' });
      await snap(page, 'notice-readonly-tooltip', { keepMouse: true });
      await parkMouse(page);
      await uncheckRow(s, 0);
      await rows(s).first().locator('a.ant-typography').click();
      const m = await openModal(page, '공지사항 상세');
      await m.locator('.detail-grid').waitFor({ state: 'visible' });
      await snap(page, 'notice-readonly-view');
    },
  },
  {
    id: 'notice-writer',
    shots: ['part-actionbar-writer'],
    async run({ open, snap }) {
      const { page } = await open({ id: IDS.write });
      const s = await openScreen(page, R.notice);
      await search(page, s);
      await checkRow(s, 0);
      await snap(page, 'part-actionbar-writer', { locator: actionBar(s) });
    },
  },
  {
    id: 'mcn-info',
    shots: ['mcn-info-initial', 'mcn-info-list', 'mcn-info-list-full', 'mcn-info-selected', 'mcn-info-edit', 'mcn-info-new'],
    async run({ open, snap }) {
      const { page } = await open();
      const s = await openScreen(page, R.mcnInfo);
      await snap(page, 'mcn-info-initial');
      await search(page, s);
      await snap(page, 'mcn-info-list');
      await snap(page, 'mcn-info-list-full', { tall: true });
      await rows(s).nth(2).locator('td').nth(3).click();
      await snap(page, 'mcn-info-selected');
      await rows(s).nth(2).locator('td').nth(3).dblclick();
      await s.getByLabel('기번 입력').waitFor({ state: 'visible' });
      await snap(page, 'mcn-info-edit');
      await btn(s, '목록').click();
      await rows(s).first().waitFor({ state: 'visible' });
      await settle(page);
      await btn(s.locator('.ant-tabs-tabpane-active'), '등록').click();
      await s.getByLabel('기번 입력').waitFor({ state: 'visible' });
      await snap(page, 'mcn-info-new');
    },
  },
  {
    id: 'mcn-model',
    shots: ['mcn-model-initial', 'mcn-model', 'mcn-model-editing', 'mcn-model-saved'],
    async run({ open, snap }) {
      const { page } = await open();
      const s = await openScreen(page, R.mcnModel);
      await snap(page, 'mcn-model-initial');
      await search(page, s);
      await rows(s).first().click();
      const grid = s.locator('.editable-grid');
      await grid.locator('.ant-table-row').first().waitFor({ state: 'visible' });
      await snap(page, 'mcn-model');
      // 표에서 바로 고치기
      await btn(grid, '행추가').click();
      await settle(page);
      const added = grid.locator('tr.row-added').first();
      await added.waitFor({ state: 'visible' });
      await added.getByLabel('기기구분').fill('05');
      await added.getByLabel('모델코드').fill('N1');
      await added.getByLabel('모델명').fill('가상 ATM-3000');
      const firstName = grid.locator('.ant-table-tbody > tr.ant-table-row:not(.row-added)').first().getByLabel('모델명');
      await firstName.fill('가상 ATM-1000 (구형)');
      await firstName.blur();
      await snap(page, 'mcn-model-editing');
      await btn(grid, '저장').click();
      await page.locator('.ant-message-success').first().waitFor({ state: 'visible' });
      await snap(page, 'mcn-model-saved');
    },
  },
  {
    id: 'common-modules',
    shots: ['common-modules', ...['date', 'combo', 'popup', 'grid', 'output', 'auth'].flatMap((k) => [`common-modules-${k}`, `common-modules-${k}-full`]), 'popup-office-search', 'popup-person-search', 'popup-mcn-search', 'error-toast', 'perm-preview-qry'],
    async run({ open, snap }) {
      const { page } = await open();
      const s = await openScreen(page, R.common);
      await s.locator('.ant-tabs-tab-active').waitFor({ state: 'visible' });
      await snap(page, 'common-modules');
      const tabs = [['date', '날짜'], ['combo', '콤보'], ['popup', '팝업'], ['grid', '표'], ['output', '출력'], ['auth', '권한·메시지']];
      for (const [key, label] of tabs) {
        await s.locator('.ant-tabs-nav').first().locator('.ant-tabs-tab-btn', { hasText: new RegExp(`^${label}$`) }).click();
        await s.locator('.ant-tabs-tab-active', { hasText: label }).first().waitFor({ state: 'visible' });
        await settle(page);
        await scrollContent(page, 'top');
        await snap(page, `common-modules-${key}`);
        await snap(page, `common-modules-${key}-full`, { tall: true });
        if (key === 'popup') {
          for (const [name, button, title] of [['popup-office-search', '사무소 검색', '사무소 검색'], ['popup-person-search', '인원 검색', '인원 검색'], ['popup-mcn-search', '기기 검색', '기기 검색']]) {
            await btn(s, button).click();
            const m = await openModal(page, title);
            await m.locator('.ant-table-row').first().waitFor({ state: 'visible' });
            await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
            await snap(page, name);
            await closeModal(page, m);
          }
        }
        if (key === 'auth') {
          await s.locator('.ant-radio-button-wrapper', { hasText: '조회만' }).click();
          await settle(page);
          await snap(page, 'perm-preview-qry', { locator: s.locator('.panel', { hasText: '권한 미리보기 + 표준 버튼 12종' }).first(), tall: true });
          await s.locator('.ant-radio-button-wrapper', { hasText: '실제 권한' }).click();
          await btn(s, '400 LKP_002 부르기').scrollIntoViewIfNeeded();
          await btn(s, '400 LKP_002 부르기').click();
          await page.locator('.ant-message-error').first().waitFor({ state: 'visible' });
          await snap(page, 'error-toast');
        }
      }
    },
  },
  {
    id: 'fault-status',
    shots: ['fault-status', 'fault-status-full', 'fault-status-selected', 'fault-status-list'],
    async run({ open, snap }) {
      const { page } = await open();
      const s = await openScreen(page, R.fault);
      await searchBtn(s).click();
      await s.locator('.atm-card').first().waitFor({ state: 'visible' });
      await snap(page, 'fault-status');
      await snap(page, 'fault-status-full', { tall: true });
      await s.locator('.atm-card').nth(1).click();
      await s.locator('.atm-card').nth(3).click();
      await snap(page, 'fault-status-selected');
      await s.locator('.atm-card').nth(1).click();
      await s.locator('.atm-card').nth(3).click();
      await s.locator('.view-toggle').getByText('목록 보기').click();
      await rows(s).first().waitFor({ state: 'visible' });
      await snap(page, 'fault-status-list');
    },
  },
];

/* ================================================================== 실행 */
const declared = new Set(SCENES.flatMap((sc) => sc.shots));
for (const c of CATALOG) if (!declared.has(c.name)) throw new Error(`CATALOG 의 ${c.name} 을 찍는 장면이 없습니다`);
for (const n of declared) if (!CAT.has(n)) throw new Error(`장면이 찍는 ${n} 이 CATALOG 에 없습니다`);

const MANIFEST = path.join(SHOTS_DIR, 'manifest.json');
const DEBUG_DIR = path.join(ROOT, 'dist', 'shots-debug');
const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
const taken = [];
const failures = [];
const consoleLog = [];

const writeIndex = () => {
  // 목록에서 빠진 옛 기록은 버린다
  for (const k of Object.keys(manifest)) if (!CAT.has(k) || !fs.existsSync(path.join(SHOTS_DIR, `${k}.png`))) delete manifest[k];
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  const row = (c) => {
    const m = manifest[c.name];
    const size = m ? `${m.width}×${m.height}` : '(아직 없음)';
    const kb = m ? `${Math.round(m.bytes / 1024)}KB` : '';
    return `| \`${c.name}.png\` | ${size} | ${kb} | ${c.desc} | \`${c.route}\` | ${c.how} |`;
  };
  const table = (group) => ['| 파일 | 크기(px) | 용량 | 무엇이 보이나 | 화면(주소) | 만든 방법 |', '|---|---|---|---|---|---|', ...CATALOG.filter((c) => c.group === group).map(row)].join('\n');
  const md = `# 화면 그림 목록 (img/shots)

> 이 파일은 \`node scripts/shots/capture.mjs\` 가 만든다. 손으로 고치지 말고 \`scripts/shots/capture.mjs\` 의 CATALOG 를 고친 뒤 다시 돌린다.
> 원고에서는 \`![설명](img/shots/<파일>)\` 로 쓴다.

## 찍은 환경

- 앱: \`nh-atms-common-main/Frontend/nh-atms-web\` 을 임시 폴더에 복사해 \`npm run dev\`(개발 모드 — 헤더에 \`LOCAL\` 배지)로 띄움. 소스는 고치지 않았다.
- 서버: 가짜 백엔드 \`scripts/shots/mock-api.mjs\` (진짜 백엔드·DB 없음). **화면 속 사람 이름·개인번호·사무소·업체·기종·공지 내용은 모두 지어낸 것**이다.
- 브라우저: Chromium(Playwright), 창 1280×800, 배율 2 → 창 전체 그림은 **2560×1600px**. 한국어, 서울 시간대. "창 높이를 늘려 찍음"이라고 적힌 그림만 세로가 더 길다. 창 1440×900 그림은 2880×1800px, 1920×1080 그림은 3840×2160px.
- 1280 폭에서는 왼쪽 메뉴 패널이 **접힌 것이 기본**이다(창이 1366 미만이면 접힘). 그래서 대부분의 그림 왼쪽에는 아이콘 줄만 있다. 펼친 모습은 \`layout-panel\`·\`layout-panel-1440\`·\`layout-wide\`.
- 1280 폭에서는 헤더의 시스템 이름("자동화기기 종합관리시스템")과 검색 범위 콤보가 숨는다(CSS 가 시스템 이름은 1440 미만, 검색 범위는 1760 미만에서 숨김). 보이는 모습은 \`part-header-wide\`·\`layout-wide\`.
- 날짜는 찍은 날 기준이다(공지 작성일·기본 조회 기간 "최근 1개월"이 찍는 날에 따라 바뀐다).
- 로그인 계정(가짜 백엔드): \`99000101\` 김하늘(관리자, 버튼 전부), \`99000202\` 이도윤(조회·등록·수정), \`99000303\` 박서진(조회 전용). 비밀번호는 아무 글자나.

## 주의해서 고를 것

- \`login.png\` 에는 저장소 소스(\`testAccounts.ts\`)에 적힌 **공통 테스트 비밀번호 글자가 그대로** 보인다. 책에 싣기 꺼려지면 그 글자만 가린 \`login-masked.png\` 를 쓴다.
- 헤더 로고는 저장소의 \`public/nh-logo.png\` 그대로다.
- 공통 모듈 [표]·[출력]·[팝업] 탭의 표 자료는 가짜 백엔드가 아니라 **프론트 소스 안 견본 자료**(\`commonModules/demoData.ts\`)다. 거기 적힌 사무소·업체 이름은 소스에 있는 그대로다.
- 장애현황은 프론트만 있는 잠정 화면이다(백엔드·API 계약 없음). 가짜 백엔드가 \`domain/fault.ts\` 모양에 맞춰 지어낸 값을 준다.
- 기기정보·장애현황 목록처럼 옆으로 긴 표는 1280 폭에서 오른쪽이 잘리고, 화면 아래쪽에 회색 가로 스크롤 막대가 줄 위에 겹쳐 떠 있다(antd 표의 "붙어 다니는 스크롤 막대" — 앱의 실제 모습이며 그림이 깨진 것이 아니다).
- 알림(초록·빨강 풍선)은 3초 뒤 사라진다. 알림이 필요한 그림은 이름에 \`toast\` 가 들어 있는 것뿐이고, 나머지는 사라진 뒤에 찍었다.

## 창 전체 그림 (주문 목록)

${table('window')}

## 부품만 잘라 찍은 그림 (주문 목록)

${table('part')}

## 덤으로 찍은 그림

${table('extra')}

## 주문 목록에 있었지만 만들지 않은 것

없음. 주문한 그림은 모두 앱에 있는 화면·부품이라 전부 찍었다.
단, 이름과 내용이 주문과 조금 다른 것:

- \`layout-panel\`: 주문은 "헤더·아이콘 줄·메뉴 패널·탭 줄·본문"이 한 장에 보이는 그림이었지만, 이 앱은 **패널을 펼쳐 고정하면 아이콘 줄이 사라진다**(아이콘 줄은 패널을 접었을 때만 나온다). 그래서 \`layout-panel\` 은 고정된 패널, 다섯 가지가 한 장에 다 보이는 것은 \`layout-flyout\`(아이콘 줄 + 마우스를 올려 튀어나온 패널)이다. 또 1280 폭에서 패널을 고정하면 본문 오른쪽이 조금 잘리므로(실제 동작) 구조 설명 그림으로는 \`layout-panel-1440\` 을 권한다.
- \`notice-list\`·\`part-datagrid\`: 20줄과 페이지 줄이 800 높이에 함께 들어가지 않아 창 높이를 늘려 찍었다. 800 높이 그대로는 \`notice-list-top\`·\`notice-list-bottom\`.
- \`common-modules\` 와 \`common-modules-date\` 는 같은 모습이다(첫 탭이 날짜).
`;
  fs.writeFileSync(path.join(SHOTS_DIR, 'INDEX.md'), md);
};

if (flag('--index')) {
  writeIndex();
  console.log(`[shots] ${path.relative(ROOT, path.join(SHOTS_DIR, 'INDEX.md'))} 를 다시 만들었습니다(그림 ${Object.keys(manifest).length}장 기록).`);
  process.exit(0);
}

const main = async () => {
  const todo = SCENES.filter((sc) => sc.shots.some(wants));
  if (!todo.length) {
    console.error(`--only ${ONLY.join(',')} 에 맞는 그림이 없습니다. --list 로 이름을 확인하세요.`);
    process.exit(1);
  }
  const t0 = Date.now();
  // 프론트 사본 준비 + 가짜 백엔드(8080~) + 개발 서버(3100~). 포트가 쓰이고 있으면 다음 빈 포트
  const { appDir, mock, vite } = await startAll({ quiet: !VERBOSE });
  console.log(`[shots] 가짜 백엔드 ${mock.url} · 개발 서버 ${vite.url} · 그림 ${todo.reduce((n, sc) => n + sc.shots.filter(wants).length, 0)}장 (${((Date.now() - t0) / 1000).toFixed(1)}초에 준비)`);

  let stopping = false;
  const browsers = new Set();
  const cleanup = async () => {
    if (stopping) return;
    stopping = true;
    for (const b of browsers) await b.close().catch(() => undefined);
    await vite.stop().catch(() => undefined);
    await mock.stop().catch(() => undefined);
  };
  for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => void cleanup().then(() => process.exit(130)));

  try {
    for (const sc of todo) {
      mock.reset(); // 장면마다 자료를 처음 상태로(앞 장면의 등록·삭제가 섞이지 않게)
      const opened = [];
      const ctx = {
        mock,
        vite,
        appDir,
        /** 브라우저 한 개를 열고(기본: 관리자로 로그인) 돌려준다 */
        open: async ({ id = IDS.full, login: doLogin = true, width, height, baseURL = vite.url } = {}) => {
          const b = await launch({ baseURL, width, height });
          browsers.add(b.browser);
          opened.push(b);
          if (doLogin) await login(b.page, { id });
          return b;
        },
        /** 이름이 --only 에 맞을 때만 찍고 기록한다 */
        snap: async (page, name, opts = {}) => {
          if (!CAT.has(name)) throw new Error(`CATALOG 에 없는 이름: ${name}`);
          if (!wants(name)) return null;
          const r = await shot(page, name, opts);
          const bytes = fs.statSync(r.file).size;
          manifest[name] = { width: r.width, height: r.height, bytes, capturedAt: new Date().toISOString() };
          taken.push(name);
          console.log(`  ✓ ${name}.png  ${r.width}×${r.height}  ${Math.round(bytes / 1024)}KB`);
          return r;
        },
      };
      const ts = Date.now();
      console.log(`[shots] 장면 ${sc.id}`);
      try {
        await sc.run(ctx);
      } catch (e) {
        failures.push({ scene: sc.id, error: String(e?.stack ?? e) });
        console.error(`  ✗ 장면 ${sc.id} 실패: ${String(e?.message ?? e).split('\n')[0]}`);
        fs.mkdirSync(DEBUG_DIR, { recursive: true });
        for (const [i, b] of opened.entries()) await b.page.screenshot({ path: path.join(DEBUG_DIR, `${sc.id}-${i}-error.png`) }).catch(() => undefined);
      }
      for (const b of opened) {
        for (const c of b.consoleErrors) consoleLog.push({ scene: sc.id, ...c });
        await b.browser.close().catch(() => undefined);
        browsers.delete(b.browser);
      }
      console.log(`         ${((Date.now() - ts) / 1000).toFixed(1)}초`);
    }
  } finally {
    writeIndex();
    await cleanup();
  }

  /* ---------- 보고 ---------- */
  const missing = todo.flatMap((sc) => sc.shots.filter(wants)).filter((n) => !taken.includes(n));
  console.log(`\n[shots] 찍은 그림 ${taken.length}장 · ${((Date.now() - t0) / 1000).toFixed(1)}초 · 목록 ${path.relative(ROOT, path.join(SHOTS_DIR, 'INDEX.md'))}`);
  if (missing.length) console.log(`[shots] 못 찍은 그림: ${missing.join(', ')}`);
  const errors4xx = mock.requests.filter((r) => r.status >= 400);
  if (errors4xx.length) {
    const by = new Map();
    for (const r of errors4xx) by.set(`${r.method} ${r.path} → ${r.status} ${r.code}`, (by.get(`${r.method} ${r.path} → ${r.status} ${r.code}`) ?? 0) + 1);
    console.log('[shots] 가짜 백엔드가 오류로 답한 요청(의도한 것인지 확인):');
    for (const [k, n] of by) console.log(`         ${k}  ×${n}`);
  }
  if (consoleLog.length) {
    const by = new Map();
    for (const c of consoleLog) {
      const k = `[${c.type}] ${c.text.split('\n')[0].slice(0, 200)}`;
      const e = by.get(k) ?? { n: 0, scenes: new Set() };
      e.n += 1;
      e.scenes.add(c.scene);
      by.set(k, e);
    }
    console.log('[shots] 브라우저 콘솔 오류·경고:');
    for (const [k, e] of by) console.log(`         ×${e.n} (${Array.from(e.scenes).join(', ')}) ${k}`);
  } else console.log('[shots] 브라우저 콘솔 오류·경고 없음');
  const reloads = vite.lines.filter((l) => /optimized dependencies changed|page reload|new dependencies optimized/i.test(l));
  if (reloads.length) console.log(`[shots] 개발 서버가 도중에 새로고침을 일으켰습니다(그림을 다시 확인):\n         ${reloads.join('\n         ')}`);
  if (mock.unknown.length) {
    console.error(`[shots] !!! 가짜 백엔드에 없는 /api 주소 ${mock.unknown.length}건 — mock-api.mjs 에 추가하세요:`);
    for (const u of mock.unknown) console.error(`         ${u.method} ${u.path}${u.query}`);
  } else console.log('[shots] 모르는 /api 주소 0건');
  for (const f of failures) console.error(`\n[shots] 장면 ${f.scene} 실패\n${f.error}`);
  process.exit(failures.length || mock.unknown.length || missing.length ? 1 : 0);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
