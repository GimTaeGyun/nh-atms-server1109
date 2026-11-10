# 반입 전 점검 — 개발서버(ws01·wb01) 적용분 (2026-11-09)

> 대상: Common-ATMS `main` (커밋은 이 문서가 들어간 판). 서버에 올라가 있는 판을 모르므로 **처음부터 전부 반입한다고 보고** 점검했다.
> 전제(사용자 결정 2026-11-09): 개발서버에는 `nh-atms-common-main`(atms-web 1개 + 화면)이 NH-ATMS 를 **대체**한다.
> 표기: ✅ 확인함 · 🔧 이번에 고침 · ⚠️ 사람이 해야 함 · ❔ 서버·담당에서만 확인 가능

## 1. 한눈에 — 놓친 것 / 해야 할 것

| # | 항목 | 상태 | 할 일 · 근거 |
|---|---|---|---|
| 1 | **CORS 허용 주소가 `CHANGE_ME_WEBTOB_HOST`** 로 남아 있었음 | 🔧 | 서버가 받은 Host 가 9000 주소와 다르면 브라우저 POST(로그인·저장)가 403. 두 앱 `jeus-common.yml` 기본값을 `http://16.88.122.112:9000` 으로 채움 (2-4 시험) |
| 2 | **배포킷 문서가 옛 저장소 이름**(`ATMS-Server-main.zip`)이고, 서버 업로드 제외 목록에 `nh-atms-common-main/` 이 없었음 | 🔧 | DEV_SERVER_SETUP·INFRA_MANUAL·REQUIRED_FILES 등 이름·제외 목록 수정. zip 은 약 100MB (사진 90MB 포함) — 반입 한도가 있으면 INFRA_MANUAL 4-5 처럼 분할 |
| 3 | **내부 Gitea 에 새 앱 소스를 올리는 절차가 없었음** | 🔧 | 4장에 추가 (저장소 `NH-ATMS/nh-atms` 내용을 `nh-atms-common-main/` 안의 내용으로 교체). 2026-11-10: 옛 main 백업 브랜치 `backup/main-20261110`·점검·되돌리기 추가, "웹훅 빌드는 배포 안 함" 오기 정정(화면 잡은 웹훅도 `build-deploy`) |
| 4 | 새 프론트 `.env.production`·`.env.development`·`.env.mock` 이 저장소에 없음 | ⚠️ | 원본을 가진 PC 에서 올림 (`COMMON_ATMS_INTEGRATION.md` 6-5). 없어도 운영 빌드는 기본값으로 됨 — 단 원본 값(예: `VITE_ROUTER`)이 다르면 화면 동작이 달라짐 |
| 5 | 필드 암호화 키 파일 `/home/atmswas/keys/field-k202611.{key,pub}.pem` | ⚠️ | **없으면 atms01 기동 실패** (로그인 견본 추가로 다시 필요). `POST_HANDOVER_EDITS.md` 0-2 — 그 명령 그대로 만든 키로 기동 확인함 (2-4) |
| 6 | 고정 사용자 개인번호 | ⚠️ | atms01 JVM 옵션 `-Datms.fixed-user.per-no=<개인번호>` (WAS 담당) — 없으면 화면 전체 401 `ME_001` (`POST_HANDOVER_EDITS.md` K) |
| 7 | npm 캐시 (143개 + node-forge) | ⚠️ | `deploy/offline-bundle/make-npm-carry.bat` → zip 1개 → 팀 PC·Jenkins 에 합치기 (`REQUIRED_FILES.md` 3-5). Windows 실행은 미시험 |
| 8 | DB: 새 앱 TB_ 테이블 15개 + 시드 | ⚠️ | `nh-atms-common-main/db/check/01·02` → `db/seed` (JNDI 계정 ATMS_APP 에서 보여야 함) |
| 9 | Gradle 캐시 (Jenkins `/cache/gradle`) | ✅ | 새 앱 WAR 의 jar 69개가 모두 NH-ATMS WAR 6개에 있음 → 새 반입 없음 (2-3). Gradle 8.14.4·플러그인 블록 같음 |
| 10 | WAS 담당 작업 (atms01 :8080, WebtoB 커넥터, JNDI `dsATMS01` Oracle + orai18n, 재기동 메뉴) | ❔ | 기존과 같음 (`WAS_REQUEST_MANAGED_SERVERS.md`). 서버 6개 요청은 유지 결정 |
| 11 | WebtoB `http.m` 적용 | ❔ | 기존과 같음. 새 앱은 `/api/`·`/v3/api-docs` → atms01 만 씀 (나머지 URI 는 둬도 무해) |
| 12 | JEUS 9.1 의 Jakarta EE(Servlet 5/6) 지원 | ❔ | 기존부터 열린 위험 — 첫 배포에서 Spring 기동 로그가 안 보이고 전부 404 면 "미지원" (CLAUDE.md) |
| 13 | 로그인 견본을 켤 때(`atms.login.enabled=true`)의 세션 쿠키 | ❔ | 기본 꺼짐이라 첫 배포와 무관. 켤 때 WebtoB·JEUS 를 거친 `JSESSIONID` 유지 확인 필요 (이 환경에서 미시험) |

