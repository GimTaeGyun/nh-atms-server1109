# state와 이벤트

::: lead
버튼을 누르면 팝업이 뜨고, 표에서 공지 하나를 체크하면 [수정] 버튼이 켜집니다. 화면이 사용자의 손길에 반응하는 원리를 이벤트와 state라는 두 낱말로 배웁니다. 읽고 나면 공지사항 화면이 팝업을 여닫는 코드를 한 줄씩 설명하게 됩니다.
:::

::: goals
- 이벤트 핸들러를 건네는 것과 부르는 것의 차이를 설명할 수 있다
- `useState`로 값을 기억하는 코드를 읽고 쓸 수 있다
- state가 바뀐 뒤 화면이 다시 그려지는 순서를 말할 수 있다
- 객체와 배열 state를 새 값으로 바꾸는 코드를 읽을 수 있다
:::

::: files
- `src/screens/home/HomePage.tsx`
- `src/screens/sample/NoticePage.tsx`
- `src/screens/sample/NoticeParts.tsx`
- `src/hooks/usePagedSearch.ts`
- `src/screens/login/LoginPage.tsx`
:::

은행 창구 위에는 번호 표시기가 있어서, 직원이 호출 버튼을 누르면 딩동 소리와 함께 숫자가 바뀝니다. [[#ch5]]과 [[#ch6]]의 컴포넌트에는 이 딩동이 없었습니다. props를 받아 화면을 한 번 그린 뒤로는 사진처럼 가만히 있었습니다.

실제 화면은 움직입니다. 공지사항 화면에서 제목을 누르면 상세 팝업이 뜨고, [닫기]를 누르면 사라집니다. 이 움직임의 재료는 사용자가 무엇을 했는지 알려 주는 이벤트와, 컴포넌트가 지금 상황을 기억해 두는 state입니다.

## 누르면 일어나는 일, 이벤트 {#ch7-event}

화면이 반응하려면 먼저 사용자가 무엇을 했는지 알아야 합니다. 버튼을 눌렀다, 글자를 쳤다, 표의 행을 두 번 눌렀다. 브라우저는 이런 일이 생길 때마다 신호를 보내는데, 이 신호가 **@@이벤트@@**(event)입니다. 이벤트가 왔을 때 실행할 함수는 **@@이벤트 핸들러@@**(event handler)라고 부릅니다.

리액트에서는 이벤트 핸들러를 props로 건넵니다. 이름이 `on`으로 시작하는 props가 그 자리입니다. 누르기는 `onClick`, 두 번 누르기는 `onDoubleClick`, 입력 칸의 글자가 바뀌는 것은 `onChange`입니다. [[#ch6]]에서 팝업에 `onClose` 함수를 건넨 것과 같은 방법이고, 받는 쪽이 버튼 같은 화면 요소라는 점만 다릅니다.

```tsx src="src/screens/home/HomePage.tsx:29-31" hl="3"
        {CARDS.map((c) => (
          <Col key={c.key} xs={24} md={12} xl={6}>
            <Card hoverable className="home-card" onClick={() => openScreen(c.key)} role="link" aria-label={c.title}>
```

[[#ch5]]에서 홈 화면의 카드 4장을 그리던 코드의 앞부분입니다. 이번에는 31행의 @@|onClick@@`onClick`만 봅니다. 중괄호 안의 `() => openScreen(c.key)`는 화살표 함수입니다. 카드를 그릴 때는 이 함수를 만들어 건네기만 하고, 사용자가 카드를 누르면 그때 리액트가 이 함수를 부릅니다. 그제야 `openScreen(c.key)`가 실행되어 그 카드의 화면이 열립니다(`openScreen`은 [[#ch10]]에서 봅니다).

건넬 함수에 이미 이름이 있으면 이름만 적습니다. `NoticePage.tsx` 87행의 `onClick={excel}`이 그렇습니다. 65행에서 만든 함수 `excel`을 괄호 없이 적었습니다. `excel`은 함수 그 자체이고, `excel()`은 지금 실행하라는 명령입니다.

[[#ch6]]의 연락처 칸을 떠올려 보세요. 전표에 번호를 적어 두는 것과 그 자리에서 전화를 걸어 버리는 것은 다릅니다. `onClick`에 적어 둘 것은 번호, 곧 나중에 실행할 함수입니다.

::: warn 함수를 부르지 말고 건넵니다
`onClick={save()}`라고 쓰면 버튼을 누르기도 전에, 화면을 그리는 순간 `save`가 실행됩니다. 정작 버튼을 누르면 아무 일도 일어나지 않습니다. `save`가 화면을 다시 그리게 하는 함수라면 그리기와 부르기가 끝없이 되풀이되다 리액트가 오류를 내며 멈춥니다([[#ch7-rerender]]). `onClick={save}`처럼 이름만 건네거나, 넘길 값이 있으면 `onClick={() => save(no)}`처럼 화살표 함수로 감쌉니다. 이 실수는 대부분 타입스크립트가 빨간 줄로 잡아 줍니다.
:::

## 컴포넌트의 기억, useState {#ch7-usestate}

이벤트 핸들러 안에서 변수를 바꾸면 화면도 따라 바뀔까요? 창구의 호출 버튼을 흉내 낸 예제로 확인해 봅니다.

```tsx title="예제 7-1 변수로 만든 호출 버튼" nums
const CallButton = () => {
  let ticket = 0;
  const callNext = () => {
    ticket = ticket + 1;
    console.log(ticket);
  };
  return <button onClick={callNext}>다음 손님 ({ticket})</button>;
};
```

5행의 `console.log(값)`은 괄호 안의 값을 개발자 도구의 Console 탭에 찍는 명령입니다. 버튼을 세 번 누르면 콘솔에는 1, 2, 3이 차례로 찍히는데, 버튼의 글자는 끝까지 "다음 손님 (0)"입니다. 까닭은 둘입니다. 첫째, 변수를 바꿔도 리액트는 그 사실을 모르므로 화면을 다시 그리지 않습니다. 둘째, 다시 그린다 해도 소용이 없습니다. 컴포넌트는 함수라서 다시 그릴 때 첫 줄부터 새로 실행되고, 2행의 `let ticket = 0`이 숫자를 0으로 되돌립니다.

예제 7-1은 직원이 책상 위 메모지에 숫자를 고쳐 적은 셈입니다. 메모지를 아무리 고쳐도 손님이 보는 번호 표시기는 그대로이고, 표시기에 이어진 단추를 눌러야 숫자가 바뀝니다. 리액트에서 이 표시기의 숫자에 해당하는 것이 **@@state@@**(상태)입니다. state는 컴포넌트가 기억하는 값이고, 바뀌면 리액트가 화면을 다시 그려 주는 값입니다. state는 @@|useState@@`useState`라는 함수로 만듭니다.

```tsx title="예제 7-2 useState의 모양"
const [ticket, setTicket] = useState(0);
```

괄호 안의 `0`은 처음 값입니다. `useState`는 칸이 둘인 배열을 돌려줍니다. 첫 칸은 지금 값이고, 둘째 칸은 그 값을 @@|바꾸는 함수@@**바꾸는 함수**, 곧 표시기에 이어진 단추입니다. 왼쪽의 대괄호는 [[#ch3]]에서 배운 배열 구조 분해로, 두 칸에 `ticket`과 `setTicket`이라는 이름을 붙여 꺼냅니다. 이름은 `값`, `set값`으로 짝을 맞춥니다. `useState`는 파일 첫머리에서 `import { useState } from 'react';`로 가져와 씁니다.

예제 7-1의 2행을 이 줄로, 4행을 `setTicket(ticket + 1)`로 바꿔 봅니다. 이제 누를 때마다 버튼의 글자가 (1), (2), (3)으로 올라갑니다. 이름이 `use`로 시작하는 이런 리액트 함수를 훅이라고 합니다([[#ch8]]).

공지사항 화면 `NoticePage.tsx`에 직접 적힌 `useState`는 아래 3줄입니다.

```tsx src="src/screens/sample/NoticePage.tsx:36-38" hl="3"
  const [selected, setSelected] = useState<number[]>([]);
  const [edit, setEdit] = useState<{ open: boolean; no: number | null }>({ open: false, no: null });
  const [viewOpen, setViewOpen] = useState(false);
```

표에서 체크한 공지 번호들(`selected`), 등록·수정 팝업의 상황(`edit`), 상세 팝업이 열려 있는지(`viewOpen`)입니다. 36행과 37행의 꺾쇠는 [[#ch7-multi-state]]에서 풀고, 가장 단순한 38행부터 봅니다. 처음 값이 `false`이므로 화면을 막 열었을 때 상세 팝업은 닫혀 있습니다.

이 파일에서 `viewOpen`을 바꾸는 곳은 네 군데(54·55·104·106행)이고, 모두 `setViewOpen`을 부릅니다. `viewOpen = true`처럼 값을 직접 넣는 줄은 하나도 없습니다. state는 바꾸는 함수로만 바꿉니다.

## state가 바뀌면 다시 그린다 {#ch7-rerender}

공지 제목을 누르면 `onClick`(`NoticeParts.tsx` 90~93행)이 `openView`를 부릅니다. 그 안의 54행이 state를 바꾸고, 바뀐 값은 101행이 읽습니다. `openView`의 나머지 줄(51~58행)은 [[#ch8]]에서 봅니다.

```tsx src="src/screens/sample/NoticePage.tsx:54-101" hl="1,4"
      setViewOpen(true);
      // …
      <NoticeViewModal
        open={viewOpen}
```

팝업이 뜨기까지를 느린 화면으로 보면 다섯 걸음입니다.

1. `openView`가 `setViewOpen(true)`를 부르면(54행) 리액트가 새 값 `true`를 맡아 둡니다.
2. 이벤트 핸들러가 끝나면 리액트가 `NoticePage` 함수를 첫 줄부터 다시 부릅니다.
3. 이번에는 38행의 `useState(false)`가 처음 값 대신 맡아 둔 `true`를 돌려줍니다.
4. 그래서 새로 만든 JSX에서는 101행이 `open={true}`가 됩니다.
5. 리액트가 새 JSX를 직전 것과 견줘 달라진 곳만 실제 화면에 고칩니다. 팝업이 나타납니다.

[[#ch5]]에서 컴포넌트를 화면에 그리는 일을 렌더링이라고 했습니다. state가 바뀌어 다시 그리는 일은 @@|다시 렌더링@@**다시 렌더링**(re-rendering)입니다. 아래 그림은 이 다섯 걸음을 한 바퀴로 그린 것이고, 칸 앞의 동그라미 번호가 목록의 번호입니다. 가운데 노란 칸을 보세요. state는 리액트가 맡아 두므로 함수를 몇 번 다시 불러도 사라지지 않습니다.

![이벤트에서 화면까지 한 바퀴. 바꾸는 함수를 불러야 화면이 바뀐다](img/ch07-render-cycle.svg){width=90%}

코드 어디에도 "팝업을 띄워라"라는 명령이 없다는 점이 중요합니다. 이벤트 핸들러는 state만 바꿨고, JSX는 state가 이럴 때 화면이 어떤 모양인지만 적었습니다. *화면은 state를 그린 결과입니다.*

::: note const인데 값이 바뀌나요?
`const`로 받은 `viewOpen`은 바뀌지 않습니다. 다시 렌더링할 때마다 함수가 새로 실행되면서 그때의 값을 담은 새 상수가 만들어질 뿐입니다. 그래서 `setViewOpen(true)`를 부른 바로 다음 줄에서 `viewOpen`을 읽으면 아직 `false`입니다. 새 값은 다음 렌더링에서 만납니다. 고친 예제 7-1의 `console.log`가 한 박자 늦은 0, 1, 2를 찍는 것도 이 때문입니다.
:::

::: try 누른 횟수를 세는 버튼
개발 서버를 켜 둔 채로 `src/screens/home/HomePage.tsx`에 +가 찍힌 3줄을 더하고 저장합니다. 나머지는 자리를 찾는 길잡이입니다(줄 번호는 상자 안에서 센 번호, `// …`는 건너뛴 줄).

```tsx title="src/screens/home/HomePage.tsx" kind="고치기" diff
+import { useState } from 'react';
 import type { ReactNode } from 'react';
 // …
   const openScreen = useOpenScreen();
+  const [count, setCount] = useState(0);
   return (
     <PageFrame screenKey={screenKey} title="홈">
+      <p><button onClick={() => setCount(count + 1)}>누른 횟수: {count}</button></p>
```

홈 화면 제목 아래에 생긴 버튼을 눌러 숫자가 1씩 올라가는지 봅니다. 확인이 끝나면 더한 3줄을 지우고 다시 저장해 원래대로 돌려놓습니다.
:::

![버튼을 세 번 누른 홈 화면. 숫자 3은 state `count`가 기억하고 있다](img/shots/ch07-try-count.png){width=70%}

위 그림의 버튼을 누를 때마다 `setCount(count + 1)`이 불리고, 리액트가 `HomePage`를 다시 렌더링해 새 `count`를 버튼에 적습니다. 브라우저를 새로 고치면(<kbd>F5</kbd>) 0으로 돌아갑니다. state는 화면이 떠 있는 동안만 살아 있는 기억입니다.

## 여러 값을 기억하기 {#ch7-multi-state}

state에는 참거짓과 숫자뿐 아니라 객체와 배열도 담습니다. 앞에서 미뤄 둔 37행의 `edit`가 객체입니다. 등록·수정 팝업은 기억할 것이 둘입니다. 열려 있는지(`open`), 그리고 몇 번 공지를 고치는지(`no`, 새로 등록할 때는 `null`)입니다. 두 값은 늘 함께 바뀌므로 객체 하나로 묶었습니다.

```tsx src="src/screens/sample/NoticePage.tsx:72-73"
    { key: 'create', onClick: () => setEdit({ open: true, no: null }) },
    { key: 'update', onClick: () => setEdit({ open: true, no: selected[0] }), disabled: selected.length !== 1 },
```

[등록] 버튼과 [수정] 버튼이 눌렸을 때 할 일입니다(버튼이 되는 과정은 [[#ch13]]). [수정]은 체크한 공지가 하나일 때만 켜지고, 그 번호인 `selected[0]`을 `no`에 넣습니다. 두 줄 모두 `setEdit`에 새 객체를 통째로 건넵니다. `edit.open = true`처럼 들고 있던 객체의 속을 고치지 않습니다.

속을 고치면 안 되는 까닭은 리액트가 "이전 것과 같은 물건인가"로 state가 바뀌었는지를 가리기 때문입니다. 배열에 `push`로 값을 밀어 넣고 같은 배열을 바꾸는 함수에 다시 건네면, 리액트는 같은 물건으로 보고 화면을 다시 그리지 않습니다. *객체와 배열 state는 속을 고치지 말고 새로 만들어 넣습니다.* [[#ch3]]에서 배운 전개 연산자와 `filter`가 여기서 쓰입니다.

표: 배열·객체 state를 바꾸는 법

| 하고 싶은 일 | 이렇게 쓰지 않는다 | 이렇게 쓴다 |
|---|---|---|
| 배열에 하나 더하기 | `list.push(x)` | `setList([...list, x])` |
| 배열에서 하나 빼기 | `list.splice(i, 1)` | `setList(list.filter((v) => v !== x))` |
| 객체의 속성 하나 바꾸기 | `obj.page = 2` | `setObj({ ...obj, page: 2 })` |

가운데 칸의 `push`(끝에 덧붙이기)와 `splice`(`i`번째 하나 잘라 내기)는 배열의 속을 직접 고치는 메서드입니다. 배열 state인 36행의 `selected`도 같은 규칙을 따릅니다. 표에서 체크 칸을 누르면 97행의 `setSelected(keys.map(Number))`가 새 배열을 넣습니다. `keys`는 표가 넘겨 준 공지 번호들이고, `Number`는 값을 숫자로 바꾸는 자바스크립트의 기본 함수입니다([[#ch7-event]]에서 본 대로 이름만 건넸습니다). 조회를 새로 하면 62행의 `setSelected([])`가 빈 배열로 갈아 끼웁니다.

`useState<number[]>([])`의 꺾쇠는 [[#ch4]]에서 배운 제네릭입니다. 처음 값이 `false`나 `0`이면 타입스크립트가 타입을 짐작하지만, 빈 배열 `[]`만 봐서는 무엇을 담을 배열인지 모릅니다. 그래서 숫자 배열이라고 꺾쇠로 알려 줍니다. 37행은 꺾쇠 안에 객체의 모양을 적었습니다. 처음 값의 `no: null`만 봐서는 공지 번호가 들어올 줄 모르므로 `no`에 `number | null`을 밝혔습니다.

지금까지는 이번 렌더링 때 받은 값에서 새 값을 만들었고, 대개는 이것으로 충분합니다. 다만 잠깐 상자에서 본 대로 state는 다음 렌더링까지 옛 값입니다. 그래서 해 보기의 버튼을 한 번 누를 때 `setCount(count + 1)`을 두 번 부르게 하면 1만 오릅니다.

이럴 때는 바꾸는 함수에 값 대신 함수를 건넵니다. 리액트가 가장 최근 값을 인자로 넣어 그 함수를 부르고, 돌려받은 값을 새 state로 삼습니다. `setCount((c) => c + 1)`을 두 번 부르면 2가 오릅니다.

```ts src="src/hooks/usePagedSearch.ts:52"
  const setPage = useCallback((page: number, size: number) => setParams((prev) => (prev ? { ...prev, page, size } : prev)), [setParams]);
```

[[#ch3]]에서 읽은, 쪽 번호를 누르면 불리는 줄입니다. `setParams`는 같은 파일 13행에서 처음 값 `null`로 만든 조회조건 `params`의 바꾸는 함수입니다. `prev`는 가장 최근 조회조건이고, 조회 전이라 `null`이면 그대로 둡니다. 바깥의 `useCallback`([[#ch8]]) 때문에 `setPage`는 한 번 만들어 두고 계속 쓰는 함수입니다. 그 안에서 `params`를 읽으면 만들 때의 값에 머무르므로, `prev`로 최근 값을 받습니다.

## state는 누가 갖고 있을까 {#ch7-owner}

상세 팝업이 열려 있는지는 팝업의 사정인데, 왜 `viewOpen`은 `NoticePage`에 있을까요? 팝업을 여는 일이 팝업 바깥에서 벌어지기 때문입니다. 제목은 표에서 누르고, 상세 팝업 안의 [수정]은 상세 팝업을 닫고 다른 팝업을 열어야 합니다. 이 일을 다 볼 수 있는 자리는 표와 두 팝업을 품은 부모뿐입니다.

![state는 부모가 갖고, 팝업은 값과 알릴 길을 props로 받는다](img/ch07-state-owner.svg){width=90%}

```tsx src="src/screens/sample/NoticePage.tsx:100-110" hl="2,4,6,7"
      <NoticeViewModal
        open={viewOpen}
        // …
        onClose={() => setViewOpen(false)}
        onEdit={(n) => {
          setViewOpen(false);
          setEdit({ open: true, no: n.no });
        }}
      />
      <NoticeEditModal open={edit.open} no={edit.no} onClose={() => setEdit({ open: false, no: null })} />
```

[[#ch6]]에서 본 코드입니다. 그때는 `open`과 `onClose`를 건넨다는 것만 봤고, 이제 그 값이 어디서 오는지 압니다. 부모는 state를 갖고, 자식에게는 지금 값(101행)과 바꿔 달라고 알릴 길(104행)을 props로 내려 줍니다. 팝업은 [닫기]가 눌리면 `onClose`로 알릴 뿐이고, state를 바꾸는 것은 부모입니다.

상세 팝업의 [수정]을 누르면 106행과 107행이 state 2개를 한꺼번에 바꿉니다. 상세 팝업을 닫고, 같은 공지 번호로 등록·수정 팝업을 엽니다. 두 state가 한 컴포넌트에 모여 있어서 되는 일입니다.

여러 부품이 함께 보는 state를 공통 부모로 올려 두는 일을 @@|state 끌어올리기@@**state 끌어올리기**(lifting state up)라고 합니다. 끌어올린 state에는 그림 7-3의 검은 화살표(값)와 파란 화살표(알림)가 늘 짝으로 붙습니다. 여러 화면이 함께 보는 값은 [[#ch11]]의 스토어가 맡습니다.

## 입력 칸과 state {#ch7-input}

입력 칸에 친 글자도 누군가 기억해야 합니다. 리액트에서는 그 글자도 state에 둡니다.

```tsx title="예제 7-3 글자를 기억하는 입력 칸"
const [name, setName] = useState('');
// …
<input value={name} onChange={(e) => setName(e.target.value)} />
<p>{name.length}글자: {name}</p>
```

칸에 "김하늘"을 치면 아래 줄에 "3글자: 김하늘"이 나옵니다. `value={name}`은 칸에 보일 글자를 state가 정한다는 뜻입니다. @@|onChange@@`onChange`는 글자가 바뀔 때마다 불리는 이벤트 핸들러입니다. 매개변수 `e`는 무슨 일이 어디서 일어났는지를 담은 **@@이벤트 객체@@**(event object)입니다. `e.target`은 입력 칸이고, @@|e.target.value@@`e.target.value`는 바뀐 뒤 칸에 든 글자 전체입니다.

한 글자를 칠 때마다 `setName`, 다시 렌더링, 새 글자 순서로 [[#ch7-rerender]]의 한 바퀴가 돕니다. `onChange`를 빼고 `value`만 주면 state가 그대로라서 아무리 쳐도 글자가 들어가지 않습니다. 이렇게 `value`와 `onChange`로 state에 묶인 입력 칸을 **@@제어 컴포넌트@@**(controlled component)라고 부릅니다.

우리 소스의 검색어 칸도 같은 짝을 씁니다. 45행을 보세요.

```tsx src="src/screens/sample/NoticeParts.tsx:42-46" hl="4"
const KeywordInput = ({ form, value, onChange }: ValueProps<string | undefined> & { form: FormInstance }) => {
  const field = Form.useWatch('field', form) as NoticeField | undefined;
  const off = !field || field === 'ALL';
  return <Input value={value} onChange={(e) => onChange?.(e.target.value)} disabled={off} allowClear placeholder={off ? '검색구분을 고르세요' : '검색어'} aria-label="검색어" />;
};
```

45행의 `Input`은 antd의 입력 칸이고, `value`와 `onChange` 짝이 예제와 같습니다. 다만 `useState`가 없습니다. 둘을 props로 받아(42행) `Input`에 이어 줄 뿐입니다. 42행 콜론 뒤는 props의 타입인데, `&`는 두 타입을 합친다는 표시입니다. `value`와 `onChange`를 담은 공용 타입 `ValueProps`에 `form`을 더해 받습니다. `onChange?.(…)`는 [[#ch3]]의 옵셔널 체이닝으로, `onChange`를 받았을 때만 부릅니다.

둘을 건네는 쪽은 antd의 `Form`입니다. `KeywordInput`을 쓰는 57행은 `<KeywordInput form={form} />`이 전부라서 `value`도 `onChange`도 건네지 않습니다. 이 칸은 조회조건 틀 `SearchForm`([[#ch13]])이 품은 `Form` 안에 놓이고, 그 `Form`이 칸마다 값을 기억해 두었다가 이 둘을 꽂아 줍니다. 입력 칸이 열 개여도 `useState`를 열 번 쓰지 않는 까닭입니다.

로그인 화면 `LoginPage.tsx`도 `Form`을 써서 `useState`가 한 번도 나오지 않습니다. `NoticePage.tsx` 34행의 `Form.useForm()`은 `Form`을 바깥에서 다루는 손잡이를 받는 줄입니다.

우리 소스의 `useState`는 대개 팝업이 열렸는지, 무엇을 골랐는지 같은 화면의 사정을 기억합니다. 폼의 글자는 `Form`이, 서버에서 읽은 목록은 TanStack Query가([[#ch12]]), 로그인한 사람은 스토어가([[#ch11]]) 맡습니다. 다만 폼 밖에 홀로 놓인 검색어 칸은 예제 7-3처럼 `useState`로 기억하기도 합니다(사무소 검색 팝업 `OfficeSearchModal.tsx` 20·31행).

::: summary
- 이벤트 핸들러는 `onClick` 같은 props에 함수로 건넨다. `onClick={save()}`처럼 부르지 않는다.
- `const [값, 바꾸는 함수] = useState(처음 값)`. state는 컴포넌트가 기억하는 값이다.
- 바꾸는 함수를 부르면 리액트가 컴포넌트를 다시 렌더링한다. 화면은 state를 그린 결과다.
- 객체와 배열 state는 새로 만들어 넣는다. 가장 최근 값이 필요하면 `set((prev) => …)`를 쓴다.
- 여러 부품이 함께 보는 state는 공통 부모가 갖고, 지금 값과 알릴 길(콜백)을 props로 내려 준다.
- 입력 칸은 `value`와 `onChange` 짝으로 state와 묶는다. 우리 소스의 폼은 antd `Form`이 맡는다.
:::

::: quiz
1. `<button onClick={setCount(count + 1)}>`이라고 쓰면 어떤 일이 벌어질까요? 바르게 고쳐 보세요.
2. `selected.push(7); setSelected(selected);`로 번호를 더했는데 화면이 그대로입니다. 까닭을 말하고 코드를 고쳐 보세요.
3. `viewOpen`을 `NoticeViewModal` 안에 두지 않고 `NoticePage`에 둔 까닭은 무엇일까요?
:::
::: answer
1. 그리는 도중에 `setCount`가 불려 다시 그리기를 끝없이 되풀이하다 리액트가 오류를 내며 멈춘다(타입스크립트도 빨간 줄로 알려 준다). `onClick={() => setCount(count + 1)}`로 고친다.
2. 같은 배열을 다시 건넸으므로 리액트가 바뀌지 않았다고 본다. `setSelected([...selected, 7])`처럼 새 배열을 넣는다.
3. 팝업을 여는 일(표의 제목 누르기)이 팝업 바깥에서 벌어지고, 상세 팝업의 [수정]은 다른 팝업까지 열어야 한다. 표와 두 팝업을 품은 부모라야 이 일을 한자리에서 처리한다.
:::
