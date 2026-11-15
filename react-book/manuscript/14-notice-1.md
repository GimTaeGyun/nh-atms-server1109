# 공지사항으로 공부하기

::: lead
13장까지 읽어 온 공지사항 화면을 이제 빈 파일부터 손으로 다시 만듭니다. 11단계를 따라 한 단계씩 채우고, 단계마다 화면이 어떻게 달라지는지 눈으로 확인합니다. 마지막 단계를 마치면 원본과 똑같이 움직이는 화면이 여러분 손에 남습니다.
:::

::: goals
- 화면 하나를 이루는 파일 6개의 역할과 만드는 순서를 설명할 수 있다
- 빈 파일에서 시작해 조회·표·팝업·삭제·엑셀까지 한 단계씩 만들 수 있다
- 앞 장에서 배운 개념이 화면의 어느 줄에 쓰이는지 짚을 수 있다
- 타입 검사와 화면 확인으로 내가 친 코드를 점검할 수 있다
:::

::: files
- `src/domain/notice.ts`
- `src/api/endpoints/notice.ts`
- `src/screens/sample/NoticePage.tsx`
- `src/screens/sample/NoticeParts.tsx`
- `src/screens/popup/NoticeViewModal.tsx`
- `src/screens/popup/NoticeEditModal.tsx`
:::

은행에 들어온 신입 직원은 첫날부터 창구에 혼자 앉지 않습니다. 며칠은 선배 옆에서 전표 처리를 지켜보고, 그다음에는 선배가 지켜보는 앞에서 직접 처리해 봅니다. 13장까지가 지켜보는 시간이었다면 이 장은 직접 처리하는 시간입니다.

공지사항 화면의 파일 6개를 비우고 처음부터 한 줄씩 다시 채웁니다. 원래 파일은 옆에 펼쳐 둔 정답지입니다. 막히면 정답지를 보고, 단계가 끝날 때마다 화면을 띄워 확인합니다.

## 무엇을 만드나 {#ch14-goal}