## 2. 이 환경에서 직접 돌려 본 것

### 2-1. 배포킷 스크립트

| 시험 | 결과 |
|---|---|
| `bash -n` 저장소의 `*.sh` 26개 | ✅ 모두 통과 |
| 실행 권한·줄바꿈 | git 에는 644 로 들어 있음 → 서버에서 `DEV_SERVER_SETUP.md` 의 `sed -i 's/\r$//'`·`chmod 700` 단계가 처리 (빼먹으면 Jenkins 배포 키의 `command=…deploy-war.sh` 가 실패) |
| `deploy-war.sh deploy` — 새 앱 WAR 를 Jenkins 이름(`atms-web-0.0.1-<날짜>-<번호>.war`)으로, 가짜 서버 폴더에 | ✅ sha256 확인 → `release/atms-web/` 보관 → `catms` 교체(2750) → `lib-provided` 삭제 → "WAR 프로파일: jeus" |
| 같은 스크립트 — sha256·커밋 형식 오류, 백업 없는 롤백 | ✅ 각각 거부 |
| `deploy-war.sh status` | ✅ 6개 모듈 표시 (atms-web 외 5개는 미배포라 000 — 정상) |
| `deploy-front.sh deploy` — 새 dist 를 Jenkins 처럼 tar.gz 로, 가짜 DocBase 에 | ✅ 교체 → `/` 200 → `index.html` 일치 → 완료, `status` 기록 |

### 2-2. Jenkins 와 같은 명령

| 시험 | 결과 |
|---|---|
| 백엔드: git 에서 막 받은 소스(`gradlew` 644)에서 `sh ./gradlew bootWar -Pjeus --offline --no-daemon --max-workers=1 -Xmx768m …` | ✅ BUILD SUCCESSFUL → 묶기 단계 이름 규칙으로 `atms-web-0.0.1-<날짜>-<번호>.war` 1개 |
| 화면: 캐시 zip 을 ws01 방식으로 푼 캐시만으로 `npm ci --offline` → `npm run build` (NODE_OPTIONS 1024MB) | ✅ (2026-11-09 npm 캐시 시험, `REQUIRED_FILES.md` 3-5) |
| `MODULE` 을 atms-web·all 외로 고르면 | WAR 가 없어 `묶기`(`ls out/*.war`)에서 실패 — 새 앱은 모듈이 1개라 정상 동작 |

### 2-3. WAR 내용·라이브러리

| 확인 | 결과 |
|---|---|
| `WEB-INF/web.xml` (프로파일 jeus, Jakarta EE 9 선언) | ✅ |
| `application-local.yml`·`local-common.yml` 이 WAR 에 없음 | ✅ (로컬 DB 정보 없음) |
| p6spy·devtools 가 WAR 에 없음 | ✅ |
| 암호화 클래스 9개 (`atms-common` jar) | ✅ |
| WAR 의 jar 69개 ⊂ NH-ATMS WAR 6개의 jar 129개 | ✅ 새 Gradle 반입 없음 |

