# 개발서버 인프라 반입 파일 총정리 (외부망 → 개발서버)

기준: 서버 `nbatmsltws01:/home/atmswas/atms` (이하 `~/atms`, **atmswas 계정** — 2026-10-12 부터 `/home/userATMS` 사용 안 함), 폐쇄망, rootless Podman 5.8.2
작성일: 2026-10-07 · 개정: 2026-10-12 (반입 항목 제외 검토 결과 반영 — [review/반입항목_제외검토_20261008.pdf](review/반입항목_제외검토_20261008.pdf))

> 요약: 이번에 **새로 반입하는 것은 Gitea 이미지, Jenkins 이미지(현업 제작), 배포킷, 체크섬 파일**뿐이다.
> 컨테이너로 앱을 띄우는 데 필요한 항목(JRE·nginx 이미지, compose 실행 파일)은 **JEUS 의 Jakarta 지원 여부 확인 전까지 보류**한다.

## 1. 확정된 구성 (JEUS 기준)

| 항목 | 결정 | 반입 |
|---|---|---|
| 백엔드 | JEUS 9.1 `atms01` 에 **WAR 6개** 배포, 컨텍스트 경로로 구분 (`/`=atms-web `/home/atmswas/catms`, `/journal`·`/batch`·`/file`·`/ifin`·`/ifex` = `catms-<모듈>`) — [JEUS_SOURCE_CHANGES.md](JEUS_SOURCE_CHANGES.md) | 없음 (은행 기설치) |
| 프론트엔드 | WebtoB(`nbatmsltwb01`) DocBase 에 dist 배포 | 없음 (은행 기설치) |
| DB | 은행 Oracle (`NBATMSTP` / `ATMS_APP`) | 없음. JDBC 드라이버는 앱 WAR 에 포함 |
| 서버 컨테이너 | rootless Podman 으로 **Gitea, Jenkins** 만 실행 | Gitea·Jenkins 이미지 |
| CI | Jenkins 컨테이너 (executor 1개) | Jenkins 이미지에 Node·Docker CLI·compose 포함 |
| Git | Gitea 컨테이너, 내부망 Windows PC 에서 HTTP push ([GITEA_SETUP_GUIDE.md](GITEA_SETUP_GUIDE.md)) | Gitea 이미지 |
| 제외 | Kafka / Elasticsearch / Kibana (저널 스트리밍 기본 꺼짐) | 없음 |
| 대안 (보류) | JEUS 가 Spring Boot 3(Jakarta)를 지원하지 않으면 앱을 컨테이너로 실행 | 2-4 보류 항목 |

### 서버 포트 계획

| 서비스 | 컨테이너 포트 | 서버 포트 | 비고 |
|---|---|---|---|
| Gitea HTTP (SSH 사용 안 함) | 3000 | **3000** | |
| Jenkins | 8080 | **8090** | |
| (대안·보류) 백엔드 모듈 | 8080 ~ 8085 | 8080 ~ 8085 | 컨테이너 대안 경로에서만 |
| (대안·보류) 프론트 nginx | 80 | 8088 | 컨테이너 대안 경로에서만 |

- 서버 사용중 포트(6600/6700/6800)와 겹치지 않음. 1024 미만은 rootless 에서 사용 불가.
- 서버는 **CPU 2 core** (JEUS 공존): Jenkins 빌드(Gradle) 중에는 다른 서비스가 느려질 수 있음 → executor 1개로 고정.

---

## 2. 반입 목록

### 2-1. 신규 반입

