# props, 부품에 값 건네기

::: lead
같은 부품이 자리마다 다른 글자와 내용을 그리는 것은 쓰는 쪽이 값을 건네기 때문입니다. 값과 화면 조각과 함수를 건네는 방법을 배우고 나면, 컴포넌트의 첫 줄만 보고도 무엇을 받는 부품인지 읽어 냅니다.
:::

::: goals
- 쓰는 쪽의 속성과 받는 쪽의 구조 분해를 짝지어 읽을 수 있다
- props의 타입 표기에서 필수와 선택, 기본값을 가려낼 수 있다
- `children`과 `ReactNode`가 무엇인지 설명할 수 있다
- 자식이 부모에게 알리는 길인 콜백 props를 읽을 수 있다
:::

::: files
- `src/components/feedback/LoadingBlock.tsx`
- `src/components/display/SectionCard.tsx`
- `src/components/display/StatusTag.tsx`
- `src/screens/popup/NoticeViewModal.tsx`
- `src/screens/sample/NoticePage.tsx`
- `src/types/screen.ts`
:::

은행에서 돈을 찾을 때는 출금 전표를 씁니다. 계좌번호 칸과 금액 칸을 채워 내밀면 창구 직원은 적힌 대로 일합니다. 직원은 그대로인데 전표에 따라 내주는 돈이 달라집니다.

