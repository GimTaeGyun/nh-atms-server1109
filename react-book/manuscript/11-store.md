# 전역 상태와 스토어

::: lead
로그인한 사람의 이름, 열려 있는 탭, 환경설정처럼 여러 화면이 함께 보는 값이 있습니다. 이 장에서는 그런 값을 두는 곳인 스토어를 읽고, 로그인한 사용자와 권한이 버튼까지 오는 길을 따라갑니다.
:::

::: goals
- 여러 컴포넌트가 함께 보는 값을 왜 스토어에 두는지 설명할 수 있다
- 스토어 파일에서 값과 액션을 찾고, 꺼내 쓰는 코드를 읽을 수 있다
- 우리 소스의 스토어 일곱 개가 무엇을 담는지 말할 수 있다
- 로그인한 사용자와 권한이 버튼까지 오는 길을 설명할 수 있다
:::

::: files
- `src/stores/useSettingsStore.ts`
- `src/hooks/usePagedSearch.ts`
- `src/stores/useAuthStore.ts`
- `src/hooks/usePermission.ts`
:::

로그인하고 화면 오른쪽 위를 보면 내 이름과 사무소가 있습니다. 홈 화면의 인사말에도 같은 이름이 나옵니다. 공지사항을 열면 조회조건의 사무소 칸에 내 사무소가 미리 들어가 있습니다. 헤더와 홈과 공지사항은 서로 다른 컴포넌트입니다. 세 곳은 어떻게 같은 사람을 알고 있을까요?

## 모두가 함께 보는 값 {#store-why}

