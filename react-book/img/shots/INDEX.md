# 화면 그림 목록 (img/shots)

> 이 파일은 `node scripts/shots/capture.mjs` 가 만든다. 손으로 고치지 말고 `scripts/shots/capture.mjs` 의 CATALOG 를 고친 뒤 다시 돌린다.
> 원고에서는 `![설명](img/shots/<파일>)` 로 쓴다.

## 찍은 환경

- 앱: `nh-atms-common-main/Frontend/nh-atms-web` 을 임시 폴더에 복사해 `npm run dev`(개발 모드 — 헤더에 `LOCAL` 배지)로 띄움. 소스는 고치지 않았다.
- 서버: 가짜 백엔드 `scripts/shots/mock-api.mjs` (진짜 백엔드·DB 없음). **화면 속 사람 이름·개인번호·사무소·업체·기종·공지 내용은 모두 지어낸 것**이다.
- 브라우저: Chromium(Playwright), 창 1280×800, 배율 2 → 창 전체 그림은 **2560×1600px**. 한국어, 서울 시간대. "창 높이를 늘려 찍음"이라고 적힌 그림만 세로가 더 길다. 창 1440×900 그림은 2880×1800px, 1920×1080 그림은 3840×2160px.
- 1280 폭에서는 왼쪽 메뉴 패널이 **접힌 것이 기본**이다(창이 1366 미만이면 접힘). 그래서 대부분의 그림 왼쪽에는 아이콘 줄만 있다. 펼친 모습은 `layout-panel`·`layout-panel-1440`·`layout-wide`.
- 1280 폭에서는 헤더의 시스템 이름("자동화기기 종합관리시스템")과 검색 범위 콤보가 숨는다(CSS 가 시스템 이름은 1440 미만, 검색 범위는 1760 미만에서 숨김). 보이는 모습은 `part-header-wide`·`layout-wide`.
- 날짜는 찍은 날 기준이다(공지 작성일·기본 조회 기간 "최근 1개월"이 찍는 날에 따라 바뀐다).
- 로그인 계정(가짜 백엔드): `99000101` 김하늘(관리자, 버튼 전부), `99000202` 이도윤(조회·등록·수정), `99000303` 박서진(조회 전용). 비밀번호는 아무 글자나.

## 주의해서 고를 것

- `login.png` 에는 저장소 소스(`testAccounts.ts`)에 적힌 **공통 테스트 비밀번호 글자가 그대로** 보인다. 책에 싣기 꺼려지면 그 글자만 가린 `login-masked.png` 를 쓴다.
- 헤더 로고는 저장소의 `public/nh-logo.png` 그대로다.
- 공통 모듈 [표]·[출력]·[팝업] 탭의 표 자료는 가짜 백엔드가 아니라 **프론트 소스 안 견본 자료**(`commonModules/demoData.ts`)다. 거기 적힌 사무소·업체 이름은 소스에 있는 그대로다.
- 장애현황은 프론트만 있는 잠정 화면이다(백엔드·API 계약 없음). 가짜 백엔드가 `domain/fault.ts` 모양에 맞춰 지어낸 값을 준다.
- 기기정보·장애현황 목록처럼 옆으로 긴 표는 1280 폭에서 오른쪽이 잘리고, 화면 아래쪽에 회색 가로 스크롤 막대가 줄 위에 겹쳐 떠 있다(antd 표의 "붙어 다니는 스크롤 막대" — 앱의 실제 모습이며 그림이 깨진 것이 아니다).
- 알림(초록·빨강 풍선)은 3초 뒤 사라진다. 알림이 필요한 그림은 이름에 `toast` 가 들어 있는 것뿐이고, 나머지는 사라진 뒤에 찍었다.

## 창 전체 그림 (주문 목록)