### 2-4. jeus 프로파일로 실제 기동 (JEUS 대신 내장 톰캣, JNDI 는 시험용 가짜)

| 확인 | 결과 |
|---|---|
| 기동 | ✅ `Started AtmsWebApplication` (프로파일 jeus) |
| JNDI 조회 `java:comp/env/dsATMS01` | ✅ 조회됨 (Spring 이 JEUS 풀을 찾아 쓰는 경로) |
| 키 파일 — `POST_HANDOVER_EDITS.md` 0-2 의 `openssl` 명령으로 만든 PEM | ✅ `[field-crypto] 키 로드 kid=k202611` |
| 기동 확인 주소 `/v3/api-docs` (`deploy-war.sh`) | ✅ 200 |
| swagger 화면 | ✅ 404 (jeus 에서 끔) |
| `/api/auth/public-key` | ✅ `enabled:true, kid:k202611` |
| `/api/me` (개인번호 `CHANGE_ME` 상태) | ✅ 401 `ME_001` — #6 을 해야 화면이 열림 |
| 로그 파일 `${jeus.log-dir}/atms-web.log` | ✅ 생성 |
| CORS — 고치기 전 `Origin: http://16.88.122.112:9000` | ❌ 403 → 🔧 고친 뒤 통과(400 = 빈 본문 검사), 다른 Origin 은 그대로 403 |

### 2-5. 소스 검사 (새 앱)

| 검사 | 결과 |
|---|---|
| 백엔드 `gradlew build` | ✅ 테스트 98개 |
| 프론트 `npm run check` (타입·lint·테스트) | ✅ 225개 |
| 프론트 `npm run build` | ✅ |
| 실행 서버에 node-forge 암호문 전송 | ✅ 복호화, 재전송·변조·시각·키 버전 각각 400 `CRYPTO_*` |

## 3. 반입물 목록 (처음부터 전부 반입하는 경우)