[[#ch7]]에서 state는 컴포넌트 하나의 기억이라고 배웠습니다. 그 값을 다른 컴포넌트에 알리는 길은 props였습니다. 부모와 자식 사이라면 이것으로 충분합니다. 헤더와 공지사항 화면처럼 멀리 떨어진 컴포넌트가 같은 값을 봐야 하면 일이 커집니다.

은행 지점의 안내 데스크 옆에는 게시판이 있습니다. 오늘의 환율과 영업시간을 직원도 손님도 지나가다 보고, 고쳐 붙이는 사람은 정해져 있습니다. **@@스토어@@**(store)가 이 게시판입니다. 컴포넌트 바깥에 값을 두고, 필요한 컴포넌트가 직접 꺼내 보게 하는 보관소입니다. 이렇게 앱 어디서나 함께 보는 값을 **@@전역 상태@@**(global state)라고 부릅니다.

아래 그림은 로그인한 사람을 담은 값 `me`를 두는 두 가지 방법입니다. 왼쪽은 `me`를 state에 두고 props로 내립니다. 탭을 관리하는 `ScreenHost`는 `me`를 쓰지도 않으면서 받아서 건네기만 합니다. 오른쪽은 스토어에 둔 모습입니다. `me`가 필요한 컴포넌트만 스토어에서 직접 꺼냅니다.

[[#ch8]]의 Context도 props를 층층이 건네지 않게 해 줍니다. 스토어는 Provider로 감싸지 않아도 되고, 컴포넌트가 꺼내 쓰는 값이 바뀔 때만 그 컴포넌트를 다시 렌더링합니다.

![같은 값을 여러 컴포넌트가 볼 때. 왼쪽은 props로 내리는 길, 오른쪽은 스토어에서 꺼내는 길](img/ch11-props-vs-store.svg){width=86%}

## 스토어 만들기와 꺼내 쓰기 {#store-basics}

우리 소스는 @@zustand@@라는 라이브러리로 스토어를 만들고, 파일은 모두 `src/stores/` 폴더에 둡니다. 가장 읽기 쉬운 것은 환경설정을 담는 @@`useSettingsStore`|useSettingsStore@@입니다. 화면 왼쪽 아래의 [환경설정]을 누르면 열리는 서랍에 조회 결과를 몇 건씩 볼지 같은 설정 네 가지가 있습니다.

```ts src="src/stores/useSettingsStore.ts:23-32" hl="3-7"
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      update: (patch) => set(patch),
      reset: () => set(DEFAULTS),
    }),
    { name: `${STORAGE_PREFIX}:settings`, storage: createJSONStorage(() => localStorage) },
  ),
);
```

23행의 @@`create`|create@@가 스토어를 만듭니다. 돌려받은 것에 `useSettingsStore`라는 이름을 붙였고, 이름이 `use`로 시작하니 훅입니다. 형광펜을 칠한 25~29행이 스토어의 알맹이입니다. 26행은 같은 파일 21행의 기본값 네 개를 전개 연산자로 펼쳐 넣습니다. 그중 하나가 `pageSize: 20`입니다.

27행과 28행은 그 값을 바꾸는 함수입니다. 게시판을 고쳐 붙이는 담당자인 셈이고, **@@액션@@**(action)이라고 부릅니다. 25행에서 zustand가 건네준 @@`set`|set@@에 객체를 넘기면 그 객체에 든 속성만 바뀌고 나머지는 그대로 남습니다. `update({ pageSize: 50 })`을 부르면 `pageSize`만 50이 됩니다.

꺼내 쓰는 쪽은 한 줄입니다. 조회 화면이 쓰는 훅 `usePagedSearch`에 있습니다.

```ts src="src/hooks/usePagedSearch.ts:43"
  const settingPageSize = useSettingsStore((s) => s.pageSize);
```

훅을 부르면서 화살표 함수를 건넸습니다. `s`는 스토어에 든 것 전부이고, 함수는 그중 `pageSize`만 골라 돌려줍니다. 필요한 값만 고르는 이 함수를 **@@셀렉터@@**(selector)라고 부릅니다. 바꾸는 쪽인 환경설정 서랍은 `update({ pageSize: v })`를 부릅니다(`SettingsDrawer.tsx` 22행).

*스토어의 값이 바뀌면 그 값을 꺼내 쓰는 컴포넌트가 다시 렌더링됩니다.* 서랍에서 50건을 고른 뒤 조회 화면을 새로 열어 [조회]를 누르면 50건씩 나옵니다. 서랍과 조회 화면은 서로를 모릅니다. 둘 다 같은 게시판을 볼 뿐입니다.

스토어의 값도 state처럼 새로 고치면 처음 값으로 돌아갑니다. 환경설정이 그러면 곤란하니 24행의 @@`persist`|persist@@로 스토어를 한 겹 감쌌습니다. `persist`는 값이 바뀔 때마다 브라우저의 저장 공간인 @@`localStorage`|localStorage@@에 적어 둡니다. 30행의 `name`이 그때 쓰는 이름표입니다. 창을 닫았다 열어도 남아 있어서, 앱이 다시 뜨면 그 값으로 스토어를 채웁니다.

## 우리 소스의 스토어 {#store-list}

`src/stores/` 폴더에는 이런 스토어가 일곱 개 있습니다.

표: 우리 소스의 스토어 일곱 개

| 스토어 | 담는 것 | 새로 고치면 |
|---|---|---|
| `useAuthStore` | 로그인한 사용자 `me`, 읽기 상태 `status` | 사라진다. 서버에서 다시 읽는다 |
| `useNavStore` | 메뉴와 화면별 권한, 왼쪽 메뉴를 접었는지 | 접었는지만 남는다 |
| `useTabStore` | 열린 탭 목록, 지금 보는 탭 | 남는다. 브라우저 탭을 닫으면 사라진다 |
| `useFavoriteStore` | 즐겨찾기, 최근에 연 화면 | 남는다 |
| `useSettingsStore` | 환경설정 네 가지 | 남는다 |
| `useMessageLineStore` | 공통 모듈 화면의 메시지 줄 | 사라진다 |
| `usePermPreviewStore` | 권한 미리보기 스위치의 값 | 사라진다 |

남길지 말지는 값의 주인이 누구인가로 갈립니다. 설정과 즐겨찾기는 사용자가 고른 값이라 브라우저에 남깁니다. 로그인한 사람과 메뉴는 서버가 주인이라 매번 다시 받습니다. 어제 받은 권한이 오늘도 맞는다는 보장이 없기 때문입니다.

::: note 공지 목록은 왜 표에 없을까요?
공지 목록 같은 서버 자료는 스토어에 두지 않습니다. 서버에서 읽어 온 자료를 기억하는 일은 TanStack Query가 맡습니다. [[#ch12]]에서 배웁니다.
:::

## 나는 누구이고 무엇을 할 수 있나 {#me-permission}

헤더도 홈도 공지사항도 @@`useAuthStore`|useAuthStore@@에 든 `me`를 꺼내 씁니다. 장 첫머리에서 물은 질문의 답입니다. 홈 화면이라면 `HomePage.tsx` 21행에서 꺼냅니다.

`me`를 채우는 것은 `loadMe`라는 액션입니다. [[#ch9]]의 관문 `MeGate`가 앱이 뜰 때 부릅니다. `loadMe`는 서버에 "나는 누구인가"를 묻고 답을 `me`에 넣으며, 그동안의 사정을 `status`에 적습니다. 묻는 동안은 `'loading'`, 답을 받으면 `'ready'`, 실패하면 `'error'`입니다. `MeGate`는 `status`를 꺼내 쓰고 있어서, 값이 바뀔 때마다 다시 렌더링되어 로딩 표시에서 앱 화면으로 넘어갑니다.

화면에서 할 수 있는 일은 조회, 등록, 수정, 삭제, 업무실행 다섯 가지 @@권한@@으로 나뉩니다. 서버는 메뉴를 내려 줄 때 화면마다 이 다섯 가지를 `'Y'`나 `'N'`으로 붙여 주고, `useNavStore`가 메뉴와 함께 받아 둡니다. 화면은 스토어를 직접 뒤지지 않고 @@`usePermission`|usePermission@@ 훅에 묻습니다.

```ts src="src/hooks/usePermission.ts:47-53"
export const usePermission = (screenKey?: ScreenKey | string): Permission => {
  const isAdmin = useAuthStore(selectIsAdmin);
  const menus = useNavStore((s) => s.menus);
  const preview = usePermPreviewStore((s) => s.preview);
  const node = screenKey ? findMenuByScreen(menus, screenKey) : undefined;
  return applyPreview(permissionOf(node, isAdmin), preview);
};
```

48~50행에서 스토어 세 곳의 값을 꺼냅니다. `selectIsAdmin`은 "관리자인가"를 고르는 셀렉터에 붙인 이름입니다. 51행은 메뉴에서 이 화면을 찾고, 52행은 권한을 `canQry`(조회), `canReg`(등록)처럼 `true`나 `false`로 돌려줍니다. 관리자면 모두 `true`, 그 밖에는 메뉴에 적힌 대로입니다.

공지사항 화면(`NoticePage.tsx` 83행)은 버튼줄 `ActionBar`에 화면키를 건넵니다. 권한을 묻고 권한 없는 버튼을 흐리게 그리는 일은 아래 그림처럼 `ActionBar`가 맡습니다([[#ch13]]).

![권한이 버튼까지 오는 길. 서버가 준 값을 스토어가 받아 두고, 훅이 모아서 답한다](img/ch11-permission-path.svg){width=86%}

실제 화면에서는 아래처럼 보입니다. 두 버튼줄의 [등록], [수정], [삭제]를 견줘 보세요.

![](img/shots/part-actionbar-selected.png){width=42%}

![같은 공지사항 화면의 버튼줄. 위는 관리자, 아래는 조회 권한만 있는 사용자](img/shots/part-actionbar-readonly.png){width=42%}

::: warn 흐린 버튼은 안내일 뿐입니다
화면이 버튼을 흐리게 하는 것은 누를 수 없다고 미리 알려 주는 친절입니다. 진짜 검사는 서버가 합니다. 서버는 등록, 수정, 삭제 요청을 받을 때마다 같은 권한을 다시 확인합니다.
:::

::: try 스위치 하나로 다른 화면의 버튼 바꾸기
[공통 모듈] 화면의 [권한·메시지] 탭에서 '권한 미리보기'를 [조회만]으로 바꾸고 공지사항 화면을 열어 보세요. [등록]이 흐려져 있습니다. 처음부터 흐린 계정이라면 [전부]를 골라 켜지는 모습을 보세요. 스위치가 바꾼 것은 `usePermPreviewStore`의 값 하나인데, 그 값을 꺼내 쓰는 `usePermission`을 거쳐 다른 화면의 버튼이 바뀌었습니다. 이 스토어에는 `persist`가 없어 <kbd>F5</kbd>로 새로 고치면 원래대로 돌아옵니다.
:::

::: summary
- 여러 컴포넌트가 함께 보는 값은 컴포넌트 바깥의 스토어에 둔다.
- 스토어는 `create`로 만들고 값과 액션을 함께 담는다. 값은 액션 안에서 `set`으로 바꾼다.
- 셀렉터로 필요한 값만 꺼낸다. 그 값이 바뀌면 꺼내 쓴 컴포넌트가 다시 렌더링된다.
- `persist`로 감싼 스토어는 브라우저에 저장되어 새로 고쳐도 남는다.
- 로그인한 사용자는 `useAuthStore`에, 화면별 권한은 `useNavStore`에 있다. `usePermission`이 모아서 답한다.
- 흐린 버튼은 안내일 뿐이고, 진짜 권한 검사는 서버가 한다.
:::

::: quiz
1. 환경설정 서랍에서 바꾼 페이지 크기를, 부모도 자식도 아닌 조회 화면이 어떻게 알게 될까요?
2. `useAuthStore`에는 `persist`가 없습니다. <kbd>F5</kbd>를 누르면 `me`는 어떻게 되고, 누가 다시 채울까요?
3. 조회 권한만 있는 사용자가 개발자 도구로 흐린 [삭제] 버튼을 억지로 켰습니다. 공지를 지울 수 있을까요?
:::
::: answer
1. 둘 다 `useSettingsStore`의 `pageSize`를 본다. 서랍이 `update`로 값을 바꾸면 `usePagedSearch`가 셀렉터로 꺼낸 값도 바뀐다.
2. 스토어가 처음 값으로 돌아가 `me`는 `null`이 된다. `MeGate`가 `loadMe`를 불러 서버에서 다시 읽는다.
3. 지울 수 없다. 흐린 버튼은 화면의 안내일 뿐이고, 서버가 삭제 요청을 받을 때 권한을 다시 검사한다.
:::
