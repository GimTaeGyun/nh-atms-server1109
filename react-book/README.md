# 번호표 뽑고 시작하는 리액트

은행 업무 화면 소스로 배우는 첫 프론트엔드 — `nh-atms-common-main/Frontend/nh-atms-web` 소스를 교재로 삼은 리액트 입문서(사내 교육용, 188×257mm, 150쪽)의 원고와 조판 도구입니다.

- 완성본: **`react-book.pdf`**
- 원고: `manuscript/*.md` (장별 Markdown) · 그림: `img/*.svg` · 화면 캡처: `img/shots/*.png`
- 집필 규칙: `STYLE.md` · 차례와 쪽수: `book.config.mjs`

## 폴더

| 경로 | 무엇 |
|---|---|
| `manuscript/` | 원고. `00-preface.md`(머리말), `00-guide.md`(읽는 방법), `01-…` ~ `14-…`(장) |
| `img/` | 직접 그린 그림(SVG). `img/shots/` 는 앱 화면 캡처와 목록(`INDEX.md`) |
| `parts/` | 표지·속표지·판권 (HTML) |
| `styles/book.css` | 판형·글꼴·상자·코드 모양 |
| `scripts/build.mjs` | 원고 → HTML → PDF. 소스 인용 대조, 차례·찾아보기 쪽번호 채우기 |
| `scripts/fig.mjs` | 그림(SVG) 미리보기 |
| `scripts/shots/` | 화면 캡처 도구(가짜 백엔드 `mock-api.mjs` + 캡처 `capture.mjs`) |
| `dist/` | 빌드 중간 산출물(Git 에 올리지 않음) |

## 다시 만들기 (인터넷이 되는 PC 에서)

글꼴과 조판 도구를 npm 으로 받으므로 폐쇄망에서는 빌드하지 않습니다. 폐쇄망에는 `react-book.pdf` 만 가져가면 됩니다.

```bash
cd react-book
npm install
node scripts/build.mjs            # 책 전체 → react-book.pdf (장별 쪽수 보고)
node scripts/build.mjs --only 05  # 5장만 → dist/ch05.pdf
node scripts/build.mjs --only 05 --png   # 쪽 그림도 → dist/png/ch05-N.png
```

- PDF 는 Chromium(Playwright)으로 인쇄합니다. Playwright 는 전역에 설치된 것을 씁니다.
- 원고의 코드 블록에 `src="경로:시작-끝"` 이 붙어 있으면 실제 소스 파일과 한 줄씩 대조합니다. 소스가 바뀌어 인용과 달라지면 빌드가 어느 줄이 다른지 알려 주고 멈춥니다. 그때는 원고의 인용과 설명을 소스에 맞춰 고칩니다.
- 화면 캡처를 다시 찍으려면 `node scripts/shots/capture.mjs` (가짜 백엔드와 개발 서버를 스스로 띄웁니다. 화면 속 이름·사무소·번호는 모두 지어낸 자료입니다).

## 원고를 고칠 때

1. `STYLE.md` 를 먼저 읽습니다(문체, 용어, 원고 문법).
2. 고친 장을 `--only` 로 빌드해 쪽수가 `book.config.mjs` 의 목표와 맞는지 봅니다.
3. 책 전체를 빌드해 합계가 150쪽인지, 차례와 찾아보기 쪽번호가 맞는지 봅니다.
