# 서버와 대화하기

::: lead
공지사항 표를 채우는 자료는 서버에 있습니다. 이 장에서는 화면이 서버에 묻고, 답을 받아 표에 올리기까지의 길을 한 층씩 따라갑니다. 읽고 나면 조회와 등록이 어떤 코드를 거치는지 손으로 짚을 수 있습니다.
:::

::: goals
- 개발자 도구에서 요청과 응답을 찾아 읽을 수 있다
- 공용 창구 `api`가 대신 해 주는 일 네 가지를 설명할 수 있다
- `useQuery`와 `useMutation`, 쿼리 키와 무효화를 읽을 수 있다
- `usePagedSearch`가 [조회] 버튼을 어떻게 만드는지 설명할 수 있다
:::

::: files
- `src/types/api.ts`
- `src/api/http.ts`
- `src/api/endpoints/notice.ts`
- `src/screens/popup/NoticeEditModal.tsx`
- `src/hooks/usePagedSearch.ts`
- `src/screens/sample/NoticePage.tsx`
:::

공지사항 화면을 막 열면 표는 비어 있습니다. [조회]를 누르면 공지 수십 건이 표를 채웁니다. 그런데 우리 소스 어디에도 공지 제목은 한 줄도 없습니다. 자료는 서버에 있고, 화면은 필요할 때마다 서버에 물어서 받아 옵니다.

은행 창구 직원이 저마다 본점에 전화를 걸지는 않습니다. 본점과 통화하는 공용 창구에 전표를 넘기면 그곳이 대신 주고받습니다. 우리 화면도 서버를 직접 부르지 않고, 아래 그림처럼 훅, API 함수, 공용 창구를 차례로 거칩니다. @@**API**|API@@는 서버가 "이 주소로 이렇게 물으면 이렇게 답한다"고 정해 둔 약속입니다. 이 장은 그림의 오른쪽 끝에서 왼쪽으로 한 칸씩 읽어 갑니다.

![요청은 오른쪽으로 가고 응답은 같은 길로 돌아온다](img/ch12-path.svg){width=100%}

## 요청과 응답을 눈으로 보기 {#ch12-net}

