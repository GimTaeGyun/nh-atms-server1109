# HTML과 CSS, 화면의 뼈대와 옷

::: lead
화면에 무엇이 놓이는지 적는 HTML과 어떻게 보이는지 적는 CSS를, 우리 소스를 읽는 데 필요한 만큼만 배웁니다. 이 장을 마치면 개발자 도구에서 요소를 찾아내고, 왜 그런 모양인지 소스에서 짚을 수 있습니다.
:::

::: goals
- 요소·태그·속성이 무엇인지 말하고 `index.html`을 읽을 수 있다
- 우리 화면에 자주 나오는 태그가 무엇을 그리는지 설명할 수 있다
- CSS 규칙의 모양과 박스 모델, flex 배치를 읽을 수 있다
- 개발자 도구로 요소와 그 요소에 입힌 CSS를 찾을 수 있다
:::

::: files
- `index.html`
- `src/screens/sample/NoticePage.tsx`
- `src/screens/home/home.css`
- `src/theme/global.css`
- `src/components/page/page.css`
- `src/components/feedback/LoadingBlock.tsx`
:::

[[#ch1]]에서 띄워 둔 우리 화면으로 돌아갑니다. 개발자 도구가 닫혀 있으면 <kbd>F12</kbd>로 열고 Elements 탭을 고르세요. 꺾쇠괄호로 둘러싼 글이 줄줄이 나옵니다. 이 화면의 속 모습입니다. 암호처럼 보여도 쓰인 말은 둘뿐입니다. 뼈대를 적는 HTML과 옷을 적는 CSS입니다.

## 태그로 뼈대 세우기 {#ch2-tag}

화면의 "공지사항" 네 글자만으로는 제목인지 버튼 글자인지 브라우저가 알 수 없습니다. HTML은 글자를 @@**태그**|태그@@(tag)로 감싸 무엇인지 알려 줍니다. 태그는 꺾쇠괄호(`<`, `>`)로 둘러싼 표시입니다.

아래 그림은 Elements 탭에 보이는 홈 화면 카드 제목입니다. 여는 태그와 닫는 태그가 내용을 감쌌고, 닫는 태그에는 빗금(`/`)이 붙습니다. 여는 태그부터 닫는 태그까지를 @@**요소**|요소@@(element)라고 부릅니다. 여는 태그 안에는 요소에 덧붙이는 정보인 @@**속성**|속성(HTML)@@(attribute)을 `이름="값"` 모양으로 적습니다.

![요소 하나의 생김새. 홈 화면 카드의 제목이다](img/ch02-element.svg){width=82%}

*화면은 이런 요소를 쌓아 만듭니다.* 요소 안에는 글자뿐 아니라 다른 요소도 들어갑니다. 감싸는 쪽을 **부모**(parent), 안에 든 쪽을 **자식**(child)이라고 부릅니다. 소스에서는 자식을 안쪽으로 들여 써서 누가 누구 안에 있는지 보이게 합니다. 우리 프로젝트에 HTML 파일은 `index.html` 하나뿐이니 14줄 전체를 읽어 봅시다.

```html src="index.html:1-14" hl="11"
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <title>NH농협은행 자동화기기 종합관리시스템</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

1행은 이 글이 HTML 문서라고 알리는 줄입니다. 2행에서 열린 `html`은 14행에서 닫히고, 그 안의 자식은 머리 `head`(3~9행)와 몸 `body`(10~13행)입니다. `head`에는 화면에 그리지 않는 정보를 둡니다.

4행은 한글이 깨지지 않게 글자를 저장한 방식을 알립니다. 5행은 브라우저 탭의 작은 그림, 6행은 화면 폭을 기기에 맞추는 설정, 7행은 밝은 색 화면을 쓴다는 설정이고, 8행의 `title`은 탭에 뜨는 제목입니다. 4~7행은 감쌀 내용이 없어 닫는 태그 없이 혼자 씁니다. 맨 뒤의 `/`는 끝났다는 표시인데, HTML에서는 빼도 되어 Elements 탭에는 보이지 않습니다([[#ch5]]의 리액트 코드에는 꼭 붙입니다).

`body`에는 화면에 보이는 것을 두는데, 2줄뿐입니다. 11행의 `div`는 `root`라는 @@`id`|id@@만 있고 내용이 없는 빈 상자입니다. `id`는 문서 안에서 하나뿐인 이름을 붙이는 속성입니다. 12행의 `script`는 `src` 속성에 적힌 자바스크립트 파일을 불러와 실행합니다.

로고도 메뉴도 표도 이 파일에는 없습니다. 하지만 Elements 탭에서 `<div id="root">` 왼쪽의 세모를 눌러 펼쳐 보면 안에 요소가 겹겹이 들어 있습니다. 12행이 불러온 자바스크립트가 브라우저 안에서 요소를 만들어 채워 넣은 것입니다. Elements 탭은 서버가 준 파일이 아닌 지금 이 순간의 화면을 보여 줍니다. 상자를 채우는 일은 리액트가 맡고, 그 과정은 [[#ch5]]에서 따라가 봅니다.

## 자주 만나는 태그 {#ch2-tags}

태그는 100가지가 넘지만 자주 만나는 것은 아래 표의 10개 남짓입니다. 가장 흔한 `div`와 `span`은 뜻이 없는 상자라서, 앞 그림의 카드 제목처럼 무엇인지는 `class`에 적습니다.

표: 자주 만나는 태그

| 태그 | 무엇인가 | 우리 화면의 어디 |
|---|---|---|
| `div` | 구역을 나누는 상자 | 화면 틀, 조회조건 상자, 카드 등 거의 모든 곳 |
| `span` | 글 한 줄 안의 한 토막 | "(45건)" 같은 건수, 제목 앞의 남색 막대 |
| `h1` | 가장 큰 제목 | 화면 제목 "공지사항" |
| `p` | 글 한 문단 | 우리 화면에는 없음([[#ch5]]의 예제에 나옴) |
| `button` | 누르는 버튼 | [조회], [등록], 맨 위 줄의 메뉴 |
| `input` | 글자를 치는 입력 칸(닫는 태그 없음) | 조회조건의 검색어 칸 |
| `a` | 누르는 글자(링크) | 목록의 공지 제목(누르면 상세 팝업) |
| `img` | 그림(닫는 태그 없음) | 맨 위 줄의 로고 |
| `table` `tr` `th` `td` | 표, 행, 머리 칸, 자료 칸 | 공지 목록, 인쇄용 표 |

표 태그는 공지사항 화면의 소스 `NoticePage.tsx`에서 찾아봅니다. 목록 표는 antd 부품이 그리므로 소스에 `table` 태그가 없습니다. 태그가 그대로 적힌 것은 [출력]을 누를 때만 나타나는 인쇄용 표입니다. `.tsx` 파일에는 자바스크립트와 태그를 함께 적는데, 태그를 읽는 법은 `index.html`과 같습니다.

```tsx src="src/screens/sample/NoticePage.tsx:112-115"
        <table>
          <thead>
            <tr><th>순번</th><th>번호</th><th>제목</th><th>사무소</th><th>작성자</th><th>작성일</th><th>조회수</th></tr>
          </thead>
```

표 전체가 `table`이고, 그 안이 머리 `thead`와 몸 `tbody`로 나뉩니다. 114행을 보세요. `tr` 하나가 표의 가로 한 줄, 곧 행 하나입니다. 그 안에 머리 칸 `th` 7개가 들어 맨 위 행을 이룹니다. 이어지는 116~122행의 `tbody`는 공지 한 건마다 `tr` 하나와 자료 칸 `td` 7개를 만드는데, 자바스크립트가 섞인 이 방법은 [[#ch5]]에서 배웁니다.

## CSS로 옷 입히기 {#ch2-css}

HTML만 있으면 화면은 흰 바탕에 검은 글자가 위에서 아래로 늘어설 뿐입니다. 글자를 굵게 하고, 상자에 테두리를 두르고, 버튼을 오른쪽 끝에 놓는 일은 CSS가 합니다. CSS는 **규칙**(rule)을 늘어놓은 글이고, 규칙 하나는 누구에게 무엇을 입힐지 적습니다. 아래는 홈 화면 카드 제목의 규칙입니다.

```css src="src/screens/home/home.css:5"
.home-card-title { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
```

중괄호 앞의 `.home-card-title`이 @@**선택자**|선택자@@(selector)이고, 규칙을 입힐 요소를 고릅니다. 중괄호 안에는 `속성: 값;` 쌍을 늘어놓습니다. 이 속성(property)은 태그에 적던 속성(attribute)과 낱말만 같은 다른 것입니다. `font-size`는 글자 크기, `font-weight`는 글자 굵기(700이면 굵게), `margin-bottom`은 아래쪽 바깥 여백입니다. px(픽셀)은 화면의 점 하나를 기준으로 한 길이 단위입니다.

선택자 맨 앞의 점(`.`)은 @@**클래스**|클래스(class)@@(class) 이름이라는 표시입니다. 클래스는 요소에 붙이는 별명이고 `class` 속성에 적습니다. [[#ch2-tag]]의 그림에서 본 `class="home-card-title"`이 그것입니다. 브라우저는 이 별명이 붙은 요소를 모두 찾아 규칙을 입히므로, 홈 화면 카드 4장의 제목이 모두 16px 굵은 글씨입니다. *CSS의 `.이름`과 요소의 `class="이름"`이 짝입니다.*

::: tip 짝을 찾을 때는 이름만 검색하세요
`.tsx`에서는 `class`를 `className`이라 적습니다([[#ch5]]). VS Code의 전체 검색(<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd>)에 `home-card-title`처럼 점 없이 넣으면 규칙과 그 클래스를 쓴 소스가 함께 나옵니다.
:::

브라우저는 모든 요소를 네 겹의 네모 상자로 그립니다. 한가운데에 내용이 있고, 그 둘레를 @@**안쪽 여백**|안쪽 여백@@(`padding`), @@**테두리**|테두리@@(`border`), @@**바깥 여백**|바깥 여백@@(`margin`)이 차례로 감쌉니다. 이 네 겹을 @@**박스 모델**|박스 모델@@(box model)이라고 합니다. 요소의 크기와 이웃 요소와의 간격이 이 네 겹의 값으로 정해집니다. 공지사항 화면에서 조회조건을 담은 흰 상자에 입힌 규칙으로 확인해 봅니다.

```css src="src/theme/global.css:88-95"
.search-panel {
  background: var(--bg-panel);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 12px 16px;
  margin-bottom: 14px;
}
```

93행의 `padding`처럼 값을 둘 적으면 앞이 위아래, 뒤가 좌우이고, 하나만 적으면 사방이 같습니다. 90행의 `border`는 굵기 1px의 실선(`solid`)을 두릅니다. 94행의 `margin-bottom`은 상자 아래를 14px 비워 밑의 목록과 떨어뜨립니다. 89·91·92행은 바탕색, 둥근 모서리, 그림자이고, `var(…)`는 [[#ch2-where]]에서 풉니다. 이 값을 네 겹에 놓으면 아래 그림과 같습니다.

![조회조건 상자의 네 겹. 숫자는 위 규칙의 값이고, 색과 굵기는 겹을 나눠 보이려고 칠했다](img/ch02-box-model.svg){width=82%}

## 줄 세우기, flex {#ch2-flex}

`div`는 가만히 두면 위에서 아래로 한 줄에 하나씩 쌓입니다. 그런데 화면 제목 줄에는 왼쪽에 제목이, 같은 줄 오른쪽 끝에 버튼들이 있습니다. 우리 소스에서는 요소를 가로로 세우는 일을 거의 다 @@**flex**|flex@@(플렉스)가 맡습니다. flex는 자식 요소들을 한 줄로 세우고 간격과 정렬을 정하는 배치 방법입니다.

*flex는 줄을 세울 자식들의 부모에 줍니다.* 부모 요소에 `display: flex`를 주면 그 자식들이 가로로 나란히 섭니다. 줄은 속성 셋으로 다듬습니다. `gap`은 자식 사이의 간격이고, `align-items`는 세로 방향 맞춤으로 `center`면 키가 달라도 가운데를 맞춥니다. `justify-content`는 가로 방향 배치로, `center`면 가운데로 모으고 `space-between`이면 양 끝으로 벌립니다.

자식을 세로로 세우면(`flex-direction: column`, [[#ch5]]) 두 속성의 방향이 서로 바뀝니다. 아래 그림에서 회색 상자가 부모, 점선 상자가 버튼 둘을 묶은 상자입니다.

![flex가 줄을 세우는 모습. 부모에 무엇을 주느냐에 따라 자식의 자리가 달라진다](img/ch02-flex.svg){width=90%}

```css src="src/theme/global.css:68-69"
.flex { display: flex; align-items: center; gap: 8px; }
.flex-between { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
```

68·69행은 자주 쓰는 속성 묶음에 이름을 붙여 둔 클래스입니다. 요소에 `class="flex-between"`만 붙이면 자식이 양 끝으로 벌어집니다. 공지사항 화면 제목 줄도 같은 배치로, 왼쪽 끝에 제목이, 오른쪽 끝에 버튼줄이 있습니다. 이 줄의 클래스 `page-title-row`에도 `page.css` 5행이 69행과 같은 `justify-content: space-between`을 줍니다. 버튼들은 한 상자로 묶여 있어 함께 오른쪽 끝에 섭니다.

CSS 파일에 규칙을 만들지 않고 요소에 직접 적기도 합니다. 이때는 @@`style` 속성|style 속성@@을 씁니다. "불러오는 중…" 표시를 그리는 부품의 한 줄입니다.

```tsx src="src/components/feedback/LoadingBlock.tsx:4"
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height, color: 'var(--text-muted)', gap: 10 }}>
```

중괄호 안은 flex에서 본 이름들이고, 가로도 세로도 `center`이니 내용이 한가운데에 놓입니다. `.tsx` 파일이라 `style={{ … }}`로 감싸고, 이름은 `-`를 빼고 다음 글자를 대문자로 써서 `alignItems`처럼 적습니다. 값에 붙은 따옴표, 숫자만 적은 `gap: 10`, 값 없이 쓴 `height`는 [[#ch3]]과 [[#ch5]]에서 풉니다.

::: note 이름만 알아 둘 것 두 가지
`grid`는 바둑판처럼 나누는 배치이고, `@media`는 인쇄할 때처럼 조건이 맞을 때만 입히는 규칙입니다.
:::

## 우리 소스의 CSS가 사는 곳 {#ch2-where}

우리 소스의 CSS 파일은 6개뿐입니다. `src/theme/global.css`에는 앱 전체가 함께 쓰는 규칙이 있고, 나머지 5개는 `home.css`처럼 자기가 꾸미는 화면이나 부품 옆에 있습니다. 어느 파일에 적든 규칙은 앱 전체에 걸립니다. 그래서 클래스 이름 앞에 `home-`, `page-` 같은 말을 붙여 겹치지 않게 합니다.

`global.css` 앞부분에는 색과 크기에 이름을 붙인 목록이 있습니다. 같은 남색을 여기저기 적어 두면 색을 바꿀 때 모두 찾아 고쳐야 하기 때문입니다. 이름 붙인 값이 @@**CSS 변수**|CSS 변수@@(CSS variable)입니다.

```css src="src/theme/global.css:11-16" hl="3"
:root {
  /* … */
  --primary: #054681;
```

16행은 남색 색상 코드 `#054681`에 `--primary`라는 이름을 붙입니다. 11행의 `:root`는 문서의 맨 바깥 요소를 고르는 선택자라서, 이 이름은 어디서나 `var(--primary)`로 꺼내 씁니다.

`home.css` 4행의 `color: var(--primary);`가 홈 화면 카드의 아이콘을 남색으로 칠합니다. `color`는 글자색인데 아이콘도 이 색을 따릅니다. 이 변수를 꺼내 쓰는 곳이 아무리 많아도 16행만 바꾸면 모두 함께 바뀝니다. antd 부품의 남색은 같은 폴더의 `antdTheme.ts`가 따로 정합니다([[#ch9]]).

버튼, 입력 칸, 표, 달력의 기본 모양은 우리 CSS 파일에 없습니다. 이 부품들은 antd가 만든 것이고 옷도 antd가 입혀서 옵니다. 우리 CSS는 그 위에 조금 덧입힐 뿐입니다. 직접 확인해 봅시다.

::: try [조회] 버튼의 옷 들춰 보기
1. 공지사항 화면에서 개발자 도구 왼쪽 위 구석의 화살표 버튼(<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd>)을 켭니다. 그다음 조회조건 상자 오른쪽의 큰 [조회] 버튼에서 글자가 없는 오른쪽 끝을 누릅니다.
2. Elements 탭에서 `<button type="submit" class="ant-btn … search-btn">` 줄이 칠해집니다. `<span>조회</span>`이 칠해졌다면 그 줄을 감싼 `<button` 줄을 누르세요. 띄어 적은 `class` 이름 가운데 `ant-`·`css-`로 시작하는 것은 antd가, 끝의 `search-btn`은 우리 소스가 붙였습니다.
3. 옆(창이 좁으면 아래)의 Styles 칸에 이 버튼에 입힌 규칙이 쌓여 있습니다. `.ant-`나 `.css-`로 시작하는 규칙은 antd의 옷입니다. `.search-btn.ant-btn`은 두 클래스를 다 가진 요소를 고르는 우리 소스(`global.css` 109행)의 규칙입니다. 그 `min-width`(가장 작은 너비) 값 `130px`을 눌러 `300px`로 고치고 <kbd>Enter</kbd>를 누르면 버튼이 길어집니다.
4. <kbd>F5</kbd>로 새로 고치면 원래대로 돌아옵니다. 개발자 도구에서 고친 것은 소스 파일에 남지 않습니다.
:::

화면을 만들 때 CSS를 새로 쓸 일은 드뭅니다. [[#ch14]]에서 만드는 공지사항 화면의 파일 6개에는 CSS 파일이 없고, 모양을 직접 적은 곳도 버튼 2개를 오른쪽에 모으는 `style` 한 줄뿐입니다. 그러니 지금은 `className`과 `style`이 하는 일만 알면 됩니다. [[#ch3]]에서는 움직임, 자바스크립트를 배웁니다.

::: summary
- 요소는 여는 태그, 내용, 닫는 태그로 이루어진다. 여는 태그에는 속성을 적는다.
- `index.html`의 `body`에는 빈 상자 `<div id="root">`와 `script`뿐이다. 화면은 자바스크립트가 채운다.
- CSS 규칙은 `선택자 { 속성: 값; }` 모양이다. `.이름`은 `class="이름"`이 붙은 요소를 고른다.
- 모든 요소는 내용, `padding`, `border`, `margin` 네 겹의 상자다.
- 부모에 `display: flex`를 주면 자식이 가로로 선다.
- 버튼과 표의 모양은 antd가 준다. 색은 `var(--이름)`으로 꺼내 쓴다.
:::

::: quiz
1. `index.html`의 `body`는 2줄뿐인데 Elements 탭의 `body`에는 요소가 가득합니다. 누가 채웠습니까?
2. `global.css` 65행의 규칙 `.muted { color: var(--text-muted); }`는 어떤 요소에 무엇을 입힙니까? 실제 색 값은 어디에 적혀 있습니까?
3. 제목은 줄의 왼쪽 끝에, 버튼은 오른쪽 끝에 놓으려고 합니다. 어느 요소에 어떤 CSS를 줍니까?
:::
::: answer
1. 12행의 `script`가 불러온 자바스크립트(리액트)가 `<div id="root">` 안에 요소를 만들어 넣었다.
2. `class`에 `muted`가 붙은 요소에 글자색을 입힌다. 색 값은 `global.css` 39행 `--text-muted: #8a94a3;`에 있다.
3. 둘을 감싼 부모에 `display: flex`와 `justify-content: space-between`을 준다. 우리 소스에서는 `class="flex-between"`을 붙인다.
:::