| # | 파일 | 원본 | 크기(대략) | 용도 | 만드는 곳 |
|---|---|---|---|---|---|
| 1 | `gitea-rootless.tar` | `gitea/gitea:latest-rootless` | 180MB | 사내 Git 서버 (SQLite 내장) | 외부망 `docker save` (3-1) |
| 2 | `nh-atms-jenkins-bank.tar` | Jenkins 2.580.1 + 플러그인 (2-3) | **약 400MB** (적재 후 1.21GB) | CI 빌드 서버 | **현업 제작** (3-2) |
| 3 | `Common-ATMS-main.zip` (본 저장소 — 서버에는 **`NH-ATMS/`·`nh-atms-common-main/` 제외**, 새 앱 소스는 내부 Gitea 로) | GitHub | 약 100MB (2026-11-09, `docs/db-tobe` 사진 약 90MB 포함) | 배포킷·Jenkins 정의·문서 | GitHub 다운로드. 바뀔 때마다 재반입 (2026-10-23 판: 서버 실행 스크립트 추가) → [DEV_SERVER_SETUP.md](DEV_SERVER_SETUP.md) "배포킷 갱신" |
| 4 | `SHA256SUMS.txt`, `versions.txt` | — | — | 무결성 확인·버전 기록 | 위 파일 생성 시 함께 (3-3) |

- 이미지는 모두 **linux/amd64** (서버는 x86_64).
- 크기는 대략치. 실제 크기는 생성 후 확인해 반입 신청서에 기재.
- Jenkins 크기는 2026-10-12 실측값. 최신 Docker Desktop(containerd 저장 방식)은 `docker save` 때 층을 **압축된 채로** 묶어 tar 가 풀린 크기(`docker image ls` 의 SIZE)보다 작다. tar 안에 `index.json`·`manifest.json` 이 함께 들어 있고 서버 Podman 5.8 의 `podman load` 로 그대로 적재된다.
- 2026-10-12 반입본 Gitea 버전: 28.1.0 (`latest-rootless` 는 받는 날마다 바뀌므로 `versions.txt` 로 확인).

### 2-2. 이미 반입된 것 (계속 사용)

| 파일 | 위치(반입 폴더) | 용도 |
|---|---|---|
| `offline-seed` (gradle-modules-cache, gradle-wrapper-dists, npm-cache) | `일괄다운_2` | Jenkins·PC 오프라인 빌드용 캐시 (Jenkins 컨테이너에 마운트). **의존성이 바뀌면 재반입** |
| JDK 21.0.12 (Windows), `node-v22.23.2` | `D:\dev` | PC 빌드용 |

### 2-3. Jenkins 제작 사양 (2번, 현업 제작)

버전은 2026-10-08 Jenkins 업데이트 센터 조회값이며, 저장소 `deploy/jenkins/Dockerfile`·`plugins.txt` 도 같은 버전으로 고정돼 있다.

**본체**

| 항목 | 값 |
|---|---|
| Jenkins | **2.580.1 LTS** (2026-09-30) |
| Java | JDK 21 (이미지 내장) |
| 공식 이미지 | `jenkins/jenkins:2.580.1-lts-jdk21` (Debian trixie) |
| 이미지 digest | `sha256:a660310e39ade10631f774bacd5219de767dfd08947ea5c32a739b5e5bb382c1` |
| WAR (war 방식일 때) | `https://get.jenkins.io/war-stable/2.580.1/jenkins.war` (같은 위치의 `jenkins.war.sha256` 으로 확인) |

**플러그인 (직접 지정 16개)** — 의존 플러그인 71개가 함께 설치됨 (총 87개)

