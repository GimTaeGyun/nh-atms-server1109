# 프로젝트 지도

::: lead
`src` 폴더 11개와 설정 파일이 저마다 무슨 일을 맡는지 지도를 그립니다. 이어서 주소를 치고 첫 화면이 뜰 때까지 어떤 파일이 차례로 일하는지 따라갑니다. 읽고 나면 낯선 파일을 열어도 건물의 어디쯤에 서 있는지 압니다.
:::

::: goals
- 폴더 이름을 보고 무엇을 두는 곳인지 말할 수 있다
- `npm run` 명령이 어디에 적혀 있고 무슨 일을 하는지 설명할 수 있다
- 주소창에서 첫 화면까지 일하는 파일을 차례로 짚을 수 있다
- `MeGate`가 무엇을 확인하고 어디로 보내는지 읽을 수 있다
:::

::: files
- `package.json`
- `vite.config.ts`
- `src/app/providers.tsx`
- `src/app/router.tsx`
- `src/app/MeGate.tsx`
:::

처음 가 본 큰 은행 지점에서는 입구의 층별 안내도부터 찾습니다. 대출 창구는 2층, 금고는 지하. 한 번 보고 나면 어느 문 앞에서도 망설이지 않습니다. 우리 소스도 그런 건물이어서, `src` 안에만 폴더가 11개, 파일이 180개 넘게 있습니다. 이 장에서는 한 걸음 물러나 건물 전체의 안내도를 그립니다.

## 폴더 한눈에 보기 {#project-folders}

소스는 모두 `src` 폴더에 있고, 그 안은 맡은 일에 따라 폴더 11개로 나뉩니다. 아래 그림이 그 지도입니다. 왼쪽이 프로젝트 맨 위 폴더, 오른쪽 점선 안이 `src` 폴더입니다.

![프로젝트 폴더 지도. 새 화면을 만들 때 파일을 만드는 곳은 노란 묶음의 세 폴더다](img/ch09-folder-map.svg){width=100%}

은행 지점에 빗대면 `screens`는 손님을 맞는 창구입니다. 화면 하나가 창구 하나입니다. `domain`은 창구에서 쓰는 서류 양식, `api`는 본점으로 거는 전화, `components`는 창구마다 가져다 쓰는 공용 비품입니다. 코드로는 차례로 화면 컴포넌트, 화면이 다루는 자료의 타입, 서버를 부르는 함수, 여러 화면이 함께 쓰는 컴포넌트를 둡니다. 폴더 11개를 표에 모았습니다.

표: `src` 아래 @@폴더 구조|폴더 구조@@

| 폴더 | 무엇을 두는 곳 | 대표 파일 |
|---|---|---|
| `app` | 앱을 켜는 파일 | `App.tsx`, `MeGate.tsx` |
| `screens` | 화면. `home`·`sample`·`popup` 같은 하위 폴더로 나눈다 | `sample/NoticePage.tsx` |
| `domain` | 화면이 다루는 자료의 타입 | `notice.ts` |
| `api` | 서버를 부르는 함수. 화면별 함수는 `endpoints`에 | `endpoints/notice.ts` |
| `components` | 여러 화면이 함께 쓰는 공통 부품 | `grid/DataGrid.tsx` |
| `hooks` | 여러 화면이 함께 쓰는 커스텀 훅 | `usePagedSearch.ts` |
| `stores` | 여러 화면이 함께 보는 값 | `useAuthStore.ts` |
| `utils` | 날짜·금액 표기를 다듬는 도구 함수 | `format.ts` |
| `config` | 상수, 문구, 환경 값 | `constants.ts` |
| `types` | 여러 곳에서 쓰는 공통 타입 | `api.ts` |
| `theme` | 색, 글꼴, 공통 CSS | `global.css` |

