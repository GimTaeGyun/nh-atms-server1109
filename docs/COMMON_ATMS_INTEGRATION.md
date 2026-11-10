# Common-ATMS 통합 기록 · npm 추가 반입 · 로컬 기동 절차

> 2026-11-09 작성. ATMS-server 저장소(배포킷 + `NH-ATMS/`)에 새 프로젝트 소스 `nh-atms-common-main/`(프론트·백엔드·db·docs)을 더해 Common-ATMS 로 옮긴 작업의 기록이다.
> 명령은 Git Bash 기준. 명령 하나 = 블록 하나(사진 보고 그대로 칠 수 있게). `sudo`/`su` 없음.

## 1. 무엇을 어떻게 옮겼나

| 항목 | 내용 |
|---|---|
| 원본 | ATMS-server `main` — 커밋 73개, 히스토리 그대로 유지 |
| Common-ATMS `main` | 새 소스 추가 직전 커밋 `0d76682` (배포킷·설정·문서·`NH-ATMS/`) |
| 새 소스 | 커밋 `b3f8517` — `nh-atms-common-main/` 450개 파일, PR 로 리뷰 후 병합 |
| 폴더 구조 | ATMS-server 구조 그대로. 새 소스는 `nh-atms-common-main/` 아래에만 있다 |
| 인프라 | 루트 `bin/` `conf/` `deploy/` `docs/` 와 `NH-ATMS/` 는 바뀌지 않음 |
| 옮기지 않은 것 | ATMS-server 의 `main` 외 브랜치(백업 브랜치 등) |

점검: 새 소스에 빌드 산출물(`node_modules`, `build/`, `dist/`, `target/`, `.env`) 없음. yml/properties 에 실제 비밀번호 없음(`local-common.yml` 은 빈 값). `gradle-wrapper.jar` 는 정상 포함 대상.

## 2. 설정 비교와 결정 (NH-ATMS ↔ nh-atms-common-main)

설정 파일 23개 비교: 같음 4 · 다름 17 · 새 소스에만 2.
새 소스 설정은 주석에 "배포킷(nh-atms-server)에서 복사·축소" 라고 적혀 있는 **의도된 파생본**이다. NH-ATMS 것으로 덮으면 빌드·기동이 깨지므로 아래처럼 정했다.

| 항목 | NH-ATMS | nh-atms-common-main | 결정 |
|---|---|---|---|
| ① 모듈·기능 (`settings.gradle`, `build.gradle`, `application.yml`) | 모듈 7개, JWT·SSO·필드 암호화·POI·H2 | 모듈 2개(common, web), 로그인 없음(고정 사용자) | **새 소스 유지** — 덮으면 없는 모듈 5개로 빌드 실패, `JWT_SECRET` 없어 기동 실패 |
| ② 폐쇄망 Gradle (foojay, `validateDistributionUrl`, JDK vendor) | 자동 다운로드·URL 검사·Adoptium 고정 | 모두 끔(로컬 JDK 21) | **새 소스 유지** |
| ③ p6spy·prometheus | 운영 WAR 에 포함 | p6spy 는 `developmentOnly`, prometheus 없음 | **새 소스 유지** — 운영 로그에 SQL 평문 안 남음 |
| ④ 프론트 npm (`package.json`/lock) | lock 334개 | lock 469개 (143개 추가: vitest·msw·playwright·jsdom·testing-library 등) | **새 소스 유지 + npm 캐시에 추가 반입** (§3) |

서버 관련 값은 원래부터 같다 — 바꿀 것 없음.

| 서버 값 | 결과 |
|---|---|
| `jeus.host` 16.88.122.113, `log-dir`, `data-dir`, JNDI `dsATMS01`, `cors` | 같음 |
| 기동 확인 `/v3/api-docs` (`deploy-war.sh`) | 같음 (새 소스도 켜 둠) |
| WAR 이름 (새 소스 `atms-web.war`) | Jenkins `backend.Jenkinsfile` 이 `<모듈>-<버전>-<날짜>-<빌드>.war` 로 다시 이름 붙임 → 문제없음 |
| Node (새 소스 22.13 이상) | Jenkins 이미지 22.23.3 → 문제없음 |