| # | 플러그인 ID | 이름 | 버전 | 최소 Jenkins | 용도 |
|---|---|---|---|---|---|
| 1 | `workflow-aggregator` | Pipeline | 608.v67378e9d3db_1 | 2.479.3 | 파이프라인(Jenkinsfile) 기본 묶음 |
| 2 | `pipeline-stage-view` | Pipeline: Stage View | 2.41 | 2.479.1 | 단계별 실행 화면 |
| 3 | `git` | Git | 5.10.1 | 2.504.3 | Git 소스 받기 |
| 4 | `gitea` | Gitea | 283.v14b_179495971 | 2.528.3 | 사내 Gitea 연동 |
| 5 | `credentials` | Credentials | 1511.v2e3cb_0008ef0 | 2.541.1 | 계정·비밀값 저장소 |
| 6 | `credentials-binding` | Credentials Binding | 728.v902a_273b_8947 | 2.479.3 | 파이프라인에서 비밀값 사용 |
| 7 | `plain-credentials` | Plain Credentials | 199.v9f8e1f741799 | 2.479.3 | 비밀번호·Secret Text 유형 |
| 8 | `ssh-agent` | SSH Agent | 433.v9e73d67c3f74 | 2.479.3 | 파이프라인 내 SSH 키 사용 |
| 9 | `docker-workflow` | Docker Pipeline | 653.v2f2c08eff0ec | 2.541.3 | 파이프라인에서 docker 명령 |
| 10 | `gradle` | Gradle | 2.20.1253.vc116f0763a_eb_ | 2.528.1 | 백엔드 빌드 |
| 11 | `junit` | JUnit | 1434.vde2d24df0c4c | 2.541.3 | 테스트 결과 수집 |
| 12 | `timestamper` | Timestamper | 1.30 | 2.479.3 | 로그 시각 표시 |
| 13 | `ansicolor` | AnsiColor | 542.v03d235fee02d | 2.504.3 | 로그 색상 |
| 14 | `ws-cleanup` | Workspace Cleanup | 0.49 | 2.479.3 | 작업공간 정리 |
| 15 | `build-timeout` | Build Timeout | 1.41 | 2.541.3 | 빌드 시간 제한 |
| 16 | `configuration-as-code` | Configuration as Code | 2133.ve570217cdb_cd | 2.541.1 | 설정 자동 구성(관리자 계정 등) |

**이미지에 함께 넣을 도구** (폐쇄망에서는 나중에 설치 불가)

| 도구 | 버전 | 용도 |
|---|---|---|
| Node.js | 22.23.3 | 화면(React) 빌드 |
| Docker CLI (`docker-ce-cli`) | 29.8.2 | 서버 Podman 에 docker 명령으로 연결 |
| Docker Compose 플러그인 (`docker-compose-plugin`) | 5.6.0 | 파이프라인에서 compose 실행 |

### 2-4. 보류 (JEUS 의 Jakarta 지원 확인 후 결정)

| 항목 | 상태 | 필요해지는 경우 |
|---|---|---|
| `temurin-21-jre-jammy.tar` (`eclipse-temurin:21-jre-jammy`, 270MB) | 미반입 | JEUS 가 Spring Boot 3(Jakarta)를 지원하지 않아 atms-web 을 컨테이너로 띄우는 대안을 쓸 때 |
| `nginx-alpine.tar` (`nginx:alpine`, 50MB) | 미반입 | WebtoB 배포 전에 화면을 임시로 제공할 때 |
| `docker-compose-linux-x86_64` (70MB) | 미반입 | 서버 호스트에서 여러 모듈을 컨테이너로 함께 띄울 때 (Jenkins 안의 compose 는 이미지에 포함) |
| Linux JDK `jdk-21.0.12_linux-x64_bin.tar.gz`, `docker-29.8.0.tgz` 의 `docker` CLI | 기반입 | 컨테이너 없이 직접 실행(`bin/direct.sh`)하거나 위 compose 를 쓰는 대안 경로에서만 사용 |

판정 방법: [JEUS_WEBTOB_DEPLOY_GUIDE.md](JEUS_WEBTOB_DEPLOY_GUIDE.md) STEP 1-3 (JEUS 라이브러리에 `jakarta/servlet/Servlet.class` 가 있는지)

### 2-5. 반입하지 않는 것

