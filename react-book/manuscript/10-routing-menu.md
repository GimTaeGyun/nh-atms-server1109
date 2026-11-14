# 화면 이동과 메뉴

::: lead
주소창의 주소 한 줄이 어떻게 화면 하나가 되는지 따라갑니다. 읽고 나면 새 화면을 어디에 등록하는지, 탭을 옮겨도 왜 내용이 그대로인지, 왼쪽 메뉴는 어디서 오는지 말할 수 있습니다.
:::

::: goals
- 라우터가 주소를 보고 그릴 것을 고르는 원리를 설명할 수 있다
- 화면 등록부에서 화면키와 주소와 파일의 짝을 읽을 수 있다
- 탭을 옮겨도 화면이 그대로인 까닭을 말할 수 있다
- 새 화면이 메뉴에 보이려면 무엇이 필요한지 안다
:::

::: files
- `src/app/router.tsx`
- `src/screens/screenIds.ts`
- `src/screens/registry.ts`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/ScreenHost.tsx`
- `src/screens/menuSeed.ts`
:::

은행 입구에는 '예금 1~3번, 대출 5번'이라고 적힌 창구 안내판이 걸려 있습니다. 손님은 안내판에서 번호를 찾아 그 창구로 갑니다. 우리 앱에서는 주소가 그 번호입니다. 주소창 끝이 `/sample/notice`이면 공지사항이, `/sample/mcn-info`이면 기기정보가 뜹니다. 그렇다면 주소를 읽는 것은 누구이고, 안내판은 어느 파일일까요? [[#ch9]]에서 `AppShell`까지 따라온 길을 이 장에서 화면 하나까지 이어 갑니다.

## 주소와 화면을 잇는 라우터 {#ch10-router}

우리 앱이 서버에서 받는 HTML은 `index.html` 하나뿐입니다. 공지사항으로 가도 기기정보로 가도 새 문서를 받지 않습니다. 자바스크립트가 주소창의 주소를 읽고, 그 주소에 맞는 컴포넌트로 화면을 갈아 끼웁니다. 문서는 하나여도 화면마다 주소가 있으니 뒤로 가기가 되고, 주소를 복사해 동료에게 보내면 같은 화면이 열립니다.

주소와 화면 사이에서 이 일을 맡은 부품이 **@@라우터@@**(router)입니다. 라우터는 두 가지를 합니다. 주소가 바뀌면 그 주소에 맞는 것을 그리고, 화면이 부탁하면 주소를 바꿔 줍니다. 우리 소스는 @@react-router@@라는 라이브러리의 라우터를 씁니다.

라우터에게는 '이 주소면 이것을 그려라'라는 짝을 미리 알려 줘야 합니다. 그 짝 하나를 **@@라우트@@**(route)라고 합니다. 우리 앱의 라우트는 `src/app/router.tsx`에 있습니다. `<Routes>` 안에 `<Route>`를 하나씩 적는데, `path`가 주소이고 `element`가 그 주소에서 그릴 것입니다.

```tsx src="src/app/router.tsx:15-25" marks="2=①;4=②"
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <MeGate>
            <AppShell />
          </MeGate>
        }
      />
    </Routes>