## 3. npm 캐시 추가 반입 (143개 + node-forge)

절차의 정본은 [REQUIRED_FILES.md](REQUIRED_FILES.md) **3-5** 이다 (2026-11-09 개정).

- 인터넷 PC 에서 `deploy\offline-bundle\make-npm-carry.bat` 를 한 번 실행 → `npm-carry.zip` + SHA256
  - 새 앱 lock (NH-ATMS 에 없던 143개) + NH-ATMS lock (node-forge 1.4.0·@types/node-forge 1.3.14) + Windows·Linux 실행 파일 패키지(esbuild·rollup)를 한 캐시에
  - 자체 검증(오프라인 설치)까지 스크립트가 한다
- 반입 후 같은 zip 을 팀 PC(`robocopy`)와 ws01 Jenkins(`podman unshare cp -rn`)에 합친다
- 확인: 팀 PC `npm ci --offline` → `npm run build`, Jenkins 화면 잡 `MODE=build-only`
- 2026-11-09 시험: zip 약 60MB, ws01 방식으로 푼 캐시만으로 두 프로젝트 모두 오프라인 설치·빌드 성공

## 4. 로컬 기동 절차 (DB 포함, 폐쇄망 PC)

근거: `nh-atms-common-main/docs/01_실행_배포.md`, `nh-atms-common-main/db/README.md`.

### 4-0. 준비

| 항목 | 기준 |
|---|---|
| JDK | 21 |
| Node | 22.13 이상 |
| npm 캐시 | §3 반입 완료 |
| Gradle 캐시 | `orai18n` 포함 여부 확인 (없으면 `--offline` 빌드가 그 줄에서 멈춤) |
| DB 계정 | 은행 개발 DB(16.88.250.91:1531/NBATMSTP) 계정·비밀번호를 **정확히** 알고 있을 것 — 틀린 값은 한 번만 시도하고 막힌다(잠김 방지) |

### 4-1. DB 테이블 확인 (조회만)

SQL 도구에서 순서대로 실행한다.

1. `nh-atms-common-main/db/check/01_exists.sql` — TB_ 테이블 15개가 있나
2. `nh-atms-common-main/db/check/02_columns.sql` — 컬럼이 `db/ddl/` 과 같나

- 없는 테이블이 있으면 기동은 되지만 그 화면이 오류 → 담당자와 상의. `db/ddl/` 은 참고용(그냥 돌리지 않음).
- 시드가 필요하면 `db/seed/01` → `02` → (필요 시 `03`), 확인은 `db/check/03_seed_status.sql`.

### 4-2. `D:\local-db.yml` (PC마다, 저장소 밖)

들여쓰기는 **스페이스만**(Tab 금지), 값은 큰따옴표.

```yaml
spring:
  datasource:
    username: "DB계정"
    password: "DB비밀번호"
atms:
  fixed-user:
    per-no: "내개인번호"
```

개인번호가 비었거나 `CHANGE_ME` 면 백엔드는 뜨지만 `/api/**` 가 401 `ME_001`.

### 4-3. 백엔드

```bash
cd nh-atms-common-main/Backend/nh-atms-api
```

```bash
sh gradlew :atms-web:bootRun --offline
```

JDK 를 못 찾으면 끝에 `-Porg.gradle.java.installations.paths=C:/경로/jdk-21` 를 붙인다.

| 로그 | 뜻 |
|---|---|
| `Started AtmsWebApplication` | 성공 → `http://localhost:8080/swagger-ui.html` 열림 |
| `[DB-GUARD] 로컬 DB 계정이 없습니다` | `D:\local-db.yml` 경로·들여쓰기 확인 |
| `ORA-01017` / `ORA-28000` | 비밀번호 틀림 / 계정 잠김 — 같은 값으로는 다시 안 붙음. 값을 고친 뒤 다시 실행 |

### 4-4. 프론트 (새 Git Bash 창)