| 파일 | 크기(px) | 용량 | 무엇이 보이나 | 화면(주소) | 만든 방법 |
|---|---|---|---|---|---|
| `login.png` | 2560×1600 | 101KB | 로그인 화면 첫 모습 — 왼쪽 로그인 카드(암호화 안내), 오른쪽 테스트 계정 표(저장소 그대로 "입력 필요" 6줄)와 공통 비밀번호 표시 | `/login` | 로그인하지 않고 / 로 들어감 → MeGate 가 /api/me 401 ME_002 를 받고 /login 으로 보냄 → 공개키를 받은 뒤 찍음 |
| `home.png` | 2560×1600 | 111KB | 홈 — 인사말과 견본 화면 바로가기 카드 4개. 왼쪽은 아이콘 줄(1280 폭에서는 메뉴 패널이 접힌 상태가 기본) | `/home` | 관리자 99000101 김하늘 로그인 → 알림이 사라진 뒤 |
| `layout-tabs.png` | 2560×1600 | 299KB | 탭 3개(홈·공지사항·기기정보)가 열린 모습 — 활성 탭은 기기정보(조회 결과 있음). 헤더·아이콘 줄·열린 탭 줄·본문 | `/sample/mcn-info` | 관리자 99000101 김하늘 로그인 → 공지사항 열고 [조회] → 기기정보 열고 [조회] |
| `layout-panel.png` | 2560×1600 | 337KB | 왼쪽 메뉴 패널을 펼쳐 고정한 모습(1280×800) — 헤더, 메뉴 패널(즐겨찾기·견본 메뉴 4개·사용자·환경설정), 열린 탭 줄, 본문(공지 목록). 패널을 고정하면 아이콘 줄은 사라진다. 1280 폭에서는 본문 최소 폭(1050)이 모자라 오른쪽 30px 쯤이 잘린다(실제 동작) — 잘리지 않은 그림은 layout-panel-1440·layout-wide | `/sample/notice` | 탭 3개 상태에서 공지사항 탭 → 아이콘 줄 맨 위 [»](패널 펼치기) 클릭 |
| `global-search.png` | 2560×1600 | 327KB | 헤더 화면 검색에 "기기"를 친 모습 — 검색 결과 (2): 기기정보·기기모델코드, 일치 글자 강조와 경로 표시 | `/sample/notice` | 헤더 검색 칸에 "기기" 입력(드롭다운이 열린 상태) |
| `notice-initial.png` | 2560×1600 | 124KB | 공지사항을 막 연 모습(조회 전) — 조회조건 기본값(작성일 최근 1개월, 내 사무소), 표에는 "조회 조건을 입력하고 [조회]를 누르세요." | `/sample/notice` | 관리자 99000101 김하늘 로그인 → /sample/notice |
| `notice-list.png` | 2560×2140 | 421KB | [조회] 뒤 전체 모습 — 공지 목록 (45건) 1쪽 20줄과 맨 아래 페이지 줄(총 45건 · 1 2 3 · 20개씩 보기)까지. 20줄이 800 높이에 다 안 들어가 창 높이를 늘려 찍음 | `/sample/notice` | 조회조건 그대로 [조회] → 본문이 스크롤 없이 다 보이게 창 높이만 늘림 |
| `notice-selected.png` | 2560×1600 | 325KB | 첫 두 줄을 체크한 모습 — "공지 목록 (45건) 2건 선택", [삭제]가 켜지고 [수정]은 꺼짐(1건일 때만 켜짐) | `/sample/notice` | [조회] → 1·2번째 줄 체크 |
| `notice-delete-confirm.png` | 2560×1600 | 336KB | [삭제]를 눌러 확인 풍선 "선택한 2건을 삭제하시겠습니까?"(취소·확인)가 뜬 모습 | `/sample/notice` | 두 줄 체크 → [삭제] 클릭 |
| `notice-view.png` | 2560×1600 | 320KB | 상세 팝업 "공지사항 상세" — 제목·번호·사무소·작성자·작성일·조회수·최종변경·내용, 아래 [닫기][수정] | `/sample/notice` | 첫 줄의 제목 클릭(GET /api/notice/{no}?hit=Y — 조회수 +1) |
| `notice-edit.png` | 2560×1600 | 306KB | 수정 팝업 "공지사항 수정" — 제목·사무소·작성자·내용이 채워져 있고 바이트 수 표시, [닫기][저장] | `/sample/notice` | 첫 줄만 체크 → [수정] |
| `notice-new.png` | 2560×1600 | 278KB | 등록 팝업 "공지사항 등록" 빈 폼 — 사무소는 내 사무소, 작성자는 로그인 사용자 | `/sample/notice` | [등록] 클릭 |
| `notice-new-invalid.png` | 2560×1600 | 275KB | 등록 팝업에서 아무것도 안 쓰고 [저장] — 칸 아래 빨간 검증 문구("제목을 입력하세요." 등) | `/sample/notice` | [등록] → 바로 [저장] |
| `notice-toast.png` | 2560×1600 | 329KB | 등록 성공 직후 — 위쪽 가운데 초록 알림 "등록되었습니다."(서버 문구 S002), 팝업이 닫히고 목록 맨 위에 새 글(46건) | `/sample/notice` | 등록 팝업에서 제목·내용 입력 → [저장] |
| `notice-readonly.png` | 2560×1600 | 323KB | 조회 전용 사용자(99000303 박서진)의 공지사항 — 한 줄을 체크해도 [등록][수정][삭제]가 모두 흐림(관리자는 켜짐: notice-selected·part-actionbar-selected 와 비교) | `/sample/notice` | 99000303 으로 로그인 → 공지사항 [조회] → 첫 줄 체크 |
| `mcn-info-list.png` | 2560×1600 | 297KB | 기기정보 [목록] 탭 조회 결과(22건) — 왼쪽 고정 칸(순번·사무소·기번), 코너·기종·기기사 등 | `/sample/mcn-info` | 조회조건 그대로(가람지점, 사용여부 Y) [조회] |
| `mcn-info-edit.png` | 2560×1600 | 128KB | 기기정보 [수정] 탭 — 3열 폼(사무소·기번은 잠김), 최초등록·최종변경, 아래 [수정][삭제][목록] | `/sample/mcn-info` | 목록에서 3번째 줄 더블클릭 |
| `mcn-model.png` | 2560×1600 | 228KB | 기기모델코드 — 왼쪽 기기사 3곳(모델 수), 오른쪽은 고른 기기사([10] 가상테크)의 모델 편집 표(행추가·행삭제·저장·취소) | `/sample/mcn-model` | 관리자 99000101 김하늘 로그인 → /sample/mcn-model → [조회] → 왼쪽 첫 줄 클릭 |
| `common-modules.png` | 2560×1600 | 189KB | 공통 모듈 화면 첫 탭(날짜) — 탭 6개(날짜·콤보·팝업·표·출력·권한·메시지) | `/sample/common-modules` | 관리자 99000101 김하늘 로그인 → /sample/common-modules |
| `common-modules-date.png` | 2560×1600 | 189KB | 공통 모듈 [날짜] 탭 — 날짜 부품(단일일자·기간+빠른선택·년월·년도·시각…)과 휴일 표시. 1280×800 창 그대로(윗부분만) | `/sample/common-modules` | [날짜] 탭 클릭 |
| `common-modules-combo.png` | 2560×1600 | 265KB | 공통 모듈 [콤보] 탭 — 공통 조회 API 콤보(사무소→기번·코너·인원, 기기사→모델, 공통코드, 있는 값, 사용여부), 개인번호·금액 입력. 1280×800 창 그대로(윗부분만) | `/sample/common-modules` | [콤보] 탭 클릭 |
| `common-modules-popup.png` | 2560×1600 | 303KB | 공통 모듈 [팝업] 탭 — 검색 팝업 3종·상세 팝업·입력 팝업·주소·원문 열람·결재 견본. 1280×800 창 그대로(윗부분만) | `/sample/common-modules` | [팝업] 탭 클릭 |
| `common-modules-grid.png` | 2560×1600 | 190KB | 공통 모듈 [표] 탭 — 표 부품 견본 — DataGrid(G1·G2·G3), EditableGrid, MasterDetailGrids, MatrixGrid, 행 명령 버튼, 목록/편집 탭(자료는 소스 안 demoData). 1280×800 창 그대로(윗부분만) | `/sample/common-modules` | [표] 탭 클릭 |
| `common-modules-output.png` | 2560×1600 | 188KB | 공통 모듈 [출력] 탭 — 엑셀 다운로드·인쇄·마스킹 표시·첨부파일·파일 올리기 견본. 1280×800 창 그대로(윗부분만) | `/sample/common-modules` | [출력] 탭 클릭 |
| `common-modules-auth.png` | 2560×1600 | 291KB | 공통 모듈 [권한·메시지] 탭 — 나(/api/me)·화면 권한 5개·권한 미리보기·표준 버튼 12종·메시지 라인·서버 문구·확인창 문구·자동 새로고침·표시 부품(StatusTag·KpiCard 등). 1280×800 창 그대로(윗부분만) | `/sample/common-modules` | [권한·메시지] 탭 클릭 |
| `fault-status.png` | 2560×1600 | 252KB | 장애현황 — 조회 뒤 격자 보기(기기 카드: 정상·운영장애·기기장애·통신단절·미개국), 위에 집계 줄 | `/mgmt/fault-status` | 관리자 99000101 김하늘 로그인 → /mgmt/fault-status → [조회] |

