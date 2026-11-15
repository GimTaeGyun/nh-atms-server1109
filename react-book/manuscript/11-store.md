# 전역 상태와 스토어

::: lead
로그인한 사람의 이름, 열려 있는 탭, 환경설정처럼 여러 화면이 함께 보는 값이 있습니다. 이 장에서는 그런 값을 두는 곳인 스토어를 읽고, 로그인한 사람과 권한이 버튼까지 오는 길을 따라갑니다.
:::

::: goals
- 여러 컴포넌트가 함께 보는 값을 왜 스토어에 두는지 설명할 수 있다
- 스토어 파일에서 값과 액션을 찾고, 꺼내 쓰는 코드를 읽을 수 있다
- 우리 소스의 스토어 7개가 무엇을 담는지 말할 수 있다
- 로그인한 사람과 권한이 버튼까지 오는 길을 설명할 수 있다
:::

::: files
- `src/stores/useSettingsStore.ts`
- `src/hooks/usePagedSearch.ts`
- `src/stores/useAuthStore.ts`
- `src/hooks/usePermission.ts`
:::

로그인하고 화면 오른쪽 위를 보면 내 이름과 사무소가 있습니다. 홈 화면의 인사말에도 같은 이름이 나옵니다. 공지사항을 열면 조회조건의 사무소 칸에 내 사무소가 미리 들어가 있습니다. 헤더와 홈과 공지사항은 서로 다른 컴포넌트입니다. 3곳은 어떻게 같은 사람을 알고 있을까요?

## 모두가 함께 보는 값 {#store-why}