| 항목 | 이유 |
|---|---|
| Docker 엔진 (`docker-29.8.0.tgz` 의 dockerd·containerd 등, 기반입) | 설치에 root 필요, 데몬이 상시 root 로 동작 → 1일 root 권한이 끝나면 관리 불가. 기설치 Podman 사용 |
| Docker Desktop 설치 파일 (기반입) | Windows PC 전용 |
| `eclipse-temurin:21-jdk` 이미지 | 백엔드 빌드는 Jenkins 이미지 안의 JDK 21 로 수행 |
| `node:22-alpine` 이미지 | Node 22 가 Jenkins 이미지에 포함 |
| `apache/kafka`, `elasticsearch`, `kibana` | 저널 스트리밍 기본 꺼짐, 업체 시연 환경 전용 (약 2GB) |
| Oracle DB 이미지 | 은행 DB 사용 |
| 업체 Jenkins 구성 (`Jenkins_v1.1.zip`, `NH-ATMS/infra/jenkins` 플러그인 목록) | GitLab·GitHub·Slack·인터넷 전제 → 사내 Gitea 기준 16개로 재구성한 은행용 이미지(2-3)로 대체 |
| `pnpm-offline-package` (기반입) | 프로젝트는 npm(`package-lock.json`) 사용 |
| 동료 검토서 「01 프로그램 버전과 설치 요청」 중 Jenkins 외 11개 (Node 24, React 19.3.0, Vite 8.3, Python 3.12 등) | 업체 소스에 고정된 버전 유지(Node 22, React 19.2.4, Vite 7.3.1) 또는 기설치·동봉. 항목별 이유는 위 PDF 1장 |

---

## 3. 현업이 만드는 방법 (외부망 PC)

전제: 외부망 PC + Docker(`docker version` 에 `Server` 표시). 결과 파일은 모두 linux/amd64.

### 3-1. Gitea 이미지

```bat
docker pull --platform linux/amd64 gitea/gitea:latest-rootless
docker save -o gitea-rootless.tar gitea/gitea:latest-rootless
docker run --rm --entrypoint gitea gitea/gitea:latest-rootless --version
```
마지막 줄의 버전을 `versions.txt` 에 기록한다.

### 3-2. Jenkins 이미지 (2-3 사양)

만드는 방식은 현업이 정한다. 저장소 정의를 쓰는 경우 (버전이 2-3 과 같게 고정돼 있음):
```bat
docker build --platform linux/amd64 -t localhost/nh-atms-jenkins:bank deploy\jenkins
docker save -o nh-atms-jenkins-bank.tar localhost/nh-atms-jenkins:bank
docker run --rm localhost/nh-atms-jenkins:bank jenkins-plugin-cli --list > jenkins-plugins.txt
```

반입 전 확인 (cmd·PowerShell 모두 가능, 2026-10-12 실제 결과와 같으면 정상):
```bat
docker run --rm --entrypoint java localhost/nh-atms-jenkins:bank -jar /usr/share/jenkins/jenkins.war --version
docker run --rm --entrypoint node localhost/nh-atms-jenkins:bank --version
docker run --rm --entrypoint docker localhost/nh-atms-jenkins:bank --version
docker run --rm --entrypoint docker localhost/nh-atms-jenkins:bank compose version
docker run --rm --entrypoint sh localhost/nh-atms-jenkins:bank -c "ls /usr/share/jenkins/ref/plugins/*.jpi | wc -l"
```

| 줄 | 정상 결과 |
|---|---|
| 1 | `2.580.1` |
| 2 | `v22.23.3` |
| 3 | `Docker version 29.8.2, ...` |
| 4 | `Docker Compose version v5.6.0` |
| 5 | `87` (지정 16개 + 의존 71개). 16 이하면 의존 플러그인 누락 → 다시 빌드 |

현업에서 받을 결과물:
- `nh-atms-jenkins-bank.tar` (이미지 이름 `localhost/nh-atms-jenkins:bank`)
- 실제 설치된 플러그인 목록(`jenkins-plugins.txt`, 이름·버전) — 반입 후 2-3 표와 대조

### 3-3. 체크섬·버전 기록 (PowerShell, 결과 파일이 있는 폴더에서)

```powershell
Get-ChildItem *.tar | ForEach-Object { "{0}  {1}" -f (Get-FileHash $_.Name -Algorithm SHA256).Hash.ToLower(), $_.Name } | Set-Content -Encoding ascii SHA256SUMS.txt
```
`versions.txt` 에는 Gitea 버전, Jenkins 2.580.1, 만든 날짜를 적는다.