| # | 무엇 | 어디로 | 비고 |
|---|---|---|---|
| 1 | `Common-ATMS-main.zip` (GitHub Download ZIP) + sha256 | ws01 `~/atms` (`bin conf deploy docs README.md` 만), wb01 `~/deploy/kit` (`deploy` 만) | `NH-ATMS/`·`nh-atms-common-main/` 은 서버에 올리지 않음 (`DEV_SERVER_SETUP.md` 배포킷 갱신) |
| 2 | 같은 zip 의 `nh-atms-common-main/` | 내부 PC → Gitea `NH-ATMS/nh-atms` (4장) | `.env.*` 3개 포함되도록 (#4) |
| 3 | `npm-carry.zip` + sha256 | 팀 PC npm 캐시, ws01 Jenkins `~/atms/infra/jenkins/cache/npm` | `REQUIRED_FILES.md` 3-5 |
| 4 | (처음이면) Gitea·Jenkins 이미지 tar, Gradle 캐시(offline-seed) | ws01 | `REQUIRED_FILES.md` 2장, `DEV_SERVER_SETUP.md` 9-5 — 서버에 이미 있으면 불필요 |

## 4. 내부 Gitea 에 새 앱 올리기 (NH-ATMS 대체) — 내부 PC, Git Bash

> 2026-11-10 개정 (사용자 결정): **옛 `main` 은 백업 브랜치 `backup/main-20261110` 로 남기고**, `main` 은 그 위에 "전체 교체" 커밋 1개를 얹는다 (강제 푸시 없음). 넣는 것은 `nh-atms-common-main/` **안의 내용만** — 배포킷(`bin conf deploy docs`)·옛 `NH-ATMS/` 는 넣지 않는다.

- 저장소 이름·주소는 그대로(`NH-ATMS/nh-atms`) — Jenkins `GITEA_REPO`·웹훅 `url=` 을 안 바꾸려고
- 비유: 옛 집(main)을 통째로 사진 찍어 앨범(백업 브랜치)에 꽂아 두고, 같은 주소에 새 가구로 바꿔 넣는 것

### 4-0. 미리 할 것

- 팀원에게 알림: 작업하는 동안 `main` 에 push 하지 말 것. 끝나면 **새로 clone** (4-6)
- **Gitea 웹훅 잠시 끄기 (권장)** — 화면 잡은 웹훅 빌드도 `build-deploy` 라서, push 하는 순간 새 화면이 wb01 에 배포된다(npm 캐시 143개가 아직 없으면 빌드 실패로 끝나 배포는 안 됨). 백엔드 잡은 `build-only` 라 배포 안 함
  - Gitea 웹 → `NH-ATMS/nh-atms` → 설정 → 웹훅 → 그 웹훅 → "활성" 체크 해제 → 저장
- 반입한 소스 zip 을 푼 폴더 확인. 아래는 `D:\carry\nh-atms-server1109-main` 으로 가정 (Git Bash 경로 `/d/carry/nh-atms-server1109-main`). 이름이 다르면 그 이름으로 바꿔 친다
- `Frontend\nh-atms-web\.env.production`·`.env.development`·`.env.mock` 원본이 있으면 그 폴더에 미리 넣어 둔다 (GitHub zip 에는 없음, 1장 #4)

### 4-1. 새 폴더에 받기

옛 작업 폴더는 쓰지 않는다 (`build/`·`node_modules/` 같은 무시 파일이 남아 헷갈림).

```bash
cd /d
```

```bash
git clone http://16.88.122.113:3000/NH-ATMS/nh-atms.git nh-atms-replace
```

```bash
cd nh-atms-replace
```

```bash
git log --oneline -1
```

- 나온 커밋 번호를 사진으로 남긴다 (= 백업할 옛 main)

### 4-2. 백업 브랜치 만들기

```bash
git branch backup/main-20261110
```

```bash
git push origin backup/main-20261110
```

```bash
git ls-remote origin main backup/main-20261110
```

- 두 줄의 앞 번호가 **같아야** 한다 (= 백업 완료). 다르면 멈춘다

### 4-3. 옛 파일 지우고 새 소스 넣기

```bash
git rm -r -q .
```

```bash
ls -A
```

- `.git` 하나만 남아야 한다

```bash
cp -r /d/carry/nh-atms-server1109-main/nh-atms-common-main/. .
```

- 끝의 `/.` 까지 쳐야 숨김 파일(`.gitignore`, `.env.*`)도 복사된다

```bash
ls -A
```

- `.git .gitignore Backend CLAUDE.md Frontend README.md agent-briefs db docs tools` 가 보이면 정상

```bash
git add -A
```

### 4-4. 올리기 전 점검 (사진으로 남기기)

```bash
find /d/carry/nh-atms-server1109-main/nh-atms-common-main -type f | wc -l
```

```bash
git ls-files | wc -l
```

- 두 숫자가 **같아야** 한다 (GitHub zip 그대로면 476, `.env` 3개를 넣었으면 479). 다르면 빠진 파일 확인:

```bash
git status --short --ignored | grep "^!!"
```

```bash
ls Backend/nh-atms-api/gradlew Frontend/nh-atms-web/package.json
```

- 두 줄 모두 나와야 Jenkins 경로가 맞는다

```bash
git ls-files --eol Backend/nh-atms-api/gradlew
```

- 맨 앞이 `i/lf` 여야 한다. `i/crlf` 면 Jenkins 의 `sh ./gradlew` 가 깨진다 → 아래 두 줄 후 다시 확인

```bash
git config core.autocrlf true
```

```bash
git add --renormalize -A
```

```bash
git grep -n "CHANGE_ME" -- "*.yml"
```

- `per-no: CHANGE_ME` 2줄이 나오면 정상 → 개인번호는 JVM 옵션으로 (`POST_HANDOVER_EDITS.md` K)
- 옛 main 에 직접 채웠던 내부 값(L4 VIP 등)은 새 앱에 같은 항목이 없으면 옮기지 않는다 (백업 브랜치에 남아 있음)

### 4-5. 커밋·푸시

```bash
git commit -q -m "chore: main 을 nh-atms-common-main 으로 전체 교체 (옛 main 은 backup/main-20261110)"
```

```bash
git push origin main
```

- `rejected` 가 나오면 = 그새 누가 main 에 올림 → 멈추고, 이 폴더를 지운 뒤 4-1 부터 다시 (백업 이름은 `backup/main-20261110-2`)
- `protected branch` 가 나오면 Gitea 관리자 계정으로 브랜치 보호를 잠시 풀고 다시

```bash
git log --oneline -2
```

- 맨 위 = 교체 커밋, 그 아래 = 4-1 에서 사진 찍은 옛 main 번호

### 4-6. 확인과 뒷정리

- Gitea 웹: `main` 맨 위에 `Backend`·`Frontend` · 브랜치 목록에 `backup/main-20261110`
- Jenkins: 두 잡을 **"Build with Parameters" 로 `build-only`** 실행 → 둘 다 성공 확인. 백엔드는 `MODULE=all` 또는 `atms-web` 만 (다른 모듈은 WAR 가 없어 실패 — 정상)
- 4-0 에서 끈 웹훅 다시 켜기 ("활성" 체크). 켠 뒤의 push 부터는 화면이 자동 배포된다
- 팀원 PC: 옛 폴더는 그대로 두고 새로 clone (`git clone http://16.88.122.113:3000/NH-ATMS/nh-atms.git`). 옛 폴더에서 `git pull` 해도 되지만 무시 파일이 남는다
- 개인번호를 JVM 옵션 대신 소스에 넣는다면 이 사본의 `Backend/nh-atms-api/atms-web/src/main/resources/application-jeus.yml` `atms.fixed-user.per-no` 만 바꾼다 (GitHub 에는 올리지 않음)

### 4-7. 되돌리기 (옛 소스로)

강제 푸시 없이 교체 커밋만 취소한다 (교체 커밋이 맨 위일 때):

```bash
git revert --no-edit HEAD
```

```bash
git push origin main
```

- 교체 뒤에 다른 커밋이 쌓였으면 `HEAD` 대신 4-5 의 교체 커밋 번호
- 옛 소스는 언제든 `backup/main-20261110` 에서 볼 수 있다: `git log --oneline -3 origin/backup/main-20261110`

## 5. 첫 배포 순서 (요약)

1. 배포킷 갱신 (3장 #1) → `DEV_SERVER_SETUP.md` ③ 의 `sed`·`chmod`
2. npm 캐시 합치기 (3장 #3)
3. 키 파일 (1장 #5), WAS 담당: atms01 JVM 옵션 개인번호(#6)·JNDI·커넥터 (#10)
4. DB 확인·시드 (#8)
5. Gitea 교체 (4장: 옛 main 백업 → 교체 커밋, 웹훅 잠시 끔) → 두 잡 `build-only` 성공 → 웹훅 다시 켬
6. 백엔드 `build-deploy` `MODULE=atms-web` → `deploy-war.sh` 가 교체·재기동(메뉴 없으면 UNSTABLE → 담당 재기동) → `http://16.88.122.113:8080/v3/api-docs` 200
7. 화면 `build-deploy` → `http://16.88.122.112:9000` (WebtoB `http.m` 적용 후)
8. 화면 확인: `/api/me` 가 사용자 이름을 돌려주는지, 견본 화면 조회, `/login` 에서 "비밀번호를 암호화해서 보냅니다 (키 k202611)"

## 6. 이번 커밋에서 고친 파일

- `nh-atms-common-main/Backend/nh-atms-api/atms-common/src/main/resources/jeus-common.yml`, `NH-ATMS/…/jeus-common.yml` — `cors.allowed-origins` 기본값 (+ 반영 가이드 9단계 사본)
- `docs/DEV_SERVER_SETUP.md`, `INFRA_MANUAL.md`, `REQUIRED_FILES.md`, `SERVER_SETUP_GUIDE.md`, `PROTOTYPE_QUICKSTART.md`, `SERVER_DIRECTORY_LAYOUT.md`, `README.md` — 저장소 이름·zip 이름·서버 업로드 제외 목록·크기
- `docs/POST_HANDOVER_EDITS.md` J — WebtoB IP 가 바뀌면 cors 도
- `nh-atms-common-main/docs/07_API_계약.md` §7 — 키 폴더 권한을 0-2 와 같게(2750)