[[#ch1]]에서 열어 본 개발자 도구의 @@Network 탭@@에는 요청과 응답이 한 줄씩 쌓입니다. 공지사항 화면에서 [조회]를 누르면 브라우저는 이런 요청을 보냅니다.

```text
GET /api/notice?fromDate=20261016&toDate=20261115&ofcCode=100001&page=1&size=20
```

맨 앞의 `GET`은 요청의 방식입니다. `/api/notice`는 주소이고, 물음표 뒤는 조회조건입니다. `이름=값`을 `&`로 이어 붙였습니다. 작성일은 10월 16일부터 11월 15일까지, 사무소는 100001, 1쪽을 20건씩 달라는 뜻입니다. 날짜와 사무소 코드는 여러분 화면의 조회조건을 따라갑니다.

요청의 방식을 @@**HTTP 메서드**|HTTP 메서드@@(method)라고 부릅니다. 우리 소스에는 넷이 나옵니다. `GET`은 읽기, `POST`는 새로 만들기, `PUT`은 고치기, `DELETE`는 지우기입니다.

서버의 답은 두 겹으로 싸여 옵니다. 아래 그림처럼 겉봉투 안에 속봉투가 있고, 그 안에 공지 배열이 들어 있습니다. 오른쪽의 ①과 ②는 봉투를 누가 여는지 미리 적어 둔 것입니다.

![목록 조회의 응답은 봉투 안의 봉투다](img/ch12-envelope.svg){width=100%}

은행에서 증명서를 떼면 '발급 완료' 도장이 찍힌 봉투에 담아 줍니다. 우리 서버도 무엇을 묻든 똑같은 겉봉투에 담아 답합니다. 그 겉봉투의 모양이 @@`ApiResponse`|ApiResponse@@입니다.

```ts src="src/types/api.ts:2-9"
export interface ApiResponse<T> {
  success: boolean;
  /** 서버 응답코드 테이블(T_API_MESSAGE)의 문구 — 성공 응답은 알릴 말이 있을 때만, 없으면 null. 화면은 그대로 보여준다 */
  message: string | null;
  /** 성공 '0000', 실패는 응답코드(예: USR_001) */
  code: string;
  data: T;
}
```

`success`는 일이 잘 끝났는지, `message`는 사용자에게 알릴 말, `code`는 응답코드이고, 알맹이는 `data`에 들어 있습니다. 알맹이의 모양은 요청마다 달라서 [[#ch4]]에서 배운 제네릭 `T`로 비워 두었습니다. 목록 조회라면 `T` 자리에 목록 한 쪽을 담는 `PageResult<Notice>`가 들어갑니다. 그림의 속봉투가 그것입니다.

::: try 요청 한 건 잡아 보기
1. 공지사항 화면에서 <kbd>F12</kbd>를 눌러 Network 탭을 열고, 위쪽의 [Fetch/XHR]을 누릅니다.
2. 화면의 [조회]를 누릅니다. `notice?fromDate=…`로 시작하는 줄이 생깁니다.
3. 그 줄을 누르면 [Headers]에 요청 주소가, [Response]에 서버의 답이 보입니다. 봉투 그림과 맞춰 보세요.
4. 조건을 그대로 두고 [조회]를 또 누릅니다. 줄이 늘지 않습니다. 까닭은 [[#ch12-paged]]에서 풉니다.
:::

## 모든 요청이 거치는 창구, http.ts {#ch12-http}

화면마다 서버를 직접 부른다고 해 봅시다. 요청마다 네 가지 일이 따라붙습니다. 주소 앞에 `/api`를 붙이고, 겉봉투를 벗겨 알맹이를 꺼내고, 서버가 보낸 성공 문구를 띄우고, 실패하면 오류를 알려야 합니다. 우리 소스는 이 네 가지를 `src/api/http.ts` 한 파일에 모았습니다. 서버로 가는 요청은 모두 이 창구를 거칩니다.

이 파일은 요청을 보내고 응답을 받는 라이브러리 @@**axios**|axios@@(액시오스)로 만들었습니다. 밖으로는 `api`라는 객체를 내보냅니다. [[#ch3]]에서 `async`를 배울 때 본 코드입니다.

```ts src="src/api/http.ts:86-119" marks="9=①;10=②;11=③"
export const api = {
  get: async <T>(url: string, config?: ApiRequestConfig): Promise<T> => {
    const res = await http.get<ApiResponse<T>>(url, config);
    return unwrap(res.data, config);
  },
  // …
const unwrap = <T>(body: ApiResponse<T>, config?: ApiRequestConfig): T => {
  if (body && typeof body === 'object' && 'success' in body) {
    if (!body.success) throw new AppError('server', body.message || KIND_MESSAGE.server, { code: body.code, detail: body.data });
    if (body.message && !config?.quietSuccess) notifySuccess(body.message);
    return body.data;
  }
```

@@`api.get`|api (http.ts)@@은 주소를 받아 `GET` 요청을 보내고(88행), 받은 응답을 `unwrap`에 넘겨 그 결과를 돌려줍니다(89행). 88행의 `http`는 30행에서 axios로 만들어 둔 요청 도구입니다. 만들 때 주소 앞머리를 `/api`로 정해 두어서, `'/notice'`만 건네도 요청은 `/api/notice`로 나갑니다. `post`, `put`, `delete`도 같은 모양입니다.

봉투를 여는 일은 114행의 `unwrap`이 합니다. 115행은 받은 것이 겉봉투 모양인지 확인합니다. ①은 실패한 경우입니다. `success`가 `false`면 `throw`로 오류를 던집니다. `throw`는 하던 일을 멈추고 문제가 생겼다고 알리는 문장입니다. ②는 서버가 `message`에 알릴 말을 담아 보낸 경우로, `notifySuccess`가 그 글자를 화면 위쪽에 띄웁니다. 공지를 등록하면 뜨는 "등록되었습니다."가 서버가 보낸 바로 이 글자입니다. 조회 응답은 `message`가 `null`이라 아무것도 뜨지 않습니다. ③에서 알맹이 `data`만 돌려줍니다.

실패의 길은 하나 더 있습니다. 서버가 잘못된 요청이라고 답했거나 서버가 꺼져 있어 답을 받지 못한 경우로, 같은 파일 56~65행이 맡습니다. 어느 길로 왔든 실패는 @@`AppError`|AppError@@라는 한 가지 모양의 오류가 되고, `src/api/queryClient.ts`의 공통 코드가 빨간 알림으로 띄웁니다. 로그인이 풀려서 난 실패라면 [[#ch11]]의 `useAuthStore`에 알려 로그인 화면으로 보냅니다. *네 가지를 이 창구가 다 해 주므로 화면 코드에는 `try/catch`도, 알림을 띄우는 줄도 없습니다.*

::: warn 화면에서 알림을 또 띄우지 않습니다
저장에 성공했다고 화면에서 알림을 직접 띄우면 같은 글자가 두 번 뜹니다. axios를 화면에서 직접 불러도 안 됩니다. 이 창구를 거치지 않은 요청은 위의 네 가지를 받지 못합니다.
:::

## API 함수와 쿼리 키 {#ch12-endpoints}

`api.get('/notice')`를 화면에 바로 써도 동작은 합니다. 하지만 주소가 화면 곳곳에 흩어지면 주소 하나가 바뀔 때 고칠 곳을 찾아다녀야 합니다. 그래서 규칙이 있습니다. *서버를 부르는 코드는 `src/api/endpoints/` 폴더에만 씁니다.* @@**엔드포인트**|엔드포인트@@(endpoint)는 서버가 요청을 받는 주소 하나하나를 가리키는 말입니다. 업무마다 파일이 하나씩 있고 공지사항은 `notice.ts`입니다.

```ts src="src/api/endpoints/notice.ts:11-22"
export const noticeApi = {
  /** 목록(페이징, NO DESC). 목록의 text 는 null */
  list: (p: NoticeSearch) => api.get<PageResult<Notice>>('/notice', { params: compactParams(p) }),
  /** 1건(text 포함). hit=true 면 서버가 조회수 +1 (상세 팝업 열기). 없으면 404 NTC_001 */
  get: (no: number, hit = false) => api.get<Notice>(`/notice/${no}`, { params: hit ? { hit: 'Y' } : undefined }),
  /** 등록 — 서버 문구 S002 */
  create: (body: NoticeSave) => api.post<Notice>('/notice', body),
  /** 수정 — 서버 문구 S003 */
  update: (no: number, body: NoticeSave) => api.put<Notice>(`/notice/${no}`, body),
  /** 다건 삭제(1~100건) — 서버 문구 S005 '{n}건 삭제되었습니다.' */
  remove: (nos: number[]) => api.post<NoticeDeleteResult>('/notice/delete', { nos } satisfies NoticeDeleteRequest),
};
```

@@`noticeApi`|noticeApi@@는 함수 다섯 개를 담은 객체입니다. 위에 달린 주석대로 차례로 목록, 한 건, 등록, 수정, 삭제입니다. 읽기 둘은 `api.get`을, 등록은 `api.post`를, 수정은 `api.put`을 씁니다. 화면은 `noticeApi.list(조건)`처럼 이름으로 부르면 되고, 주소가 무엇인지는 몰라도 됩니다.

13행을 뜯어 봅시다. 꺾쇠 안의 `PageResult<Notice>`는 겉봉투를 벗긴 뒤 받을 알맹이의 타입입니다. `{ params: … }`는 조회조건 객체를 주소 뒤의 `?이름=값`으로 실어 보내라는 뜻이고, `compactParams`는 비어 있는 조건을 빼 줍니다. [[#ch12-net]]의 주소에 작성자 조건이 없던 까닭입니다. 15행과 19행은 [[#ch3]]의 템플릿 문자열로 주소를 만듭니다. `no`가 7이면 `/notice/7`입니다. 21행의 삭제가 `DELETE` 대신 `POST`인 것은 지울 번호 여러 개를 한 번에 실어 보내려는 것입니다.

같은 파일 아래쪽에는 객체가 하나 더 있습니다.

```ts src="src/api/endpoints/notice.ts:25-29"
export const noticeKeys = {
  all: ['notice'] as const,
  list: (p: NoticeSearch) => ['notice', 'list', p] as const,
  detail: (no: number) => ['notice', 'detail', no] as const,
};
```

`noticeKeys`는 @@**쿼리 키**|쿼리 키@@(query key)를 만드는 곳입니다. 쿼리 키는 자료를 넣어 둘 서랍의 이름표인데, 다음 절에서 씁니다. 키는 넓은 이름부터 좁은 이름 순으로 적은 배열입니다. `noticeKeys.detail(7)`은 `['notice', 'detail', 7]`을 만듭니다. `all`은 조건이 없어 배열 그대로입니다.

## 읽기, useQuery {#ch12-query}

API 함수만으로 화면을 만들려면 손이 많이 갑니다. 받은 자료를 담을 state, 읽는 중인지 기억할 state, 처음 그린 뒤 요청을 보낼 `useEffect`가 화면마다 필요합니다. 같은 사무소 목록을 부품 다섯 개가 쓰면 요청도 다섯 번 나갑니다.

@@**TanStack Query**|TanStack Query@@(탠스택 쿼리)가 이 일을 맡습니다. 서버 자료를 읽어 오고, 받은 자료를 @@**캐시**|캐시@@(cache)에 넣어 두는 라이브러리입니다. 캐시는 받은 자료를 다시 쓰려고 넣어 두는 서랍장입니다. [[#ch9]]에서 본 `QueryClientProvider`가 이 서랍장을 앱 전체에 놓아 준 부품입니다. 서버에서 자료를 읽는 일 하나를 @@**쿼리**|쿼리@@(query)라 하고, @@`useQuery`|useQuery@@ 훅으로 만듭니다. 공지 수정 팝업은 이렇게 씁니다.

```tsx src="src/screens/popup/NoticeEditModal.tsx:59"
  const detail = useQuery({ queryKey: noticeKeys.detail(no ?? 0), queryFn: () => noticeApi.get(no as number), enabled: no !== null, gcTime: 0 });
```

`queryFn`에는 자료를 읽어 올 함수를, `queryKey`에는 그 자료를 넣을 서랍의 이름표를 적습니다. 둘 다 [[#ch12-endpoints]]에서 본 것입니다. `enabled`는 요청을 보내도 되는지 정합니다. `no`가 `null`이면 새 글 등록이라 읽을 것이 없어 보내지 않습니다. `?? 0`과 `as number`는 그 `null`에 대비한 타입 맞춤입니다. `gcTime`을 0으로 둔 것은 팝업을 닫으면 서랍을 바로 비우라는 뜻입니다.

돌려받은 `detail`에는 받은 자료 `data`, 지금 읽는 중인지 알려 주는 `isFetching`, 실패했을 때의 `error`가 들어 있습니다. 컴포넌트가 처음 그려질 때 `detail.data`는 `undefined`입니다. 응답이 오면 컴포넌트가 다시 렌더링되고 `data`에 공지 한 건이 들어옵니다. state를 한 줄도 쓰지 않았는데 [[#ch7]]의 "바뀌면 다시 그린다"가 그대로 일어납니다.

쿼리 키는 두 가지 일을 합니다. 첫째, 키가 같으면 같은 서랍을 봅니다. 같은 키로 `useQuery`를 부르는 부품이 여럿이어도 요청은 한 번만 나가고 모두 같은 자료를 받습니다. 둘째, 키가 달라지면 다른 서랍을 봅니다. 번호가 264에서 265로 바뀌면 `useQuery`가 새로 읽어 옵니다. *키가 바뀌면 다시 읽습니다.* [[#ch12-paged]]에서 이 규칙으로 [조회] 버튼을 만듭니다.

## 쓰기, useMutation과 무효화 {#ch12-mutation}

읽기는 화면이 그려질 때 저절로 나가도 괜찮습니다. 쓰기는 다릅니다. 등록 요청은 사용자가 [저장]을 누른 순간에 딱 한 번 나가야 합니다. 서버의 자료를 바꾸는 요청을 @@**뮤테이션**|뮤테이션@@(mutation)이라 하고 @@`useMutation`|useMutation@@ 훅으로 준비합니다. 공지 등록·수정 팝업의 저장 부분을 봅시다.

```tsx src="src/screens/popup/NoticeEditModal.tsx:70-73"
  const save = useMutation({
    mutationFn: (body: NoticeSave) => (target ? noticeApi.update(target.no, body) : noticeApi.create(body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: noticeKeys.all }),
  });
```

`mutationFn`은 보낼 자료 `body`를 받아 서버를 부르는 함수입니다. 71행은 삼항 연산자로, 고칠 대상 `target`이 있으면 수정을, 없으면 등록을 부릅니다. `onSuccess`는 성공했을 때 할 일입니다. 이 훅은 준비만 합니다. 요청은 같은 파일 80행처럼 `save.mutate(값)`을 부를 때 나갑니다. 요청이 나가 있는 동안 `save.isPending`이 `true`이고, [저장] 버튼이 이 값으로 빙글빙글 도는 표시를 냅니다.

72행이 이 절의 주인공입니다. 등록에 성공한 순간, 캐시에 들어 있던 목록은 새 글이 빠진 낡은 자료가 됩니다. `invalidateQueries`는 그 서랍에 "낡았음" 딱지를 붙입니다. 이 일을 @@**무효화**|무효화@@(invalidate)라고 합니다. 딱지가 붙은 서랍을 지금 화면이 쓰고 있으면 TanStack Query가 곧바로 다시 읽습니다. `qc`는 68행의 `useQueryClient()`가 돌려준 캐시 관리자이고, 건넨 키 `noticeKeys.all`은 `['notice']`입니다. 키의 앞부분이 맞으면 모두 걸리므로 `['notice', 'list', …]` 서랍은 조건이 무엇이든 한꺼번에 무효화됩니다. 키를 넓은 이름부터 적는 까닭이 여기 있습니다.

아래 그림은 [저장]을 누른 뒤의 일을 순서대로 그린 것입니다. ③에서 화면이 한 일은 딱지를 붙인 것뿐이고, ④의 다시 읽기는 TanStack Query가 알아서 합니다.

![등록에 성공하면 목록을 무효화해 다시 읽는다](img/ch12-invalidate.svg){width=100%}

목록 화면의 삭제도 같은 모양입니다. `NoticePage.tsx` 48행에서 `mutationFn`만 `noticeApi.remove`로 바뀝니다. 47행의 상세 열기는 읽기인데도 뮤테이션입니다. 서버가 조회수를 1 올리는 요청이라, 사용자가 누를 때 한 번만 나가야 하기 때문입니다.

## 조회 화면의 공식, usePagedSearch {#ch12-paged}

업무 화면의 조회는 어느 화면이나 똑같이 움직입니다. [조회]를 누르기 전에는 서버를 부르지 않습니다. 누르면 그때의 조건을 기억하고 1쪽부터 읽습니다. 쪽을 넘기면 같은 조건으로 그 쪽을 읽습니다. 이 공식을 커스텀 훅 @@`usePagedSearch`|usePagedSearch@@에 담아 두었습니다. 훅은 조건으로 쿼리 키를 만드는 함수 `key`와 서버를 부르는 함수 `fetch`를 `opts`에 담아 건네받습니다. 안쪽의 뼈대는 이렇습니다.

```ts src="src/hooks/usePagedSearch.ts:13-20"
  const [params, setParams] = useState<P | null>(null);
  const query = useQuery({
    queryKey: params ? opts.key(params) : opts.idleKey,
    queryFn: () => opts.fetch(params as P),
    enabled: params !== null,
    placeholderData: keepPreviousData,
    // …
  });
```

13행은 조회조건을 state로 기억합니다. 처음 값 `null`은 "아직 조회 전"이라는 약속이고, 17행의 `enabled`가 그동안 요청을 막습니다. 조건이 생기면 15행이 그 조건으로 쿼리 키를 만들고 16행이 `fetch`를 부릅니다. 18행은 새 답이 올 때까지 이전 목록을 그대로 보여 주라는 옵션이라, 쪽을 넘겨도 표가 깜빡이지 않습니다. [조회]와 쪽 넘김은 이 state를 바꾸는 함수입니다.

```ts src="src/hooks/usePagedSearch.ts:48-52"
  const search = useCallback(
    (values: Omit<P, 'page' | 'size'>) => setParams((prev) => ({ ...(values as P), page: 1, size: prev?.size ?? pageSize })),
    [pageSize, setParams],
  );
  const setPage = useCallback((page: number, size: number) => setParams((prev) => (prev ? { ...prev, page, size } : prev)), [setParams]);
```

`search`는 새 조건에 `page: 1`을 붙여 기억합니다. 한 쪽의 건수 `size`는 쓰던 값을 잇고, 처음이면 [[#ch11]]에서 본 설정 스토어의 `pageSize`를 씁니다. `setPage`는 전개 연산자로 조건은 그대로 두고 `page`와 `size`만 바꿉니다. 두 함수 어디에도 서버를 부르는 줄이 없습니다. *state를 바꾸는 것이 곧 조회입니다.* 조건이 바뀌면 15행의 쿼리 키가 달라지고, 그래서 `useQuery`가 새로 읽습니다.

[[#ch12-net]]에서 [조회]를 두 번 눌렀을 때 요청이 한 번만 나간 까닭도 여기서 풀립니다. 조건이 같으면 키가 같고, 키가 같으면 같은 서랍입니다. 같은 조건으로 다시 읽으려면 제목 줄의 새로고침 버튼(↻)을 누릅니다. 이 버튼이 `search.refetch()`를 부릅니다.

::: try 쪽을 넘기며 요청 보기
1. Network 탭을 연 채로 표 아래의 쪽 번호 2를 누릅니다. `page=2`만 다른 요청이 나갑니다.
2. 곧바로 1을 누릅니다. 줄이 늘지 않고 1쪽이 바로 나옵니다. 받은 자료를 30초 동안은 새것으로 믿기 때문입니다. 이 시간은 `src/api/queryClient.ts`의 @@`staleTime`|staleTime@@이 정합니다.
3. 제목 줄의 ↻를 누릅니다. 같은 주소로 요청이 한 번 더 나갑니다.
:::

공지사항 화면은 이 훅을 한 줄로 씁니다.

```tsx src="src/screens/sample/NoticePage.tsx:41"
  const search = usePagedSearch<NoticeSearch, Notice>({ key: noticeKeys.list, fetch: noticeApi.list });
```

`key`와 `fetch` 자리에 [[#ch12-endpoints]]의 `noticeKeys.list`와 `noticeApi.list`를 건넸습니다. 괄호 없이 함수 자체를 건넸고, 부르는 일은 훅이 합니다. 돌려받은 `search`에는 다음 표의 값들이 들어 있습니다. 화면은 이 값들을 부품에 나눠 건네기만 합니다. 그 부품들이 [[#ch13]]의 주제입니다.

표: `usePagedSearch`가 돌려주는 값

| 이름 | 뜻 |
|---|---|
| `rows`, `total` | 표에 넣을 행 배열과 전체 건수(속봉투의 `content`, `totalCount`) |
| `page`, `size` | 지금 쪽 번호(1부터)와 한 쪽의 건수 |
| `loading`, `searched` | 서버에서 읽는 중인지, [조회]를 한 번이라도 눌렀는지 |
| `params`, `lastUpdated` | 지금 조회조건(조회 전이면 `null`)과 마지막으로 받은 시각 |
| `pagination` | 표 부품에 그대로 건네는 쪽 넘김 묶음 |
| `search(조건)` | 1쪽부터 조회한다 |
| `refetch()`, `reset()` | 같은 조건으로 다시 읽는다, 조회 전으로 되돌린다 |

::: summary
- 화면은 서버를 직접 부르지 않는다. 훅, API 함수, 공용 창구 `api`를 차례로 거친다.
- 서버의 답은 `ApiResponse` 겉봉투에 싸여 온다. `api`가 벗기고, 알림도 공통 코드가 띄운다.
- 서버를 부르는 코드와 쿼리 키는 `api/endpoints/` 폴더의 업무별 파일에 둔다.
- 읽기는 `useQuery`다. 쿼리 키가 같으면 캐시를 함께 쓰고, 키가 바뀌면 다시 읽는다.
- 등록·수정·삭제는 `useMutation`이다. 성공하면 목록을 무효화해 다시 읽게 한다.
- `usePagedSearch`의 [조회]와 쪽 넘김은 조건 state만 바꾼다. 요청은 `useQuery`가 보낸다.
:::

::: quiz
1. 공지를 등록하면 화면 위쪽에 "등록되었습니다."가 뜹니다. 이 글자는 누가 만들고, 어느 코드가 띄웁니까?
2. 공지 삭제에 성공한 뒤 목록을 무효화하지 않으면 화면에 어떤 일이 생깁니까?
3. 공지사항 화면을 막 열었을 때는 왜 `/api/notice` 요청이 나가지 않습니까?
:::
::: answer
1. 서버가 응답의 `message`에 담아 보내고, `http.ts`의 `unwrap`이 `notifySuccess`로 띄운다. 2. 서버에서는 지워졌지만 캐시의 목록은 그대로라서, 목록을 다시 읽기 전까지 지운 행이 표에 남는다. 3. 조회조건 state의 처음 값이 `null`이고, 그동안은 `enabled`가 요청을 막는다. [조회]를 눌러 `search`가 조건을 넣어야 요청이 나간다.
:::