### 3-4. 참고

- 반입 용량 제한(예: 512MB)이 있으면 `nh-atms-jenkins-bank.tar` 는 7-Zip 분할(`.001`, `.002`) 후 반입, 내부 PC 에서 합쳐서 업로드.
- `deploy/offline-bundle/make-bundle.ps1` 은 보류 항목(2-4)까지 전부 만들고 Jenkins 도 직접 빌드하므로 **이번 반입에는 쓰지 않는다**. 보류 항목이 필요해지면 그때 사용.

---

### 3-5. 화면 npm 라이브러리 반입 — **스크립트로 캐시 폴더째** (2026-11-09 개정, 처음 결정 2026-11-06)

tgz 만 반입하면 폐쇄망에서 `ENOTCACHED` 로 실패한다 (`npm cache add <tgz>` 는 목록 정보(packument)를 넣지 않음 — [INFRA_MANUAL.md](INFRA_MANUAL.md) T67). 그래서 인터넷 PC 에서 **실제 설치로 채운 npm 캐시 폴더를 통째로** 반입한다.

2026-11-09 부터는 저장소의 **`deploy/offline-bundle/make-npm-carry.mjs`** (Windows 는 같은 폴더의 `make-npm-carry.bat` 더블클릭) 가 한 번에 만든다:

| 단계 | 하는 일 |
|---|---|
| 1 | 두 화면 프로젝트의 `package.json`·`package-lock.json` 으로 각각 `npm ci` → 한 캐시에 모음<br>· `nh-atms-common-main/Frontend/nh-atms-web` (새 앱, NH-ATMS 에 없던 143개 포함)<br>· `NH-ATMS/Frontend/nh-atms-web` (**node-forge 1.4.0 · @types/node-forge 1.3.14** 포함 — 2026-11-09 부터 새 앱 lock 에도 같은 버전으로 들어 있음) |
| 2 | 다른 운영체제용 실행 파일 패키지(`@esbuild/*-x64`, `@rollup/rollup-*-x64-*`)를 Windows·Linux 둘 다 `npm cache add` — Windows PC 의 `npm ci` 는 자기 것만 받아서, 그대로면 Jenkins(Linux)에서 빌드 단계가 실패할 수 있음 |
| 3 | 자체 검증: 새 빈 폴더에서 두 프로젝트를 `npm ci --offline` + node-forge 설치 확인 + 운영체제별 패키지 오프라인 확인 |
| 4 | `npm-carry.zip` (안에 `_cacache\...`, Windows 내장 `tar` 로 묶음) + `npm-carry.zip.sha256.txt` |

2026-11-09 시험 (Linux, 인터넷 환경): zip 약 60MB (패키지 약 480개), 만든 zip 을 ws01 방식(`python3 -m zipfile -e`)으로 푼 캐시만으로 **두 프로젝트 모두 `npm ci --offline` → `npm run build` 성공** (Jenkins 화면 잡과 같은 명령).

