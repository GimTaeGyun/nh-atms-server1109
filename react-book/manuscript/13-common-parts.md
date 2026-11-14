# 공통 부품으로 화면 조립하기

::: lead
조회 화면을 이루는 틀, 버튼줄, 조회조건, 표, 팝업은 이미 만들어져 있습니다. 이 장에서는 그 공통 부품의 이름과 맡은 일, 건네는 값을 하나씩 익힙니다. 읽고 나면 공지사항 화면의 소스에서 어느 줄이 화면의 어느 조각이 되는지 짚을 수 있습니다.
:::

::: goals
- 조회 화면의 뼈대를 이루는 부품 다섯 개의 이름과 자리를 말할 수 있다
- 버튼줄, 조회조건, 표를 설정 배열로 적는 방식을 읽을 수 있다
- 조회조건에 넣은 값이 서버로 갈 조건이 되는 길을 설명할 수 있다
- 입력 검사 규칙, 포맷 함수, 화면 문구가 어느 파일에 있는지 찾을 수 있다
:::

::: files
- `src/screens/sample/NoticePage.tsx`
- `src/screens/sample/NoticeParts.tsx`
- `src/components/auth/ActionBar.tsx`
- `src/components/grid/columns.tsx`
- `src/screens/popup/NoticeEditModal.tsx`
- `src/utils/format.ts`
:::

`NoticePage.tsx`는 129줄입니다. 이 파일이 그리는 화면에는 버튼 여섯 개, 조회조건 다섯 칸, 일곱 열짜리 표, 쪽 번호 줄이 있습니다. 그런데 권한이 없을 때 버튼을 흐리게 하는 코드도, 쪽 번호를 그리는 코드도 이 파일에는 없습니다.

은행 창구의 서식함에는 입금 전표와 출금 전표가 미리 인쇄되어 꽂혀 있습니다. 손님은 줄을 긋거나 칸을 나누지 않고 빈칸만 채웁니다. 우리 소스의 @@공통 부품@@이 이 전표 양식입니다. 공통 부품은 여러 화면이 함께 쓰려고 `src/components` 폴더에 만들어 둔 컴포넌트입니다. 화면은 빈칸에 해당하는 props만 채웁니다. 이 장에서는 14장에서 쓸 양식을 한 장씩 꺼내 빈칸의 이름을 익힙니다.

## 조회 화면의 표준 뼈대 {#ch13-skeleton}

업무 화면은 대부분 조건을 넣고 [조회]를 눌러 표로 결과를 보는 화면입니다. 하는 일이 같으니 뼈대도 같습니다. 아래 그림은 공지사항 화면의 본문에 부품의 경계를 그린 것입니다. 번호 다섯 개가 부품 다섯 개이고, 화면 소스의 `return` 안에도 같은 부품이 같은 순서로 적혀 있습니다.

![조회 화면의 뼈대. ① `PageFrame` ② `ActionBar` ③ `SearchForm` ④ `ResultHeader` ⑤ `DataGrid`](img/shots/ch13-skeleton.png){width=100%}

```tsx src="src/screens/sample/NoticePage.tsx:78-99" marks="1=①;6=②;8=③;9=④;12=⑤"
    <PageFrame
      screenKey={screenKey}
      lastUpdated={search.lastUpdated}
      onRefresh={() => void search.refetch()}
      refreshing={search.loading}
      extra={<ActionBar screenKey={screenKey} size="small" hotkeys actions={actions} />}
    >
      <SearchForm form={form} fields={fields} onSearch={onSearch} loading={search.loading} onReset={search.reset} />
      <ResultHeader title="공지 목록" total={search.searched ? search.total : undefined} selected={selected.length} note={search.searched ? '제목 클릭·행 더블클릭 = 상세(조회수 +1), 체크 = 수정(1건)·삭제(여러 건) 대상' : undefined}>
        <ExcelButton onClick={excel} disabled={!search.rows.length} />
      </ResultHeader>
      <DataGrid<Notice>
        // …
      />
```