이 장을 마치면 여러분 앞에는 아래 그림의 화면이 있습니다. [[#ch1]]에서 처음 띄워 본 그 공지사항 화면에서 [조회]를 누른 모습입니다. 이 화면에서는 조건을 넣어 공지를 찾고 제목을 눌러 상세를 봅니다. 새 공지를 쓰고 고치고, 여러 건을 골라 지우고, 목록을 엑셀로 받거나 인쇄합니다.

![이 장에서 만들 공지사항 화면. [조회]를 누른 뒤의 윗부분이다](img/shots/ch14-final.png){width=60%}

이 일을 해내는 파일은 6개뿐이고, [[#ch9]]에서 말했듯이 `screens`, `api/endpoints`, `domain` 세 폴더에 나뉘어 있습니다. 아래 그림은 파일마다 맡은 일과 서로 가져다 쓰는 관계입니다.

![공지사항 화면의 파일 6개. 화살표는 가져다 쓰는 파일에서 쓰이는 파일로 향하고, 파란 글자는 그 파일을 치는 단계다. 타입 파일은 다섯 파일이 모두 쓰지만 화살표는 하나만 그렸다](img/ch14-files.svg){width=96%}

맨 위의 `NoticePage.tsx`가 화면 본체로, 틀과 버튼을 그리고 아래 파일들을 불러 조립합니다. `NoticeParts.tsx`는 조회조건 칸과 표의 컬럼을 모아 둔 부품 서랍이고, 팝업 둘은 한 파일씩입니다. 맨 아래 두 파일은 화면에 아무것도 그리지 않습니다. 서버와 주고받는 자료의 모양을 적은 타입 파일과, 서버를 부르는 API 함수 파일입니다.

화살표 끝의 파일이 먼저 있어야 그 파일을 가져다 쓸 수 있습니다. 그래서 빈 화면을 하나 띄운 다음에는 화살표를 거슬러 올라가며 만듭니다. 아래 표가 이 장의 지도입니다.

표: 공지사항 화면을 만드는 11단계

| 단계 | 만드는 것 | 화면에서 달라지는 것 |
|---|---|---|
| 1~3 | 빈 화면, 타입, API 함수 | 오류 화면 대신 제목만 있는 틀이 뜬다 |
| 4~5 | 조회조건, 조회 | 조건 칸이 생기고 [조회]가 서버에 묻는다 |
| 6 | 표 | 받아 온 목록과 쪽 번호 줄 |
| 7~8 | 상세 팝업, 등록·수정 팝업 | 제목을 누르면 상세가, [등록]을 누르면 입력 칸이 뜬다 |
| 9~11 | 행 선택, 삭제, 엑셀과 출력 | 체크 칸과 [수정]·[삭제]·[엑셀]·[출력] |

단계 2와 3을 빼면 단계마다 화면이 한 가지씩 달라집니다. *달라진 화면을 눈으로 확인하고 나서 다음 단계로 넘어갑니다.* 화면을 메뉴에 올리는 등록은 이미 되어 있어 이 장에서는 하지 않고, 진짜 새 화면을 만들 때 더 할 일은 장의 끝에서 정리합니다.

## 준비 {#ch14-ready}

원본 소스를 직접 비우면 정답지가 사라집니다. 프로젝트 폴더를 통째로 복사한 @@**연습용 폴더**|연습용 폴더@@를 만들어 그 안에서 실습합니다. 원본 폴더는 정답지로 남겨 둡니다.

### 연습용 폴더 만들기

1. 파일 탐색기에서 `nh-atms-web` 폴더를 복사해 바탕 화면에 붙여 넣습니다. 붙여 넣은 폴더의 이름은 `nh-atms-web-practice`처럼 바꿉니다. 받은 소스 폴더는 팀이 Git이라는 도구로 함께 관리하는 저장소라서, 그 안에 두면 연습한 파일이 팀 소스에 섞여 올라갈 수 있습니다. `node_modules`까지 함께 복사되니 `npm ci`는 다시 하지 않습니다.
2. VS Code의 [파일] → [새 창]([New Window])으로 창을 하나 더 열고, 그 창에서 [폴더 열기]로 연습용 폴더를 엽니다. 창 제목의 폴더 이름으로 원본 창과 구별합니다.
3. 장 머리의 소스 6개 파일을 하나씩 열어 <kbd>Ctrl</kbd>+<kbd>A</kbd>, <kbd>Delete</kbd>, <kbd>Ctrl</kbd>+<kbd>S</kbd>를 누릅니다. 파일은 지우지 않고 내용만 비워서, 자리와 이름을 그대로 둡니다.
4. 원본 폴더에서 켜 둔 개발 서버가 있으면 <kbd>Ctrl</kbd>+<kbd>C</kbd>로 끄고, 연습용 폴더의 터미널에서 `npm run dev`를 칩니다. 두 화면은 똑같이 생겨서, 둘 다 켜 두면 어느 쪽을 보는지 헷갈립니다.

실습 화면도 [[#ch1]]처럼 팀의 개발 백엔드에 붙으니 백엔드가 켜져 있어야 합니다. 로그인한 뒤 메뉴에서 [견본] → [공지사항]을 누르면 아래처럼 오류 화면이 뜹니다.

![6개 파일을 비운 뒤의 공지사항 탭. 헤더와 다른 탭은 멀쩡하다](img/shots/tut-00-empty.png){width=80%}

[[#ch9]]에서 본 안전망 `ErrorBoundary`를 `ScreenHost.tsx` 74행이 탭마다 한 번 더 감싸 두어서, 오류는 이 탭 안에만 뜹니다. 터미널을 하나 더 열어 `npm run typecheck`를 실행하면 오류가 하나 나옵니다. 경로 앞부분은 줄였고, 사이에 딸려 나오는 코드 조각은 읽지 않아도 됩니다.

```out
src/screens/registry.ts:54:54 - error TS2322: Type 'Promise<typeof import("…/src/screens/sample/NoticePage")>' is not assignable to type 'Promise<ScreenModule>'.
  Property 'default' is missing in type 'typeof import("…/src/screens/sample/NoticePage")' but required in type 'ScreenModule'.
…
Found 1 error.
```

`registry.ts` 54행은 [[#ch10-registry]]에서 읽은 공지사항의 `def(…)` 줄입니다. 이 줄이 `NoticePage.tsx`에서 `export default`로 내보낸 화면을 찾지 못했다는 오류이고, 단계 1을 마치면 사라집니다. 화면키, 등록부, 내장 메뉴(`screenIds.ts` 16행, `registry.ts` 54행, `menuSeed.ts` 20행)는 그대로라서 메뉴와 탭은 뜹니다. 이 세 파일은 고치지 않습니다.

### 실습의 약속

단계는 파란 머리 "단계 01"로 시작해 "확인" 상자로 끝납니다. 그 사이 코드 블록의 이름표 오른쪽에는 치는 법이 적혀 있습니다.

표: 14장 코드 블록의 이름표

| 이름표 | 치는 법 |
|---|---|
| 새 파일 | 빈 파일에 처음 치는 코드 |
| 이어 쓰기 | 쓰던 파일에 더 치는 코드. 넣을 자리는 블록 앞의 글이 알려 준다 |
| 고치기 | `+` 줄은 더하고 `−` 줄은 지운다. 표시 없는 줄은 자리를 찾는 길잡이 |
| 임시 줄 | 화면을 미리 보려고 잠깐 넣는 줄. 언제 바꾸는지 함께 적었다 |

"새 파일"과 "이어 쓰기"는 이름표 글자만 다를 뿐, 지금까지의 "우리 소스"처럼 실제 파일과 한 줄씩 대조한 코드이고 줄 번호도 원본의 번호입니다. 줄이 덜 찬 여러분 파일의 번호와는 다르니 원본 창에서 같은 번호를 찾아 앞뒤를 견줍니다. ⋮은 원본에는 줄이 있지만 지금은 치지 않는 자리입니다.

번호가 다른 블록도 있습니다. "고치기" 블록의 왼쪽 번호는 블록 안에서 센 순서일 뿐 원본 번호가 아닙니다. 줄 번호가 아예 없는 블록에는 원본과 조금 다른 줄이 있고, 그 까닭은 그 자리에 적었습니다.

- **파일을 저장하면 화면이 저절로 바뀝니다.** 오류 화면이 떠 있을 때는 저장해도 그대로이니 [다시 시도]나 <kbd>F5</kbd>를 누릅니다. 저장 뒤 화면이 "조회 전"으로 돌아가면 [조회]를 다시 누릅니다.
- **괄호나 쉼표를 빠뜨리면 화면 전체를 덮는 오류 창이 뜹니다.** 창의 빨간 글에 파일 이름과 `(16:31)` 같은 줄:칸 번호가 있으니 그 자리를 고쳐 저장합니다. 고치면 창은 저절로 사라집니다.
- **두 파일을 고치는 단계는 부품 파일을 먼저 저장합니다.** 순서가 바뀌면 아직 없는 것을 가져온다는 오류가 뜰 수 있습니다.
- **단계를 마칠 때마다 `npm run typecheck`를 돌립니다.** 화면에 드러나지 않는 실수를 타입 검사가 먼저 알려 줍니다. 치는 도중 편집기가 긋는 빨간 줄은 대개 그 단계를 다 치면 사라집니다.
- 주석은 동작과 상관없고 §·→ 같은 기호가 많으니 원본 창에서 복사해 붙여도 됩니다. 블록 사이의 빈 줄도 보기 좋게 넣습니다.

::: warn 저장과 삭제는 누르지 않습니다
실습 화면이 붙는 백엔드는 팀이 함께 쓰는 개발 DB를 읽고 씁니다. 그래서 이 장의 실습은 화면을 확인하는 데까지만 합니다. [저장]은 제목과 내용을 하나도 치지 않은 등록 팝업에서 입력 검사를 볼 때만 누릅니다. 빨간 별이 붙은 칸이 비어 있으면 화면이 막아 서버로 가지 않기 때문입니다. 글이 든 팝업의 [저장]과 삭제 확인 풍선의 [확인]은 누르지 않고, 그 뒤의 화면은 책의 그림으로 봅니다.

공지 제목을 누르면 서버가 조회수를 1 올립니다. 바뀌는 것이 조회수뿐이니 눌러도 괜찮습니다.
:::

## 빈 화면과 서버 창구 {#ch14-shell}

첫 세 단계는 화면의 문을 열고, 서버와 주고받을 서류의 양식과 창구를 갖추는 일입니다. 단계 2와 3은 화면 대신 타입 검사로 확인합니다.

::: step 1 빈 화면 띄우기
`NoticePage.tsx`에 화면 틀만 그리는 컴포넌트를 씁니다.
:::

비워 둔 `NoticePage.tsx`에 아래 세 블록을 차례로 칩니다. 원본 129줄 가운데 18줄과 임시 줄 하나입니다.

```tsx src="src/screens/sample/NoticePage.tsx:8-84" kind="새 파일"
import { PageFrame } from '@/components/page/PageFrame';
// …
import type { ScreenProps } from '@/types/screen';
// …
/**
 * 공지사항 — "팝업형 CRUD" 견본(설계 §8.2, API 계약 §3, TB_NOTICE).
 *  조회조건(SearchForm) → [조회] → 서버 페이징 목록(DataGrid G1, 체크 선택) → 제목 클릭·행 더블클릭 = 상세 팝업(조회수 +1)
 *  [등록]·[수정](1건 선택) = 입력 팝업(NoticeEditModal), [삭제](여러 건 선택 + 확인창), [엑셀]·[출력] = 지금 보이는 목록.
 *  성공·오류 문구는 서버가 만들고 자동 표시된다 — 이 화면은 onSuccess 에서 목록 다시 읽기(invalidate)만 한다.
 */
const NoticePage = ({ screenKey }: ScreenProps) => {
  // …
  return (
    <PageFrame
      screenKey={screenKey}
      // …
    >
```

```tsx title="src/screens/sample/NoticePage.tsx" kind="임시 줄 · 단계 4에서 바꿈"
      <p>여기에 공지사항 화면을 만듭니다.</p>
```

```tsx src="src/screens/sample/NoticePage.tsx:125-129" kind="이어 쓰기"
    </PageFrame>
  );
};

export default NoticePage;
```

8행은 바깥 틀 `PageFrame`([[#ch13-frame]])을, 20행은 화면 props의 타입([[#ch6]])을 가져옵니다. 27~32행의 머리 주석은 앞으로 칠 것의 차례표입니다. 33행부터는 `screenKey`만 꺼내는 화살표 함수 컴포넌트입니다([[#ch5]]). 화면키를 받은 `PageFrame`은 등록부에서 제목과 경로를 찾아 그립니다. 129행의 `export default`는 등록부의 `lazy`가 찾는 내보내기입니다([[#ch10-registry]]).

@@임시 줄@@은 `PageFrame` 태그 사이에 들어가는 `children`입니다. `PageFrame`은 `children`을 꼭 받아야 합니다. 이 줄을 빼면 타입 검사가 `error TS2741: Property 'children' is missing …`라고 알립니다.

::: check
- 저장해도 오류 화면이 그대로입니다. [다시 시도]를 누르면 경로 "견본 > 공지사항", 제목과 별, 임시 문장이 보입니다.
- `npm run typecheck`가 오류 없이 끝납니다. 마지막 줄을 빠뜨리면 준비 때 본 `registry.ts`의 오류가 그대로 남습니다.
:::

![단계 1을 마친 화면의 본문 윗부분. 경로와 제목, 임시 문장만 있다](img/shots/ch14-step1-blank.png){width=38%}

::: step 2 자료의 모양 적기
`src/domain/notice.ts`에 공지사항의 타입 6개를 씁니다.
:::

이 파일 57줄은 4장에 한 줄도 빼지 않고 실었습니다. 1~37행은 [[#ch4-notice]]의 세 블록에, 39~57행은 [[#ch4-interface]]의 첫 블록에 있습니다. 그 쪽을 펴 두거나 원본 창을 보며 처음부터 끝까지 그대로 칩니다. 뜻은 그 절에 맡기고, 칠 때는 세 가지를 살핍니다.

- 첫째, 타입 6개 앞의 `export`입니다. 다른 파일이 가져다 쓰려면 내보내야 합니다([[#ch3]]). `NoticeSave` 앞에서 빠뜨리면 이 단계에서 `'NoticeSave' is declared but never used.`가 나옵니다. 아무도 쓰지 않는 이름이라는 뜻이고, 단계 3에서는 `… is not exported` 오류가 더 붙습니다.
- 둘째, 5행의 `import type` 줄입니다. 빠뜨리면 `Cannot find name 'Audit'`과 `Cannot find name 'PageParams'`가 나옵니다.
- 셋째, `?`와 `| null`입니다. 둘은 뜻이 다르니([[#ch4-union]]) 칸마다 원본과 똑같이 붙입니다.

::: check
- 화면은 그대로이고, `npm run typecheck`가 아래 2줄만 찍고 끝나면 통과입니다.

```out
> nh-atms-web@1.0.0 typecheck
> tsc -b
```
:::

::: step 3 서버 창구 만들기
`src/api/endpoints/notice.ts`에 API 함수 5개와 쿼리 키를 씁니다.
:::

[[#ch12-endpoints]]에서 읽은 파일입니다. 2행에서 단계 2의 타입을 가져다 씁니다.

```ts src="src/api/endpoints/notice.ts:1-22" kind="새 파일"
import { api } from '../http';
import type { Notice, NoticeDeleteRequest, NoticeDeleteResult, NoticeSave, NoticeSearch } from '@/domain/notice';
import type { PageResult } from '@/types/api';
import { compactParams } from '@/utils/object';

/**
 * 공지사항 견본(`sample.notice`) API — API 계약 §3 (`/api/notice…`).
 * 규칙: API 호출은 이 파일에서만, 응답 타입은 domain/notice.ts, 쓰기 성공 문구는 서버가 보내고 http.ts 가 띄운다.
 * 화면의 onSuccess 는 `invalidateQueries({ queryKey: noticeKeys.all })` 만.
 */
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

```ts src="src/api/endpoints/notice.ts:24-29" kind="이어 쓰기"
/** 공지사항 쿼리 키 — `noticeKeys.all` 은 invalidate 용 루트 */
export const noticeKeys = {
  all: ['notice'] as const,
  list: (p: NoticeSearch) => ['notice', 'list', p] as const,
  detail: (no: number) => ['notice', 'detail', no] as const,
};
```

1행의 `'../http'`는 한 폴더 위에 있는 공용 창구 `http.ts`입니다. 점을 하나만 찍으면 `Cannot find module './http'` 오류가 납니다. 15행과 19행의 주소는 백틱(`` ` ``)으로 감싼 [[#ch3]]의 템플릿 문자열이라야 `${no}` 자리에 공지 번호가 들어갑니다.

::: check
- 화면은 그대로이고, `npm run typecheck`가 단계 2처럼 2줄만 찍고 끝납니다.
- 15행을 작은따옴표로 치면 `error TS6133: 'no' is declared but its value is never read.`가 나옵니다. 받은 `no`를 쓰지 않았다는 말이고, 따옴표가 틀렸다는 신호입니다.
:::

## 조회조건에서 조회까지 {#ch14-search}

이제 화면이 눈에 띄게 달라집니다. 단계 4에서 조건 칸 5개를 그리고, 단계 5에서 [조회]가 서버에 묻게 합니다.

::: step 4 조회조건 칸 만들기
`NoticeParts.tsx`에 조건 칸 목록을 만들고, `NoticePage.tsx`가 그 목록을 그리게 합니다.
:::

`NoticeParts.tsx`는 화면 본체가 쓸 조회조건과 컬럼을 모아 두는 파일입니다. 먼저 머리 주석과 가져오기 줄을 칩니다.

```tsx title="src/screens/sample/NoticeParts.tsx" kind="새 파일 · 형광펜 2줄은 줄여 친다" hl="7,16"
/**
 * 공지사항 견본(`sample.notice`) 부품 — 조회조건·조건→파라미터·컬럼·인쇄 조건.
 * 화면 본체 NoticePage.tsx, 팝업 popup/NoticeEditModal.tsx·NoticeViewModal.tsx 가 함께 쓴다.
 * 새 "팝업형 CRUD" 화면은 이 파일을 복사해 이름만 바꿔 시작한다.
 */
import { useMemo } from 'react';
import { Form, Input } from 'antd';
import type { FormInstance } from 'antd';
import { useAuthStore, selectOfficeCd } from '@/stores/useAuthStore';
import type { SearchField } from '@/components/search/SearchForm';
import { officeField } from '@/components/search/fields';
import { rangeField } from '@/components/search/dateFields';
import { personField } from '@/components/search/lookupFields';
import { today, type Dayjs } from '@/utils/date';
import type { ValueProps } from '@/types/common';
import type { NoticeField } from '@/domain/notice';
```

이 블록은 원본 1~21행 가운데 지금 쓰는 줄만 모았습니다(14~17·19행은 뒤 단계에서 칩니다). 형광펜 2줄은 원본 7행의 `Typography`, 21행의 `Notice`와 `NoticeSearch`를 빼고 치므로 이 블록에는 줄 번호를 달지 않았습니다. 우리 소스의 타입 검사는 가져와 놓고 쓰지 않는 이름을 오류로 봅니다(`tsconfig.app.json`의 @@`noUnusedLocals`|noUnusedLocals@@). 그래서 가져오기 줄에는 그 단계에서 쓰는 이름만 적고, 쓰는 단계에 이르면 더합니다. 이어서 검색구분의 고를 거리와 기본 기간을 만듭니다.

```tsx src="src/screens/sample/NoticeParts.tsx:29-39" kind="이어 쓰기"
/* ---------- 1. 조회조건 ---------- */
/** 검색구분(계약 NoticeField) */
export const FIELD_OPTIONS: { value: NoticeField; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'SUBJECT', label: '제목' },
  { value: 'TEXT', label: '내용' },
  { value: 'NAME', label: '작성자' },
];

/** 기본 기간: 최근 1개월(오늘 포함) — 빠른선택 '1개월' 과 같은 계산 */
export const lastMonth = (): [Dayjs, Dayjs] => [today().subtract(1, 'month').add(1, 'day'), today()];
```

`FIELD_OPTIONS`는 검색구분 칸의 고를 거리 넷입니다. `value`는 서버로 보낼 값, `label`은 화면의 글자이고, `value`에는 [[#ch4-union]]의 `NoticeField` 네 값만 들어갑니다.

39행의 `lastMonth`는 기본 기간을 만드는 함수입니다. 반환 타입 `[Dayjs, Dayjs]`는 날짜 객체가 시작과 끝 순서로 정확히 2개 든 배열입니다. 이렇게 칸의 개수와 자리마다의 타입이 정해진 배열을 @@**튜플**|튜플@@(tuple)이라고 합니다. `today()`는 오늘을 날짜 라이브러리 dayjs의 날짜 객체로 돌려주고, 시작은 거기서 한 달을 빼고(`subtract`) 하루를 더한(`add`) 날입니다.

오늘이 11월 15일이면 10월 16일부터 11월 15일까지입니다. 상수가 아니라 함수인 것은 부를 때마다 그날 날짜로 다시 계산하기 위해서입니다.

남은 검색어 칸 `KeywordInput`은 [[#ch7-input]]에서, 조건 칸 목록 `useNoticeFields`는 [[#ch13-search]]에서 읽었습니다.

```tsx src="src/screens/sample/NoticeParts.tsx:41-61" kind="이어 쓰기"
/** 검색어 칸 — 검색구분이 '전체'면 비활성 */
const KeywordInput = ({ form, value, onChange }: ValueProps<string | undefined> & { form: FormInstance }) => {
  const field = Form.useWatch('field', form) as NoticeField | undefined;
  const off = !field || field === 'ALL';
  return <Input value={value} onChange={(e) => onChange?.(e.target.value)} disabled={off} allowClear placeholder={off ? '검색구분을 고르세요' : '검색어'} aria-label="검색어" />;
};

/** 조회조건: 작성일(최근 1개월, 최대 366일) · 사무소(기본 내 사무소, 비우면 전체) · 작성자 · 검색구분+검색어 */
export const useNoticeFields = (): SearchField[] => {
  const myOfc = useAuthStore(selectOfficeCd);
  return useMemo(
    () => [
      rangeField({ name: 'period', label: '작성일', maxDays: 366, defaultValue: lastMonth() }),
      officeField({ required: false, defaultValue: myOfc || undefined }),
      personField({ label: '작성자', clearOnParentChange: true }),
      { name: 'field', label: '검색구분', type: 'select', widthClass: 'code', options: FIELD_OPTIONS, defaultValue: 'ALL', allowClear: false },
      { name: 'keyword', label: '검색어', type: 'custom', widthClass: 'normal', render: (form) => <KeywordInput form={form} /> },
    ],
    [myOfc],
  );
};
```

13장에서 지나친 곳만 짚습니다. `useNoticeFields`는 커스텀 훅이고([[#ch8-custom]]), 50행은 [[#ch11]]의 셀렉터로 내 사무소 코드를 꺼냅니다. 51행의 `useMemo`는 사무소가 바뀔 때만 칸 목록을 새로 만듭니다([[#ch8-memo]]). 54행은 빈 글자까지 `undefined`로 바꾸려고 `??` 대신 `||`를 썼습니다([[#ch3-cond]]).

이제 `NoticePage.tsx`에 가져오기 2줄과 훅을 부르는 줄을 더하고 임시 줄을 바꿉니다.

```tsx title="src/screens/sample/NoticePage.tsx" kind="고치기" diff
 import { PageFrame } from '@/components/page/PageFrame';
+import { SearchForm } from '@/components/search/SearchForm';
 import type { ScreenProps } from '@/types/screen';
+import { useNoticeFields } from './NoticeParts';
 ⋮
 const NoticePage = ({ screenKey }: ScreenProps) => {
+  const fields = useNoticeFields();
   return (
 ⋮
-      <p>여기에 공지사항 화면을 만듭니다.</p>
+      <SearchForm fields={fields} onSearch={(v) => console.log(v)} />
```

`useNoticeFields`를 가져오는 줄도 원본 23행보다 이름이 적고, 훅을 부르는 줄은 `return`보다 위에 둡니다([[#ch8-rules]]). 바뀐 임시 줄은 `SearchForm`에 칸 목록을 건네고, [조회]를 누르면 폼이 건넨 값을 `console.log`로 Console 탭에 찍습니다. 서버에 묻기 전에 폼이 무엇을 건네는지 보려는 줄이고, 단계 5에서 원본 85행으로 바꿉니다.

::: warn 타입 검사가 못 잡는 실수
`NoticeParts.tsx` 53행에서 `lastMonth()`의 괄호를 빠뜨리면 날짜 둘 대신 함수가 처음 값으로 건너갑니다. `defaultValue`는 무엇이든 받는 `unknown` 타입이라 타입 검사는 조용합니다. 그런데 화면은 오류 화면이 되고, Console 탭에는 `TypeError: date4.isValid is not a function`이 찍힙니다. 검사가 조용해도 화면에서 꼭 확인합니다.
:::

::: check
- 조건 칸 5개와 [조회]가 생깁니다. 검색구분을 "제목"으로 바꾸면 꺼져 있던 검색어 칸이 켜집니다.
- <kbd>F12</kbd>로 Console 탭을 열고 지난 기록을 <kbd>Ctrl</kbd>+<kbd>L</kbd>로 지웁니다. [조회]를 누르면 `{period: Array(2), ofcCode: '100001', perNo: undefined, field: 'ALL', keyword: undefined}` 같은 줄이 찍힙니다. 사무소 코드는 사람마다 다릅니다. 공지 목록 요청은 아직 나가지 않습니다.
:::

![단계 4를 마친 화면의 본문. 작성일은 최근 한 달, 사무소는 내 사무소가 처음 값이다](img/shots/ch14-step4-search.png){width=100%}

::: step 5 조회하기
폼의 값을 서버가 받는 조회조건으로 바꾸는 함수를 만들고, [조회]가 서버에 묻게 합니다.
:::

*단계 4에서 Console에 찍힌 값과 서버가 받는 조회조건은 모양이 다릅니다.* 기간은 날짜 객체 둘이고, 서버는 `'20261016'` 같은 8자리 글자를 받습니다. [[#ch13-search]]의 그림에서 본 이 차이를 메우는 함수를 `NoticeParts.tsx`에 만듭니다. 가져오기 줄을 먼저 고칩니다.

```tsx title="src/screens/sample/NoticeParts.tsx" kind="고치기" diff
 import { personField } from '@/components/search/lookupFields';
+import { ymdRange } from '@/components/search/params';
 import { today, type Dayjs } from '@/utils/date';
+import { compactParams } from '@/utils/object';
 import type { ValueProps } from '@/types/common';
-import type { NoticeField } from '@/domain/notice';
+import type { NoticeField, NoticeSearch } from '@/domain/notice';
```

그리고 파일 맨 끝에 @@`toNoticeParams`|toNoticeParams@@를 칩니다.

```tsx src="src/screens/sample/NoticeParts.tsx:63-77" kind="이어 쓰기"
/* ---------- 2. 조건값 → API 파라미터 ---------- */
/** 검색구분이 전체(또는 검색어 없음)면 field·keyword 를 보내지 않는다. 빈 값은 빠진다 */
export const toNoticeParams = (v: Record<string, unknown>): Omit<NoticeSearch, 'page' | 'size'> => {
  const { fromDate, toDate } = ymdRange(v.period);
  const field = (v.field as NoticeField | undefined) ?? 'ALL';
  const keyword = field === 'ALL' ? undefined : ((v.keyword as string | undefined) ?? '').trim() || undefined;
  return compactParams<NoticeSearch>({
    fromDate,
    toDate,
    ofcCode: (v.ofcCode as string | undefined) || undefined,
    perNo: (v.perNo as string | undefined) || undefined,
    field: keyword ? field : undefined,
    keyword,
  });
};
```

65행은 폼의 값 `v`를 받아 `NoticeSearch`에서 `page`와 `size`를 뺀(`Omit`, [[#ch4-table]]) 모양을 돌려준다는 약속입니다. 뺀 두 칸은 `usePagedSearch`가 붙입니다. 66행의 `ymdRange`는 날짜 둘을 8자리 글자 둘로 바꿔 `{ fromDate, toDate }`로 돌려줍니다.

68행은 연산자가 여럿 겹친 줄이니 안쪽부터 읽습니다. 검색어가 없으면 `?? ''`가 빈 글자로 바꾸고, `.trim()`이 앞뒤 빈칸을 떼고, `|| undefined`가 빈 글자를 `undefined`로 바꿉니다. 맨 앞의 삼항 연산자는 검색구분이 "전체"면 검색어가 무엇이든 `undefined`를 고릅니다. 74행은 검색어가 없으면 검색구분도 빼고, 72·73행은 빈 글자를 거르며, 69행의 `compactParams`가 `undefined`인 칸을 뺍니다([[#ch12-endpoints]]).

화면 본체에 가져오기 5줄을 더하고, `./NoticeParts` 줄에 이름을 하나 더합니다.

```tsx title="src/screens/sample/NoticePage.tsx" kind="고치기" diff
+import { Form } from 'antd';
+import { noticeApi, noticeKeys } from '@/api/endpoints/notice';
+import { usePagedSearch } from '@/hooks/usePagedSearch';
 import { PageFrame } from '@/components/page/PageFrame';
 import { SearchForm } from '@/components/search/SearchForm';
+import { ActionBar, type ActionItem } from '@/components/auth/ActionBar';
+import type { Notice, NoticeSearch } from '@/domain/notice';
 import type { ScreenProps } from '@/types/screen';
-import { useNoticeFields } from './NoticeParts';
+import { toNoticeParams, useNoticeFields } from './NoticeParts';
```

컴포넌트 안에는 세 군데에 넣습니다. 34행은 컴포넌트 첫 줄 바로 아래, 41행은 단계 4의 `const fields …` 줄 아래, 61~75행은 `return (` 바로 위입니다.

```tsx src="src/screens/sample/NoticePage.tsx:34-75" kind="이어 쓰기"
  const [form] = Form.useForm();
  // …
  const search = usePagedSearch<NoticeSearch, Notice>({ key: noticeKeys.list, fetch: noticeApi.list });
  // …
  const onSearch = (v: Record<string, unknown>) => {
  // …
    search.search(toNoticeParams(v));
  };
  // …
  const actions: ActionItem[] = [
    { key: 'search', onClick: () => form.submit(), loading: search.loading },
  // …
  ];
```

34행은 폼을 바깥에서 다루는 손잡이 `form`을 받습니다([[#ch7-input]]). 41행은 [[#ch12-paged]]에서 읽은 줄로, `noticeKeys.list`와 `noticeApi.list`를 괄호 없이 건네 부르는 일을 훅에 맡깁니다.

61~64행의 `onSearch`는 폼의 값을 `toNoticeParams`로 바꿔 `search.search`에 넘기고, 62행 자리는 단계 9에서 채웁니다. 68~75행은 제목 줄의 버튼 목록으로([[#ch13-frame]]) 지금은 [조회] 하나입니다. 69행을 `onClick: form.submit()`으로 치면 [[#ch7-event]]의 그 실수가 되어, 누르기도 전에 조회가 돌다 리액트가 오류를 내며 멈춥니다. 다행히 이 실수는 타입 검사가 `error TS2322`로 먼저 알려 줍니다.

끝으로 `PageFrame`에 props 4개를 더하고, 임시 줄을 원본 85행으로 바꿉니다.

```tsx title="src/screens/sample/NoticePage.tsx" kind="고치기" diff
     <PageFrame
       screenKey={screenKey}
+      lastUpdated={search.lastUpdated}
+      onRefresh={() => void search.refetch()}
+      refreshing={search.loading}
+      extra={<ActionBar screenKey={screenKey} size="small" hotkeys actions={actions} />}
     >
-      <SearchForm fields={fields} onSearch={(v) => console.log(v)} />
+      <SearchForm form={form} fields={fields} onSearch={onSearch} loading={search.loading} onReset={search.reset} />
     </PageFrame>
```

더한 4줄(원본 80~83행) 가운데 `lastUpdated`는 "조회 전"이나 "마지막 업데이트"를 그리고, `onRefresh`를 건네면 ↻가 생깁니다. `void`는 `refetch`가 돌려주는 값을 쓰지 않는다는 표시입니다. `extra`의 `ActionBar`는 `actions`를 버튼으로 그립니다. 바꾼 `SearchForm` 줄이 34행의 손잡이를 건네서, 조회조건 칸 옆의 [조회]와 제목 줄의 [조회]가 같은 폼을 제출합니다. 이제 임시 줄은 없고, 이름을 덜 적은 가져오기 줄 3개를 빼면 지금까지 친 줄은 모두 원본의 줄입니다.

::: check
- 제목 줄 오른쪽에 "조회 전", ↻, [조회]가 생기고, [조회]를 누르면 "마지막 업데이트 : 0초 전"이 됩니다. 목록을 그릴 표는 아직 없습니다.
- Network 탭에 `notice?fromDate=…&toDate=…&ofcCode=…&page=1&size=20` 줄이 생깁니다.
- 조건을 그대로 두고 [조회]를 곧바로 또 누르면 줄이 늘지 않습니다([[#ch12-paged]]의 캐시). 조건을 바꾼 뒤 조건 칸에서 <kbd>Enter</kbd>나 <kbd>Ctrl</kbd>+<kbd>Enter</kbd>를 눌러도 같은 모양의 요청이 나갑니다. ↻는 누를 때마다 다시 읽습니다.
:::

![단계 5를 마친 제목 줄의 오른쪽. [조회]를 누르자 "마지막 업데이트"가 떴다](img/shots/ch14-step5-title.png){width=36%}
