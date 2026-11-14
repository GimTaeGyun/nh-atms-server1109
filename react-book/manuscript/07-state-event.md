# state와 이벤트

::: lead
버튼을 누르면 팝업이 뜨고, 줄을 체크하면 [삭제] 버튼이 켜집니다. 화면이 사용자의 손길에 반응하는 원리를 이벤트와 state라는 두 낱말로 배웁니다. 읽고 나면 공지사항 화면이 팝업을 여닫는 코드를 한 줄씩 설명하게 됩니다.
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

은행 창구 위에는 번호 표시기가 걸려 있습니다. 직원이 호출 버튼을 누르면 딩동 소리와 함께 숫자가 바뀝니다. [[#ch5]]과 [[#ch6]]에서 만든 화면에는 이 딩동이 없었습니다. 컴포넌트는 props를 받아 화면을 한 번 그렸고, 그 뒤로는 사진처럼 가만히 있었습니다.

실제 화면은 움직입니다. 공지사항 화면에서 제목을 누르면 상세 팝업이 뜨고 [닫기]를 누르면 사라집니다. 이 움직임을 만드는 재료는 둘입니다. 사용자가 무엇을 했는지 알려 주는 이벤트, 그리고 컴포넌트가 지금 형편을 기억해 두는 state입니다.

## 누르면 일어나는 일, 이벤트 {#ch7-event}

화면이 반응하려면 먼저 사용자가 무엇을 했는지 알아야 합니다. 버튼을 눌렀다, 글자를 쳤다, 줄을 두 번 눌렀다. 브라우저는 이런 일이 생길 때마다 신호를 보내는데, 이 신호가 **@@이벤트@@**(event)입니다. 이벤트가 왔을 때 실행할 함수는 **@@이벤트 핸들러@@**(event handler)라고 부릅니다.

리액트에서는 이벤트 핸들러를 props로 건넵니다. 이름이 `on`으로 시작하는 props가 그 자리입니다. 누르기는 `onClick`, 두 번 누르기는 `onDoubleClick`, 입력 칸의 글자가 바뀌는 것은 `onChange`입니다. [[#ch6]]에서 팝업에 `onClose` 함수를 건넨 것과 같은 방법이고, 받는 쪽이 버튼 같은 화면 요소라는 점만 다릅니다.

```tsx src="src/screens/home/HomePage.tsx:29-31" hl="3"
        {CARDS.map((c) => (
          <Col key={c.key} xs={24} md={12} xl={6}>
            <Card hoverable className="home-card" onClick={() => openScreen(c.key)} role="link" aria-label={c.title}>
```

[[#ch5]]에서 홈 화면의 카드 4장을 그리던 코드의 앞부분입니다. 이번에는 31행의 @@|onClick@@`onClick`만 봅니다. 중괄호 안의 `() => openScreen(c.key)`는 화살표 함수입니다. 카드를 그릴 때는 이 함수를 만들어 건네기만 하고, 사용자가 카드를 누르면 그때 리액트가 이 함수를 부릅니다. 그제야 `openScreen(c.key)`가 실행되어 그 카드의 화면이 열립니다(`openScreen`은 [[#ch10]]에서 봅니다).

건넬 함수에 이미 이름이 있으면 이름만 적습니다. `NoticePage.tsx` 87행의 `<ExcelButton onClick={excel} … />`에서 `excel`은 65행에서 만든 함수입니다. 뒤에 괄호가 없다는 점을 눈여겨보세요. `excel`은 함수 그 자체이고, `excel()`은 지금 실행하라는 명령입니다.

[[#ch6]]의 연락처 칸을 떠올려 보세요. 전표에 번호를 적어 두는 것과 그 자리에서 전화를 걸어 버리는 것은 다릅니다. `onClick`에 적어 둘 것은 번호, 곧 나중에 실행할 함수입니다.

::: warn 함수를 부르지 말고 건넵니다
`onClick={save()}`라고 쓰면 버튼을 누르기도 전에, 화면을 그리는 순간 `save`가 실행됩니다. 정작 버튼을 누르면 아무 일도 일어나지 않습니다. `onClick={save}`처럼 이름만 건네거나, 넘길 값이 있으면 `onClick={() => save(no)}`처럼 화살표 함수로 감쌉니다. 이 실수는 대부분 타입스크립트가 빨간 줄로 잡아 줍니다.
:::

## 컴포넌트의 기억, useState {#ch7-usestate}

이벤트 핸들러 안에서 변수를 바꾸면 화면도 따라 바뀔까요? 창구의 호출 버튼을 흉내 낸 예제로 확인해 봅니다.

```tsx title="예제 7-1 변수로 만든 호출 버튼" nums
const CallButton = () => {
  let waiting = 0;
  const callNext = () => {
    waiting = waiting + 1;
    console.log(waiting);
  };
  return <button onClick={callNext}>다음 손님 ({waiting})</button>;
};
```

버튼을 세 번 누르면 콘솔에는 1, 2, 3이 차례로 찍히는데, 버튼의 글자는 끝까지 "다음 손님 (0)"입니다. 까닭은 둘입니다. 첫째, 변수를 바꿔도 리액트는 그 사실을 모르므로 화면을 다시 그리지 않습니다. 둘째, 다시 그린다 해도 소용이 없습니다. 컴포넌트는 함수라서 다시 그릴 때 첫 줄부터 새로 실행되고, 2행의 `let waiting = 0`이 숫자를 0으로 되돌립니다.

직원이 책상 위 메모지에 숫자를 고쳐 적어도 손님이 보는 번호 표시기는 그대로입니다. 표시기에 이어진 호출 버튼을 눌러야 숫자가 바뀝니다. 리액트에서 이 표시기의 숫자에 해당하는 것이 **@@state@@**(상태)입니다. state는 컴포넌트가 기억하는 값이고, 바뀌면 리액트가 화면을 다시 그려 주는 값입니다. state는 @@|useState@@`useState`라는 함수로 만듭니다.

```tsx title="예제 7-2 useState의 모양"
const [waiting, setWaiting] = useState(0);
```

괄호 안의 `0`은 처음 값입니다. `useState`는 칸이 둘인 배열을 돌려줍니다. 첫 칸은 지금 값이고, 둘째 칸은 그 값을 @@|바꾸는 함수@@**바꾸는 함수**입니다. 왼쪽의 대괄호는 [[#ch3]]에서 배운 배열 구조 분해로, 두 칸에 `waiting`과 `setWaiting`이라는 이름을 붙여 꺼냅니다. 이름은 `값`, `set값`으로 짝을 맞춥니다.

예제 7-1의 2행을 이 줄로, 4행을 `setWaiting(waiting + 1)`로 바꾸면 누를 때마다 버튼의 글자가 (1), (2), (3)으로 올라갑니다. `useState`처럼 이름이 `use`로 시작하는 리액트 함수를 훅이라고 부르는데, [[#ch8]]에서 자세히 배웁니다.

우리 소스의 공지사항 화면이 스스로 기억하는 값은 아래 세 개가 전부입니다.

```tsx src="src/screens/sample/NoticePage.tsx:36-38" hl="3"
  const [selected, setSelected] = useState<number[]>([]);
  const [edit, setEdit] = useState<{ open: boolean; no: number | null }>({ open: false, no: null });
  const [viewOpen, setViewOpen] = useState(false);
```

표에서 체크한 공지 번호들(`selected`), 등록·수정 팝업의 형편(`edit`), 상세 팝업이 열려 있는지(`viewOpen`)입니다. 가장 단순한 38행부터 봅니다. 처음 값이 `false`이므로 화면을 막 열었을 때 상세 팝업은 닫혀 있습니다. 36행과 37행의 꺾쇠는 [[#ch7-multi-state]]에서 풉니다.

## state가 바뀌면 다시 그린다 {#ch7-rerender}

공지 제목을 누르면 이벤트 핸들러 `openView`가 불리고, 그 안의 54행이 state를 바꿉니다. 바뀐 `viewOpen`을 읽는 곳은 101행입니다.

```tsx src="src/screens/sample/NoticePage.tsx:54-101" hl="1,4"
      setViewOpen(true);
      // …
      <NoticeViewModal
        open={viewOpen}
```

팝업이 뜨기까지를 느린 화면으로 보면 다섯 걸음입니다.

1. 이벤트 핸들러가 `setViewOpen(true)`를 부릅니다(54행).
2. 리액트가 새 값 `true`를 보관하고, `NoticePage` 함수를 첫 줄부터 다시 부릅니다.
3. 이번에는 38행의 `useState(false)`가 처음 값 대신 보관해 둔 `true`를 돌려줍니다.
4. 101행이 `open={true}`가 된 새 JSX가 만들어집니다.
5. 리액트가 새 JSX를 직전 것과 견줘 달라진 곳만 실제 화면에 고칩니다. 팝업이 나타납니다.

[[#ch5]]에서 컴포넌트를 화면에 그리는 일을 렌더링이라고 했습니다. state가 바뀌어 다시 그리는 일은 @@|다시 렌더링@@**다시 렌더링**입니다. 아래 그림은 위의 다섯 걸음을 한 바퀴로 그린 것입니다. 가운데 노란 칸을 보세요. state는 리액트가 맡아 두므로 함수를 몇 번 다시 불러도 사라지지 않습니다.

![이벤트에서 화면까지 한 바퀴. 바꾸는 함수를 불러야 화면이 바뀐다](img/ch07-render-cycle.svg){width=90%}

코드 어디에도 "팝업을 띄워라"는 명령이 없다는 점이 중요합니다. 이벤트 핸들러는 state만 바꿨고, JSX는 state가 이럴 때 화면이 어떤 모양인지만 적었습니다. *화면은 state를 그린 결과입니다.* state를 바꾸면 화면은 따라옵니다.

::: note const인데 값이 바뀌나요?
`const`로 받은 `viewOpen`은 바뀌지 않습니다. 다시 렌더링할 때마다 함수가 새로 실행되면서 그때의 값을 담은 새 상수가 만들어질 뿐입니다. 그래서 `setViewOpen(true)`를 부른 바로 다음 줄에서 `viewOpen`을 읽으면 아직 `false`입니다. 새 값은 다음 렌더링에서 만납니다.
:::

::: try 누른 횟수를 세는 버튼
개발 서버를 켜 둔 채로 `src/screens/home/HomePage.tsx`에 초록색으로 칠한 세 줄을 더하고 저장합니다.

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

홈 화면 제목 아래에 생긴 버튼을 눌러 숫자가 1씩 올라가는지 봅니다. 확인이 끝나면 더한 세 줄을 지우고 다시 저장해 원래대로 돌려놓습니다.
:::

![버튼을 세 번 누른 홈 화면. 숫자 3은 state `count`가 기억하고 있다](img/shots/ch07-try-count.png){width=80%}

위 그림의 버튼을 누를 때마다 `setCount(count + 1)`이 불리고, 리액트가 `HomePage`를 다시 렌더링해 새 `count`를 버튼에 적습니다. 방금 본 한 바퀴를 손으로 돌려 본 셈입니다. 브라우저를 새로 고치면(<kbd>F5</kbd>) 0으로 돌아갑니다. state는 화면이 떠 있는 동안만 살아 있는 기억입니다.

## 여러 값을 기억하기 {#ch7-multi-state}

state에는 참거짓과 숫자뿐 아니라 객체와 배열도 담습니다. 앞에서 미뤄 둔 37행의 `edit`가 객체입니다. 등록·수정 팝업은 기억할 것이 둘입니다. 열려 있는지(`open`), 그리고 몇 번 공지를 고치는지(`no`, 새로 등록할 때는 `null`)입니다. 두 값은 늘 함께 바뀌므로 객체 하나로 묶었습니다.

```tsx src="src/screens/sample/NoticePage.tsx:72-73"
    { key: 'create', onClick: () => setEdit({ open: true, no: null }) },
    { key: 'update', onClick: () => setEdit({ open: true, no: selected[0] }), disabled: selected.length !== 1 },
```

[등록] 버튼과 [수정] 버튼이 눌렸을 때 할 일을 적은 줄입니다(이 줄들이 버튼이 되는 과정은 [[#ch13]]에서 봅니다). [수정]은 체크한 공지가 하나일 때만 켜지고, 그 번호인 `selected[0]`을 `no`에 넣습니다. 두 줄 모두 `setEdit`에 새 객체를 통째로 넣습니다. `edit.open = true`처럼 들고 있던 객체의 속을 고치지 않습니다.

속을 고치면 안 되는 까닭은 리액트가 "이전 것과 같은 물건인가"로 state가 바뀌었는지를 가리기 때문입니다. 배열에 `push`로 값을 밀어 넣고 같은 배열을 바꾸는 함수에 다시 건네면, 리액트는 같은 물건으로 보고 화면을 다시 그리지 않습니다. *객체와 배열 state는 속을 고치지 말고 새로 만들어 넣습니다.* [[#ch3]]에서 배운 전개 연산자와 `filter`가 여기서 쓰입니다.

표: 배열·객체 state를 바꾸는 법

| 하고 싶은 일 | 이렇게 쓰지 않는다 | 이렇게 쓴다 |
|---|---|---|
| 배열에 하나 더하기 | `list.push(x)` | `setList([...list, x])` |
| 배열에서 하나 빼기 | `list.splice(i, 1)` | `setList(list.filter((v) => v !== x))` |
| 객체의 속성 하나 바꾸기 | `obj.page = 2` | `setObj({ ...obj, page: 2 })` |

배열 state인 36행의 `selected`도 같은 규칙을 따릅니다. 표에서 줄을 체크하면 97행의 `setSelected(keys.map(Number))`가 새 배열을 넣습니다. 조회를 새로 하면 62행의 `setSelected([])`가 빈 배열로 갈아 끼웁니다.

`useState<number[]>([])`의 꺾쇠는 [[#ch4]]에서 배운 제네릭입니다. 처음 값이 `false`나 `0`이면 타입스크립트가 타입을 짐작하지만, 빈 배열 `[]`만 봐서는 무엇을 담을 배열인지 모릅니다. 그래서 숫자 배열이라고 꺾쇠로 알려 줍니다. 37행의 꺾쇠도 같은 이유로 객체의 모양을 적은 것입니다.

새 값을 이전 값에서 만들어야 할 때는 바꾸는 함수에 값 대신 함수를 건넵니다. 리액트가 가장 최근 값을 인자로 넣어 그 함수를 부르고, 돌려받은 값을 새 state로 삼습니다.

```ts src="src/hooks/usePagedSearch.ts:52"
  const setPage = useCallback((page: number, size: number) => setParams((prev) => (prev ? { ...prev, page, size } : prev)), [setParams]);
```

표 아래에서 쪽 번호를 눌렀을 때 불리는 함수입니다. 바깥을 감싼 `useCallback`은 [[#ch8]]에서 배우니 지금은 안쪽의 `setParams((prev) => …)`만 봅니다.

`prev`가 직전 조회조건입니다. 조건이 있으면 `{ ...prev, page, size }`, 곧 나머지는 그대로 두고 쪽 번호와 크기만 바꾼 새 객체를 돌려줍니다. 아직 조회 전이라 `null`이면 그대로 둡니다. [조회]를 눌렀을 때 불리는 49행도 같은 모양으로, 쪽 크기만 `prev`에서 이어받습니다.

## state는 누가 갖고 있을까 {#ch7-owner}

상세 팝업이 열려 있는지는 팝업의 사정인데, 왜 `viewOpen`은 `NoticePage`에 있을까요? 팝업을 여닫는 일이 팝업 바깥에서 벌어지기 때문입니다. 제목은 표에서 누르고, [수정]을 누르면 상세 팝업을 닫고 등록·수정 팝업을 열어야 합니다. 이 일을 다 볼 수 있는 자리는 표와 두 팝업을 품은 부모뿐입니다.

```tsx src="src/screens/sample/NoticePage.tsx:100-110" hl="2,5,7,8"
      <NoticeViewModal
        open={viewOpen}
        notice={view.data}
        loading={view.isPending}
        onClose={() => setViewOpen(false)}
        onEdit={(n) => {
          setViewOpen(false);
          setEdit({ open: true, no: n.no });
        }}
      />
      <NoticeEditModal open={edit.open} no={edit.no} onClose={() => setEdit({ open: false, no: null })} />
```

[[#ch6]]에서 본 코드입니다. 그때는 `open`과 `onClose`를 건넨다는 것만 봤고, 이제 그 값이 어디서 오는지 압니다. 부모는 state를 갖고, 자식에게는 지금 값(101행)과 바꿔 달라고 알릴 길(104행)을 props로 내려 줍니다. 팝업은 자기가 열려 있는지를 스스로 정하지 않습니다. [닫기]가 눌리면 `onClose`를 불러 부모에게 알릴 뿐이고, state를 바꾸는 것은 부모입니다.

106행과 107행은 한 번 누르기로 state 두 개를 바꿉니다. 상세 팝업을 닫고, 같은 공지 번호로 등록·수정 팝업을 엽니다. 두 state가 한 컴포넌트에 모여 있어서 되는 일입니다.

![state는 부모가 갖고, 팝업은 값과 알릴 길을 props로 받는다](img/ch07-state-owner.svg){width=84%}

여러 부품이 함께 봐야 하는 state를 그 부품들의 공통 부모로 올려 두는 일을 @@|state 끌어올리기@@**state 끌어올리기**라고 합니다. 위 그림에서 파란 화살표와 점선 화살표가 늘 짝으로 다니는 것을 확인하세요. 여러 화면이 함께 봐야 하는 값은 [[#ch11]]의 스토어가 맡습니다.

## 입력 칸과 state {#ch7-input}

입력 칸에 친 글자도 누군가 기억해야 합니다. 리액트에서는 그 글자도 state에 둡니다.

```tsx title="예제 7-3 글자를 기억하는 입력 칸"
const [name, setName] = useState('');
// …
<input value={name} onChange={(e) => setName(e.target.value)} />
<p>{name.length}글자: {name}</p>
```

칸에 "김하늘"을 치면 아래 줄에 "3글자: 김하늘"이 나옵니다. `value={name}`은 칸에 보일 글자를 state가 정한다는 뜻입니다. @@|onChange@@`onChange`는 글자가 바뀔 때마다 불리는 이벤트 핸들러이고, 인자 `e`는 무슨 일이 어디서 일어났는지를 담은 **@@이벤트 객체@@**(event object)입니다. 그 안의 `e.target`이 입력 칸이고, @@|e.target.value@@`e.target.value`가 방금 바뀐 글자입니다.

한 글자를 칠 때마다 `setName`, 다시 렌더링, 새 글자 순서로 [[#ch7-rerender]]의 한 바퀴가 돕니다. `onChange`를 빼고 `value`만 주면 아무리 쳐도 글자가 들어가지 않습니다. state가 그대로이기 때문입니다. 이렇게 `value`와 `onChange`로 state에 묶인 입력 칸을 **@@제어 컴포넌트@@**(controlled component)라고 부릅니다.

우리 소스의 검색어 칸도 같은 짝을 씁니다. 45행을 보세요.

```tsx src="src/screens/sample/NoticeParts.tsx:42-46" hl="4"
const KeywordInput = ({ form, value, onChange }: ValueProps<string | undefined> & { form: FormInstance }) => {
  const field = Form.useWatch('field', form) as NoticeField | undefined;
  const off = !field || field === 'ALL';
  return <Input value={value} onChange={(e) => onChange?.(e.target.value)} disabled={off} allowClear placeholder={off ? '검색구분을 고르세요' : '검색어'} aria-label="검색어" />;
};
```

45행의 `Input`은 antd의 입력 칸이고, `value`와 `onChange` 짝이 예제와 같습니다. 다른 점은 `useState`가 없다는 것입니다. `value`와 `onChange`를 props로 받아(42행) `Input`에 이어 주기만 하고, state는 앞 절에서 본 대로 위쪽에 둡니다. `onChange?.(…)`의 `?.`는 `onChange`를 받았을 때만 부른다는 뜻입니다. 43행과 44행은 검색구분이 "전체"이면 이 칸을 끕니다.

그 위쪽이 누구인지가 재미있습니다. `KeywordInput`을 쓰는 57행은 `<KeywordInput form={form} />`이 전부라서 `value`도 `onChange`도 건네지 않습니다. antd의 `Form`이 대신 건넵니다. `Form`은 안에 놓인 칸마다 값을 기억해 두고 `value`와 `onChange`를 알아서 꽂아 줍니다. 입력 칸이 열 개인 화면에서 `useState`를 열 번 쓰지 않아도 되는 까닭입니다.

`NoticePage.tsx` 34행의 `const [form] = Form.useForm();`은 이 `Form`을 바깥에서 다루는 손잡이를 받는 줄입니다. 로그인 화면 `LoginPage.tsx`도 같은 방식이라, 개인번호와 비밀번호를 받는데도 `useState`가 한 번도 나오지 않습니다. `Form`은 [[#ch13]]에서 자세히 봅니다.

우리 소스에서 `useState`를 직접 쓰는 곳은 팝업이 열렸는지, 무엇을 골랐는지 같은 화면의 형편입니다. 입력 칸의 글자는 `Form`이, 서버에서 읽은 목록은 TanStack Query가([[#ch12]]), 로그인한 사람은 스토어가([[#ch11]]) 기억합니다. 맡는 곳은 달라도 원리는 같습니다. 값이 바뀌면 그 값을 쓰는 컴포넌트가 다시 렌더링됩니다.

::: summary
- 이벤트 핸들러는 `onClick` 같은 props에 함수로 건넨다. `onClick={save()}`처럼 부르지 않는다.
- `const [값, 바꾸는 함수] = useState(처음 값)`. state는 컴포넌트가 기억하는 값이다.
- 바꾸는 함수를 부르면 리액트가 컴포넌트를 다시 렌더링한다. 화면은 state를 그린 결과다.
- 객체와 배열 state는 속을 고치지 않고 새로 만들어 넣는다. 이전 값이 필요하면 `set((prev) => …)` 모양을 쓴다.
- 여러 부품이 함께 보는 state는 공통 부모가 갖고, 지금 값과 알릴 길(콜백)을 props로 내려 준다.
- 입력 칸은 `value`와 `onChange` 짝으로 state와 묶는다. 우리 소스에서는 antd `Form`이 이 일을 맡는다.
:::

::: quiz
1. `<button onClick={setCount(count + 1)}>`이라고 쓰면 어떤 일이 벌어질까요? 바르게 고쳐 보세요.
2. `selected.push(7); setSelected(selected);`로 번호를 더했는데 화면이 그대로입니다. 까닭을 말하고 코드를 고쳐 보세요.
3. `viewOpen`을 `NoticeViewModal` 안에 두지 않고 `NoticePage`에 둔 까닭은 무엇일까요?
:::
::: answer
1. 화면을 그리는 도중에 `setCount`가 불려 다시 렌더링이 끝없이 되풀이되고, 리액트가 오류를 내며 멈춘다. `onClick={() => setCount(count + 1)}`로 고친다.
2. 같은 배열을 다시 건넸으므로 리액트가 바뀌지 않았다고 본다. `setSelected([...selected, 7])`처럼 새 배열을 넣는다.
3. 팝업을 여는 일(표의 제목 누르기)과 닫으면서 다른 팝업을 여는 일이 팝업 바깥에서 벌어진다. 표와 두 팝업을 모두 품은 부모가 state를 가져야 이 일을 한자리에서 처리한다.
:::