표의 11줄을 외우는 대신 그림의 세 묶음을 기억하세요. *새 화면을 만들 때 파일을 새로 만드는 곳은 `screens`, `domain`, `api/endpoints` 세 곳뿐입니다.* [[#ch14]]의 공지사항 화면도 파일 6개가 모두 이 세 곳에 있습니다. 파란 묶음은 만들어 둔 것을 가져다 쓰는 곳이라 읽을 일은 많아도 고칠 일은 드뭅니다. 파일은 VS Code에서 <kbd>Ctrl</kbd>+<kbd>P</kbd>를 누르고 `NoticePage`처럼 이름 몇 글자를 쳐서 찾으세요.

## 설정 파일이 정하는 것 {#config-files}

프로젝트 맨 위 폴더에는 화면을 그리지 않는 @@**설정 파일**|설정 파일@@이 여럿 있습니다. 프로젝트를 켜고, 검사하고, 내보내는 방법을 정하는 파일입니다. 내용을 알면 터미널 명령이 주문처럼 보이지 않습니다.

@@`package.json`|package.json@@에는 두 가지가 있습니다. 첫째는 [[#ch1]]의 `npm ci`가 설치한 라이브러리 목록입니다(20~56행). 사내망에서는 패키지를 내려받지 못해 이 목록은 혼자 바꾸지 않습니다. 둘째는 `scripts`에 적힌 명령입니다(10~19행). `npm run dev`를 치면 npm이 `vite --host`를 대신 실행합니다.

표: `package.json`에 적힌 @@`npm run` 명령|npm run 명령@@(화면 자동 점검용 `e2e` 두 개는 뺐다)

| 명령 | 실제로 실행하는 것 | 하는 일 |
|---|---|---|
| `npm run dev` | `vite --host` | 개발 서버를 켠다 |
| `npm run typecheck` | `tsc -b` | 타입 검사를 한다 |
| `npm run lint` | `eslint .` | 코드 규칙 검사를 한다 |
| `npm run check` | `npm run typecheck && npm run lint` | 두 검사를 이어서 한다 |
| `npm run build` | `tsc -b && vite build` | 서버에 올릴 파일을 `dist` 폴더에 만든다 |
| `npm run preview` | `vite preview --host --port 4173` | 만든 `dist`를 미리 띄워 본다 |

표의 `&&`는 앞 명령이 성공해야 뒤 명령을 실행한다는 뜻입니다. `build`가 타입 검사에서 걸리면 파일을 만들지 않는 까닭입니다. 소스를 넘기기 전에 `npm run check`를 돌리는 것이 팀의 약속입니다.

[[#ch1]]에서 주소창에 친 `http://localhost:3100`의 3100은 누가 정했을까요. @@`vite.config.ts`|vite.config.ts@@입니다. 개발 서버이자 빌드 도구인 Vite의 설정이 이 파일에 있습니다.

```ts src="vite.config.ts:24-36" marks="1=①;4=②;7=③"
      alias: { '@': path.resolve(__dirname, 'src') },
    // …
    server: {
      port: 3100,
      proxy: {
        // 대상은 .env.development(.local) 의 DEV_PROXY_TARGET 으로 바꾼다
        '/api': { target: apiTarget, changeOrigin: true, configure: dropOrigin },
      },
    },
```

① 은 [[#ch3]]에서 배운 `@/`의 정체입니다. `@`를 `src` 폴더로 읽으라는 @@**별칭**|별칭@@(alias)을 여기서 정합니다. ② 는 개발 서버의 @@**포트**|포트@@(port), 곧 한 PC 안에서 프로그램을 가려내는 번호입니다.

③ 은 @@**프록시**|프록시@@(proxy) 설정입니다. 프록시는 요청을 대신 받아 다른 곳으로 넘겨 주는 일입니다. 화면이 `/api/notice`를 요청하면 개발 서버가 받아 백엔드로 넘깁니다. 넘길 곳 `apiTarget`의 기본값이 19행의 `http://localhost:8080`입니다. [[#ch1]]에서 백엔드를 함께 켜야 했던 까닭이 이 줄입니다.

나머지 설정 파일은 하는 일만 알아 둡니다.

- `tsconfig.app.json`은 타입스크립트의 검사 기준입니다. 20행의 `"strict": true`가 꼼꼼히 검사하라는 뜻이고, 30행은 타입 검사기에게도 `@/` 별칭을 알려 줍니다.
- `eslint.config.js`는 ESLint라는 검사기의 규칙표입니다. 타입은 맞아도 팀의 약속에 어긋난 코드를 찾는 검사를 @@**린트**|린트@@(lint)라고 합니다. [[#ch8]]에서 배운 훅의 규칙도 여기서 검사합니다.
- `.env.production`에는 @@**환경 변수**|환경 변수@@, 곧 코드를 고치지 않고 바깥에서 바꿔 끼우는 값을 적습니다. 빌드할 때만 읽히며 지금은 값이 하나뿐입니다([[#ch10]]).

## 주소창에서 첫 화면까지 {#boot-flow}

지도를 쥐었으니 길 하나를 끝까지 걸어 봅니다. 주소창에 `http://localhost:3100`을 치고 <kbd>Enter</kbd>를 누른 뒤 첫 화면이 뜨기까지입니다. 아래 그림의 왼쪽 기둥을 따라 내려가면 길이 두 번 갈립니다.

![주소창에서 첫 화면까지. 길은 주소에서 한 번, 로그인 확인에서 또 한 번 갈라진다](img/ch09-boot-flow.svg){width=100%}

위의 세 칸은 이미 읽었습니다. `index.html`의 빈 상자에 `main.tsx`가 `<App />`을 그렸습니다([[#ch2]], [[#ch5]]). `App`은 `AppProviders`로 `AppRouter`를 감쌌습니다. 그 아래 칸부터 새로 읽습니다.

```tsx src="src/app/providers.tsx:10-19" marks="2=①;3=②;4=③"
export const AppProviders = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <ConfigProvider locale={koKR} theme={antdTheme} form={{ validateMessages: { required: '${label} 항목을 입력하세요.' } }}>
      <AntApp message={{ maxCount: 3, duration: 2.5 }} notification={{ placement: 'bottomRight' }}>
        <AppMessageBridge />
        <ErrorBoundary scope="root">{children}</ErrorBoundary>
      </AntApp>
    </ConfigProvider>
  </QueryClientProvider>
);
```

@@`AppProviders`|AppProviders@@는 `children`을 세 겹으로 감쌉니다. 세 겹 모두 [[#ch8]]에서 본 Provider, 곧 아래쪽 어디서든 꺼내 쓸 것을 걸어 두는 자리입니다. ① 은 서버 자료를 기억하는 캐시를([[#ch12]]), ② 는 antd 부품의 한국어 표기와 색을, ③ 은 알림과 확인 창을 깔아 줍니다. 15행의 @@`ErrorBoundary`|ErrorBoundary@@는 그리다 오류가 나면 흰 화면 대신 안내문을 보여 주는 안전망입니다. 그 안의 `{children}`이 `AppRouter`입니다.

::: note 12행의 `${label}`은 템플릿 문자열이 아닙니다
백틱이 아닌 작은따옴표로 감쌌으므로 `${label}`은 값으로 바뀌지 않고 글자 그대로 남습니다. 이 자리는 antd가 나중에 입력 칸의 이름으로 채웁니다.
:::

```tsx src="src/app/router.tsx:16-24" hl="1,3"
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <MeGate>
            <AppShell />
          </MeGate>
        }
      />
```

`<Route>` 두 개가 첫 번째 갈림길입니다. `path`가 주소이고 `element`가 그 주소에서 그릴 것입니다. 주소가 `/login`이면 로그인 화면을 그립니다(16행). `/*`는 그 밖의 모든 주소이고, 이때는 `MeGate`로 감싼 `AppShell`, 곧 헤더·메뉴·탭이 놓인 화면 틀을 그립니다. `<Route>`를 쓰는 법과 `AppShell`의 안쪽은 [[#ch10]]에서 보고, 지금은 로그인 화면만 `MeGate` 바깥에 있다는 점만 기억하세요.

두 번째 갈림길은 @@`MeGate`|MeGate@@입니다. 금고실 앞에는 신분을 확인하는 직원이 서 있고, 확인이 끝나야 문이 열립니다. `MeGate`가 그 직원입니다. 서버에 "지금 로그인한 사람이 누구입니까"를 묻고, 답에 따라 안쪽 화면을 그릴지 정합니다. 서버가 로그인한 브라우저를 기억해 두는 것이 @@**세션**|세션@@(session)입니다.

::: source
`src/app/MeGate.tsx`를 열어 [[#ch5]]에서 모양만 본 25~46행을 앞의 흐름 그림과 견줘 보세요. `return` 네 개가 그림 오른쪽의 네 상자와 하나씩 짝을 이룹니다.
:::

어느 `return`으로 갈지는 17행에서 꺼낸 `status`가 정합니다(꺼내는 법은 [[#ch11]]). 아직 묻지 않은 `'idle'`, 묻는 중인 `'loading'`, 확인을 마친 `'ready'`, 실패한 `'error'` 가운데 하나입니다.

로그인하지 않은 채 앱을 열면 처음에는 `'idle'`이라 로딩 표시가 나옵니다. 그 사이 21행의 `useEffect`가 서버에 묻고, 세션이 없어 로그인이 필요하다는 답이 오면 `status`가 `'error'`로 바뀝니다. 그러면 함수가 다시 실행되어 27행의 `<Navigate to="/login" … />`, 곧 그려지는 순간 주소를 바꾸는 컴포넌트를 돌려줍니다. *같은 함수가 `status`가 바뀔 때마다 다시 실행되어 그때마다 다른 화면을 돌려줍니다.* 아래 그림이 이때 보이는 두 화면입니다.

![`MeGate`의 갈림길에서 보이는 화면. 확인하는 동안의 로딩 표시(왼쪽)와 로그인 화면(오른쪽)의 가운데 부분](img/ch09-gate-screens.png){width=68%}

로그인에 성공하면 `status`가 `'ready'`가 되고 주소는 원래 가려던 곳으로 돌아갑니다. 이번에는 `MeGate`가 문을 열고, 안쪽의 `AppShell`이 메뉴와 탭과 화면을 그립니다.

::: try 관문이 일하는 모습 보기
1. [로그아웃]을 누른 뒤, 주소창에 `http://localhost:3100/sample/notice`를 쳐서 들어갑니다.
2. 주소가 곧바로 `/login`으로 바뀝니다. `MeGate`가 돌려보낸 것입니다.
3. 로그인합니다. 홈이 아니라 공지사항 화면이 열립니다. 원래 가려던 주소를 기억해 둔 덕분입니다.
:::

::: summary
- 소스는 `src` 아래 폴더 11개에 있다. 새 화면의 파일은 `screens`, `domain`, `api/endpoints`에 만든다.
- `npm run` 명령은 `package.json`의 `scripts`에 적혀 있다. 일을 마치면 `npm run check`를 돌린다.
- `vite.config.ts`가 개발 서버의 포트 3100, `/api` 프록시, `@` 별칭을 정한다.
- 앱은 `index.html` → `main.tsx` → `App` → `AppProviders` → `AppRouter` 순서로 켜진다.
- `MeGate`는 로그인 여부를 서버에 확인하고, `status`에 따라 네 가지 화면 가운데 하나를 돌려준다.
:::

::: quiz
1. "기기 점검 이력" 화면을 만듭니다. 화면 컴포넌트, 타입, 서버를 부르는 함수는 각각 어느 폴더에 둘까요?
2. 개발 서버는 3100번, 백엔드는 8080번 포트입니다. `/api/notice`만 요청해도 왜 백엔드에 닿을까요?
3. `router.tsx`에서 로그인 화면을 `MeGate` 안쪽으로 옮기면 로그인하지 않은 사람에게 어떤 일이 벌어질까요?
:::

::: answer
1. 차례로 `screens`의 하위 폴더, `domain`, `api/endpoints`에 둡니다. 2. `vite.config.ts`의 `proxy` 설정 덕분입니다. 개발 서버가 `/api`로 시작하는 요청을 백엔드로 넘겨 줍니다. 3. 로그인 화면이 끝내 뜨지 않습니다. `MeGate`는 로그인하지 않은 사람에게 `children` 대신 `/login`으로 가라는 `Navigate`만 돌려줍니다. 그 `/login`도 `MeGate` 안이라 같은 일이 되풀이됩니다.
:::
