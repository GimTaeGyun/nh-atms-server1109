# 타입스크립트, 값에 이름표 붙이기

::: lead
3장에서 값에 이름을 붙였다면, 타입스크립트는 그 이름 옆에 "여기에는 숫자만" 같은 이름표를 하나 더 붙여 실행하기 전에 틀린 값을 찾아 줍니다. 이 장을 마치면 우리 소스의 콜론과 꺾쇠를 읽고, 공지사항의 자료 모양을 적은 파일 하나를 끝까지 읽습니다.
:::

::: goals
- 타입이 왜 필요하고 타입 검사가 언제 일어나는지 설명할 수 있다
- 변수와 함수에 붙은 타입 표기를 읽을 수 있다
- `interface`, 유니온 타입, 제네릭 `<T>`를 읽을 수 있다
- `src/domain/notice.ts`를 처음부터 끝까지 읽을 수 있다
:::

::: files
- `src/stores/useSettingsStore.ts`
- `src/utils/format.ts`
- `src/domain/notice.ts`
- `src/types/api.ts`
- `src/components/display/StatusTag.tsx`
- `src/utils/math.ts`
:::

[[#ch3]]에서 우리 소스를 읽을 때 콜론 뒤는 건너뛰라고 했습니다. `: string`, `: number` 같은 글자입니다. 우리 소스에는 `: string`만 700번 넘게 나옵니다. 자바스크립트 문법도 아닌 글자를 왜 이렇게 열심히 적어 두었을까요?

## 타입이 왜 필요할까 {#ch4-why}

공지사항에는 조회수가 있고, 누가 글을 열면 1을 더합니다. 자바스크립트로는 한 줄입니다.

```js title="예제 4-1 조회수에 1 더하기"
const addVisit = (visit) => visit + 1;

addVisit(7);    // 8
addVisit('7');  // '71'
```

숫자 7 대신 문자열 `'7'`이 들어오자 자바스크립트는 글자를 이어 붙여 `'71'`을 만들었습니다. 오류도 내지 않아서 조회수 71이 그대로 화면까지 갑니다. 틀린 줄은 실행해 본 뒤에야 드러납니다.

은행의 출금 전표는 칸마다 적을 것이 정해져 있습니다. 계좌번호 칸에 이름을 적어 내면 창구에서 바로 돌려줍니다. **@@타입@@**(type)이 이 칸의 약속입니다. 칸마다 붙은 "숫자만" 같은 이름표, 곧 값의 종류를 정한 것입니다. @@|타입스크립트@@타입스크립트(TypeScript)는 자바스크립트에 타입을 적는 문법을 더한 말입니다.

같은 코드를 `.ts` 파일에 적고 첫 줄의 `(visit)`을 `(visit: number)`로 고치면 `visit` 자리에는 숫자만 받는다는 약속이 됩니다. 그러면 VS Code가 `addVisit('7')`의 `'7'` 아래에 빨간 줄을 긋습니다. 마우스를 올리면 `Argument of type 'string' is not assignable to parameter of type 'number'.`라고 알립니다. 문자열은 숫자 자리에 넣을 수 없다는 말이고, 한국어 VS Code에서는 이 설명도 한국어로 나옵니다. *타입스크립트는 실행하기 전에, 코드를 쓰는 자리에서 틀린 값을 알려 줍니다.*

타입스크립트 파일은 이름이 `.ts`로 끝나고, [[#ch5]]의 JSX가 든 파일은 `.tsx`로 끝납니다. 브라우저는 타입스크립트를 몰라서 [[#ch1]]의 Vite가 타입 표기를 지워 자바스크립트로 바꿉니다. 검사는 하지 않아서 타입이 틀려도 화면은 뜹니다. @@|타입 검사@@타입 검사는 VS Code와 @@|npm run typecheck@@`npm run typecheck` 명령이 맡습니다.

::: try 빨간 줄 만나 보기
1. <kbd>Ctrl</kbd>+<kbd>P</kbd>를 누르고 `useSettingsStore`를 쳐서 파일을 엽니다. 편집기 왼쪽의 숫자가 줄 번호입니다. 21행의 `pageSize: 20`은 표 한 쪽에 20건씩 보여 주는 설정입니다.
2. `20`을 `'20'`으로 고치면 저장하기도 전에 `pageSize` 아래에 빨간 줄이 생깁니다. 저장합니다.
3. 개발 서버가 도는 터미널은 그대로 두고 [터미널] → [새 터미널]로 하나 더 열어 `npm run typecheck`를 실행합니다. `src/stores/useSettingsStore.ts:21:76 - error TS2322: Type 'string' is not assignable to type 'number'.`가 찍힙니다. `21:76`은 21행 76번째 글자입니다.
4. <kbd>Ctrl</kbd>+<kbd>Z</kbd>로 되돌려 저장하고 다시 실행합니다. `error` 줄 없이 끝나면 통과입니다.
:::

## 기본 타입 표기 {#ch4-basic}

타입은 이름 뒤에 콜론을 찍고 적습니다. `const office: string = '가람지점'`은 `office`에 문자열을 담는다는 뜻이고, 이렇게 적는 것을 **@@타입 표기@@**(type annotation)라고 합니다. 흔한 타입은 문자열 `string`, 숫자 `number`, 참거짓 `boolean`입니다. `number[]`는 숫자만 담는 배열입니다.

함수에는 타입을 적는 자리가 2군데입니다. 초를 "분:초" 글자로 바꾸는 함수를 봅니다.

```ts src="src/utils/format.ts:100-104" hl="2"
/** 초 → 'mm:ss' */
export const fmtMmSs = (totalSec: number): string => {
  const s = Math.max(0, Math.floor(totalSec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
```

101행의 괄호 안 `totalSec: number`는 숫자를 받는다는 뜻이고, 괄호 뒤의 `: string`은 문자열을 돌려준다는 뜻입니다. `fmtMmSs(125)`는 `'02:05'`를 돌려줍니다. 102~103행의 계산은 지금 읽지 않아도 됩니다. *괄호 안의 콜론은 받는 값의 타입, 괄호 뒤의 콜론은 돌려주는 값의 타입입니다.*

모든 이름에 타입을 적지는 않습니다. `let waiting = 7`처럼 처음 넣는 값으로 알 수 있을 때는 타입스크립트가 짐작하고, `waiting`에 마우스를 올리면 `number`가 보입니다. 이것을 **@@타입 추론@@**(type inference)이라고 합니다. 우리 소스는 변수의 타입은 대개 추론에 맡기고 함수의 매개변수에는 꼭 적습니다. 다만 `rows.map((r) => …)`의 `r`은 `map`이 타입을 알므로 적지 않습니다.

## 객체의 모양, interface와 type {#ch4-interface}

[[#ch3]]에서 객체를 전표 한 장에 견주었습니다. 아직 아무것도 적지 않은 전표 양식에 해당하는 것이 **@@인터페이스@@**(interface)입니다. 객체에 어떤 속성이 있고 속성마다 타입이 무엇인지 적어 이름을 붙입니다. 공지사항의 타입을 모아 둔 `src/domain/notice.ts`의 끝부분(39~57행)을 봅니다.

```ts src="src/domain/notice.ts:39-57" hl="8"
/** `POST /api/notice`, `PUT /api/notice/{no}` 본문 */
export interface NoticeSave {
  /** 필수, 200바이트 이내 */
  subject: string;
  /** 필수, 4000바이트 이내 */
  text: string;
  /** 6자리 */
  ofcCode?: string;
}

/** `POST /api/notice/delete` 본문 (1~100건) */
export interface NoticeDeleteRequest {
  nos: number[];
}

/** `POST /api/notice/delete` 응답 */
export interface NoticeDeleteResult {
  count: number;
}
```

`interface` 뒤가 양식의 이름이고 중괄호 안이 칸이며, 칸 끝에는 쉼표 대신 세미콜론을 찍습니다. @@`NoticeSave`|NoticeSave@@는 공지를 등록하거나 고칠 때 서버에 보내는 양식이고, 제목 `subject`와 내용 `text`는 꼭 있어야 합니다. 46행의 사무소 코드 `ofcCode?`처럼 이름 뒤에 물음표가 붙은 칸은 없어도 되는 **@@선택 속성@@**(optional property)입니다. 아래 두 양식은 삭제용으로, 번호 배열 `nos`를 보내면 지운 건수 `count`가 옵니다. 주석의 `POST`·`PUT`은 요청의 방식([[#ch12]])이고, 본문은 요청에 실은 자료입니다.

타입에 이름을 붙이는 낱말에는 `type`도 있는데, 우리 소스는 객체의 모양에는 대개 `interface`를, 그 밖의 타입에는 `type`을 씁니다. 양식을 붙인 객체는 타입스크립트가 칸마다 맞춰 봅니다.

```ts title="예제 4-2 양식에 맞는 객체와 맞지 않는 객체"
const a: NoticeSave = { subject: '점검 안내', text: '새벽 2시 점검' };
const b: NoticeSave = { subject: '점검 안내' };
const c: NoticeSave = { subject: '점검 안내', text: '새벽 2시 점검', ofcCod: '100001' };
```

`a`는 통과하고, `b`에는 `text`가 빠졌다는 빨간 줄이 그어집니다. `c`는 `ofcCode`의 끝 글자를 빠뜨렸는데, 타입스크립트는 그런 칸이 없다면서 `Did you mean to write 'ofcCode'?`라고 되묻습니다. [[#ch4-why]] 해 보기의 오류도 `useSettingsStore.ts` 11행의 칸 `pageSize: number;` 때문입니다.

## 정해진 값만, 유니온 타입 {#ch4-union}

`string`은 너무 넓을 때가 있습니다. 상태를 알리는 알약 모양 부품은 색이 다섯 가지뿐인데, `string`으로 받으면 `'sucess'` 같은 오타도 통과합니다. 그래서 받을 값을 모두 늘어놓았습니다.

```ts src="src/components/display/StatusTag.tsx:4"
export type Tone = 'success' | 'danger' | 'warning' | 'info' | 'neutral';
```

세로 막대 `|`(<kbd>Shift</kbd>+<kbd>₩</kbd>)는 "또는"으로 읽습니다. 타입을 `|`로 이은 것이 **@@유니온 타입@@**(union type)입니다. 따옴표로 감싼 값 하나도 타입이라서 `Tone`은 5개 값만 받습니다. `const t: Tone = 'sucess'`에는 빨간 줄이 그어지고, `= '`까지 치면 5개 값이 목록에 뜹니다.

값이 없을 수도 있다는 것도 유니온 타입으로 적습니다. 서버는 값이 없는 칸을 `null`로 보내므로, 공지 한 건 `Notice`([[#ch4-notice]])의 제목은 `subject: string | null`입니다.

```ts title="예제 4-3 null일 수도 있는 값"
const len1 = (n: Notice) => n.subject.length;
const len2 = (n: Notice) => n.subject?.length ?? 0;
```

첫 줄에서는 VS Code가 `'n.subject' is possibly 'null'`이라고 알립니다. [[#ch3]]에서 배운 `?.`과 `??`로 `null`일 때의 값을 정해 준 둘째 줄은 통과합니다. 우리 소스에 `?.`과 `??`가 많은 까닭입니다.

::: warn 물음표와 `| null`은 다르다
`ofcCode?: string`은 칸이 아예 없어도 된다는 뜻이고, `subject: string | null`은 칸은 꼭 있되 값이 비어 있을 수 있다는 뜻입니다. [[#ch3]]에서 읽은 `maskName`의 `(v?: string | null)`은 둘을 함께 썼습니다. 인자를 넘기지 않아도 되고, 넘긴 값이 `null`이어도 됩니다.
:::

## 타입을 나중에 정하기, 제네릭 {#ch4-generic}

목록을 조회하면 서버는 한 쪽의 행에 전체 건수와 쪽 번호를 묶어 보냅니다. 공지든 기기정보든 묶음의 모양은 같고 행의 타입만 다릅니다. 그래서 행을 담는 칸의 타입까지 비운 양식을 만들었습니다.

```ts src="src/types/api.ts:11-19" hl="2,3"
/** 페이징 결과 (atms-common PageResult) */
export interface PageResult<T> {
  content: T[];
  totalCount: number;
  /** 1-based */
  page: number;
  size: number;
  totalPages: number;
}
```

12행의 꺾쇠 `<T>`가 빈칸이고 `T`는 나중에 정할 타입의 임시 이름이며, 13행의 `content: T[]`가 그 빈칸을 씁니다. 타입에 빈칸을 뚫어 두는 이 문법이 **@@제네릭@@**(generic)입니다.@@|PageResult@@ 빈칸은 쓰는 쪽이 채워서, 아래 그림처럼 `PageResult<Notice>`라고 쓰면 `content`는 `Notice[]`가 됩니다. 15행의 `1-based`는 쪽 번호를 1부터 센다는 메모이고, 2~9행의 `ApiResponse<T>`는 [[#ch12]]에서 읽습니다.

![`PageResult<T>`의 빈칸 `T`에 타입을 넣으면 목록마다 맞는 양식이 된다](img/ch04-generic.svg){width=100%}

우리 소스에서는 빈칸을 채워 쓰는 꺾쇠를 더 자주 만납니다. [[#ch7]]의 `useState<number[]>([])`는 "숫자 배열을 기억한다", [[#ch12]]의 `api.get<Notice>(…)`는 "`Notice`를 받아 온다"로 읽습니다. *양식을 만드는 쪽의 꺾쇠는 빈칸이고, 쓰는 쪽의 꺾쇠는 그 빈칸을 채우는 타입입니다.* 함수에도 빈칸이 있습니다.

```ts src="src/utils/math.ts:1-2"
/** 합계 (null/undefined 는 0) */
export const sumBy = <T,>(rows: T[], pick: (r: T) => number | null | undefined): number => rows.reduce((acc, r) => acc + (pick(r) ?? 0), 0);
```

`<T,>`가 빈칸이고 쉼표는 무시해도 됩니다. `rows`는 `T`의 배열이고, `pick`은 `T` 하나를 받아 숫자나 `null`, `undefined`를 돌려주는 함수입니다. `=>` 바로 앞의 `: number`는 합계의 타입이고, 그 뒤의 `reduce` 계산은 읽지 않아도 됩니다. 공지 배열 `notices`의 조회수 합을 `sumBy(notices, (n) => n.visit)`으로 구하면 빈칸 `T`가 `Notice`로 채워집니다. 이런 함수는 읽을 줄만 알면 됩니다.

## 자주 만나는 표기 읽는 법 {#ch4-table}

소스에는 낯선 타입 표기가 더 나옵니다.@@|as@@@@|satisfies@@@@|Record@@ 만나면 아래 표에서 뜻을 찾고, 파일은 <kbd>Ctrl</kbd>+<kbd>P</kbd>로 엽니다.

표: 우리 소스에서 자주 만나는 타입 표기

| 표기 | 읽는 법 | 우리 소스의 예 |
|---|---|---|
| `값 as 타입` | 이 값은 이 타입이라고 내가 보증한다 | `NoticeParts.tsx` 43행 |
| `as const` | 바뀌지 않는 값이니 값 그대로를 타입으로 | `constants.ts` 2행 |
| `satisfies` | 값이 이 타입에 맞는지 검사만 한다 | `NoticeEditModal.tsx` 29행 |
| `값!` | `null`도 `undefined`도 아니라고 보증한다 | `main.tsx` 7행 |
| `Record<K, V>` | 속성 이름이 `K`, 값이 `V`인 객체 | `StatusTag.tsx` 6행 |
| `Omit<T, K>` | 양식 `T`에서 `K` 칸을 뺀 양식 | `NoticeParts.tsx` 65행 |
| `Partial<T>` | `T`의 모든 칸을 선택 속성으로 바꾼 양식 | `useSettingsStore.ts` 17행 |
| `import type` | 타입만 가져온다. 실행할 때는 사라진다 | `StatusTag.tsx` 1행 |
| `keyof typeof` | 그 객체의 속성 이름 가운데 하나 | `screenIds.ts` 27행 |

::: warn 보증은 검사를 떠맡는 일이다
`as`와 `!`는 타입스크립트가 할 검사를 사람이 떠맡는 표기입니다. 틀리게 보증하면 빨간 줄 없이 지나갔다가 실행 중에 오류가 나거나 틀린 값이 화면까지 갑니다. 검사를 통째로 끄는 타입 @@|any@@`any`는 우리 소스에서 금지입니다.
:::

## domain/notice.ts 읽기 {#ch4-notice}

`src/domain/notice.ts`는 공지사항 화면과 서버가 주고받는 자료의 모양을 적은 57줄짜리 파일이고, [[#ch14]]에서 빈 화면 다음에 치는 파일입니다. 타입만 6개 있습니다. 서버로 보내는 양식은 `NoticeSearch`(조회조건), `NoticeSave`(등록·수정), `NoticeDeleteRequest`(삭제)입니다. 받는 양식은 `Notice`(공지 한 건)와 `NoticeDeleteResult`(삭제 결과)이고, 나머지 하나가 검색구분 `NoticeField`입니다. 끝의 세 양식은 [[#ch4-interface]]에서 읽었습니다.

```ts src="src/domain/notice.ts:1-8"
/**
 * 공지사항 견본(`sample.notice`, TB_NOTICE) 타입 — API 계약 §3 과 글자 하나까지 같다.
 * 필드 = 정본 컬럼 camelCase. `wrtDate` 는 DB DATE 를 서버가 'YYYYMMDD' 문자열로 내린다.
 */
import type { Audit, PageParams } from '@/types/api';

/** 검색구분 */
export type NoticeField = 'ALL' | 'SUBJECT' | 'TEXT' | 'NAME';
```

1~4행은 주석입니다. 이 파일이 백엔드와 맞춘 약속 문서(API 계약)의 3절과 글자 하나까지 같다고 적어 두었습니다. 타입은 실행하면 사라지므로 서버가 모양을 바꿔도 타입스크립트는 모릅니다. 문서와 맞추는 일은 사람이 챙깁니다. `sample.notice`는 화면키([[#ch10]]), `TB_`로 시작하는 말은 데이터베이스(DB) 표 이름입니다.

3행은 칸 이름을 DB 컬럼 이름에서 따왔다는 메모입니다. @@|camelCase@@camelCase는 낱말을 붙여 쓰되 둘째 낱말부터 첫 글자를 대문자로 쓰는 표기법으로, 컬럼 `OFC_CODE`가 칸 `ofcCode`가 됩니다. 5행은 다른 파일의 양식 둘을 타입으로만 가져오고, 8행은 검색구분 칸에서 고르는 전체, 제목, 내용, 작성자입니다.

```ts src="src/domain/notice.ts:10-20"
/** `GET /api/notice` 조회조건 */
export interface NoticeSearch extends PageParams {
  /** 작성일 시작 YYYYMMDD */
  fromDate?: string;
  /** 작성일 끝 YYYYMMDD */
  toDate?: string;
  ofcCode?: string;
  perNo?: string;
  field?: NoticeField;
  keyword?: string;
}
```

[조회]를 누르면 `GET` 요청으로 보내는 조회조건 양식입니다. 11행의 @@|extends@@`extends`는 물려받기입니다. `src/types/api.ts` 22~27행 `PageParams`의 3칸 `page`, `size`, `sort`를 물려받고 6칸을 더합니다. 모두 선택 속성이라 안 쓰는 조건은 빼고 보냅니다. 마지막은 표의 한 행인 공지 한 건, @@|Notice@@`Notice`입니다.

![공지사항 표의 컬럼과 `Notice`의 칸. 표의 한 행이 `Notice` 하나다](img/ch04-notice-row.svg){width=100%}

```ts src="src/domain/notice.ts:22-37"
/** 공지 1건 — 목록 응답에서는 text 가 null */
export interface Notice extends Audit {
  no: number;
  ofcCode: string | null;
  /** 사무소명(TB_OFC_REG_MGT.KANM) */
  kanm: string | null;
  subject: string | null;
  text: string | null;
  /** 조회수 */
  visit: number | null;
  /** 작성자 성명 */
  name: string | null;
  perNo: string | null;
  /** 작성일 YYYYMMDD */
  wrtDate: string | null;
}
```

실제 화면의 맨 앞에 있는 순번은 화면이 세는 번호라 `Notice`에 없고, 내용 `text`와 작성자의 개인번호 `perNo`는 표에 없는 칸입니다. `no`만 반드시 숫자이고 나머지 8칸은 비어 있어도 됩니다. 작성일은 서버가 `'20261115'`처럼 보내고 화면이 `2026-11-15`로 바꿔 그립니다. 23행에서 물려받는 `Audit`은 `src/types/api.ts`에 있는 4칸짜리 양식입니다. 만든 일시와 사람이 `crtDtm`·`crtCmeno`, 마지막으로 고친 일시와 사람이 `lschgDtm`·`lsCmeno`입니다.

::: summary
- 타입은 값의 종류다. 타입스크립트는 실행하기 전에 틀린 값을 빨간 줄과 `npm run typecheck`로 알려 준다.
- 타입은 이름 뒤에 콜론으로 적는다. 함수에서는 괄호 안이 받는 값, 괄호 뒤가 돌려주는 값의 타입이다.
- `interface`는 객체의 모양이다. `?`는 없어도 되는 칸, `extends`는 다른 양식의 칸 물려받기다.
- `A | B`는 A 또는 B다. 정해진 값만 받게 하거나, `| null`로 값이 없을 수 있음을 적는다.
- 꺾쇠 `<T>`는 타입의 빈칸이다. `PageResult<Notice>`처럼 쓰는 쪽이 채운다.
:::

::: quiz
1. `const s: NoticeSave = { subject: '휴무 안내', ofcCode: '100001' };`에 빨간 줄이 그어지는 까닭은?
2. 공지 `n`의 조회수에 1을 더하는 `n.visit + 1`에도 빨간 줄이 그어집니다. 3장의 연산자로 고쳐 보세요.
3. 공지 목록의 응답 타입은 `PageResult<Notice>`입니다. 이 응답의 `content[0].subject`는 어떤 타입일까요?
:::
::: answer
1. 반드시 있어야 하는 `text` 칸이 빠졌다(`ofcCode`는 선택 속성이라 문제가 아니다).
2. `visit`이 `number | null`이기 때문이다. `(n.visit ?? 0) + 1`로 고친다.
3. `string | null`이다. `content[0]`이 `Notice` 하나이기 때문이다.
:::