① 인터넷 PC (Windows) — 준비: Node 22.13 이상, Common-ATMS 저장소 전체(zip 다운로드 또는 clone)
- `deploy\offline-bundle\make-npm-carry.bat` 더블클릭 (결과 폴더 기본 `D:\npm-carry-build`, 다른 곳은 `cmd` 에서 `make-npm-carry.bat E:\carry`)
- 끝에 `[npm-carry] 완료` 와 SHA256 이 나오면 성공. `실패:` 가 나오면 그 줄의 원인대로 (결과 폴더가 비어 있지 않음 / Node 버전 / 인터넷)
- 반입 신청: `D:\npm-carry-build\npm-carry.zip` + SHA256 값 (`npm-carry.zip.sha256.txt`)
- PowerShell `Compress-Archive` 로 다시 묶지 않는다 — Windows PowerShell 5.1 은 zip 안 경로를 `\` 로 저장해 ws01 에서 폴더가 아니라 이름에 `\` 가 든 파일로 풀릴 수 있다

② 폐쇄망 팀 PC (`cmd`) — 받은 캐시를 내 npm 캐시에 **합친다** (기존 파일은 건드리지 않음):
```bat
powershell Expand-Archive -Path D:\반입\npm-carry.zip -DestinationPath D:\npm-carry -Force
```
```bat
robocopy D:\npm-carry\_cacache "%LOCALAPPDATA%\npm-cache\_cacache" /E /XC /XN /XO
```
(`robocopy` 는 성공해도 종료코드 1 — 마지막 표의 `실패` 칸이 0 이면 정상)

③ 폐쇄망 팀 PC — 확인 (`nh-atms-common-main\Frontend\nh-atms-web` 또는 `NH-ATMS\Frontend\nh-atms-web`):
```bat
npm config get registry
```
```bat
npm ci --offline
```
```bat
npm run build
```
- 첫 줄은 `https://registry.npmjs.org/` 여야 한다 (캐시는 주소별 저장 — 다르면 T67)
- 두 프로젝트 모두 `package.json`·lock 에 이미 들어 있으므로 `npm install` 로 json 을 고칠 필요가 없다