[[#ch7]]에서 state는 컴포넌트 하나의 기억이라고 배웠습니다. 그 값을 다른 컴포넌트에 알리는 길은 props였습니다. 부모와 자식 사이라면 이것으로 충분합니다. 헤더와 공지사항 화면처럼 멀리 떨어진 컴포넌트가 같은 값을 봐야 하면 일이 커집니다.

은행 지점의 안내 데스크 옆에는 게시판이 있습니다. 오늘의 환율과 영업시간을 직원도 손님도 지나가다 보고, 고쳐 붙이는 사람은 정해져 있습니다. **@@스토어@@**(store)가 이 게시판입니다. 컴포넌트 바깥에 값을 두고, 필요한 컴포넌트가 직접 꺼내 보게 하는 곳입니다. 이렇게 앱 어디서나 함께 보는 값을 **@@전역 상태@@**(global state)라고 부릅니다.

스토어는 [[#ch8]]의 Context처럼 층을 건너 값을 건네지만, Provider로 감쌀 필요가 없습니다. 값과 함께 그 값을 바꾸는 함수도 한곳에 담아 둡니다.

그림 11-1은 로그인한 사람을 담은 `me`를 두는 두 가지 방법을 견줍니다. 왼쪽처럼 `AppShell`의 state에 두고 props로 내리면, 탭을 관리하는 `ScreenHost`는 화면을 열 때마다 `me`를 다시 건네야 합니다. 화면이 늘면 건넬 곳도 늘어납니다. 오른쪽처럼 스토어에 두면 쓰는 쪽이 직접 꺼냅니다.

![같은 값을 여러 컴포넌트가 볼 때. 왼쪽은 props로 내리는 길, 오른쪽은 스토어에서 꺼내는 길](img/ch11-props-vs-store.svg){width=82%}

## 스토어 만들기와 꺼내 쓰기 {#store-basics}

우리 소스는 @@**zustand**|zustand@@(주스탠드)라는 라이브러리로 스토어를 만들고, 파일은 모두 `src/stores/` 폴더에 둡니다. 가장 읽기 쉬운 것은 환경설정 네 가지를 담는 @@`useSettingsStore`|useSettingsStore@@입니다. 메뉴 패널 맨 아래의 [환경설정]을 누르면 오른쪽에서 환경설정 창이 열립니다. 패널이 접혀 아이콘 줄만 보이면 맨 아래 동그라미에 마우스를 올려야 [환경설정]이 나옵니다.

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

23행의 @@`create`|create@@가 스토어를 만듭니다. 꺾쇠 안의 `SettingsState`는 스토어에 담길 것을 적은 타입이고, 괄호가 두 번 오는 것은 타입을 적을 때의 zustand 약속입니다.

형광펜을 칠한 25~29행이 알맹이입니다. 26행은 기본값 4개(`DEFAULTS`)를 전개 연산자로 펼쳐 넣습니다. `showTopNav: true`(상단 메뉴 표시), `pageSize: 20`(20건씩 보기) 등입니다. 27행과 28행처럼 값을 바꾸는 함수, 곧 게시판을 고쳐 붙이는 담당자를 **@@액션@@**(action)이라 부릅니다. 25행의 @@`set`|set@@은 zustand가 건네준 함수로, `update({ pageSize: 50 })`처럼 객체를 넘기면 그 객체에 든 속성만 바꿉니다.

스토어의 값도 state처럼 브라우저를 새로 고치면(<kbd>F5</kbd>) 처음 값으로 돌아갑니다. 환경설정이 그러면 곤란하니 24행의 @@`persist`|persist@@로 스토어를 한 겹 감쌌습니다. `persist`는 값이 바뀔 때마다 브라우저의 저장 공간인 @@`localStorage`|localStorage@@에 적어 둡니다. 30행의 `name`은 그때 붙이는 이름이고, `storage`는 적어 둘 곳입니다. 적어 둔 값은 창을 닫아도 남아서, 앱이 다시 뜨면 그 값으로 스토어를 채웁니다.

꺼내 쓰는 쪽은 한 줄입니다. 조회 화면이 쓰는 훅 `usePagedSearch`에 있습니다.

```ts src="src/hooks/usePagedSearch.ts:43"
  const settingPageSize = useSettingsStore((s) => s.pageSize);
```

괄호 안 화살표 함수의 `s`는 스토어에 든 것 전부이고, 함수는 그중 `pageSize`만 돌려줍니다. 필요한 값만 고르는 이 함수를 **@@셀렉터@@**(selector)라고 합니다. 값을 고치는 환경설정 창(`SettingsDrawer.tsx`)은 스토어의 `update` 액션을 부릅니다.

*스토어의 값이 바뀌면 그 값을 꺼내 쓰는 컴포넌트가 다시 렌더링됩니다.* 환경설정 창에서 '상단 1뎁스 메뉴 표시'를 끄면 `showTopNav`를 꺼내 쓰는 헤더(`AppHeader.tsx`)에서 상단 메뉴가 곧바로 사라집니다. 창과 헤더는 서로를 모른 채 같은 게시판을 한쪽은 고치고 한쪽은 볼 뿐입니다. 직접 꺼 보고, 확인했으면 다시 켜 두세요. 조회 건수(`pageSize`)는 바꿔도 이미 조회한 화면은 쓰던 건수를 잇고, 아직 조회하지 않은 화면부터 따릅니다([[#ch12]]).

## 우리 소스의 스토어 {#store-list}

`src/stores/` 폴더에는 이런 스토어가 7개 있습니다.

표: 우리 소스의 스토어 7개

| 스토어 | 담는 것 | 새로 고치면 |
|---|---|---|
| `useAuthStore` | 로그인한 사람 `me`, 읽기 상태 `status` | 사라진다. 서버에서 다시 읽는다 |
| `useNavStore` | 메뉴와 화면별 권한, 메뉴 패널을 접었는지 | 접었는지만 남는다 |
| `useTabStore` | 열린 탭 목록, 지금 보는 탭 | 남는다. 브라우저 탭을 닫으면 사라진다 |
| `useFavoriteStore` | 즐겨찾기, 최근에 연 화면 | 남는다 |
| `useSettingsStore` | 환경설정 네 가지 | 남는다 |
| `useMessageLineStore` | [공통 모듈] 화면의 메시지 줄 | 사라진다 |
| `usePermPreviewStore` | 권한 미리보기 스위치의 값 | 사라진다 |

남길지 말지는 값의 주인과 쓰임새로 갈립니다. 설정과 즐겨찾기는 사용자가 고른 값이라 남기고, 미리보기 스위치처럼 잠깐 쓰는 값은 버립니다. 로그인한 사람과 메뉴는 서버가 주인이라 새로 고칠 때마다 다시 받습니다. 어제 받은 권한이 오늘도 맞는다는 보장이 없기 때문입니다.

::: note 공지 목록은 왜 표에 없을까요?
공지 목록 같은 서버 자료는 스토어에 두지 않습니다. 그런 자료를 기억하는 일은 [[#ch12]]의 TanStack Query가 맡습니다.
:::

## 나는 누구이고 무엇을 할 수 있나 {#me-permission}

헤더도 홈도 공지사항도 @@`useAuthStore`|useAuthStore@@에 든 `me`를 꺼내 씁니다. 첫머리 질문의 답입니다. `me`의 처음 값은 `null`이고, `loadMe` 액션이 채웁니다. 서버에 "나는 누구인가"를 물어 답은 `me`에, 상태는 `status`에 적습니다. 앱이 뜰 때 이 액션을 부르는 [[#ch9]]의 `MeGate`는 `status`를 셀렉터로 꺼내 쓰므로 `status`가 바뀔 때마다 다시 렌더링됩니다.

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

48~50행에서 스토어 3곳의 값을 꺼냅니다. `selectIsAdmin`은 "관리자인가"를 고르는 셀렉터이고, `preview`는 다른 권한을 흉내 내는 미리보기 값입니다. 51행은 메뉴에서 이 화면을 찾습니다. 52행 안쪽 `permissionOf`는 관리자면 모두 `true`, 아니면 메뉴에 적힌 대로 `canQry`(조회), `canReg`(등록) 같은 답을 정합니다. 바깥쪽 `applyPreview`는 미리보기가 켜지면 관리자라도 답을 덮어씁니다.

![권한이 버튼까지 오는 길. 스토어 3곳에 든 값을 훅이 모아서 답한다](img/ch11-permission-path.svg){width=82%}

공지사항 화면은 그림 11-2 맨 오른쪽의 `ActionBar`에 권한 대신 화면키를 건넵니다. 권한을 묻고 버튼을 흐리게 그리는 일은 `ActionBar`가 맡습니다([[#ch13]]). 그림 11-3은 공지 한 건을 체크했을 때의 버튼줄을 관리자(위)와 조회 전용 사용자(아래)로 견준 것입니다. 아래 줄의 [등록]·[수정]·[삭제]는 권한이 없어 흐립니다. 위 줄의 [수정]과 [삭제]는 권한이 있어도 공지를 체크해야 켜집니다.

![공지 한 건을 체크했을 때의 버튼줄. 위는 관리자, 아래는 조회 전용 사용자](img/shots/ch11-actionbar-compare.png){width=60%}

::: warn 흐린 버튼은 안내일 뿐입니다
누를 수 없다고 미리 알려 줍니다. 진짜 검사는 서버가 등록·수정·삭제 요청마다 다시 합니다.
:::

::: try 스위치 하나로 다른 화면의 버튼 바꾸기
[공통 모듈] 화면의 [권한·메시지] 탭에서 '권한 미리보기'를 [조회만]으로 바꾸고 공지사항을 열어 보세요. [등록]이 흐려져 있습니다(원래 흐렸다면 [전부]로 켜 보세요). 스위치는 `usePermPreviewStore`의 값 하나만 바꿨는데, `usePermission`을 거쳐 다른 화면의 버튼이 바뀌었습니다. `persist`가 없어 <kbd>F5</kbd>를 누르면 풀립니다. 계정을 바꿔 로그인했을 때도 <kbd>F5</kbd>를 눌러야 새 메뉴와 권한을 받습니다.
:::

::: summary
- 여러 컴포넌트가 함께 보는 값은 컴포넌트 바깥의 스토어에 둔다.
- 스토어는 `create`로 만들고 값과 액션을 함께 담는다. 값은 액션 안에서 `set`으로 바꾼다.
- 셀렉터로 필요한 값만 꺼낸다. 그 값이 바뀌면 꺼내 쓴 컴포넌트가 다시 렌더링된다.
- `persist`로 감싼 스토어는 브라우저에 저장되어 새로 고쳐도 남는다.
- 로그인한 사람은 `useAuthStore`에, 화면별 권한은 `useNavStore`에 있다. `usePermission`이 모아서 답한다.
- 흐린 버튼은 안내일 뿐이고, 진짜 권한 검사는 서버가 한다.
:::

::: quiz
1. 환경설정 창과 헤더는 부모도 자식도 아닙니다. 창에서 고친 값을 헤더는 어떻게 바로 알까요?
2. `useAuthStore`에는 `persist`가 없습니다. <kbd>F5</kbd>를 누르면 `me`는 어떻게 되고, 누가 다시 채울까요?
3. `useNavStore((s) => s.menus)`에서 `s`는 무엇이고, 괄호 안의 화살표 함수를 무엇이라고 부를까요?
:::
::: answer
1. 둘 다 `useSettingsStore`를 본다. 창이 `showTopNav`를 바꾸면 그 값을 꺼낸 헤더가 다시 렌더링된다.
2. `me`는 처음 값 `null`로 돌아가고, `MeGate`가 `loadMe`를 불러 서버에서 다시 채운다.
3. `s`는 스토어에 든 것 전부이고, 그중 `menus`만 골라 돌려주는 이 함수가 셀렉터다.
:::