## 부품만 잘라 찍은 그림 (주문 목록)

| 파일 | 크기(px) | 용량 | 무엇이 보이나 | 화면(주소) | 만든 방법 |
|---|---|---|---|---|---|
| `part-header.png` | 2560×112 | 33KB | 앱 헤더만 — 로고·환경 배지(LOCAL)·1뎁스 메뉴(홈·종합 관리·견본)·화면 검색·사용자·로그아웃. 1280 폭에서는 시스템 이름이 숨는다 | `/sample/mcn-info` | layout-tabs 상태에서 .app-header 만 |
| `part-opentabbar.png` | 2432×76 | 8KB | 열린 탭 줄만 — 홈(고정)·공지사항·기기정보(활성, ×), 오른쪽 [전체 닫기] | `/sample/mcn-info` | layout-tabs 상태에서 .app-tabbar 만 |
| `part-sidepanel.png` | 440×1488 | 25KB | 메뉴 패널만 — 즐겨찾기 상자, "견본" 제목과 접기 버튼, 화면 4개(공지사항 활성), 아래 사용자 카드·환경설정 | `/sample/notice` | layout-panel 상태에서 .app-panel 만 |
| `part-pageframe-title.png` | 2384×148 | 20KB | 화면 머리(PageFrame)만 — 경로(견본 > 공지사항), 제목·즐겨찾기 별, 마지막 업데이트·새로고침, 버튼줄 | `/sample/notice` | 공지사항 [조회] 뒤 .page-crumb + .page-title-row 만 |
| `part-searchform.png` | 2384×222 | 25KB | 조회조건 폼(SearchForm)만 — 작성일·사무소·작성자·검색구분·검색어, 오른쪽 [조회] | `/sample/notice` | 공지사항 조회 전 .search-panel 만 |
| `part-actionbar.png` | 660×86 | 8KB | 표준 버튼줄(ActionBar)만 — 조회·엑셀·출력·등록·수정·삭제. 줄을 고르지 않아 수정·삭제는 꺼져 있음 | `/sample/notice` | 공지사항 [조회] 뒤 제목 줄 오른쪽 버튼 묶음만 |
| `part-resultheader.png` | 2384×94 | 18KB | 결과 머리(ResultHeader)만 — "공지 목록 (45건)" + 안내문 + [엑셀 다운로드] | `/sample/notice` | 공지사항 [조회] 뒤 .result-header 만 |
| `part-datagrid.png` | 2384×1470 | 306KB | 표(DataGrid)만 — 머리줄·체크 칸·20줄과 페이지 줄(총 45건 · ‹ 이전 1 2 3 다음 › · 20개씩 보기) | `/sample/notice` | 공지사항 [조회] 뒤 .data-grid 만(창 높이를 늘려 끝까지) |