④ ws01 Jenkins 캐시에도 같은 zip 을 합친다 (atmswas, FileZilla 바이너리로 `~/atms/inbox/npm-carry.zip` 업로드 후):
```bash
cd ~/atms/inbox
```
```bash
sha256sum npm-carry.zip
```
```bash
python3 -m zipfile -e npm-carry.zip npm-carry
```
```bash
ls npm-carry/_cacache
```
```bash
podman unshare mkdir -p ~/atms/infra/jenkins/cache/npm/_cacache
```
```bash
podman unshare cp -rn ~/atms/inbox/npm-carry/_cacache/. ~/atms/infra/jenkins/cache/npm/_cacache/
```
```bash
podman unshare chown -R 1000:1000 ~/atms/infra/jenkins/cache/npm/_cacache
```
```bash
rm -rf ~/atms/inbox/npm-carry
```
- `sha256sum` 값이 반입 신청 값과 같아야 한다 (대소문자 무관)
- `ls` 에 `content-v2`·`index-v5` 가 보여야 한다 (`_cacache\content-v2…` 처럼 `\` 가 든 이름이면 zip 을 Compress-Archive 로 다시 묶은 것 → ① 의 결과 zip 을 그대로 반입)
- `cache/npm` 은 컨테이너 1000(subuid) 소유라 `podman unshare` 를 붙인다 (없으면 `Permission denied`). Jenkins 재기동 불필요 (`/cache/npm` 으로 마운트됨)
- 확인: 화면 잡 `nh-atms-frontend` `MODE=build-only` 가 `ENOTCACHED` 없이 `npm run build` 까지 성공

- 다른 팀원 PC 는 ② ③ 만 (zip 은 ⑤ 의 Gitea 릴리스에서 받는다)
- 라이브러리를 새로 추가할 때: 인터넷 PC 에서 프로젝트에 `npm install 이름@버전 --save-exact` → `package.json`·lock 커밋 → 이 스크립트를 다시 돌려 반입 (예전처럼 빈 폴더에 따로 설치할 필요 없음) → ⑤ 로 새 릴리스

⑤ 팀 배포 — **내부 Gitea 릴리스에 zip 첨부** (2026-11-10 사용자 결정)

zip 을 사람마다 USB·메신저로 돌리지 않고, 반입한 사람이 내부 Gitea 저장소의 **릴리스**에 한 번 올린다. 팀원은 거기서 받는다.

- **매번 받는 것이 아니다**: 합친 캐시는 각 PC 의 `%LOCALAPPDATA%\npm-cache` 에 남는다. 저장소를 지우고 다시 clone 해도 그대로 쓴다. 다시 받는 때는 ⓐ 새 PC·새 팀원 ⓑ `package-lock.json` 이 바뀌어 `npm ci --offline` 이 `ENOTCACHED` 로 멈출 때뿐
- **저장소에 zip 을 커밋하지 않는다**: 갱신할 때마다 약 60MB 가 이력에 영원히 쌓여 clone·Jenkins 체크아웃이 계속 무거워지고, 저장소째 반입할 때 압축 안에 압축이 생긴다(반입 규칙 위반). 릴리스 첨부 파일은 git 이력 밖에 저장된다

올리는 사람 (반입 담당, Gitea 화면에서):
- 저장소 → **릴리스** → **새 릴리스**
- 태그 이름 `npm-carry-YYYYMMDD` (예: `npm-carry-20261109`), 대상 `main`, 제목도 같게
- 설명에 적을 것: SHA256 값(`npm-carry.zip.sha256.txt`), 만든 기준 커밋(`package-lock.json` 이 들어 있는 커밋), 지난 릴리스보다 늘어난 라이브러리
- 파일 첨부: `npm-carry.zip` (이름을 `npm-carry-YYYYMMDD.zip` 으로 바꿔도 SHA256 은 같다)
- 첨부 크기: Gitea 기본 한도가 파일당 2048MB(`[repository.release] FILE_MAX_SIZE`)라 60MB 는 그대로 올라간다 (2026-11-10 기준 이 서버에서 실제 업로드는 미시험)
- 옛 릴리스는 지우지 않는다 — 옛 커밋을 빌드해야 할 때 그 시점 zip 이 필요할 수 있다

받는 사람 (팀원 PC, `cmd`):
- Gitea 저장소 → 릴리스 → **가장 위(최신)** 의 zip 을 `D:\반입\` 에 받는다
- SHA256 확인 (릴리스 설명의 값과 같아야 함, 대소문자 무관):
```bat
certutil -hashfile D:\반입\npm-carry-20261109.zip SHA256
```
- 그다음 ② ③ (파일 이름만 받은 이름으로). robocopy 는 없는 파일만 채우므로 갱신 때도 같은 명령을 다시 쓰면 된다
- Jenkins 캐시(④)는 서버에 직접 올리는 절차 그대로 (릴리스는 PC 용)
- (이전 방식, 2026-11-06) node-forge 2개만 빈 폴더 설치로 캐시를 만들던 절차는 이 스크립트가 대신한다 — NH-ATMS lock 에서 같은 버전·같은 의존(`@types/node` 등)으로 들어간다

## 4. 서버 반입 후 처리

**atmswas 로 로그인**해서 진행한다 (`~` = `/home/atmswas`). 배포킷 배치부터 Gitea·Jenkins 기동까지 전체 순서는 [DEV_SERVER_SETUP.md](DEV_SERVER_SETUP.md).

```bash
mkdir -p ~/atms/images
# (FileZilla 바이너리 모드로 ~/atms/images/ 에 업로드 후)
cd ~/atms/images
sha256sum -c SHA256SUMS.txt
podman load -i gitea-rootless.tar
podman load -i nh-atms-jenkins-bank.tar
podman images
```

`podman images` 에서 기대하는 이름:

| 이미지 | podman 표시 이름 |
|---|---|
| Gitea | `docker.io/gitea/gitea:latest-rootless` |
| Jenkins | `localhost/nh-atms-jenkins:bank` |

이후 Gitea 설치는 [GITEA_SETUP_GUIDE.md](GITEA_SETUP_GUIDE.md) 를 따른다.

### 4-1. (보류 항목을 반입하게 되면)

```bash
podman load -i temurin-21-jre-jammy.tar
podman load -i nginx-alpine.tar
mkdir -p ~/atms/tools ~/.docker/cli-plugins
mv ~/atms/images/docker-compose-linux-x86_64 ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose
tar -xzf docker-29.8.0.tgz -C ~/atms/tools --strip-components=1 docker/docker
systemctl --user enable --now podman.socket
export DOCKER_HOST=unix:///run/user/$(id -u)/podman/podman.sock
~/atms/tools/docker compose version
```
표시 이름: JRE `docker.io/library/eclipse-temurin:21-jre-jammy`, nginx `docker.io/library/nginx:alpine`

---

## 5. 구성별 서버 측 주의사항 (반입 후 셋팅 시)

| 구성 | 주의 |
|---|---|
| Jenkins ↔ Podman | rootless Podman 소켓을 컨테이너의 `/var/run/docker.sock` 으로 마운트. 데이터 폴더는 `podman unshare chown -R 1000:1000` 으로 컨테이너 jenkins(1000) 소유로 맞춘다 (`--userns=keep-id` 는 이 서버의 podman 5.8.2 / crun 1.27 에서 기동 실패, 2026-10-14) |
| Jenkins 빌드 캐시 | `offline-seed` 의 Gradle 캐시를 `GRADLE_USER_HOME`, npm 캐시를 `npm_config_cache` 로 마운트 → `gradlew --offline`, `npm ci --offline`. **의존성이 바뀌면 캐시 재반입 필요** |
| Jenkins → Gitea | Gitea 플러그인 포함. Jenkins 에서 `http://<서버IP>:3000/<조직>/<저장소>.git` 을 SCM 으로 등록 (화면 잡은 Gitea 웹훅 → git 플러그인 notifyCommit, `FRONTEND_CICD_PLAN.md`) |
| Gitea | 내부망 Windows PC 에서 `git push http://<서버IP>:3000/...` (HTTP, 계정+토큰). PC 에 Git for Windows 필요 |
| 자동기동 | Quadlet/podman `--restart` 모두 서버 재부팅 후 기동에는 **linger(인프라 요청)** 필요 |
| (대안·보류) 백엔드 compose | 프로젝트 `docker-compose.yml` 은 이미지 안에서 Gradle 빌드(인터넷 필요) + 업체 경로(`/home/atec`) 사용 → 은행용 compose 를 별도 작성해 `deploy/Dockerfile`(미리 빌드한 jar) 사용 |
| (대안·보류) 프론트 nginx | `nginx/default.conf` 의 `resolver 127.0.0.11`(Docker 전용 DNS) 제거, 업스트림을 compose 서비스명 또는 서버 IP 로 |

---

## 6. 파일이 아닌 선결 사항

| 항목 | 요청처 |
|---|---|
| JEUS 제품 버전·Fix, **servlet 규격(Jakarta 지원 여부)**, 실행 JDK → 2-4 보류 항목 결정 | WAS 담당 (또는 JEUS 가이드 STEP 1-3 으로 직접 확인) |
| WebtoB 버전·Fix, Oracle 버전 | 각 담당자 |
| 개발 PC 의 Git for Windows 설치 여부, PC 빌드용 Temurin 21 JDK 보유 여부 (없으면 Windows 용 Temurin 21 반입) | 본인 |
| DB 호스트·포트, `ATMS_APP` 비밀번호, ATMS 테이블 존재 여부 | DBA |
| atmswas 의 `/etc/subuid`, `/etc/subgid` 등록, `loginctl enable-linger atmswas` | 인프라 (또는 1일 root) |
| `/home/atmswas` 디스크 여유 10GB 이상 (공용 10G 면 전용 디스크 할당) | 인프라 |
| 서버 → DB 방화벽 | 인프라 |
| 내부망 PC → 서버 3000(Gitea), 8090(Jenkins) 방화벽 | 인프라 |
| (대안·보류) PC → 서버 8080~8085·8088, ATM 에이전트 → 서버 | 인프라 (대안 경로를 쓸 때) |
| 반입 승인 (2-1 목록) | 보안/반입 담당 |
| JEUS atms01 앱 6개 등록(컨텍스트 경로), HTTP 리스너 포트, JVM 힙·옵션 | 현업(WAS 담당) — `JEUS_SOURCE_CHANGES.md` 7-6 |