```

①은 주소가 `/login`이면 로그인 화면을 그리라는 라우트입니다. ②는 속성을 여러 줄에 나눠 적었을 뿐 같은 모양입니다. `/*`의 별표는 '무엇이 오든'이라는 뜻이어서, `/login`이 아닌 주소는 모두 이 라우트로 옵니다. 그려지는 것은 [[#ch9]]에서 본 관문 `MeGate`와 그 안의 앱 틀 `AppShell`입니다.

라우트는 이 둘이 전부입니다. `/sample/notice`도 `/sample/mcn-info`도 이 파일에는 없습니다. *새 화면을 만들어도 `router.tsx`는 고치지 않습니다.* 화면마다의 주소는 다음 절에서 볼 등록부가 맡습니다.

::: note 운영 서버에서는 주소에 #이 낍니다
개발 서버의 주소 `/sample/notice`는 운영용으로 빌드하면 `/#/sample/notice`가 됩니다. `.env.production`의 `VITE_ROUTER=hash` 한 줄이 @@해시 주소@@ 방식을 켜기 때문입니다. 브라우저는 `#` 뒤쪽을 서버에 보내지 않으므로, 어느 화면에서 새로 고쳐도 서버는 `index.html`을 내줍니다.
:::

## 화면 등록부, registry {#ch10-registry}

화면에는 주소 말고도 딸린 정보가 있습니다. 탭에 적을 제목, 속한 대분류, 화면이 든 파일. 이것을 여러 파일에 흩어 적으면 하나만 고치고 나머지를 잊기 쉽습니다. 그래서 창구 안내판처럼 표 하나에 모아 적습니다. 이 표가 **@@화면 등록부@@**(registry), `src/screens/registry.ts`입니다.

```ts src="src/screens/registry.ts:54-56" hl="1"
    def('sample.notice', '공지사항', 'sample', '', () => import('./sample/NoticePage')),
    def('sample.mcnInfo', '기기정보', 'sample', '', () => import('./sample/McnInfoPage')),
    def('sample.mcnModel', '기기모델코드', 'sample', '', () => import('./sample/McnModelPage')),
```

`def(…)` 한 줄이 화면 하나입니다. 인자는 순서대로 화면키, 제목, 대분류, 그룹(메뉴 안의 폴더 이름, 없으면 `''`), 화면 파일을 불러오는 함수입니다. 형광펜을 칠한 54행은 이렇게 읽습니다. "화면키는 `sample.notice`, 제목은 공지사항, 대분류는 견본, 파일은 `sample/NoticePage`."

첫 인자 @@**화면키**|화면키@@는 화면마다 하나씩 붙인 영문 이름으로, `대분류.이름` 모양입니다. `sample`은 상단 메뉴의 [견본]을 가리킵니다. 쓸 수 있는 화면키는 `src/screens/screenIds.ts`에 먼저 적어 둡니다. `'sample.notice': '',`처럼 한 줄에 하나씩인데, 오른쪽은 화면번호 자리이고 이 프로젝트는 번호를 쓰지 않아 모두 빈 문자열입니다. 거기 없는 화면키를 `def`에 쓰면 편집기에 빨간 줄이 뜹니다.

주소는 어디에도 적혀 있지 않습니다. 화면키에서 만들어 내기 때문인데, 점은 빗금으로, 이름 속 대문자는 하이픈과 소문자로 바꿉니다. `sample.mcnInfo`라면 점이 빗금이 되고 `I`가 `-i`가 되어 `/sample/mcn-info`입니다. 같은 파일의 `menuPathOf` 함수(19~23행)가 하는 일입니다. 주소를 손으로 적는 곳이 없으니 오타로 어긋날 일도 없습니다.

표: 등록부에 든 화면 6개(`registry.ts` 47~58행)

| 화면키 | 주소 | 제목 · 파일(`src/screens/` 아래) |
|---|---|---|
| `home` | `/home` | 홈 · `home/HomePage.tsx` |
| `mgmt.faultStatus` | `/mgmt/fault-status` | 장애현황 · `mgmt/FaultStatusPage.tsx` |
| `sample.commonModules` | `/sample/common-modules` | 공통 모듈 · `sample/CommonModulesPage.tsx` |
| `sample.notice` | `/sample/notice` | 공지사항 · `sample/NoticePage.tsx` |
| `sample.mcnInfo` | `/sample/mcn-info` | 기기정보 · `sample/McnInfoPage.tsx` |
| `sample.mcnModel` | `/sample/mcn-model` | 기기모델코드 · `sample/McnModelPage.tsx` |

다섯째 인자 `() => import('./sample/NoticePage')`도 봅시다. 3장에서 배운 파일 맨 위의 `import`는 앱이 뜰 때 미리 가져옵니다. 함수처럼 부르는 `import()`는 불릴 때에야 파일을 받아 옵니다. `def`는 이 함수를 리액트의 @@**lazy**|lazy@@에 넘겨(42행) '처음 그려질 때 파일을 받아 오는 컴포넌트'를 만듭니다.

덕분에 화면이 수백 개로 늘어도 브라우저는 연 화면의 파일만 받습니다. 개발자 도구(<kbd>F12</kbd>)의 Network 탭을 켜 두고 공지사항을 처음 열면, 그 순간 `NoticePage.tsx`를 받아 오는 줄이 생깁니다.

파일을 받는 동안 그 자리에 보여 줄 것은 @@**Suspense**|Suspense@@가 맡습니다. `<Suspense fallback={…}>`로 감싸 두면 안쪽이 준비될 때까지 `fallback`을 대신 그립니다. 화면을 처음 열 때 잠깐 스치는 "공지사항 화면을 불러오는 중…"이 그것입니다.

::: warn 화면 파일은 export default로 끝냅니다
`lazy`는 받아 온 파일에서 `export default`로 내보낸 컴포넌트를 찾습니다. 그래서 화면 파일의 마지막 줄은 `export default NoticePage;` 같은 모양입니다.
:::

## 화면 틀과 탭 {#ch10-shell}

`/*` 라우트가 그리는 @@`AppShell`|AppShell@@은 로그인한 뒤 늘 보이는 앱의 틀입니다. 아래 그림의 번호대로 부품 넷이 놓입니다. ①은 헤더 `AppHeader`, ②는 메뉴 패널 `SidePanel`, ③은 열린 탭 줄 `OpenTabBar`, ④는 본문 자리 `ScreenHost`입니다.

![앱의 틀. ① 헤더 ② 메뉴 패널 ③ 열린 탭 줄 ④ 본문](img/shots/ch10-shell.png){width=100%}

`AppShell.tsx`의 `return` 안(63~79행)에도 네 부품이 이 순서로 적혀 있습니다. 창이 좁거나 패널을 접으면 ② 자리에는 아이콘 줄 `IconRail`이 대신 나옵니다. 어느 화면을 열든 ①②③은 그대로이고, 화면이 그려지는 곳은 ④입니다. 거기 놓인 @@**ScreenHost**|ScreenHost@@가 주소를 읽어 화면을 고릅니다.

![주소가 화면이 되기까지. 어느 길로 열든 주소가 바뀌고, 바뀐 주소를 `ScreenHost`가 읽는다](img/ch10-flow.svg){width=92%}

위 그림의 오른쪽 상자가 `ScreenHost`가 하는 일입니다. 주소가 바뀔 때마다 주소를 화면키로 바꾸고, 등록부에서 그 화면키의 컴포넌트를 찾고, 탭을 열어 화면을 그립니다. 이 일은 8장에서 배운 `useEffect`에 들어 있고, 의존성 배열에 주소가 있어 주소가 바뀔 때마다 다시 돕니다. 메뉴를 누르든 탭을 누르든 주소창에 직접 치든 주소가 바뀌고, 그 뒤는 `ScreenHost`가 이어받습니다.

열린 @@탭@@의 목록은 `useTabStore`라는 스토어가 기억합니다. 스토어는 여러 부품이 함께 보는 값을 두는 곳으로, [[#ch11]]에서 배웁니다. 같은 화면은 탭이 하나만 열리고, 탭은 홈까지 합쳐 12개가 한도입니다. `ScreenHost`는 이 목록을 `map`으로 돌며 탭마다 화면 하나를 그립니다.

```tsx src="src/components/layout/ScreenHost.tsx:67-76"
      {tabs.map((tab) => {
        const def = getScreen(tab.screenKey);
        const Comp = def?.component ?? PlaceholderScreen;
        const active = tab.key === activeKey;
        return (
          <Activity key={tab.key} mode={active ? 'visible' : 'hidden'}>
            // …
                  <Comp screenKey={tab.screenKey} screenId={screenIdOf(tab.screenKey)} active={active} />
```

68~69행이 등록부에서 화면을 찾아 `Comp`에 담습니다. 컴포넌트를 변수에 담아도 이름이 대문자로 시작하면 76행처럼 태그로 씁니다. 등록부에 없는 화면키면 "아직 구현되지 않았습니다"라고 알리는 `PlaceholderScreen`이 대신 들어갑니다. 건너뛴 75행에는 앞 절에서 본 `Suspense`가 있습니다.

72행의 @@**Activity**|Activity@@가 탭의 비밀입니다. 리액트 19.2에 들어온 컴포넌트로, `mode`가 `hidden`이면 안쪽을 숨깁니다. 숨긴 화면은 보이지 않을 뿐 지워지지 않고 state도 그대로입니다. *탭을 옮겼다 돌아와도 조회조건과 결과가 남아 있는 까닭입니다.* 6장에서 본 `ScreenProps`의 `active`는 76행에서 채워지고, 화면은 이 값으로 자기가 지금 보이는 중인지 압니다.

화면 안에서 다른 화면을 열 때는 주소를 직접 만지지 않습니다. 커스텀 훅 @@`useOpenScreen`|useOpenScreen@@이 '화면키를 주면 그 화면을 여는 함수'를 돌려줍니다. 홈 화면의 카드가 `onClick={() => openScreen(c.key)}`로 부르는 것이 이 함수입니다(`HomePage.tsx` 22·31행). 왼쪽 메뉴와 즐겨찾기도 이 함수를 씁니다.

::: try 주소와 탭 실험
1. 주소창 끝을 `/sample/mcn-model`로 바꾸고 <kbd>Enter</kbd>를 누릅니다. 기기모델코드 탭이 열립니다.
2. 이번에는 등록부에 없는 주소 `/sample/abc`를 칩니다. 홈으로 돌아옵니다.
3. 공지사항에서 [조회]를 누르고 홈 탭에 다녀옵니다. 목록이 그대로 있습니다.
:::

## 메뉴는 어디서 올까 {#ch10-menu}

등록부에 화면을 넣으면 주소로는 열립니다. 그런데 왼쪽 메뉴에는 나타나지 않습니다. 누구에게 어떤 화면을 보여 줄지는 사람마다 다르고, 그것을 아는 쪽은 서버이기 때문입니다. 그래서 @@메뉴@@는 서버에서 받아 온 자료로 그립니다.

앱 틀이 뜨면 `src/api/endpoints/menu.ts`의 `menuApi.my()`가 서버에 내 메뉴를 요청합니다. 요청 주소는 `/api/menu/my`이고, 요청하는 법은 [[#ch12]]에서 배웁니다. 응답에는 화면 한 칸마다 이름과 주소와 권한이 들어 있습니다. 앱은 이 주소를 화면키로 바꿔 등록부의 화면과 잇습니다. 화면키만 정해 두고 아직 등록하지 않은 화면이 메뉴에 있으면, 누를 때 앞에서 본 `PlaceholderScreen`이 뜹니다.

소스에는 메뉴가 하나 더 있습니다. `src/screens/menuSeed.ts`의 @@**내장 메뉴**|내장 메뉴@@로, 서버 메뉴가 아직 비어 있는 개발 초기에 대신 쓰려고 넣어 둔 것입니다. 개발 서버에서 서버 메뉴에 화면이 하나도 없으면 이 메뉴가 쓰이고, 권한은 조회만 들어 있습니다. 그때는 환경설정 창 맨 아래에 '메뉴 내장 시드'라는 글자가 붙습니다. 운영 빌드는 언제나 서버 메뉴만 씁니다.

새 화면이 메뉴에 보이기까지 할 일을 모으면 이렇습니다.

- **화면 담당(여러분)**: 화면 파일을 만들고, 화면키 한 줄과 `def(…)` 한 줄을 적어 리드에게 넘깁니다. `screenIds.ts`와 `registry.ts`는 모두가 함께 쓰는 파일이라, 프로젝트 개발 가이드에 따라 공통 파일을 맡은 리드가 고칩니다.
- **리드·백엔드 담당에게 부탁할 일**: 서버의 메뉴 표에 그 화면의 주소와 권한을 넣는 일입니다. 이것이 들어가야 메뉴에 보입니다.

::: summary
- 라우터는 주소를 보고 그릴 것을 고른다. 우리 앱의 라우트는 `/login`과 `/*` 둘뿐이다.
- 화면은 등록부 `registry.ts`에 `def(화면키, 제목, 대분류, 그룹, 불러오기)` 한 줄로 등록한다.
- 주소는 화면키에서 만들어진다. `sample.mcnInfo`는 `/sample/mcn-info`가 된다.
- `lazy`는 화면 파일을 처음 열 때 받아 오고, 그동안 `Suspense`가 로딩 표시를 그린다.
- `ScreenHost`가 주소를 화면키로 바꿔 탭을 연다. 지금 탭이 아닌 화면은 지우지 않고 숨긴다.
- 메뉴는 서버가 준다. 등록부에 넣는 것만으로는 메뉴에 나타나지 않는다.
:::

::: quiz
1. 화면키 `sample.cornerInfo`를 등록부에 넣으면 이 화면의 주소는 무엇이 될까요?
2. 공지사항에서 [조회]를 누른 뒤 다른 탭에 다녀와도 목록이 남아 있습니다. 왜 그럴까요?
3. 동료가 "등록부에 `def` 한 줄을 넣었는데 메뉴에 화면이 안 보여요"라고 합니다. 무엇을 알려 주겠습니까?
:::
::: answer
1. `/sample/corner-info`. 점은 빗금으로, 대문자 `I`는 `-i`로 바뀝니다. 2. `ScreenHost`가 열린 탭의 화면을 지우지 않고 `<Activity>`로 숨겨 두어 state가 남기 때문입니다. 3. 메뉴는 등록부가 아니라 서버가 준 메뉴로 그립니다. 등록은 주소창에 주소를 쳐서 확인하고, 메뉴에는 서버의 메뉴 표에 주소와 권한이 들어가야 보입니다.
:::