[[#ch5]]에서 읽은 `LoadingBlock`도 그렇게 일합니다. 앱을 켤 때는 "사용자 정보를 확인하는 중…"을, 공지사항 화면을 처음 열 때는 "공지사항 화면을 불러오는 중…"을 그립니다. 부품은 일곱 줄짜리 파일 하나인데 글자가 다른 까닭은, 쓰는 쪽이 그릴 글자를 적어 건넸기 때문입니다.

## props는 부품에 건네는 전표 {#ch6-props}

건넬 길이 없다면 글자가 다른 로딩 부품을 글자 가짓수만큼 만들어야 합니다. 리액트는 이 문제를 @@**props**|props(프롭스)@@(프롭스)로 풉니다. props는 부모 컴포넌트가 자식 컴포넌트를 쓰면서 건네는 값입니다. `A`의 JSX 안에 `<B />`가 있으면 `A`가 **부모**, `B`가 **자식**입니다.@@|부모·자식 컴포넌트@@ 전표로 치면 칸에 적은 값이 props입니다.

```tsx src="src/components/feedback/LoadingBlock.tsx:3-7" hl="1"
export const LoadingBlock = ({ tip = '불러오는 중…', height = 160 }: { tip?: string; height?: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height, color: 'var(--text-muted)', gap: 10 }}>
    <Spin size="small" /> {tip}
  </div>
);
```

@@`LoadingBlock`|LoadingBlock@@ 3행에서 이번에는 소괄호 안, 콜론 앞쪽의 `{ tip = '불러오는 중…', height = 160 }`만 보세요. [[#ch3]]의 구조 분해에, 매개변수처럼 @@기본값|기본값(props)@@을 붙인 모양입니다. 건네받은 객체에서 `tip`과 `height`를 꺼내고, 들어 있지 않으면 `=` 뒤의 값을 씁니다. 꺼낸 `height`는 4행에서 상자의 높이가 되고 `tip`은 5행에서 글자가 됩니다. 콜론 뒤쪽은 다음 절에서 읽습니다.

쓰는 쪽은 태그에 속성을 적어 값을 건넵니다. 아래 그림의 맨 위 상자는 [[#ch5]]에서 본 `src/app/MeGate.tsx` 46행입니다. 리액트는 태그에 적힌 속성을 객체 하나로 묶어 컴포넌트 함수의 인자로 넘깁니다. 가운데 상자가 그 객체이고, props 객체라고 부릅니다.@@|props 객체@@ *컴포넌트는 props 객체 하나를 받아 화면 조각을 돌려주는 함수입니다.*

![쓰는 쪽의 속성이 props 객체로 묶여 받는 쪽으로 간다](img/ch06-props-pair.svg){width=100%}

속성 이름은 받는 쪽에서 꺼내는 이름과 같아야 합니다. 글자를 그대로 적을 때는 HTML처럼 따옴표로, 숫자나 변수 같은 그 밖의 값은 중괄호 안에 적습니다. 도입의 "공지사항 화면을 불러오는 중…"은 템플릿 문자열([[#ch3]])이라 중괄호로 건넵니다. `src/components/layout/ScreenHost.tsx` 75행입니다.

그림의 46행은 두 칸을 다 채웠으니 기본값이 쓰이지 않습니다. 적지 않은 속성은 받는 쪽에 적어 둔 기본값이 채웁니다. `src/app/router.tsx` 14행은 `<LoadingBlock height={400} />`으로 높이만 건네므로 글자는 "불러오는 중…"이 됩니다.

## props에 타입 붙이기 {#ch6-type}

전표의 금액 칸에 이름을 적어 내면 창구에서 되돌려 받습니다. 칸마다 적을 값의 종류가 정해져 있기 때문입니다. props도 칸마다 타입을 정해 둡니다. 누군가 `MeGate.tsx` 46행의 높이를 따옴표로 감싸 `height="400"`으로 고쳤다고 합시다. [[#ch4]]에서 배운 `npm run typecheck`가 곧바로 찾아냅니다.

```out
src/app/MeGate.tsx:46:46 - error TS2322: Type 'string' is not assignable to type 'number'.
```

46행 46번째 글자에서 `TS2322`번 오류가 났다는 말입니다. "문자열은 숫자 자리에 넣을 수 없다"는 뜻이고, VS Code에서는 그 자리에 빨간 줄이 그어집니다. 검사의 근거는 `LoadingBlock.tsx` 3행에서 건너뛴 콜론 뒤쪽 `{ tip?: string; height?: number }`입니다. 앞 중괄호는 값을 꺼내는 구조 분해이고 뒤 중괄호는 그 값들의 타입입니다. 모양이 닮았으니 콜론을 기준으로 갈라 읽으세요.

props가 서너 개를 넘으면 받는 자리에 타입까지 적기가 벅찹니다. 그때는 타입에 이름을 붙여 위로 빼고, 받는 자리에는 그 이름만 적습니다. 이름은 관례로 @@`Props`|Props 인터페이스@@라고 짓습니다. 제목 아래에 내용을 담는 흰 카드 @@`SectionCard`|SectionCard@@가 그렇게 씁니다.

```tsx src="src/components/display/SectionCard.tsx:3-11"
interface Props {
  title?: ReactNode;
  sub?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
  bodyStyle?: CSSProperties;
  className?: string;
}
```

이 목록이 `SectionCard`가 받는 props의 전부입니다. 물음표는 [[#ch4]]에서 본 선택 속성 표시여서, 물음표가 붙은 여섯 칸은 건네지 않아도 됩니다. 물음표가 없는 7행의 `children`은 반드시 건네야 합니다. 빼먹으면 `Property 'children' is missing`으로 시작하는 오류가 납니다. `CSSProperties`는 [[#ch5]]에서 본 `style` 객체의 타입이고, `children`과 `ReactNode`는 다음 절에서 풉니다.

낯선 컴포넌트를 만나면 이 목록부터 읽으세요. @@선택 props|선택 props@@를 건네지 않으면 그 칸에는 `undefined`가 들어옵니다. `LoadingBlock`처럼 기본값을 적어 둔 칸만 그 값으로 바뀝니다. `?`는 "안 건네도 된다"는 타입의 말이고, `= 160`은 "안 건네면 이 값을 쓴다"는 코드의 말입니다.

## children, 부품 안에 부품 {#ch6-children}

`SectionCard`에 담을 내용은 글 한 줄일 때도 있고 표나 버튼 묶음일 때도 있습니다. 이런 덩어리를 속성 한 칸에 따옴표로 적기는 어렵습니다. HTML에서 `<p>`와 `</p>` 사이에 글을 쓰듯 태그 사이에 쓰는 편이 자연스럽습니다. 리액트는 그렇게 쓴 내용을 @@**`children`**|children@@이라는 이름의 props로 넘겨 줍니다.

::: source
`src/components/display/StatusTag.tsx` 9~14행을 열어 보세요. 상태 알약 @@`StatusTag`|StatusTag@@가 `children`을 받는 짧은 예입니다. `<StatusTag tone="danger">장애</StatusTag>`의 "장애"가 12행 `{children}` 자리에 그려집니다.
:::

```tsx src="src/components/display/SectionCard.tsx:14-26" hl="1,6,7,9,13"
export const SectionCard = ({ title, sub, extra, children, style, bodyStyle, className }: Props) => (
  <div className={`panel${className ? ` ${className}` : ''}`} style={style}>
    {(title || extra) && (
      <div className="flex-between" style={{ padding: '12px 16px 0' }}>
        <div className="section-title">
          {title}
          {sub && <span className="sub">{sub}</span>}
        </div>
        {extra}
      </div>
    )}
    <div className="panel-body" style={bodyStyle}>
      {children}
    // …
```

14행의 콜론 뒤에는 앞 절에서 이름 붙인 `Props`만 적혀 있습니다. 함께 꺼낸 `children`은 26행의 `{children}` 자리에 그려집니다. *여는 태그와 닫는 태그 사이에 쓴 것은 `children`이라는 props로 들어옵니다.* 15행은 `className`을 받았을 때만 덧붙이는 줄이니 지나쳐도 됩니다. 16행은 `title`이나 `extra`가 있을 때만 17~23행의 윗줄을 그리고, 20행의 `sub`도 건넸을 때만 그립니다([[#ch5]]의 `&&`).

앞 절 7행에 적힌 `children`의 타입 @@**`ReactNode`**|ReactNode@@는 "화면에 그릴 수 있는 것은 무엇이든"이라는 뜻입니다. 문자열, 숫자, JSX 요소, 그것들의 배열이 모두 들어갑니다. 앞 절 4~6행의 `title`·`sub`·`extra`도 `ReactNode`라서, 화면 조각은 이름 붙은 속성으로도 건넵니다. JSX도 값이므로([[#ch5]]) `extra={<b>오른쪽 자리</b>}`처럼 중괄호 안에 적습니다.

![`SectionCard`가 화면 조각을 받는 네 자리](img/ch06-slots.svg){width=100%}

::: try 빈 자리 채우기
개발 서버를 켜고 홈의 [공통 모듈] 카드를 누른 뒤 [권한·메시지] 탭의 맨 아래에 "SectionCard 제목" 카드가 있습니다. `src/screens/sample/commonModules/DisplayShowcase.tsx` 80~82행입니다.

80행의 `title`을 `"점검 안내"`로, 81행의 글을 `오늘 22시부터 점검합니다.`로 고칩니다. `style` 앞에는 `extra={<b>오른쪽 자리</b>}`를 넣고 저장하세요. `<b>`는 글자를 굵게 하는 태그입니다. 카드가 그림 6-2와 같아집니다. 끝나면 <kbd>Ctrl</kbd>+<kbd>Z</kbd>를 여러 번 눌러 되돌리고 저장합니다.
:::

## 함수도 건넨다 {#ch6-callback}

공지사항 목록에서 제목을 누르면 상세 팝업(모달)이 뜹니다. 팝업을 그리는 부품은 @@`NoticeViewModal`|NoticeViewModal@@이고, 띄울지 말지는 부모인 `NoticePage`가 `open`이라는 props로 정합니다. 그러면 팝업의 [닫기] 버튼이 곤란해집니다. 버튼은 자식 안에 있는데 닫을지를 정하는 값은 부모가 쥐고 있습니다.

전표로 치면 연락처 칸이 필요합니다. 손님이 "일이 끝나면 이 번호로 전화 주세요" 하고 번호를 적어 두면 직원은 때가 됐을 때 그 번호로 겁니다. 리액트에서는 부모가 함수를 건네고, 자식은 일이 생겼을 때 그 함수를 부릅니다. [[#ch3]]에서 `map`에 건넸던 콜백처럼 함수도 값이라 props에 실립니다.

```tsx src="src/screens/popup/NoticeViewModal.tsx:8-16" hl="6,8"
interface Props {
  open: boolean;
  /** 표시할 공지(상세 API 응답, text 포함). 읽는 중이면 undefined */
  notice?: Notice;
  loading?: boolean;
  onClose: () => void;
  /** [수정] — 부모가 이 팝업을 닫고 입력 팝업을 연다 */
  onEdit: (n: Notice) => void;
}
```

9~12행은 값이고 13행과 15행은 함수 타입입니다. `() => void`는 "인자 없이 부르고 돌려주는 값도 없는 함수"라고 읽습니다. `(n: Notice) => void`는 [[#ch4]]에서 읽은 공지 1건 `Notice`를 받는 함수입니다. 이렇게 함수를 받는 props를 @@콜백 props@@라고 하고, 이름은 관례로 `on`으로 시작합니다.

```tsx src="src/screens/sample/NoticePage.tsx:100-109" hl="5-9"
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
```

부모가 다섯 칸을 채우는 모습입니다. 101~103행은 값입니다. `view.data`는 서버에서 읽어 온 공지이고 `view.isPending`은 아직 읽는 중인지를 알려 줍니다([[#ch12]]).

104행은 화살표 함수를 그 자리에서 만들어 `onClose`에 건넵니다. 이 줄에서 팝업이 닫히지는 않습니다. 함수는 건네질 뿐이고 실행은 누군가 불러 줄 때 일어납니다. 불리면 `setViewOpen(false)`가 `viewOpen`을 `false`로 바꿉니다([[#ch7]]). 105~108행은 상세 팝업을 닫고 공지 `n`의 수정 팝업을 엽니다.

```tsx src="src/screens/popup/NoticeViewModal.tsx:40-46" hl="1,3"
    onClose={onClose}
    // …
      <AuthButton screenKey="sample.notice" need="upd" type="primary" icon={<EditOutlined />} disabled={!notice} onClick={() => notice && onEdit(notice)}>
    // …
```

두 함수를 부르는 곳은 자식입니다. 40행은 받은 `onClose`를 공통 팝업 틀 `DetailModal`에 그대로 넘기고, [닫기]가 눌리면 `DetailModal`이 이 함수를 부릅니다. 46행의 `onClick`에는 [수정]이 눌렸을 때 부를 함수를 적습니다([[#ch7]]). 공지가 있으면 `onEdit(notice)`를 불러 공지를 부모의 105행 `n`에 올립니다.

![값과 함수는 props로 내려가고, 알림은 받은 함수를 불러 올린다](img/ch06-up-down.svg){width=100%}

그림의 내려가는 화살표는 101~108행, 올라가는 화살표는 두 호출입니다. *값은 위에서 아래로 흐르고, 알림은 아래에서 위로 올라갑니다.* 올라가는 길은 따로 없고, 자식은 받은 함수를 부를 뿐입니다.

## 모든 화면이 받는 props {#ch6-screen-props}

화면 컴포넌트의 첫 줄은 서로 닮았습니다. 공지사항 화면은 `const NoticePage = ({ screenKey }: ScreenProps) => {`로 시작합니다(`NoticePage.tsx` 33행). 홈 화면도 기기정보 화면도 @@`ScreenProps`|ScreenProps@@라는 같은 타입을 받습니다. 화면도 누군가의 자식이어서 props를 받습니다.

```ts src="src/types/screen.ts:40-47"
export interface ScreenProps {
  /** 영문 화면키 — PageFrame·usePermission·useOpenScreen 에 쓴다 */
  screenKey: ScreenKey;
  /** 표시용 화면번호 — 항상 ''(설계 Q9 번호 없음). 코드 분기에 쓰지 않는다 */
  screenId: string;
  /** 탭이 현재 활성인지 (keep-alive 중 백그라운드면 false) */
  active: boolean;
}
```

주석에는 낯선 말이 섞여 있으니 칸 이름과 타입만 보세요. 세 칸 모두 필수입니다. `screenKey`는 `'sample.notice'`처럼 화면마다 하나씩 붙인 이름입니다([[#ch10]]). `screenId`는 쓰지 않는 화면번호 자리라 늘 빈 문자열입니다. `active`는 이 화면의 탭이 지금 보이는지를 알려 줍니다. 세 값은 열린 탭마다 화면을 그려 주는 `ScreenHost`가 채워 줍니다(`ScreenHost.tsx` 76행).

필수는 건네는 `ScreenHost`가 지킬 약속이고, 받는 쪽은 필요한 것만 꺼냅니다. 기기정보 화면은 `screenKey`와 `active` 둘을 꺼냅니다. `NoticePage`는 `screenKey`만 꺼내 79행과 83행에서 공통 부품 `PageFrame`과 `ActionBar`에 다시 건넵니다([[#ch13]]). props는 이렇게 부모에서 자식으로, 자식에서 그 자식으로 이어 내려갑니다.

::: warn props는 읽기만 한다
자식은 받은 props를 읽어서 그리기만 하고 고쳐 쓰지 않습니다. 창구 직원이 손님의 전표를 고쳐 적지 않는 것과 같습니다. @@|읽기 전용(props)@@값이 바뀌어야 하면 그 값의 주인인 부모가 바꾸고, 자식은 콜백으로 부탁합니다.
:::

그렇다면 부모는 자기 값을 어떻게 바꿀까요? `NoticePage`가 `viewOpen`을 `true`로, 다시 `false`로 바꾸는 방법이 [[#ch7]]에서 배우는 state(상태)입니다.

::: summary
- props는 부모가 자식에게 건네는 값이다. 태그의 속성이 객체 하나로 묶여 컴포넌트 함수의 인자가 된다.
- 정해진 글자는 따옴표로, 그 밖의 값은 중괄호로 건넨다. 안 건넨 칸은 기본값이나 `undefined`다.
- 받는 props의 목록은 타입에 적혀 있다. 물음표가 있으면 선택, 없으면 필수다.
- 태그 사이에 쓴 내용은 `children`으로 들어온다. `ReactNode`는 화면에 그릴 수 있는 모든 것의 타입이다.
- 함수도 props로 건넨다. 값은 위에서 아래로 내려가고, 알림은 자식이 받은 함수를 불러 위로 올린다.
- props는 읽기 전용이다. 값은 그 주인인 부모가 바꾼다.
:::

::: quiz
1. `<LoadingBlock tip="기기정보를 불러오는 중…" />`이라고 쓰면 높이는 얼마가 될까요? 그렇게 답한 근거는 어느 파일의 몇 행인가요?
2. `<SectionCard title="점검 안내">오늘 22시부터 점검합니다.</SectionCard>`라고 썼습니다. `SectionCard` 안에서 `title`, `children`, `extra`에는 각각 무엇이 들어 있을까요?
3. `NoticeViewModal`은 [닫기]가 눌려도 자기가 받은 `open`을 `false`로 고치지 않습니다. 왜 그렇고, 그 대신 무슨 일을 할까요?
:::
::: answer
1. 160이다. `height`를 건네지 않았으므로 `LoadingBlock.tsx` 3행의 기본값이 쓰인다.
2. `title`은 문자열 "점검 안내", `children`은 태그 사이에 쓴 글이다. `extra`는 건네지 않아 `undefined`이고 오른쪽 위에는 아무것도 그려지지 않는다.
3. props는 읽기 전용이고 `open`의 주인은 부모다. 팝업은 부모가 건넨 `onClose`를 부르고, 부모가 값을 바꿔 다시 건넨다.
:::
