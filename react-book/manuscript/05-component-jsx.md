# 컴포넌트와 JSX

::: lead
리액트는 화면을 컴포넌트라는 부품으로 나누어 만들고, 부품의 생김새는 JSX로 적습니다. 이 장을 마치면 우리 소스의 작은 부품을 한 줄씩 읽고, `index.html`의 텅 빈 상자가 화면으로 채워지는 길을 따라갈 수 있습니다.
:::

::: goals
- 컴포넌트가 화면 조각을 돌려주는 함수임을 설명할 수 있다
- JSX가 HTML과 다른 네 가지를 알고 우리 소스의 JSX를 읽을 수 있다
- 조건에 따라 그리는 코드와 목록을 그리는 코드를 읽을 수 있다
- `index.html`의 빈 상자가 `main.tsx`와 `App`으로 채워지는 길을 설명할 수 있다
:::

::: files
- `src/components/feedback/LoadingBlock.tsx`
- `src/components/feedback/EmptyState.tsx`
- `src/components/layout/BrandMark.tsx`
- `src/app/MeGate.tsx`
- `src/screens/home/HomePage.tsx`
- `src/main.tsx`
:::

[[#ch2]]에서 `index.html`을 읽다가 이상한 줄을 하나 만났습니다. `<div id="root"></div>`. 안이 텅 빈 상자입니다. 그런데 브라우저에 뜬 화면에는 로고도 메뉴도 카드 4장도 있습니다. HTML 파일에 없던 것들이 어디에서 왔을까요? 실마리는 두 낱말, 컴포넌트와 JSX입니다.

## 컴포넌트는 화면을 돌려주는 함수 {#ch5-component}

앱을 켤 때도, 화면 탭을 처음 열 때도 빙글빙글 도는 '불러오는 중…' 같은 표시가 뜹니다. HTML만으로 만든다면 같은 태그 묶음을 뜨는 곳마다 적고, 모양을 바꾸는 날에는 모두 고쳐야 합니다.

은행 창구에는 도장이 여러 개 놓여 있습니다. '접수', '지급', '확인'. 한 번 파 둔 도장은 전표가 몇 장이든 똑같이 찍힙니다. 리액트의 **@@컴포넌트@@**(component)가 이 도장과 닮았습니다. 화면의 한 조각을 한 번 만들어 두고 필요한 곳마다 찍어 씁니다. 그 표시를 그리는 짧은 컴포넌트를 열어 봅니다.

```tsx src="src/components/feedback/LoadingBlock.tsx:1-7"
import { Spin } from 'antd';

export const LoadingBlock = ({ tip = '불러오는 중…', height = 160 }: { tip?: string; height?: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height, color: 'var(--text-muted)', gap: 10 }}>
    <Spin size="small" /> {tip}
  </div>
);
```

7줄이 전부입니다.@@|LoadingBlock@@ 3행에 `LoadingBlock`이라는 화살표 함수가 있고, 이 함수가 돌려주는 것이 4~6행의 태그 묶음입니다. *컴포넌트는 화면 조각을 돌려주는 함수입니다.* 2부의 나머지는 모두 이 한 문장에서 가지를 뻗습니다.

3행 끝의 `(`와 7행의 `)`는 여러 줄인 반환값을 묶는 괄호입니다. 3행 앞쪽 괄호 안은 구조 분해와 기본값([[#ch3]]), 그리고 타입 표기([[#ch4]])입니다. `tip`과 `height`는 쓰는 쪽에서 건네주는 값이고, 건네지 않으면 '불러오는 중…'과 160을 씁니다. 이런 값을 props(프롭스)라고 하며 [[#ch6]]에서 배웁니다.

4~6행은 [[#ch2]]에서 배운 HTML과 닮았습니다. `<div>` 하나가 `Spin`과 글자를 감쌉니다. `Spin`은 1행이 antd에서 가져온 부품으로, 빙글빙글 도는 표시를 그립니다. 4행의 `style`은 [[#ch2]]에서 본 flex 가운데 정렬입니다. 값 없이 쓴 `height`는 [[#ch3]]의 줄임 속성입니다. `{tip}`처럼 중괄호가 끼어 있는 것이 HTML과 다른데, [[#ch5-jsx]]에서 풉니다.

도장은 찍어야 쓸모가 있고, 컴포넌트는 태그로 써야 쓸모가 있습니다. `import`로 가져온 뒤 `<div>`를 쓰듯 `<LoadingBlock />`이라고 적으면, 그 자리에 4~6행이 그려집니다. 5행의 `Spin`도 그렇게 쓴 것입니다. 전체 검색(<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd>)으로 `<LoadingBlock`을 찾으면 도장 하나를 찍은 4곳이 나옵니다.

::: warn 컴포넌트 이름은 대문자로 시작한다
리액트는 태그 이름이 소문자로 시작하면 `div` 같은 HTML 태그로, 대문자로 시작하면 컴포넌트로 봅니다. `<loadingBlock />`이라고 쓰면 그런 HTML 태그는 없다는 빨간 줄이 그어집니다.
:::

## JSX 읽는 법 {#ch5-jsx}

화면은 값에 따라 달라지고, 값은 자바스크립트가 다룹니다. 그래서 리액트는 태그를 자바스크립트 안에 들여 값과 섞어 쓰게 했습니다. `LoadingBlock`의 4~6행처럼 태그 모양으로 적은 글이 **@@JSX@@**(제이에스엑스)이고, 컴포넌트가 그릴 것을 적은 설계도입니다. `.tsx`의 `x`는 JSX가 든 파일이라는 뜻입니다.

JSX에는 HTML과 다른 곳이 네 가지 있습니다. 지어낸 예제 하나에 모았습니다.

```tsx title="예제 5-1 번호표 한 장"
const waiting = 7;

const Ticket = () => (
  <p className="ticket" style={{ fontSize: 20 }}>
    대기 번호 {waiting}번 <br /> 앞에 {waiting - 1}명
  </p>
);
```

이 컴포넌트를 그리면 브라우저에는 다음 HTML이 만들어집니다. 예제와 견주어 보세요.

```out
<p class="ticket" style="font-size: 20px;">대기 번호 7번 <br> 앞에 6명</p>
```

1. **중괄호 안은 자바스크립트 식입니다.** **@@식@@**(expression)은 변수, 계산, 함수 호출처럼 값이 나오는 코드를 말합니다. 예제에서는 `{waiting - 1}`이 6이 되어 그 자리에 그려졌습니다.
2. **`class`는 `className`으로 씁니다.**@@|className@@ `class`는 자바스크립트가 이미 다른 뜻으로 쓰는 낱말이기 때문입니다.
3. **`style`에는 객체를 넣습니다.**@@|style 속성@@ 바깥 중괄호는 "여기부터 자바스크립트"라는 표시이고 안쪽 중괄호는 객체입니다. 속성 이름은 `font-size` 대신 `fontSize`로 쓰고, 크기에 숫자만 쓰면 px이 붙습니다.
4. **태그는 반드시 닫습니다.** 줄을 바꾸는 `<br>`처럼 사이에 넣을 내용이 없는 태그는 `<br />`로 써서 스스로 닫습니다. `<LoadingBlock />`이 이 모양이었습니다.

이 네 가지를 들고 우리 소스를 읽습니다. 자료가 없을 때 빈자리를 채우는 부품 `EmptyState`입니다.

```tsx src="src/components/feedback/EmptyState.tsx:5-10" marks="1=①;2=②;4=③;5=④"
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: height, color: 'var(--text-muted)', gap: 6 }}>
    <InboxOutlined style={{ fontSize: 26, color: '#c3cdd9' }} />
    <div>{text}</div>
    {hint && <div style={{ fontSize: 12 }}>{hint}</div>}
    {action}
  </div>
```

`height`, `text`, `hint`, `action`은 이 부품이 건네받는 값입니다. ①은 `style`에 객체를 넣었습니다. `flexDirection: 'column'`은 CSS의 `flex-direction: column`처럼 세로로 쌓으라는 뜻입니다. `minHeight: height`는 높이를 건네지 않으면 기본값 140으로 `min-height: 140px`이 됩니다. ②의 `InboxOutlined`는 상자 모양 아이콘을 그리는 컴포넌트이고, 넣을 내용이 없어 `/>`로 닫았습니다.

④는 건네받은 화면 조각을 그리는 자리입니다. 값이 `undefined`이면 아무것도 그려지지 않습니다. 리액트는 `undefined`, `null`, `true`, `false`를 화면에 그리지 않습니다. ③은 다음 절에서 풉니다.

5행에서 열고 10행에서 닫는 `<div>` 하나가 나머지를 모두 감싼 것도 눈여겨보세요. 함수는 값을 하나만 돌려주므로 컴포넌트가 돌려주는 JSX의 맨 바깥 태그는 하나여야 합니다. 감쌀 태그가 마땅치 않으면 이름 칸을 비운 **빈 태그**(Fragment)@@|빈 태그@@ `<>…</>`로 감쌉니다. 빈 태그는 안의 것을 한 묶음으로 만들 뿐 화면에는 아무 태그도 남기지 않습니다.

## 조건에 따라 그리기 {#ch5-cond}

화면은 늘 같은 모습이 아닙니다. 로고 그림이 없으면 글자로 대신하고, 안내 문구가 있을 때만 한 줄을 더 그립니다. 그런데 JSX의 중괄호 안에는 식만 쓸 수 있어서 `if` 문을 넣지 못합니다. 그래서 [[#ch3]]에서 배운 삼항 연산자와 `&&`가 여기서 일합니다.@@|조건에 따라 그리기@@ 먼저 둘 중 하나를 그리는 삼항 연산자입니다.

```tsx src="src/components/layout/BrandMark.tsx:4-11"
export const BrandMark = ({ height = 26 }: { height?: number }) =>
  brand.logoSrc ? (
    <img src={brand.logoSrc} alt={brand.logoAlt} style={{ height }} />
  ) : (
    <span className="brand-mark" style={{ height, fontSize: Math.round(height * 0.46) }} aria-label="자동화기기 종합관리시스템">
      {brand.markText}
    </span>
  );
```

`BrandMark`는 헤더 왼쪽 위의 로고를 그립니다. 로고 그림의 주소 `brand.logoSrc`가 있으면 `?` 뒤의 `<img>`를, 없으면 `:` 뒤의 `<span>`을 돌려줍니다. 삼항 연산자의 양쪽에 숫자나 문자열 대신 JSX가 놓였습니다. *JSX도 값입니다.* 그래서 삼항의 양쪽에 놓기도, 함수에서 돌려주기도, 객체의 속성에 담기도 합니다. 지금은 `brand.ts` 파일에 로고 주소가 적혀 있어 늘 `<img>` 쪽이 그려집니다.

있을 때만 그리려면 `&&`를 씁니다. `A && B`는 A가 참으로 통하면 B를, 아니면 A를 돌려줍니다([[#ch3]]). 앞 절에서 미뤄 둔 ③, `EmptyState.tsx` 8행이 그 모양입니다. `hint`에 글자가 있으면 `<div>`가 그려지고, 건네받지 않아 `undefined`이면 아무것도 그려지지 않습니다.

::: warn `&&` 왼쪽에 숫자를 두지 않는다
숫자 `0`은 `false`와 달리 화면에 그대로 그려집니다. 그래서 `{count && <p>새 글 {count}건</p>}`은 `count`가 0일 때 화면에 `0`을 찍습니다. 왼쪽을 `count > 0`처럼 참거짓 값이 나오는 식으로 바꿔 줍니다.
:::

갈래가 셋 넷으로 늘면 삼항으로는 읽기 어렵습니다. 그럴 때는 JSX 바깥에서 `if`로 가르고 갈래마다 다른 JSX를 `return`합니다. 앱을 켤 때 로그인한 사람이 누구인지 확인하는 부품 `MeGate`가 그렇게 씁니다. 확인하는 동안에는 [[#ch5-component]]의 `LoadingBlock`으로 아래 화면을 보여 줍니다.

![앱을 켠 직후 `MeGate`가 보여 주는 `LoadingBlock`](img/shots/ch05-loadingblock.png){width=40%}

```tsx src="src/app/MeGate.tsx:25-46" marks="1=①;2=②;5=③;10=④"
  if (status === 'ready') return <>{children}</>;
  if (status === 'error' && isLoginRequired(error?.code)) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  if (status === 'error') {
    return (
      // …
    );
  }
  return <LoadingBlock tip="사용자 정보를 확인하는 중…" height={400} />;
```

무엇을 어떻게 확인하는지는 [[#ch9]]에서 보고, 여기서는 모양만 봅니다. 확인이 어디까지 왔는지를 담은 `status` 값에 따라 네 갈래로 나뉩니다. ① 확인이 끝났으면 건네받은 안쪽 화면 `children`([[#ch6]])을 빈 태그에 담아 그대로 돌려줍니다. ② 로그인이 필요하면 로그인 화면으로 보내는 부품이, ③ 그 밖의 오류이면 오류 안내 화면(31~43행, 줄였습니다)이 나갑니다. ④ 어디에도 걸리지 않았다면 아직 확인하는 중이므로, 방금 본 그림처럼 `LoadingBlock`을 찍습니다.

`return`을 만나면 함수는 거기서 끝나므로, 위에서 걸러지지 않고 남은 경우만 아래로 내려갑니다. 이렇게 함수 중간에서 먼저 돌려주는 모양을 @@**이른 `return`**|이른 return@@(early return)이라고 부릅니다.

## 목록 그리기와 key {#ch5-list}

공지사항 표는 한 쪽에 공지 20건을, 홈 화면은 같은 모양의 카드 4장을 늘어놓습니다. 이렇게 되풀이되는 모양을 그릴 때는 태그를 개수만큼 적지 않습니다. 자료를 배열에 담아 두고, [[#ch3]]에서 배운 `map`으로 항목마다 JSX로 바꿉니다. 그 장에서 읽은 `CARDS` 배열(12~17행)의 객체 4개를 아래 그림의 카드 4장으로 바꾸는 곳이 `HomePage.tsx` 29~37행입니다.

![홈 화면의 카드 4장. `CARDS` 배열의 객체 4개가 카드가 되었다](img/shots/ch05-home-cards.png){width=100%}

```tsx src="src/screens/home/HomePage.tsx:29-37" hl="1,2"
        {CARDS.map((c) => (
          <Col key={c.key} xs={24} md={12} xl={6}>
            <Card hoverable className="home-card" onClick={() => openScreen(c.key)} role="link" aria-label={c.title}>
              <div className="home-card-icon">{c.icon}</div>
              <div className="home-card-title">{c.title}</div>
              <div className="home-card-desc">{c.desc}</div>
            </Card>
          </Col>
        ))}
```

29행의 `map`에 카드 자료 하나가 `c`로 들어오고 30~36행의 JSX 한 덩어리가 나갑니다. 자료가 4개이니 덩어리도 4개이고, 리액트는 중괄호 안에 배열이 오면 안의 것을 차례로 그립니다. 32행의 `c.icon`에 든 것은 [[#ch3]]에서 미뤄 둔 `<AppstoreOutlined />` 같은 JSX입니다.

`Col`과 `Card`는 antd의 칸과 카드 부품이고, 31행의 `hoverable`처럼 이름만 적은 속성은 `={true}`를 줄인 것입니다. `onClick`은 [[#ch7]]에서 배웁니다.

카드를 한 장 늘리려면 `CARDS`에 객체를 하나 더하면 되고, JSX는 손대지 않습니다. *그릴 것을 자료로 적어 두고, 그 자료를 JSX로 바꿉니다.* 우리 소스의 표와 버튼줄과 조회조건도 이렇게 만듭니다([[#ch13]]).

30행의 `key={c.key}`는 항목마다 붙이는 번호표입니다. 은행은 손님을 "셋째 자리에 앉은 분"이라고 부르지 않고 번호표의 번호로 부릅니다. 앞사람이 자리를 떠도 27번 손님은 27번입니다. 목록을 다시 그릴 때 리액트는 @@|key@@**key**가 같은 항목끼리 짝을 지어, 새로 생긴 항목과 사라진 항목과 자리만 옮긴 항목을 가려냅니다. 등호 왼쪽 `key`는 리액트가 정한 이름, 오른쪽 `c.key`는 `CARDS`의 속성일 뿐입니다.

그러니 key는 같은 목록 안에서 겹치지 않고, 다시 그려도 바뀌지 않아야 합니다. 자료가 원래 지닌 고유한 값이 알맞습니다. 홈 카드는 화면마다 하나뿐인 이름(`'sample.notice'` 등)을 씁니다. [[#ch2]]에서 미뤄 둔 인쇄용 표는 `NoticePage.tsx`의 `map`으로 공지마다 `<tr key={r.no}>`를 만들어, 공지 번호 `no`를 key로 씁니다. key는 `map`에 건넨 함수가 돌려주는 맨 바깥 태그, 곧 `Col`과 `tr`에 붙입니다.

::: try 카드를 한 장 늘려 보기
1. 앱을 띄워 홈 화면을 열어 둔 채 `HomePage.tsx` 14행(공지사항 줄)을 복사해 바로 아래에 붙여 넣고 저장합니다. 새로 고치지 않아도 카드가 5장이 됩니다.
2. <kbd>F12</kbd>를 눌러 Console 탭을 보면 `Encountered two children with the same key`로 시작하는 빨간 줄이 새로 보입니다. 번호표가 겹쳐 항목을 두 번 그리거나 빠뜨릴 수 있다는 경고입니다. 그 위에 빨간 줄이 더 있다면 처음부터 있던 것입니다.
3. <kbd>Ctrl</kbd>+<kbd>Z</kbd>로 되돌리고 저장합니다. 카드가 다시 4장이 됩니다.
:::

## 부품이 부품을 품는다 {#ch5-tree}

`HomePage`는 `Col`을 품고 `Col`은 `Card`를 품었습니다. JSX 안에 다른 컴포넌트를 태그로 쓰면 컴포넌트가 컴포넌트를 품게 됩니다. 그렇다면 `HomePage`는 누가 품고 있을까요? 품은 쪽을 따라 계속 올라가면 맨 위에서 [[#ch3]]에 나왔던 `App`을 만납니다.

```tsx src="src/app/App.tsx:4-8"
const App = () => (
  <AppProviders>
    <AppRouter />
  </AppProviders>
);
```

`App`이 곧 앱 전체이고, `AppProviders` 안에 `AppRouter`를 넣는 일 하나만 합니다. `AppProviders`는 앱 전체가 함께 쓰는 도구를 준비하고([[#ch9]]), `AppRouter`는 주소에 맞는 화면을 고릅니다([[#ch10]]). 그러면 `App`은 누가 그릴까요? 첫머리의 빈 상자로 돌아가 봅니다. `index.html`은 빈 상자 바로 다음 줄(12행)에서 `main.tsx`를 불러 실행합니다.@@|main.tsx@@ 그 `main.tsx`의 `import` 4줄 뒤에 이런 코드가 있습니다.

```tsx src="src/main.tsx:6-14" hl="2-6"
const bootstrap = async () => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
};

void bootstrap();
```

7행의 `document.getElementById('root')`는 지금 열린 문서에서 `id`가 `root`인 요소, 곧 `index.html`의 빈 상자를 찾습니다. @@|createRoot@@`createRoot(…)`는 그 상자를 리액트가 그릴 자리로 삼고, `.render(<App />)`은 거기에 `App`을 그립니다. 컴포넌트를 화면에 그리는 이 일을 **@@렌더링@@**(rendering)이라고 합니다. *리액트가 그리기를 시작하는 곳은 앱 전체에서 이 한 곳뿐입니다.* 나머지는 `App`이 품은 부품이, 또 그 부품이 품은 부품이 차례로 그립니다.

8행의 @@|StrictMode@@`React.StrictMode`는 개발하는 동안 실수를 찾아 주는 감시자이고 화면에는 아무것도 그리지 않습니다. 7행의 `getElementById('root')` 바로 뒤에 붙은 `!`는 [[#ch4]]에서 본, 값이 반드시 있다는 보증입니다. 6~14행은 이 일을 `bootstrap` 함수로 묶어 부른 것이라, `async`와 `void`는 건너뛰어도 됩니다.

![컴포넌트 나무. 노란 상자는 이 장에서 코드를 읽은 부품이고, 점선은 사이에 다른 부품이 더 있다는 뜻이다](img/ch05-tree.svg){width=100%}

위 그림은 빈 상자에서 홈 카드까지 누가 누구를 품는지 그린 **@@컴포넌트 나무@@**(component tree)입니다. 첫머리의 질문에 이제 답할 수 있습니다. `main.tsx`가 빈 상자에 `App`을 그리고, `App`에서 뻗은 가지마다 컴포넌트가 제 몫의 JSX를 돌려주어 화면을 채웁니다.

Elements 탭에서 `<div id="root">`를 펼치면 가득 찬 상자가 보이지만, `App`이나 `MeGate` 같은 이름은 없습니다. 컴포넌트가 돌려준 JSX만 예제 5-1처럼 HTML 태그로 바뀌고, 컴포넌트 이름은 남지 않기 때문입니다. 다음 장에서는 부품에 값을 건네는 방법, props를 배웁니다.

::: summary
- 컴포넌트는 화면 조각을 돌려주는 함수다. 이름은 대문자로 시작하고 태그로 쓴다.
- JSX의 중괄호 안은 자바스크립트 식이다. `class`는 `className`, `style`은 객체, 태그는 모두 닫는다.
- 돌려주는 JSX의 맨 바깥 태그는 하나다. 마땅한 태그가 없으면 빈 태그 `<>…</>`로 감싼다.
- 조건에 따라 그릴 때는 삼항 연산자(둘 중 하나), `&&`(있을 때만), 이른 `return`(갈래가 여럿)을 쓴다.
- 목록은 `배열.map(…)`으로 그리고, 항목마다 겹치지 않는 `key`를 맨 바깥 태그에 붙인다.
- `main.tsx`가 `index.html`의 빈 상자에 `App`을 그리고, 그 아래로 컴포넌트가 컴포넌트를 품어 나무를 이룬다.
:::

::: quiz
1. 다음 JSX에서 고칠 곳 3군데를 찾아보세요. `<p class="tip" style="height: 40px">안내<br></p>`
2. `<EmptyState text="공지가 없습니다." />`라고 쓰면 `EmptyState.tsx` 8행의 `<div>`는 그려질까요? 까닭은?
3. `HomePage.tsx` 30행의 `key={c.key}`를 `key={c.title}`로 바꿔도 될까요? 제목이 겹치는 카드가 생기면요?
:::
::: answer
1. `class`는 `className`으로, `style`은 `style={{ height: 40 }}`으로, `<br>`은 `<br />`로 고친다.
2. 그려지지 않는다. `hint`가 `undefined`라서 `hint && …`도 `undefined`가 되고, 리액트는 이 값을 그리지 않는다.
3. 지금은 제목이 모두 달라 괜찮지만, 제목이 겹치면 해 보기에서 본 경고가 뜬다. 겹치지 않는 `c.key`가 알맞다.
:::