①의 `PageFrame`은 78행에서 열려 125행에서 닫히고, 나머지는 그 태그 사이에 있습니다. [[#ch6]]에서 배운 `children`입니다. ②의 `ActionBar`만 83행의 `extra`라는 props에 실려 제목 줄 오른쪽 끝에 놓입니다. ③ 조회조건, ④ 건수 줄, ⑤ 표는 적힌 순서대로 위에서 아래로 쌓입니다. *조회 화면은 `PageFrame` 안에 `SearchForm`, `ResultHeader`, `DataGrid`를 차례로 쌓아 만듭니다.* 견본의 기기정보 화면과 기기모델코드 화면도 같은 순서입니다.

다섯 부품의 파일을 열어 보면 `Table`, `Form`, `Button` 같은 이름이 나옵니다. [[#ch1]]에서 소개한 @@**antd**|antd@@(Ant Design)의 부품입니다. antd는 버튼, 입력 칸, 표, 팝업처럼 업무 화면에 늘 필요한 부품을 모아 둔 라이브러리입니다. 전표에 견주면 antd는 인쇄소에서 받아 온 빈 용지이고, 공통 부품은 그 위에 우리 지점의 칸을 찍은 양식입니다. `DataGrid`는 antd의 `Table`에 쪽 번호 줄을, `ActionBar`는 antd의 `Button`에 권한 검사를 붙였습니다.

부품이 움직이는 모습은 메뉴의 [견본] 아래 @@[공통 모듈] 화면|공통 모듈 화면@@에서 봅니다. 여섯 탭에 부품이 카드로 놓여 있고, 카드마다 [코드 보기]를 누르면 그 부품을 쓰는 코드가 펼쳐집니다.

## 틀과 버튼, PageFrame과 ActionBar {#ch13-frame}

@@`PageFrame`|PageFrame@@은 화면의 맨 바깥 틀입니다. 경로 표시("견본 > 공지사항"), 제목, 즐겨찾기 별을 그리고 그 아래에 `children`을 놓습니다. 제목과 경로는 79행의 `screenKey`로 [[#ch10]]의 등록부와 메뉴에서 찾아옵니다. 80~82행은 제목 줄의 "마지막 업데이트 : 30초 전"과 ↻ 버튼에 쓸 값이고, 모두 [[#ch12]]의 `search`에서 나왔습니다. 화면은 훅이 준 값을 부품의 빈칸에 옮겨 적었을 뿐입니다.

버튼줄 @@`ActionBar`|ActionBar@@에는 버튼 태그를 건네지 않습니다. 어떤 버튼을 놓을지 적은 배열을 건넵니다.

```tsx src="src/screens/sample/NoticePage.tsx:68-75"
  const actions: ActionItem[] = [
    { key: 'search', onClick: () => form.submit(), loading: search.loading },
    { key: 'excel', onClick: excel, disabled: !search.rows.length },
    { key: 'print', onClick: () => print(), disabled: !search.searched },
    { key: 'create', onClick: () => setEdit({ open: true, no: null }) },
    { key: 'update', onClick: () => setEdit({ open: true, no: selected[0] }), disabled: selected.length !== 1 },
    { key: 'delete', onClick: onDelete, disabled: !selected.length, loading: remove.isPending, confirm: CMSG.deleteSelected(selected.length) },
  ];
```

객체 하나가 버튼 하나입니다. [[#ch7]]에서 읽은 72~73행도 이 배열의 두 줄이었습니다. `key`는 버튼의 종류, `onClick`은 눌렸을 때 할 일입니다. `disabled`가 `true`면 버튼이 꺼집니다. 73행의 [수정]은 체크한 공지가 한 건일 때만 켜집니다. `loading`이 `true`인 동안에는 버튼에 빙글빙글 도는 표시가 붙습니다.

"조회"라는 글자도 돋보기 아이콘도 이 배열에는 없습니다. `ActionBar`가 `key`를 보고 자기 파일의 표에서 찾아옵니다.

```tsx src="src/components/auth/ActionBar.tsx:40-53"
export const ACTION_DEFS: Record<ActionKey, ActionDef> = {
  search: { label: '조회', icon: <SearchOutlined />, need: 'qry', type: 'primary' },
  // …
  update: { label: '수정', icon: <EditOutlined />, need: 'upd' },
  delete: { label: '삭제', icon: <DeleteOutlined />, need: 'del', danger: true, confirm: CMSG.delete },
  // …
};
```

@@`ACTION_DEFS`|ACTION_DEFS@@에는 표준 버튼 12종이 적혀 있습니다. 종류마다 라벨과 아이콘, 그리고 필요한 권한 `need`가 있습니다. `'qry'`는 조회, `'upd'`는 수정, `'del'`은 삭제입니다. `ActionBar`는 83행에서 받은 `screenKey`로 [[#ch11]]의 권한을 묻고, `need`를 채우지 못한 버튼을 흐리게 그립니다. 화면 소스에는 권한을 따지는 줄이 없습니다. 48행의 `confirm`은 누르면 한 번 되묻는 확인 풍선의 문구이고, 화면의 74행은 이것을 건수가 든 문구로 바꿔 건넸습니다.

5장의 `CARDS`처럼 그릴 것을 자료로 적었습니다. 부품에 건네는 이런 배열을 이 장에서는 @@**설정 배열**|설정 배열@@이라고 부르겠습니다. *화면은 무엇을 놓을지만 적고, 어떻게 그릴지는 부품이 정합니다.*

::: try 한 줄로 버튼 하나 더 놓기
`NoticePage.tsx` 74행 아래에 `{ key: 'report' },` 한 줄을 넣고 저장하세요. 버튼줄 끝에 문서 아이콘이 달린 [보고서] 버튼이 생깁니다. 글자도 아이콘도 적지 않았는데 `ACTION_DEFS`가 채워 주었습니다. `onClick`을 주지 않아서 눌러도 아무 일이 없습니다. 확인했으면 <kbd>Ctrl</kbd>+<kbd>Z</kbd>로 되돌립니다.
:::

## 조회조건, SearchForm {#ch13-search}

조회조건 다섯 칸을 손으로 그리려면 칸마다 라벨, 입력 칸, 처음 값, 필수 검사를 적어야 합니다. @@`SearchForm`|SearchForm@@은 이것도 설정 배열로 받습니다. 배열의 이름은 `fields`이고 객체 하나가 조건 칸 하나입니다.

```tsx src="src/screens/sample/NoticeParts.tsx:49-61" hl="5-7"
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

56행은 조건 칸을 객체로 직접 적었습니다. `name`은 값에 붙일 이름, `label`은 화면에 보일 글자, `type`은 칸의 종류입니다. `'select'`는 목록에서 하나를 고르는 칸이고, 고를 거리는 `options`에, 처음 값은 `defaultValue`에 적습니다. 57행의 `'custom'`은 칸을 직접 그릴 때 쓰고, `render`가 돌려주는 부품이 그 칸이 됩니다. 7장에서 읽은 `KeywordInput`이 여기 꽂혀 있습니다.

형광펜을 칠한 53~55행은 객체를 적지 않고 함수를 불렀습니다. 사무소 칸은 화면마다 나오는데 그때마다 이름과 라벨과 사무소를 고르는 부품을 적는 것은 낭비입니다. 그래서 자주 쓰는 조건 칸은 그 객체를 만들어 돌려주는 함수로 준비해 두었습니다. 객체를 찍어 내는 함수라서 @@**공장 함수**|공장 함수@@(factory function)라고 부릅니다. `officeField()`는 `name`이 `'ofcCode'`이고 `label`이 "사무소"인 조건 칸을 돌려줍니다. 괄호 안에 건넨 객체는 그 기본값을 덮어씁니다. 54행은 필수 표시를 끄고 처음 값을 내 사무소로 정했습니다.

`SearchForm`은 antd의 `Form`으로 만들었습니다. 7장에서 말한 대로 `Form`은 안에 놓인 칸의 값을 `name`별로 기억합니다. [조회]를 누르면 칸마다 입력 검사를 하고, 모두 통과하면 값을 객체 하나에 담아 `onSearch`를 부릅니다. 제목 줄의 [조회]도 69행의 `form.submit()`으로 같은 폼을 제출하므로 어느 쪽을 눌러도 같습니다. 화면이 건넨 `onSearch`(`NoticePage.tsx` 61~64행)는 받은 값을 `toNoticeParams`로 바꿔 12장의 `search.search`에 넘깁니다. 폼의 값과 서버가 받는 조건은 아래 그림처럼 모양이 다릅니다.

![폼이 건넨 값(왼쪽)을 `toNoticeParams`가 서버로 갈 조건(오른쪽)으로 바꾼다](img/ch13-values-params.svg){width=100%}

①의 이름들은 `fields`에 적은 `name`입니다. `ofcCode`와 `perNo`는 공장 함수가 붙인 기본 이름입니다. 기간 칸의 값은 날짜 라이브러리 dayjs가 만든 날짜 객체 둘이 든 배열인데, 서버는 `'20261016'` 같은 여덟 자리 글자를 받습니다. ②의 `toNoticeParams`(`NoticeParts.tsx` 65~77행)가 날짜를 글자로 바꾸고, 빈 값을 빼고, 검색어의 앞뒤 빈칸을 뗍니다. ③은 4장에서 읽은 `NoticeSearch`의 모양이고, 여기에 `search.search`가 `page`와 `size`를 붙여 서버에 묻습니다.

::: warn name을 바꾸면 변환 함수도 함께 바꿉니다
조건 칸의 `name`과 `toNoticeParams`가 꺼내는 이름(`v.period`, `v.ofcCode`)은 짝입니다. 한쪽만 바꾸면 그 조건이 빠진 채로 조회됩니다. 값의 타입이 `unknown`이어서 편집기가 빨간 줄로 알려 주지도 않습니다.
:::

## 표, DataGrid와 컬럼 {#ch13-grid}

표도 설정 배열로 그립니다. 이번에는 객체 하나가 열 하나입니다. 우리 소스는 표의 열을 컬럼(column)이라고 부르고, 컬럼에도 공장 함수를 준비해 두었습니다.

```tsx src="src/screens/sample/NoticeParts.tsx:84-104"
export const noticeColumns = (page: number, size: number, onOpen: (r: Notice) => void): Col<Notice>[] => [
  indexCol<Notice>(page, size),
  // …
  col<Notice>('사무소', 'ofcCode', 200, { render: (_: unknown, r) => officeText(r), excel: officeText }),
  textCol<Notice>('작성자', 'name', 100, { align: 'center' }),
  dateCol<Notice>('작성일', 'wrtDate', 100),
  countCol<Notice>('조회수', 'visit', 80),
];
```

8장에서 `useMemo`로 감쌌던 `noticeColumns`입니다. 줄마다 공장 함수가 하나씩 있고, 인자는 머리글, 자료의 속성 이름, 너비 순서입니다. 102행은 "머리글은 작성일, 값은 공지의 `wrtDate`, 너비는 100"이라고 읽습니다. 공장 함수마다 해 주는 일이 다릅니다. 서버가 준 작성일은 `'20261115'`인데 `dateCol`이 `2026-11-15`로 바꿔 가운데에 놓습니다. 마지막 인자로 객체를 건네면 기본 설정을 덮어씁니다. 101행은 작성자를 가운데로 옮겼고, 100행은 `render`에 함수를 건네 칸을 직접 그립니다.

표: 자주 쓰는 컬럼 공장 함수(`src/components/grid/columns.tsx`)

| 함수 | 만드는 컬럼 |
|---|---|
| `col`, `centerCol` | 값을 그대로 보여 준다. `centerCol`은 가운데 정렬 |
| `textCol` | 값이 없으면 회색 `-`를 보여 준다 |
| `dateCol`, `timeCol` | `2026-11-15`, `09:30:15` 모양으로 바꿔 가운데에 |
| `countCol`, `amountCol` | 건수와 금액에 쉼표를 찍어 오른쪽에 |
| `indexCol` | 순번. 쪽 번호와 한 쪽의 건수로 계산한다 |

이 배열을 받는 표 부품이 @@`DataGrid`|DataGrid@@입니다. `NoticePage.tsx` 90~98행이 건넨 props를 읽어 봅시다. `columns`와 `rows`는 표의 열과 행입니다. `rowKey="no"`는 행을 구별할 속성으로, 5장의 key 노릇을 합니다. `pagination`은 표 아래의 쪽 번호 줄을 그립니다. `searched`는 빈 표의 안내문을 고릅니다. `false`면 "조회 조건을 입력하고 [조회]를 누르세요."가, 조회했는데 행이 없으면 "검색된 데이터가 없습니다."가 보입니다. 여기까지 건넨 값은 컬럼만 빼고 모두 12장의 `search`에서 나왔습니다.

97행의 `rowSelection`은 줄 앞의 체크 칸이고 화면의 state와 이어집니다. 줄을 체크하면 체크된 번호들이 `setSelected`로 들어가고, 그 `selected`가 [수정]과 [삭제] 버튼을 켭니다. 표 위의 `ResultHeader`도 이 값을 받아 "2건 선택"을 보여 줍니다.

컬럼 배열은 [엑셀 다운로드]를 눌렀을 때 한 번 더 쓰입니다. 65행의 `excel` 함수는 `downloadExcel(excelColumnsOf(columns), search.rows, TITLE)`을 부릅니다. @@`excelColumnsOf`|excelColumnsOf@@는 화면의 컬럼 배열에서 엑셀의 열 목록을 뽑아내고, `downloadExcel`은 그 목록과 지금 표에 있는 행으로 엑셀 파일을 만들어 내려 줍니다. 엑셀용 열 목록을 따로 적지 않으니 화면과 엑셀이 어긋나지 않습니다. 화면과 다르게 넣을 것만 컬럼에 `excel`로 적습니다. 100행은 엑셀에도 `[100001] 가람지점`이 들어가게 했고, 순번은 `indexCol`이 `excel: false`로 빼 두었습니다.

::: try 한 줄 고쳐 표와 엑셀을 함께 바꾸기
공지사항 화면에서 [조회]를 눌러 둔 채 `NoticeParts.tsx` 102행의 `'작성일'`을 `'등록일'`로 바꾸고 저장하세요. 표의 머리글이 "등록일"이 됩니다. [엑셀 다운로드]로 받은 파일을 열면 첫 줄도 "등록일"입니다. 확인했으면 <kbd>Ctrl</kbd>+<kbd>Z</kbd>로 되돌립니다.
:::

## 팝업과 입력 검사 {#ch13-popup}

[등록]을 누르면 뜨는 작은 창이 6장에서 말한 팝업(모달)입니다. 틀은 antd의 @@`Modal`|Modal@@이 그립니다. `open`이 `true`면 뜨고 `false`면 사라집니다. `onCancel`은 오른쪽 위의 ×를 눌렀을 때 부를 함수입니다. `destroyOnHidden`은 닫을 때 안쪽 내용을 버리라는 표시여서, 다음에 열면 빈 폼으로 새로 시작합니다(`NoticeEditModal.tsx` 45~52행). 조회만 하는 상세 팝업에는 `Modal`에 제목 줄과 [닫기] 버튼을 미리 붙인 공통 부품 @@`DetailModal`|DetailModal@@을 씁니다.

팝업 안쪽은 라벨과 값이 짝을 이루는 표이고 @@`DetailGrid`|DetailGrid@@가 그립니다. 이 부품도 `items`라는 설정 배열을 받습니다. 값 자리에 글자를 넣으면 상세 팝업이, 입력 칸을 넣으면 등록 팝업이 됩니다. 아래 그림은 등록 팝업에서 아무것도 쓰지 않고 [저장]을 누른 모습입니다.

![빈칸으로 [저장]을 누른 등록 팝업. 칸 아래 빨간 글자가 입력 검사의 결과다](img/shots/ch13-invalid.png){width=52%}

서버에 보내기 전에 화면이 먼저 막았습니다. 이 일이 @@**입력 검사**|입력 검사@@입니다. 어느 칸을 어떻게 검사할지는 팝업 파일의 위쪽에 모아 적습니다.

```tsx src="src/screens/popup/NoticeEditModal.tsx:25-29"
const RULES = {
  subject: [req('제목'), maxBytes(SUBJECT_MAX_BYTES)],
  text: [req('내용'), maxBytes(TEXT_MAX_BYTES)],
  ofcCode: [],
} satisfies Record<keyof NoticeFormValues, Rule[]>;
```

@@`RULES`|RULES@@는 칸 이름마다 규칙 배열을 짝지은 객체입니다. 규칙은 `src/utils/rules.ts`의 함수가 만들어 줍니다. `req('제목')`은 비어 있으면 안 된다는 규칙이고, 걸리면 "제목을 입력하세요."를 보여 줍니다. `maxBytes`는 길이의 상한입니다. 제목은 200바이트까지이고, 지금 소스는 한글 한 글자를 2바이트로 셉니다. 그림에서 칸 오른쪽의 `0 / 200`이 그 셈입니다.

규칙을 칸에 잇는 것은 @@`formItem`|formItem@@입니다. 같은 파일 88행은 제목 칸을 `formItem('subject', <Input … />, RULES.subject)`로 만듭니다. 인자는 칸 이름, 입력 칸, 규칙 순서입니다. `formItem`은 함수여서 태그로 쓰지 않고 괄호로 부릅니다. [저장] 버튼은 `form.submit()`을 부르고, 모든 칸이 규칙을 통과했을 때만 서버로 보내는 함수가 불립니다. 팝업 파일의 나머지는 14장에서 직접 치면서 읽습니다.

::: warn 빨간 별과 검사는 따로입니다
라벨 옆의 빨간 별은 `DetailGrid`의 `required: true`가 그리는 표시일 뿐입니다. 비었는지 검사하는 것은 `RULES`의 `req`입니다. 별만 달고 규칙을 빼면 화면은 빈 제목을 막지 않습니다.
:::

## 글자와 모양은 한곳에서 {#ch13-format}

작성일은 표에서도 상세 팝업에서도 출력물에서도 `2026-11-15` 모양입니다. 화면마다 따로 다듬었다면 어디선가 `2026.11.15`가 섞였을 것입니다. 우리 소스는 값을 보기 좋은 글자로 바꾸는 @@**포맷 함수**|포맷 함수@@를 `src/utils/format.ts` 한 파일에 모았습니다.

표: 공지사항 화면이 쓰는 포맷 함수

| 부르는 모양 | 돌려주는 글자 |
|---|---|
| `fmtDate('20261115')` | `2026-11-15` |
| `fmtCount(12345)` | `12,345` |
| `fmtOffice('100001', '가람지점')` | `[100001] 가람지점` |
| `fmtDate(null)`, `fmtCount(null)` | `-` |

값이 없을 때 `-`를 돌려주는 일까지 함수가 맡습니다. 앞 절의 `dateCol`과 `countCol`도 속에서 이 함수들을 부릅니다. 날짜 사이의 줄표를 점으로 바꾸기로 하면 `format.ts` 한 곳만 고칩니다.

화면이 직접 띄우는 문구도 `src/config/messages.ts` 한 파일에 있습니다. @@`VMSG`|VMSG@@는 입력 검사 문구, @@`CMSG`|CMSG@@는 확인 풍선의 문구입니다. 앞 절의 `req('제목')`은 속에서 `VMSG.required('제목')`을 부르고, 이 함수는 받침을 보고 조사를 골라 "제목을 입력하세요."를 만듭니다. "등록되었습니다." 같은 성공 문구와 오류 문구는 이 파일에 없습니다. 12장에서 본 대로 서버가 만들어 보내고 공용 창구가 띄웁니다. *화면에서는 문구를 지어 쓰지 않습니다.*

공통 부품은 이 밖에도 많습니다. 표 안에서 바로 고치는 `EditableGrid`, 목록 탭과 등록 탭을 묶는 `ListEditTabs`, 행과 열에 모두 제목이 있는 집계표 `MatrixGrid`, 개인정보를 가려 보여 주는 `MaskedText`가 있고 결재 팝업도 있습니다. 필요한 부품이 생기면 세 곳을 차례로 봅니다. 먼저 [공통 모듈] 화면에서 비슷한 것을 찾아 [코드 보기]를 누릅니다. 다음으로 `src/components` 폴더에서 그 파일을 열어 props를 읽습니다. 끝으로 견본 화면에서 그 부품을 쓰는 줄을 찾아봅니다. 공통 부품 파일은 모두가 함께 쓰므로 혼자 고치지 않고, 10장의 등록부처럼 리드에게 부탁합니다.

::: summary
- 조회 화면은 `PageFrame` 안에 `SearchForm`, `ResultHeader`, `DataGrid`를 차례로 쌓는다. 버튼줄 `ActionBar`는 `extra`로 건넨다.
- 버튼, 조건 칸, 컬럼은 설정 배열로 적는다. 화면은 무엇을 놓을지만 적고 그리는 일은 부품이 한다.
- 자주 쓰는 조건 칸과 컬럼은 공장 함수가 만든다. 건넨 옵션이 기본값을 덮어쓴다.
- `SearchForm`이 건넨 값은 화면이 서버가 받는 조건으로 바꿔 `search.search`에 넘긴다.
- 컬럼 배열 하나가 표와 엑셀을 함께 만든다.
- 입력 검사는 `RULES`에 모으고 `formItem`으로 칸에 잇는다. 표시 모양은 `format.ts`가, 문구는 `messages.ts`가 맡는다.
:::

::: quiz
1. 공지사항의 [수정] 버튼은 줄을 하나만 체크했을 때 켜집니다. 이 조건은 어디에 적혀 있습니까? 권한이 없을 때 버튼을 흐리게 하는 것은 누구입니까?
2. 기간 칸에서 고른 날짜를 그대로 `search.search`에 건넬 수 없는 까닭은 무엇이고, 어느 함수가 바꿔 줍니까?
3. 표의 "조회수" 머리글을 "읽은 수"로 바꾸려 합니다. 엑셀의 첫 줄까지 바뀌게 하려면 몇 군데를 고쳐야 합니까?
:::
::: answer
1. `NoticePage.tsx` 73행의 `disabled: selected.length !== 1`에 적혀 있다. 권한은 `ActionBar`가 `ACTION_DEFS`의 `need`와 견줘 흐리게 한다. 2. 폼이 건넨 기간 값은 날짜 객체 둘이 든 배열이고 서버는 여덟 자리 글자를 받는다. `toNoticeParams`가 바꾼다. 3. 한 군데, `NoticeParts.tsx` 103행의 `'조회수'`만 고친다. `excelColumnsOf`가 같은 컬럼 배열에서 엑셀의 열을 뽑기 때문이다.
:::
