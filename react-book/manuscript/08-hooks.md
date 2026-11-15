# 훅 더 알아보기

::: lead
`useState`는 [[#ch7]]에서 처음 만난 훅이었습니다. 이 장에서는 그 뒤를 잇는 `useEffect`, `useMemo`, `useCallback`, `useRef`, `useContext`를 우리 소스에서 하나씩 만납니다. 읽고 나면 `use`로 시작하는 줄 앞에서 멈칫하지 않고, 팀이 만든 훅도 읽게 됩니다.
:::

::: goals
- 훅의 두 가지 규칙과 그 까닭을 설명할 수 있다
- `useEffect`의 할 일 함수, 정리 함수, 의존성 배열을 읽을 수 있다
- `useMemo`, `useCallback`, `useRef`, Context를 왜 썼는지 말할 수 있다
- 커스텀 훅이 무엇인지 알고 `hooks` 폴더를 둘러볼 수 있다
:::

::: files
- `src/screens/sample/NoticePage.tsx`
- `src/hooks/useContentBand.ts`
- `src/app/MeGate.tsx`
- `src/hooks/usePrint.ts`
- `src/components/auth/screenIdContext.ts`
- `src/hooks/useLookup.ts`
:::

공지사항 화면 `NoticePage.tsx`를 열어 34행부터 59행까지 훑어보세요. 26줄 사이에 `use`로 시작하는 함수가 13번 불립니다. `useState`와 `Form.useForm`은 [[#ch7]]에서 만났습니다. `useCallback`은 그 장에서 미뤄 둔 이름이고, `useMemo`나 `usePrint`는 처음 보는 이름입니다. 리액트, 라이브러리, 팀 세 곳에서 온 훅이지만 모두 같은 규칙을 따릅니다.

## 훅이란, 그리고 두 가지 규칙 {#ch8-rules}

컴포넌트는 함수라서 부를 때마다 첫 줄부터 다시 실행되고, 안에서 쓴 변수는 사라집니다. 그런 함수가 값을 기억하도록 리액트가 내준 것이 `useState`였습니다. 이렇게 컴포넌트가 리액트의 기능을 빌려 쓸 때 부르는 함수를 **@@훅@@**(hook)이라고 합니다. 어떤 훅이든 지킬 규칙은 둘입니다.@@|훅의 규칙@@

1. **이름은 `use`로 시작하고, 다음 글자는 대문자입니다.**
2. **컴포넌트 함수의 맨 바깥 줄, 그것도 이른 `return`보다 위에서만 부릅니다.** `if`나 `map`에 건넨 함수, 이벤트 핸들러의 중괄호 속에서는 부르지 않습니다. 커스텀 훅([[#ch8-custom]])도 같습니다.

첫째 규칙은 사람과 검사 도구가 이름만 보고 훅을 알아보게 하는 표시입니다. 둘째 규칙의 까닭은 리액트가 state를 찾는 방법에 있습니다. 예제 8-1의 6행처럼 `useState(7)`을 부를 때 리액트에 건네는 것은 처음 값 `7`뿐이고, `waiting`이라는 이름은 리액트가 모릅니다. 그래서 리액트는 컴포넌트마다 보관함을 한 줄 두고, 훅이 불린 차례대로 1번 칸, 2번 칸을 내줍니다. 아래 예제는 이 규칙을 어깁니다.

```tsx title="예제 8-1 조건문 안에서 부른 훅" nums
const Ticket = ({ vip }: { vip: boolean }) => {
  if (vip) {
    const [memo] = useState('귀빈');
    console.log(memo);
  }
  const [waiting] = useState(7);
  return <p>대기 번호 {waiting}번</p>;
};
```

`vip`가 `false`인 동안에는 "대기 번호 7번"이 잘 나옵니다. `vip`가 `true`로 바뀌어 다시 렌더링되는 순간 일이 틀어집니다. 아래 그림의 오른쪽을 보세요.

![훅과 보관함. 리액트는 훅을 부른 순서대로 칸을 내준다](img/ch08-hook-slots.svg){width=90%}

이번에는 3행의 훅이 먼저 불려 1번 칸을 받습니다. 그 칸에는 `waiting`의 값이 들어 있어서 콘솔에는 '귀빈' 대신 7이 찍힙니다. 6행의 훅은 받을 칸이 없습니다. 리액트는 `Rendered more hooks than during the previous render.`라는 오류를 내고 화면 그리기를 그만둡니다.

*훅은 렌더링할 때마다 같은 순서로, 같은 개수만큼 불려야 합니다.* 맨 바깥 줄에서 함수를 중간에 끝내는 이른 `return`보다 먼저 부르면 저절로 지켜집니다. `NoticePage.tsx`도 13번 모두 그렇게 부릅니다.

::: tip 규칙은 검사 도구가 지켜 줍니다
우리 프로젝트의 코드 검사 도구 ESLint에는 훅 규칙이 들어 있습니다(`eslint.config.js` 15행). 예제 8-1 같은 코드가 소스 파일에 있으면 `npm run lint`가 그 줄(예제의 3행)에 `React Hook "useState" is called conditionally.`라는 오류를 찍습니다.
:::

## 그린 뒤에 할 일, useEffect {#ch8-effect}

컴포넌트 함수의 일은 props와 state를 받아 JSX를 돌려주는 것입니다. 그런데 화면에는 브라우저 창 크기 지켜보기, 몇 초마다 시각 고쳐 쓰기, 뜨자마자 서버에 묻기 같은 일도 필요합니다. 이런 일을 컴포넌트 함수에 그냥 적으면, 다시 렌더링할 때마다 창을 지켜봐 달라는 부탁이 쌓입니다.

@@|useEffect@@*`useEffect`에 함수를 건네면 리액트는 화면을 다 고친 뒤에 그 함수를 실행합니다.* 이렇게 맡겨 둔 일을 **@@effect@@**(이펙트)라고 부릅니다. 언제 다시 할지와 어떻게 거둘지도 함께 적으므로 부탁이 쌓이지 않습니다. 브라우저 창의 너비를 알려 주는 우리 소스의 함수를 봅니다.@@|useWindowWidth@@

```ts src="src/hooks/useContentBand.ts:28-36" marks="3=①;6=②;7=③"
export const useWindowWidth = (): number => {
  const [w, setW] = useState<number>(() => (typeof window === 'undefined' ? 1280 : window.innerWidth));
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return w;
};
```

29행은 창 안쪽의 너비 `window.innerWidth`를 state로 기억합니다. `window`는 브라우저 창을 가리키는 객체입니다. 처음 값 자리에 함수를 넣으면 리액트가 처음 한 번만 그 함수를 불러 값을 정합니다. 삼항 연산자의 앞쪽은 `window`가 없는 곳을 위한 대비이니 건너뛰어도 됩니다.

① 에서 시작하는 30~34행이 `useEffect`입니다. 첫 인자는 화면을 고친 뒤에 할 일을 담은 함수라서 **@@할 일 함수@@**(setup function)라고 부릅니다. 31행은 창 너비를 다시 읽어 state에 넣는 함수 `onResize`를 만듭니다. 32행의 `addEventListener`는 창 크기가 바뀔 때마다 이 함수를 불러 달라고 브라우저에 맡깁니다. 창은 JSX 태그가 아니어서 `onClick` 같은 props를 쓰지 못해 브라우저에 직접 부탁합니다.

② 는 할 일 함수가 돌려주는 함수로, **@@정리 함수@@**(cleanup function)라고 합니다. 33행은 32행에서 건 것을 `removeEventListener`로 거둬들입니다. ③ 은 **@@의존성 배열@@**(dependency array)입니다. 여기 적은 값이 직전과 달라졌을 때만 effect를 다시 실행합니다. 34행처럼 비우면 처음 한 번만 실행됩니다.

표: 의존성 배열과 effect가 실행되는 때

| 둘째 인자 | effect가 실행되는 때 |
|---|---|
| 적지 않음 | 렌더링할 때마다 |
| `[]` | 처음 그려진 뒤 한 번 |
| `[a, b]` | 처음 한 번, 그 뒤로는 `a`나 `b`가 달라진 렌더링 뒤 |

정리 함수가 불리는 때는 아래 그림에 있습니다. 가운데 줄을 보세요. 의존성이 바뀌면 리액트는 지난번 effect의 정리 함수를 먼저 부르고 새 effect를 실행합니다. 켠 것을 끄고 나서 다시 켭니다. 컴포넌트가 화면에서 사라질 때도 정리 함수를 부릅니다.

![effect와 정리 함수가 실행되는 때](img/ch08-effect-timeline.svg){width=90%}

의존성 배열에 값이 든 예는 [[#ch5]]에서 뒷부분을 읽은 `MeGate`에 있습니다. 앱을 켜면 `MeGate`가 로그인한 사람의 정보를 서버에 묻는데, 묻기 시작하는 곳이 아래 3줄입니다.

```tsx src="src/app/MeGate.tsx:21-23"
  useEffect(() => {
    if (status === 'idle') void loadMe();
  }, [status, loadMe]);
```

처음 렌더링 때 `status`는 아직 묻지 않았다는 뜻의 `'idle'`이라, 그린 뒤 effect가 `loadMe()`를 부릅니다. `void`는 돌려받는 Promise를 기다리지 않겠다는 표시입니다. `loadMe`가 `status`를 바꾸면 다시 렌더링되고, 의존성이 달라져 effect도 다시 실행됩니다. 이번에는 22행의 조건이 맞지 않아 아무 일도 하지 않습니다.

`status`와 `loadMe`는 스토어에서 꺼낸 값과 함수입니다([[#ch11]]). effect가 읽는 값 가운데 컴포넌트 안에서 받거나 만든 것은 이처럼 의존성 배열에 빠짐없이 적고, 빠뜨리면 `npm run lint`가 경고합니다. `useWindowWidth`의 effect는 `setW`와 `window`를 읽고도 `[]`입니다. `window`는 함수 밖의 것이고, `setW` 같은 바꾸는 함수는 늘 같은 함수라서 적지 않아도 됩니다.

::: note 개발 서버에서는 처음 effect가 두 번 실행됩니다
[[#ch5]]에서 본 `main.tsx`의 `StrictMode`는@@|StrictMode@@ 개발하는 동안 effect를 한 번 더 돌립니다. 컴포넌트가 처음 나타날 때 실행, 정리, 다시 실행 순서입니다. 정리 함수를 빠뜨린 곳을 일찍 드러내려는 것입니다. 서버에 올려 실제로 쓰는 화면에서는 한 번만 실행됩니다.
:::

견본 화면 파일에는 `useEffect`가 한 줄도 없습니다. 서버에서 읽는 일은 [[#ch12]]의 TanStack Query가, 창 크기나 타이머는 공통 부품과 팀이 만든 훅이 맡습니다. 화면을 만드는 동안 `useEffect`는 쓸 일보다 읽을 일이 많습니다.

## 다시 계산하지 않기, useMemo와 useCallback {#ch8-memo}

공지 목록에서 행 하나를 체크해도 `NoticePage` 함수는 첫 줄부터 다시 실행됩니다. 그러니 함수 안에서 만든 배열과 객체와 함수는 렌더링할 때마다 새로 만들어집니다. 자바스크립트는 이런 값을 견줄 때 내용 대신 같은 물건인지를 보므로, 내용이 같은 `[1, 2] === [1, 2]`도 `false`입니다.

새로 만드는 일은 순식간이라 대개는 괜찮지만, 받은 쪽이 지난번과 같은지를 따지는 자리에서는 탈이 납니다. 의존성 배열이 그렇습니다. 표 부품 `DataGrid`도 컬럼 배열이 지난번과 같으면 정렬을 붙이는 계산을 건너뜁니다(`src/components/grid/DataGrid.tsx` 85행). 값이 매번 새것이면 이런 자리가 안 해도 될 일을 매번 다시 합니다.

이때 쓰는 훅이 둘입니다. @@|useMemo@@`useMemo`는 계산한 값을, @@|useCallback@@`useCallback`은 함수를 리액트의 보관함에 넣어 두고, 재료가 그대로인 동안에는 지난번 것을 돌려줍니다. 재료는 의존성 배열로 적습니다.

```tsx src="src/screens/sample/NoticePage.tsx:50-59" hl="2,10"
  const { mutate: openDetail, isPending: viewPending } = view;
  const openView = useCallback(
    (r: Notice) => {
      if (viewPending) return; // 제목 더블클릭(클릭 2번 + 더블클릭)에도 요청은 한 번만
      setViewOpen(true);
      openDetail(r.no, { onError: () => setViewOpen(false) }); // 오류 문구는 전역에서 띄운다
    },
    [viewPending, openDetail],
  );
  const columns = useMemo(() => noticeColumns(search.page, search.size, openView), [search.page, search.size, openView]);
```

59행의 `noticeColumns(…)`는 공지 목록 표의 컬럼 7개를 배열로 만듭니다([[#ch13]]). `useMemo`의 첫 인자는 그 계산을 하는 함수이고, 둘째 인자가 재료입니다. 처음 렌더링 때 계산해서 보관하고, 다음부터는 쪽 번호, 한 쪽 건수, `openView` 셋을 직전과 견줘 모두 같으면 보관해 둔 배열을 돌려줍니다. 표에서 행을 체크하면 `NoticePage`는 다시 렌더링되지만 `columns`는 지난번과 같은 배열입니다. 2쪽으로 넘기면 `search.page`가 달라져 새로 만듭니다.

51~58행의 `openView`는 공지 제목을 누르면 상세 팝업을 여는 함수이고, 59행의 재료입니다. 그냥 화살표 함수였다면 렌더링할 때마다 새 함수가 되어 59행도 매번 다시 계산합니다. `useCallback`으로 감쌌으므로 57행의 재료 둘이 그대로인 동안에는 같은 함수입니다. [[#ch7]]에서 미뤄 둔 `usePagedSearch.ts` 52행의 `setPage`도 같은 파일 61행 `useMemo`의 재료라서 감쌌습니다.

50행은 `view`([[#ch12]])에서 `mutate`와 `isPending`을 꺼내며 콜론 뒤의 새 이름 `openDetail`, `viewPending`을 붙입니다. 구조 분해 중괄호 안의 콜론은 타입 표기가 아니라 이름 바꾸기입니다. 상세를 읽는 중이면 `viewPending`이 `true`라서 53행이 같은 요청을 또 보내지 않게 막습니다. 55행은 공지 번호 `r.no`로 상세를 읽다가 실패하면 팝업을 닫습니다.

*`useMemo`와 `useCallback`은 받는 쪽이 같은지를 따지는 자리에 씁니다.* 같은 파일 61~66행의 `onSearch`, `excel`, `onDelete`는 그냥 화살표 함수입니다. 우리 소스가 `useMemo`로 감싼 것은 주로 표의 컬럼과 조회조건 목록이니, 새 화면에서도 견본이 감싼 자리를 따라 하면 됩니다.

## useRef와 Context {#ch8-ref-context}

### 화면에 보이지 않는 기억, useRef

기억은 해야 하지만 화면에 보일 일은 없는 값이 있습니다. 공지사항 화면의 [출력] 버튼은 인쇄하는 동안 브라우저 탭의 제목을 "공지사항"으로 바꿨다가 되돌립니다. 원래 제목을 적어 둘 곳이 필요한데, state에 두면 적을 때마다 다시 렌더링됩니다.

[[#ch7]]의 책상 위 메모지, 곧 그냥 변수는 다시 렌더링할 때마다 처음 값으로 돌아갔습니다. @@|useRef@@`useRef`는 직원이 따로 챙겨 두는 수첩입니다. 다시 렌더링해도 적은 것이 남아 있고, 고쳐 적어도 화면은 다시 그려지지 않습니다. `useRef(처음 값)`은 `{ current: 처음 값 }` 모양의 객체 하나를 돌려주고, 리액트가 이 객체를 맡아 둡니다. 이 객체를 **@@ref@@**(레프)라 부르고, 값은 `.current`로 읽고 고칩니다.

표: 값을 두는 세 자리

| 두는 곳 | 다시 렌더링해도 남는가 | 바꾸면 다시 렌더링하는가 |
|---|---|---|
| 그냥 변수 | 남지 않는다 | 하지 않는다 |
| state | 남는다 | 한다 |
| ref | 남는다 | 하지 않는다 |

```ts src="src/hooks/usePrint.ts:11-18" hl="1"
  const saved = useRef<string | null>(null);

  const restoreTitle = () => {
    if (saved.current !== null) {
      document.title = saved.current;
      saved.current = null;
    }
  };
```

11행은 처음 값이 `null`인 ref를 만듭니다. `document.title`은 브라우저 탭에 보이는 문서 제목입니다. 41행은 인쇄를 시작할 때 원래 제목을 `saved.current`에 적어 둡니다. 13~18행의 `restoreTitle`은 그것을 꺼내 제목을 되돌린 뒤 `null`로 비웁니다. 20행의 `useEffectEvent`는 리액트 19.2의 새 훅이니 이름만 알아 둡니다.

### 층을 건너 값 건네기, Context

props는 부모에서 자식으로 한 층씩 내려갑니다. `NoticePage`는 받은 화면키 `screenKey`를 버튼줄 `ActionBar`에 건네고(83행), `ActionBar`는 그것을 버튼마다 다시 건넵니다. 버튼이 화면키를 알아야 눌러도 되는 버튼인지 가려내기 때문입니다([[#ch11]]). 층이 늘 때마다 받아서 넘기는 줄도 늡니다.

지점 이름은 전표에 적어 창구마다 돌리지 않습니다. 입구에 현판을 걸어 두면 안의 누구든 고개를 들어 봅니다. 리액트의 **@@Context@@**(컨텍스트)가 이 현판입니다. 위쪽 컴포넌트가 값을 한 번 걸어 두면, 그 안쪽 컴포넌트는 몇 층 아래에 있든 props 없이 꺼내 씁니다. 만들기, 걸기, 꺼내기 세 걸음입니다.

```ts src="src/components/auth/screenIdContext.ts:6-9" marks="1=①;4=③"
export const ScreenIdContext = createContext<ScreenKey | undefined>(undefined);

/** 가장 가까운 ScreenIdProvider 의 화면키 (없으면 undefined) */
export const useScreenId = (): ScreenKey | undefined => useContext(ScreenIdContext);
```

```tsx src="src/components/auth/ScreenIdProvider.tsx:6-8" marks="2=②"
export const ScreenIdProvider = ({ screenKey, children }: { screenKey: ScreenKey; children: ReactNode }) => (
  <ScreenIdContext.Provider value={screenKey}>{children}</ScreenIdContext.Provider>
);
```

① @@|createContext@@`createContext(기본값)`이 Context를 만들고, 여기서는 기본값이 `undefined`입니다. ② Context에 딸린 `Provider`로 감싸고 `value`에 값을 주면 걸립니다. 감싼 `children` 안쪽 전부가 이 값을 봅니다. 이렇게 값을 걸어 주는 컴포넌트를 **@@Provider@@**(프로바이더)라 하고, 6행의 `ScreenIdProvider`는 7행을 쓰기 쉽게 감싼 Provider입니다.

③ @@|useContext@@`useContext(Context)`는 가장 가까운 위쪽 Provider가 건 값을 돌려주고, 감싼 Provider가 없으면 기본값을 돌려줍니다. 9행의 `useScreenId`가 이 일을 대신합니다. 꺼내 쓰는 곳은 버튼의 권한을 묻는 `src/components/auth/useAllowed.ts` 34행 `const ctxId = useScreenId();`입니다. 35행은 인자로 받은 화면키가 없을 때만(`??`) 이 값을 씁니다.

그런데 지금 우리 소스에는 `ScreenIdProvider`로 화면을 감싼 곳이 아직 없습니다. 길만 닦아 두었을 뿐이라 화면들은 화면키를 props로 건네고, 34행은 늘 기본값을 받습니다. 실제로 일하는 Provider는 [[#ch9]]에서 앱 맨 위를 감싼 `QueryClientProvider` 등으로 만납니다.

## 나만의 훅 만들기, 커스텀 훅 {#ch8-custom}

창 너비가 필요한 컴포넌트가 둘이면 `useState`와 `useEffect` 6줄을 두 번 적어야 할까요? 훅을 부르는 코드를 함수로 묶고 이름을 `use`로 시작하면 됩니다. 이 함수가 **@@커스텀 훅@@**(custom hook)입니다.

[[#ch8-effect]]에서 읽은 `useWindowWidth`가 커스텀 훅이고, 같은 파일 39행의 @@|useWindowBand@@`useWindowBand`도 커스텀 훅입니다. `getBand(useWindowWidth())` 한 줄로 창 너비를 `'S'`, `'M'`, `'L'` 가운데 하나로 바꿉니다. 둘을 쓰는 앱의 틀 `src/components/layout/AppShell.tsx`([[#ch10]])는 33~34행에서 훅을 부를 뿐, 창을 지켜보는 일은 모릅니다.

::: try 창 너비를 화면에 찍어 보기
개발 서버를 켜 둔 채로 홈 화면 파일에 `+`가 찍힌 3줄을 더하고 저장합니다.

```tsx title="src/screens/home/HomePage.tsx" kind="고치기" diff
 import { useOpenScreen } from '@/screens/navigation';
+import { useWindowWidth } from '@/hooks/useContentBand';
 // …
   const openScreen = useOpenScreen();
+  const width = useWindowWidth();
   return (
     <PageFrame screenKey={screenKey} title="홈">
+      <p>창 너비: {width}px</p>
```

홈 화면 제목 아래에 "창 너비: 1280px" 같은 글자가 생깁니다. 브라우저 창의 폭을 바꾸면 숫자가 따라 바뀝니다. 창이 꽉 차 있으면 <kbd>F12</kbd>로 오른쪽에 연 개발자 도구의 경계선을 끌어도 됩니다. 확인이 끝나면 더한 3줄을 지우고 저장합니다.
:::

해 보기에서 홈 화면과 `AppShell`이 함께 `useWindowWidth`를 불렀지만, 너비 state는 훅을 부를 때마다 따로 생깁니다. `AppShell`은 33행(`useWindowBand` 안)과 34행에서 불러 둘을 갖습니다. *커스텀 훅은 일하는 방법을 나눠 쓰는 길이고, 값은 부를 때마다 따로입니다.* 공지사항 화면의 커스텀 훅도 봅니다.

```ts src="src/hooks/useLookup.ts:17-20"
export const useOfficeLabel = (ofcCode?: string | null): string => {
  const { data } = useOffices();
  return fmtOffice(ofcCode, data?.find((o) => o.ofcCode === ofcCode)?.kanm ?? undefined);
};
```

`useOfficeLabel`은 사무소 코드를 주면 `[코드] 사무소명` 모양의 글자를 돌려주고, `NoticePage.tsx` 42행이 이 훅을 씁니다. 18행의 `useOffices()`는 사무소 목록을 서버에서 읽어 오는 또 다른 커스텀 훅입니다([[#ch12]]). 19행은 그 목록에서 사무소를 찾아 이름 `kanm`을 `fmtOffice`에 건넵니다. 줄 끝에서 `null`을 `undefined`로 바꾸는 `?? undefined`는 넘어가도 됩니다.

`useState`나 `useEffect`가 없어도, 다른 훅을 부르는 함수면 커스텀 훅입니다. 팀이 만든 커스텀 훅은 `src/hooks/` 폴더에 모여 있습니다. 첫머리의 13번 가운데 `usePagedSearch`, `useOfficeLabel`, `usePrint`가 이 폴더에서 왔습니다. `useNoticeFields`처럼 화면 옆 `NoticeParts.tsx`에 둔 커스텀 훅도 있습니다.

표: `src/hooks/` 폴더에서 자주 만나는 커스텀 훅

| 파일 | 하는 일 | 다시 만나는 곳 |
|---|---|---|
| `usePagedSearch.ts` | [조회]를 누르면 목록을 읽고 쪽을 넘긴다 | [[#ch12]] |
| `usePermission.ts` | 등록·수정·삭제를 해도 되는지 알려 준다 | [[#ch11]] |
| `useLookup.ts` | 사무소처럼 고르는 칸에 쓸 목록을 읽는다 | 이 장 |
| `usePrint.ts` | [출력] 버튼의 인쇄를 맡는다 | [[#ch14]] |

::: summary
- 훅은 컴포넌트가 리액트의 기능을 빌려 쓰는 함수다. 이름은 `use`로 시작한다.
- 리액트는 부른 순서로 훅의 기억을 찾는다. 그래서 훅은 맨 바깥 줄, 이른 `return`보다 위에서만 부른다.
- `useEffect`는 화면을 고친 뒤에 할 일을 맡긴다. 건 것은 정리 함수에서 거두고, 의존성 배열로 다시 실행할 때를 정한다.
- `useMemo`는 값을, `useCallback`은 함수를 보관해 재료가 그대로면 지난번 것을 돌려준다.
- `useRef`는 바꿔도 화면을 다시 그리지 않는 기억이다. Context는 Provider 안쪽 어디서든 값을 꺼내게 한다.
- 커스텀 훅은 훅을 묶어 `use…`라는 이름을 붙인 함수다. 팀이 만든 것은 `src/hooks/`에 모여 있다.
:::

::: quiz
1. `MeGate.tsx`의 25행(`if (status === 'ready') return …`)을 21행 위로 옮기면 어떤 규칙을 어기게 될까요? 왜 문제가 되는지도 말해 보세요.
2. `useWindowWidth`의 33행을 지워도 화면은 그대로입니다. 이 줄이 꼭 있어야 하는 까닭은 무엇일까요?
3. `NoticePage.tsx` 51행의 `useCallback`을 벗겨 내고 화살표 함수만 남기면 59행의 `useMemo`는 어떻게 될까요?
:::
::: answer
1. 이른 `return` 아래에서 `useEffect`를 부르게 된다. `status`가 `'ready'`인 렌더링에서는 이 훅이 불리지 않아, 렌더링마다 훅의 개수가 달라진다.
2. 컴포넌트가 화면에서 사라져도 브라우저는 창 크기가 바뀔 때마다 `onResize`를 계속 부른다. 건 것은 정리 함수에서 거둬야 한다.
3. `openView`가 렌더링할 때마다 새 함수가 되므로 59행의 재료가 매번 달라진다. `useMemo`는 매번 컬럼을 다시 만든다.
:::