```bash
cd nh-atms-common-main/Frontend/nh-atms-web
```

```bash
npm ci --offline
```

```bash
npm run dev
```

`http://localhost:3100` (NH-ATMS 의 3000 이 아니라 **3100**). 화면의 `/api` 요청은 개발 서버가 8080 백엔드로 넘긴다(`vite.config.ts` 프록시).

### 4-5. 정상 판정

| 확인 | 정상 |
|---|---|
| 첫 화면 | 화면 전체 `ME_001` 오류가 없음 (고정 사용자 인식) |
| 메뉴 | 좌측 메뉴가 보임 (서버 메뉴가 비면 내장 메뉴, 조회 권한) |
| 견본 화면(공지 등) | 목록이 조회되면 DB 연결까지 정상 |

## 5. 이 저장소에서 확인한 것 (2026-11-09, 인터넷 되는 환경)

| 항목 | 결과 |
|---|---|
| 백엔드 `./gradlew build bootWar -Pjeus` (Jenkins 와 같은 방식) | 성공, 테스트 포함, `atms-web/build/libs/atms-web.war` |
| 프론트 `npm run build` (Jenkins 와 같은 방식) | 성공 |
| 프론트 `npm run lint` | 통과 |
| 프론트 `npm test` | 219개 모두 통과. 실행 중 오류 1건(`src/screens/__tests__/commonModules.test.tsx`)이 따로 보고됐으나 단독 재실행 시 통과하는 간헐적 문제. Jenkins 는 테스트를 돌리지 않아 배포 영향 없음 |
| 백엔드 기동 (`bootRun`, local) | Tomcat 초기화까지 정상, `D:\local-db.yml` 이 없어 `LocalDbLoginGuard` 가 설계대로 중단. 은행 DB 에 닿지 않아 그 뒤는 미확인 → §4 로 PC 에서 확인 |

오프라인(`--offline`) 빌드는 여기서 확인하지 못했다 — 폐쇄망 Gradle 캐시의 `orai18n` 여부와 §3 npm 반입이 끝나야 Jenkins 빌드가 된다.

## 6. 점검 결과 — 개발서버(ws01) 충돌 · 추가 반입 · 소스/배포킷 변경 (2026-11-09)

전제(사용자 결정 2026-11-09): **개발서버에는 `nh-atms-common-main` 이 NH-ATMS 를 대체**한다. 내부 Gitea 저장소(`NH-ATMS/nh-atms`) 루트에 `nh-atms-common-main/` 안의 `Backend/`·`Frontend/` 를 올리면 배포킷 Jenkins 경로(`Backend/nh-atms-api`, `Frontend/nh-atms-web`)가 그대로 맞는다.

### 6-1. 첫 배포 전에 꼭 할 것 (안 하면 막힘)

| # | 항목 | 왜 | 할 일 |
|---|---|---|---|
| 1 | **프론트 `.env.production`·`.env.development`·`.env.mock` 이 저장소에 없음** | ATMS-server 루트 `.gitignore` 의 `.env.*` 규칙에 걸려 push 때 빠짐. 운영 빌드는 기본값으로 되지만 목 모드·화면 캡처(e2e)가 안 되고, 원본 값(예: `VITE_ROUTER`)이 다르면 화면 동작이 달라짐 | 루트 `.gitignore` 에 예외 3줄 추가함(이 커밋). 원본 파일을 가진 PC 에서 아래 6-5 명령으로 올린다 |
| 2 | **고정 사용자 개인번호** (`atms.fixed-user.per-no`) | 저장소 값 `CHANGE_ME` → 개발서버에서 `/api/**` 전부 401 `ME_001` (화면 사용 불가) | atms01 JVM 옵션 `-Datms.fixed-user.per-no=<개인번호>` (WAS 담당) 또는 내부 Gitea 사본 기입 — `POST_HANDOVER_EDITS.md` K |
| 3 | **npm 캐시 143개 (+ node-forge)** | Jenkins `npm ci --offline` 이 캐시에 없는 패키지에서 실패 | `make-npm-carry.bat` 로 zip 1개 → 팀 PC + Jenkins 에 합치기 (REQUIRED_FILES 3-5) |
| 4 | **DB: TB_ 테이블 15개 + 시드** | 새 앱은 TO-BE `TB_` 테이블을 쓴다. JNDI `dsATMS01` 계정(ATMS_APP)에서 보여야 함 | `nh-atms-common-main/db/check/01·02` 로 확인 → 시드 `db/seed/01·02(·03)` |
| 4-1 | **필드 암호화 키 파일** (2026-11-09 로그인 견본 추가로 다시 필요) | 새 앱 `application-jeus.yml` 이 `crypto.field.enabled: true` + `/home/atmswas/keys/field-k202611.{key,pub}.pem` — **없으면 atms01 기동 실패** | ws01 에서 키 생성 (`POST_HANDOVER_EDITS.md` 0-2, 새 앱 `docs/07_API_계약.md` §7 — NH-ATMS 와 같은 키) |
| 5 | **WebtoB `http.m` 적용** (기존과 같음) | 화면 `/api/` → atms01 JSV | WebtoB 담당 (`deploy/webtob/http.m.atms-jsv.txt`). 새 앱은 `/api/`·`/v3/api-docs` 만 쓰고 나머지 URI 는 둬도 무해 |