## 덤으로 찍은 그림

| 파일 | 크기(px) | 용량 | 무엇이 보이나 | 화면(주소) | 만든 방법 |
|---|---|---|---|---|---|
| `login-masked.png` | 2560×1600 | 100KB | login 과 같되 오른쪽 위 공통 비밀번호 글자만 ●●● 로 가림(찍을 때 화면 글자만 바꿈, 소스 수정 없음) | `/login` | login 과 같은 상태에서 비밀번호 태그 글자를 바꾼 뒤 찍음 |
| `login-filled.png` | 2560×1600 | 103KB | 개인번호 99000101 과 비밀번호(점으로 가려짐)를 친 로그인 화면. 공통 비밀번호 표시는 가림 | `/login` | 개인번호·비밀번호 칸에 직접 입력(테스트 계정 줄은 CHANGE_ME 라 눌러도 채워지지 않음) |
| `login-error.png` | 2560×1600 | 113KB | 로그인 실패 — 서버 문구 "개인번호 또는 비밀번호를 확인하세요."(400 LGN_001) 빨간 알림 | `/login` | 없는 개인번호 000000000 으로 [로그인] |
| `home-login-toast.png` | 2560×1600 | 118KB | 로그인 직후 홈 — 위쪽 가운데 초록 알림 "로그인되었습니다."(서버 문구 S012)가 떠 있음 | `/home` | 관리자 99000101 김하늘 로 [로그인] → 홈으로 넘어온 직후 |
| `boot-loading.png` | 2560×1600 | 21KB | 앱 시작 중 — MeGate 가 /api/me 를 기다리는 동안의 "사용자 정보를 확인하는 중…" 로딩 | `/home` | /api/me 응답을 2.5초 늦춘 뒤(브라우저 쪽에서 가로챔) /home 진입 직후 |
| `boot-backend-down.png` | 2560×1600 | 36KB | 백엔드가 꺼져 있을 때 — MeGate 오류 화면 "사용자 정보를 확인할 수 없습니다", 그 아래 "처리 중 오류가 발생했습니다. 반복되면 시스템 관리자에게 문의하세요."(응답코드 줄 없음) + [다시 시도] | `/home` | /api 프록시 대상이 죽은 포트인 개발 서버를 따로 띄워 /home 진입(프록시가 500 을 돌려줌) |
| `layout-panel-1440.png` | 2880×1800 | 388KB | 창 1440×900 의 기본 모습(화면 구조 그림용으로 권함) — 창이 1366 이상이라 메뉴 패널이 처음부터 펼쳐져 있고 본문이 잘리지 않는다. 헤더에 시스템 이름도 보인다 | `/sample/notice` | 창 1440×900, 관리자 99000101 김하늘 로그인 → 공지사항 [조회] |
| `layout-flyout.png` | 2560×1600 | 298KB | 패널을 접은 상태에서 아이콘 줄 "견본"에 마우스를 올려 메뉴가 옆으로 튀어나온 모습 — 헤더·아이콘 줄·튀어나온 메뉴 패널·탭 줄·본문이 한 장에 | `/sample/notice` | 패널 [«](패널 접기) → 아이콘 줄 "견본" 위에 마우스 |
| `layout-wide.png` | 3840×2160 | 455KB | 넓은 창(1920×1080)에서의 기본 모습 — 메뉴 패널이 처음부터 펼쳐져 있고 헤더에 시스템 이름·검색 범위 콤보(전체)까지 다 보인다 | `/sample/notice` | 창 1920×1080, 관리자 99000101 김하늘 로그인 → 공지사항 [조회] |
| `tab-context-menu.png` | 2560×1600 | 309KB | 열린 탭을 마우스 오른쪽 버튼으로 눌렀을 때의 메뉴(이 탭 닫기·다른 탭 모두 닫기·오른쪽 탭 닫기·전체 닫기) | `/sample/mcn-info` | 탭 3개 상태에서 "공지사항" 탭 오른쪽 클릭 |
| `settings-drawer.png` | 2880×1800 | 328KB | 환경설정 서랍(오른쪽에서 나옴) — 창 1440×900 | `/sample/notice` | 창 1440×900 에서 메뉴 패널 아래 [환경설정] 클릭 |
| `notice-list-top.png` | 2560×1600 | 322KB | notice-list 와 같은 상태를 1280×800 창 그대로(스크롤 안 함) — 14번째 줄쯤에서 잘린다 | `/sample/notice` | [조회] 직후 그대로 |
| `notice-list-bottom.png` | 2560×1600 | 343KB | 같은 상태에서 본문을 맨 아래로 내린 모습(1280×800) — 마지막 줄들과 페이지 줄. 표 머리줄이 위에 붙어 따라오는데, 머리줄 위 16px 틈으로 지나가는 줄이 조금 비쳐 보인다(앱의 실제 모습) | `/sample/notice` | [조회] → 본문 영역을 맨 아래로 스크롤 |
| `notice-page2.png` | 2560×2140 | 439KB | 2쪽으로 넘긴 모습(순번 21~40) — 창 높이 늘려 찍음 | `/sample/notice` | 페이지 줄에서 2 클릭 |
| `notice-new-filled.png` | 2560×1600 | 307KB | 등록 팝업에 제목·내용을 쓴 모습(저장 직전) | `/sample/notice` | [등록] → 제목·내용 입력 |
| `notice-delete-toast.png` | 2560×1600 | 330KB | 삭제 성공 직후 — 알림 "2건 삭제되었습니다."(S005), 목록이 다시 읽힘 | `/sample/notice` | 두 줄 체크 → [삭제] → [확인] |
| `notice-search-keyword.png` | 2560×1600 | 264KB | 검색구분 "제목" + 검색어 "점검" 으로 조회한 결과(검색어 칸이 켜짐) | `/sample/notice` | 검색구분 콤보에서 제목 선택 → 검색어 "점검" → [조회] |
| `notice-empty.png` | 2560×1600 | 134KB | 결과가 없을 때 — "공지 목록 (0건)", 표에 "검색된 데이터가 없습니다." | `/sample/notice` | 검색구분 제목 + 검색어 "없는말" → [조회] |
| `notice-office-modal.png` | 2560×1600 | 167KB | 조회조건 사무소 칸의 돋보기로 연 "사무소 검색" 팝업(16곳, 8줄씩) | `/sample/notice` | 사무소 칸 오른쪽 돋보기 버튼 클릭 |
| `notice-daterange-open.png` | 2560×1600 | 161KB | 작성일 칸을 눌러 달력이 열린 모습 — 왼쪽 빠른선택(오늘·1주·1개월·3개월) | `/sample/notice` | 작성일 칸 클릭 |
| `notice-readonly-tooltip.png` | 2560×1600 | 330KB | 조회 전용 사용자가 흐린 [등록] 위에 마우스를 올린 모습 — 툴팁 "권한이 없습니다." | `/sample/notice` | notice-readonly 상태에서 [등록] 위에 마우스 |
| `notice-readonly-view.png` | 2560×1600 | 320KB | 조회 전용 사용자의 상세 팝업 — [수정] 버튼이 흐림 | `/sample/notice` | 99000303 로그인 → 제목 클릭 |
| `mcn-info-initial.png` | 2560×1600 | 124KB | 기기정보를 막 연 모습 — [목록][등록] 탭, 버튼줄, 조회조건 7개(2줄 + 필터 펼침) | `/sample/mcn-info` | 관리자 99000101 김하늘 로그인 → /sample/mcn-info |
| `mcn-info-list-full.png` | 2560×2308 | 451KB | mcn-info-list 를 페이지 줄까지 다 보이게 창 높이를 늘려 찍음 | `/sample/mcn-info` | [조회] → 창 높이만 늘림 |
| `mcn-info-selected.png` | 2560×1600 | 299KB | 한 줄을 클릭해 고른 모습 — 줄이 강조되고 "1건 선택", [삭제]가 켜짐 | `/sample/mcn-info` | [조회] → 3번째 줄 클릭 |
| `mcn-info-new.png` | 2560×1600 | 112KB | 기기정보 [등록] 탭 — 빈 폼(사무소 = 내 사무소, 사용여부 Y), 아래 [등록][목록] | `/sample/mcn-info` | 목록 탭에서 [등록] 클릭 |
| `mcn-model-initial.png` | 2560×1600 | 111KB | 기기모델코드를 막 연 모습(조회 전) | `/sample/mcn-model` | /sample/mcn-model 진입 직후 |
| `mcn-model-editing.png` | 2560×1600 | 236KB | 표에서 바로 고치는 중 — 한 줄 추가(기기구분·모델코드·모델명 입력)하고 기존 줄의 모델명을 바꿈. 변경 내역 요약과 [저장] 켜짐 | `/sample/mcn-model` | [행추가] → 새 줄 입력, 첫 줄 모델명 수정 |
| `mcn-model-saved.png` | 2560×1600 | 247KB | 일괄 저장 직후 — 알림 "저장되었습니다."(S001) | `/sample/mcn-model` | mcn-model-editing 상태에서 [저장] |
| `common-modules-date-full.png` | 2560×3314 | 392KB | 공통 모듈 [날짜] 탭 전체(창 높이를 늘려 끝까지) | `/sample/common-modules` | [날짜] 탭 클릭 → 창 높이만 늘림 |
| `common-modules-combo-full.png` | 2560×2084 | 292KB | 공통 모듈 [콤보] 탭 전체(창 높이를 늘려 끝까지) | `/sample/common-modules` | [콤보] 탭 클릭 → 창 높이만 늘림 |
| `common-modules-popup-full.png` | 2560×1964 | 324KB | 공통 모듈 [팝업] 탭 전체(창 높이를 늘려 끝까지) | `/sample/common-modules` | [팝업] 탭 클릭 → 창 높이만 늘림 |
| `common-modules-grid-full.png` | 2560×5602 | 746KB | 공통 모듈 [표] 탭 전체(창 높이를 늘려 끝까지) | `/sample/common-modules` | [표] 탭 클릭 → 창 높이만 늘림 |
| `common-modules-output-full.png` | 2560×3048 | 346KB | 공통 모듈 [출력] 탭 전체(창 높이를 늘려 끝까지) | `/sample/common-modules` | [출력] 탭 클릭 → 창 높이만 늘림 |
| `common-modules-auth-full.png` | 2560×3446 | 504KB | 공통 모듈 [권한·메시지] 탭 전체(창 높이를 늘려 끝까지) | `/sample/common-modules` | [권한·메시지] 탭 클릭 → 창 높이만 늘림 |
| `popup-office-search.png` | 2560×1600 | 324KB | 공통 "사무소 검색" 팝업(GET /api/lookup/offices) | `/sample/common-modules` | 공통 모듈 [팝업] 탭 → [사무소 검색] |
| `popup-person-search.png` | 2560×1600 | 320KB | 공통 "인원 검색" 팝업(GET /api/lookup/persons?ofcCode=) — 내 사무소 6명 | `/sample/common-modules` | 공통 모듈 [팝업] 탭 → [인원 검색] |
| `popup-mcn-search.png` | 2560×1600 | 352KB | 공통 "기기 검색" 팝업(GET /api/lookup/machines?ofcCode=) | `/sample/common-modules` | 공통 모듈 [팝업] 탭 → [기기 검색] |
| `error-toast.png` | 2560×1600 | 326KB | 서버 오류 문구가 빨간 알림으로 뜬 모습 — "조회할 수 없는 항목입니다. (unknown)"(400 LKP_002). 화면 코드에는 try/catch 가 없다 | `/sample/common-modules` | 공통 모듈 [권한·메시지] 탭 → [400 LKP_002 부르기] |
| `perm-preview-qry.png` | 2384×466 | 79KB | 권한 미리보기를 "조회만"으로 바꾼 시연 카드 — 표준 버튼 12종 중 저장·등록·수정·삭제·긴급이 흐려지고, 권한 버튼·숨김형 버튼·AuthGuard 문구도 바뀜 | `/sample/common-modules` | [권한·메시지] 탭 → 권한 미리보기 "조회만" 선택(그 시연 카드만 잘라 찍음) |
| `fault-status-full.png` | 2560×3062 | 465KB | fault-status 를 카드 22장이 다 보이게 창 높이를 늘려 찍음 | `/mgmt/fault-status` | [조회] → 창 높이만 늘림 |
| `fault-status-list.png` | 2560×1600 | 341KB | 장애현황 목록 보기 — 코너별 묶음 줄, 상태 알약, 줄마다 실행 버튼 4개(1280 폭에서는 표 오른쪽이 잘려 버튼이 2개쯤만 보임) | `/mgmt/fault-status` | [조회] → 오른쪽 위 "목록 보기" |
| `fault-status-selected.png` | 2560×1600 | 264KB | 격자 보기에서 카드 2장을 고른 모습 — "2건 선택", 위쪽 명령 버튼(일반리셋 등)이 켜짐 | `/mgmt/fault-status` | [조회] → 카드 2장 클릭 |
| `part-header-wide.png` | 3840×112 | 41KB | 넓은 창(1920)의 헤더 — 시스템 이름 "자동화기기 종합관리시스템"과 검색 범위 콤보(전체)가 보인다(시스템 이름은 1440 이상, 검색 범위는 1760 이상에서만 보임) | `/sample/notice` | layout-wide 상태에서 .app-header 만 |
| `part-iconrail.png` | 128×1488 | 12KB | 아이콘 줄만(패널을 접었을 때) — 펼치기 버튼, 홈·종합관리·견본, 아래 즐겨찾기·검색·사용자 | `/sample/notice` | 패널을 접은 상태에서 .app-rail 만 |
| `part-global-search.png` | 792×408 | 26KB | 화면 검색 칸과 열린 결과 목록만 | `/sample/notice` | global-search 상태에서 검색 칸 + 드롭다운만 |
| `part-actionbar-selected.png` | 660×86 | 8KB | 버튼줄 — 한 줄을 체크해 수정·삭제까지 모두 켜진 모습(관리자) | `/sample/notice` | 공지사항 [조회] → 첫 줄 체크 |
| `part-actionbar-writer.png` | 660×86 | 8KB | 버튼줄 — 권한 T 사용자(99000202 이도윤): 한 줄을 체크하면 수정은 켜지지만 삭제는 권한이 없어 흐림 | `/sample/notice` | 99000202 로그인 → 공지사항 [조회] → 첫 줄 체크 |
| `part-actionbar-readonly.png` | 660×86 | 8KB | 버튼줄 — 조회 전용 사용자: 등록·수정·삭제가 모두 흐림 | `/sample/notice` | notice-readonly 상태에서 버튼 묶음만 |
| `part-resultheader-selected.png` | 2384×94 | 20KB | 결과 머리 — 두 줄을 체크해 "2건 선택"이 붙은 모습 | `/sample/notice` | 두 줄 체크 뒤 .result-header 만 |
| `part-pagination.png` | 2384×90 | 9KB | 표 아래 페이지 줄만 | `/sample/notice` | 공지사항 [조회] 뒤 .grid-foot 만 |
| `part-toast-success.png` | 240×124 | 6KB | 초록 성공 알림만 — "등록되었습니다." | `/sample/notice` | notice-toast 상태에서 알림만 |
| `part-popconfirm.png` | 354×260 | 16KB | 삭제 확인 풍선만 — "선택한 2건을 삭제하시겠습니까?" [취소][확인] | `/sample/notice` | notice-delete-confirm 상태에서 풍선과 [삭제] 버튼만 |

## 주문 목록에 있었지만 만들지 않은 것

없음. 주문한 그림은 모두 앱에 있는 화면·부품이라 전부 찍었다.
단, 이름과 내용이 주문과 조금 다른 것:

- `layout-panel`: 주문은 "헤더·아이콘 줄·메뉴 패널·탭 줄·본문"이 한 장에 보이는 그림이었지만, 이 앱은 **패널을 펼쳐 고정하면 아이콘 줄이 사라진다**(아이콘 줄은 패널을 접었을 때만 나온다). 그래서 `layout-panel` 은 고정된 패널, 다섯 가지가 한 장에 다 보이는 것은 `layout-flyout`(아이콘 줄 + 마우스를 올려 튀어나온 패널)이다. 또 1280 폭에서 패널을 고정하면 본문 오른쪽이 조금 잘리므로(실제 동작) 구조 설명 그림으로는 `layout-panel-1440` 을 권한다.
- `notice-list`·`part-datagrid`: 20줄과 페이지 줄이 800 높이에 함께 들어가지 않아 창 높이를 늘려 찍었다. 800 높이 그대로는 `notice-list-top`·`notice-list-bottom`.
- `common-modules` 와 `common-modules-date` 는 같은 모습이다(첫 탭이 날짜).