### 6-2. ws01·wb01 서버 셋팅과 충돌 여부 — 충돌 없음

| 항목 | 서버/배포킷 | 새 앱 | 결과 |
|---|---|---|---|
| JEUS 서버·포트·폴더 | atms01 · 8080 · `/home/atmswas/catms`, 컨텍스트 `/` | `atms-web` 1개, 컨텍스트 `/` | 같음 |
| WAR 빌드 | Jenkins `./gradlew bootWar -Pjeus --offline` → `atms-*/build/libs/*.war` → `<모듈>-<버전>-<날짜>-<빌드>.war` 로 이름 변경 | `atms-web.war` | 동작 (Jenkins 가 이름을 붙임) |
| `jeus/web.xml` | 프로파일 `jeus` | NH-ATMS 것과 글자까지 같음 | 같음 |
| DB | JNDI `dsATMS01` | `jndi-name: dsATMS01` | 같음 |
| 로그·데이터 폴더 | `/WASlogs/jeusATMSlogs/nbatmsltws01/app/atms-web.log`, `/home/atmswas/data` | 같은 값 | 같음 |
| 기동 확인 | `deploy-war.sh` → `:8080/v3/api-docs` = 200 | jeus 프로파일에서 api-docs 켬(swagger 화면만 끔) | 동작 |
| Gradle (Jenkins `/cache/gradle`) | Gradle 8.14.4, Boot 3.5 플러그인, orai18n | 플러그인 블록 NH-ATMS 와 같음, 의존성은 NH-ATMS 의 부분집합 | 새 반입 없음 |
| JDK | Jenkins Temurin 21 (`installations.paths=$JAVA_HOME`) | 제조사 고정 없음 | 동작 |
| Node | Jenkins 22.23.3 | 22.13 이상 | 동작 |
| 화면 배포 | `npm ci --offline` → `npm run build` → `dist/index.html` 확인 → wb01 DocBase 교체 | `dist/` 생성 (확인함) | 동작 (npm 캐시 조건) |
| JWT·필드 암호화 키 | NH-ATMS atms-web 은 `/home/atmswas/keys` 없으면 기동 실패 | JWT 없음. **필드 암호화는 2026-11-09 부터 있음** (로그인 견본, 같은 키·경로) | 키 파일 필요 (6-1 #4-1). node-forge 는 npm 캐시 zip 에 포함 |

### 6-3. 대체 결정으로 달라지는 것 (알고 있어야 할 것)

- 서버에는 **atms-web 하나만** 배포된다 → 에이전트 저널 수신·원격제어·배치·대외 연동은 동작하지 않는다 (NH-ATMS 모듈이 없음)
- WAS 담당에 요청한 서버 6개 중 실제로 쓰는 것은 atms01 뿐 → 나머지 5개(ajou01~ifex01)도 **요청 그대로 유지** (사용자 결정 2026-11-09 — 나중에 NH-ATMS 모듈을 올릴 수 있게)
- Jenkins `nh-atms-backend` 의 `MODULE` 은 `all` 또는 `atms-web` 만 의미가 있다. 다른 모듈을 고르면 WAR 가 없어 `묶기` 단계(`ls out/*.war`)에서 실패
- `deploy-war.sh status` 에서 나머지 5개 모듈은 미배포·`000` 으로 보인다 (정상)
- 이번에 바꾼 NH-ATMS 의 모듈 간 호출 WebtoB 경유·레거시 경로 `/api` 전환은 **NH-ATMS 를 다시 배포할 때** 적용된다 (새 앱은 모듈이 1개라 모듈 간 호출이 없음)

### 6-4. NH-ATMS 를 다시 올릴 때의 9000 경유 확인 항목

| 항목 | 내용 |
|---|---|
| 선행 조건 | WebtoB `http.m` 적용 + 6개 서버 JSV 연결. 전에는 WebtoB 없이도 모듈 간 호출이 됐지만 이제는 WebtoB 가 멈추면 원격제어·연동도 멈춘다 |
| 열린 포트 | ws01 → wb01:9000 [확인 2026-10-15] |
| 오류 모양 | WebtoB 가 대상 서버에 못 보내면 302(`/error/error.html`) — 호출측 로그에 JSON 대신 HTML 파싱 오류가 보이면 WebtoB·JSV 를 먼저 본다 (INFRA_MANUAL T61) |
| 처리 수 | 화면 요청과 모듈 간 호출이 서버별 JSV 처리 수(`MaxProc`)를 나눠 쓴다 |
| 시간 제한 | 호출측 3~10초. WebtoB 쪽 요청 시간 제한은 미확인 (짧으면 504) → WebtoB 담당 |
| 루프 | 모듈 간 호출은 `/api/...` 경로만. 옛 `/atms/`·`/atmr/` 를 쓰면 atms01 로 되돌아와 무한 루프 (T68) |

### 6-5. `.env` 3개 올리는 명령 (원본을 가진 PC, Git Bash)

이 커밋의 `.gitignore` 예외 덕분에 `-f` 없이도 올라간다. 먼저 최신을 받는다.

```bash
cd /path/to/Common-ATMS
```

```bash
git pull origin main
```

원본 3개를 `nh-atms-common-main/Frontend/nh-atms-web/` 에 복사한 뒤:

```bash
git add nh-atms-common-main/Frontend/nh-atms-web/.env.production nh-atms-common-main/Frontend/nh-atms-web/.env.development nh-atms-common-main/Frontend/nh-atms-web/.env.mock
```

```bash
git status
```

비밀값(계정·비밀번호·토큰)이 없는지 한 번 열어 본다 — 정상이라면 `VITE_…` 와 `DEV_PROXY_TARGET` 만 있다.

```bash
git commit -m "chore(front): .env.production/.development/.mock 추가 (gitignore 로 빠졌던 것)"
```

```bash
git push origin main
```

### 6-6. 그 밖에 (영향 작음)

- `mockServiceWorker.js` 가 `dist/` 에 들어가 DocBase 로 배포된다 — 운영 빌드에는 목 코드가 없어 등록되지 않음 (무해)
- 화면 라우터: 2026-11-10 사용자 결정으로 운영 빌드는 해시 라우터 (`Frontend/nh-atms-web/.env.production` `VITE_ROUTER=hash`, 주소 `/#/home`). 주소창 방식(BrowserRouter)에서는 열리자마자 `/home` 으로 바뀌어 첫 화면에서도 F5 → WebtoB `302 /error/error.html` 이었다 (INFRA_MANUAL T40). 로컬 `npm run dev` 는 그대로 주소창 방식
- NH-ATMS `atms-web` 의 `NoticeServiceTest` 가 컴파일되지 않는 기존 문제로 `gradlew :atms-web:test` 전체가 멈춘다 (이번 변경과 무관, 그대로 둠)
