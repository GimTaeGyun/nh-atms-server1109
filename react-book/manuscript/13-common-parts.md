# 공통 부품으로 화면 조립하기

::: lead
조회 화면을 이루는 틀, 버튼줄, 조회조건, 표, 팝업은 이미 만들어져 있습니다. 이 장에서는 그 공통 부품의 이름과 맡은 일, 건네는 값을 하나씩 익힙니다. 읽고 나면 공지사항 화면의 소스에서 어느 줄이 화면의 어느 조각이 되는지 짚을 수 있습니다.
:::

::: goals
- 조회 화면의 뼈대를 이루는 공통 부품 5개의 이름과 자리를 말할 수 있다
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

`NoticePage.tsx`는 129줄입니다. 이 파일이 그리는 화면에는 제목 줄의 버튼 6개, 조회조건 5칸, 컬럼 7개짜리 표, 쪽 번호 줄이 있습니다. 그런데 권한이 없을 때 버튼을 흐리게 하는 코드도, 쪽 번호를 그리는 코드도 이 파일에는 없습니다.

은행 창구마다 도장과 계산기를 따로 만들지 않습니다. 지점이 같은 비품을 갖춰 두면 창구는 가져다 그날 일에 맞춰 씁니다. 우리 소스의 @@**공통 부품**|공통 부품@@이 [[#ch9]]에서 말한 이 공용 비품입니다. 공통 부품은 여러 화면이 함께 쓰려고 `src/components` 폴더에 만들어 둔 컴포넌트이고, 화면은 props만 채워 씁니다. [[#ch14]]에서 쓸 비품을 하나씩 꺼내 건넬 값의 이름부터 익혀 둡시다.

## 조회 화면의 표준 뼈대 {#ch13-skeleton}

공통 부품은 [[#ch1]]에서 소개한 @@**antd**|antd@@(Ant Design)의 부품을 감싸서 만들었습니다. antd는 버튼, 입력 칸, 표, 팝업 같은 업무 화면의 기성 부품을 모은 라이브러리입니다. antd가 시중에서 산 기성품이라면, 공통 부품은 거기에 우리 지점의 규칙을 덧붙인 비품입니다. 표 `DataGrid`는 antd의 `Table`에 쪽 번호 줄을 붙였고, 버튼줄 `ActionBar`는 `Button`에 권한 검사를 붙인 부품입니다.

업무 화면은 대부분 조건을 넣고 [조회]를 눌러 표로 결과를 보는 화면이라 뼈대도 같습니다. 아래 그림은 공지사항 화면의 본문에 부품의 경계를 그린 것이고, 번호 5개가 부품 5개입니다. 화면 소스의 `return` 안에도 같은 부품이 같은 순서로 적혀 있습니다.

![조회 화면의 뼈대. ① `PageFrame`(점선) ② `ActionBar` ③ `SearchForm` ④ `ResultHeader` ⑤ `DataGrid`](img/shots/ch13-skeleton.png){width=94%}

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

①의 `PageFrame`은 78~125행에서 나머지를 `children`([[#ch6]])으로 감쌉니다. ②의 `ActionBar`만 83행의 `extra` props로 제목 줄 끝에 놓입니다. ④의 `ResultHeader`는 건수 줄로, 86행의 삼항 연산자 둘이 조회 전에는 건수와 안내문을 감춥니다. 태그 사이의 `ExcelButton`은 [엑셀 다운로드]가 됩니다. *조회 화면은 `PageFrame` 안에 `SearchForm`, `ResultHeader`, `DataGrid`를 차례로 쌓아 만듭니다.*

## 틀과 버튼, PageFrame과 ActionBar {#ch13-frame}

화면 틀 @@`PageFrame`|PageFrame@@은 화면의 바깥을 둘러 경로, 제목, 즐겨찾기 별을 그립니다. 제목과 경로는 79행의 `screenKey`로 [[#ch10]]의 등록부·메뉴에서 찾고, "마지막 업데이트"와 ↻는 80~82행의 값으로 그립니다.

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

객체 하나가 버튼 하나로, [[#ch5]]의 `CARDS`처럼 그릴 것을 자료로 적었습니다. 이런 배열을 이 책에서는 @@**설정 배열**|설정 배열@@이라고 부르겠습니다. *화면은 무엇을 놓을지만 적고, 어떻게 그릴지는 부품이 정합니다.*

`key`는 버튼의 종류, `onClick`은 눌렸을 때 할 일, `loading`은 도는 표시를 켜는 값입니다. `disabled`가 `true`면 버튼이 꺼지므로 73행의 [수정]은 한 건을 체크했을 때만 켜집니다.

"조회"라는 글자와 아이콘은 `ActionBar`가 `key`로 `ACTION_DEFS`에서 찾아옵니다.

```tsx src="src/components/auth/ActionBar.tsx:40-53"
export const ACTION_DEFS: Record<ActionKey, ActionDef> = {
  search: { label: '조회', icon: <SearchOutlined />, need: 'qry', type: 'primary' },
  // …
  create: { label: '등록', icon: <PlusOutlined />, need: 'reg' },
  update: { label: '수정', icon: <EditOutlined />, need: 'upd' },
  delete: { label: '삭제', icon: <DeleteOutlined />, need: 'del', danger: true, confirm: CMSG.delete },
  // …
  report: { label: '보고서', icon: <FileTextOutlined />, need: 'qry' },
};
```

@@`ACTION_DEFS`|ACTION_DEFS@@에는 표준 버튼 12종의 라벨, 아이콘, 필요한 권한 `need`가 적혀 있습니다. `need`는 `'qry'` 조회, `'reg'` 등록, `'upd'` 수정, `'del'` 삭제, `'exe'` 업무 실행입니다. `ActionBar`는 건네받은 `screenKey`로 [[#ch11]]의 권한을 묻고, `need`를 못 채운 버튼을 흐리게 그립니다. 흐린 버튼에 마우스를 올리면 "권한이 없습니다."가 뜹니다.

그래서 화면 소스에는 권한을 따지는 줄이 없습니다. 다만 `screenKey`를 빠뜨리면 `ActionBar`가 권한을 찾지 못해 조회만 허락하므로, 관리자가 아니면 [등록]·[수정]·[삭제]가 늘 흐려집니다.

74행의 `confirm`은 [삭제]를 누르면 되묻는 삭제 확인 풍선의 문구입니다. `ACTION_DEFS` 48행의 기본 문구 대신 "선택한 2건을 삭제하시겠습니까?"처럼 건수가 든 문구를 건넸습니다. 83행의 `hotkeys`는 <kbd>Ctrl</kbd>+<kbd>Enter</kbd>를 [조회]의 단축키로 켭니다.

::: try 한 줄로 버튼 하나 더 놓기
`NoticePage.tsx` 74행 아래에 `{ key: 'report' },` 한 줄을 넣고 저장하세요. 버튼줄 끝에 [보고서] 버튼이 생깁니다. 라벨과 문서 아이콘은 `ACTION_DEFS` 52행이 채워 주었습니다. `onClick`을 주지 않아서 눌러도 아무 일이 없습니다. 확인했으면 <kbd>Ctrl</kbd>+<kbd>Z</kbd>로 되돌리고 저장합니다.
:::

## 조회조건, SearchForm {#ch13-search}

조회조건 5칸도 손으로 그리지 않습니다. @@`SearchForm`|SearchForm@@이 설정 배열 `fields`를 받아 그리고, 객체 하나가 조건 칸 하나입니다.

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

56행은 조건 칸을 객체로 직접 적었습니다. `name`은 값에 붙일 이름, `label`은 화면의 글자, `type`은 칸의 종류, `widthClass`는 너비 등급입니다. `'select'`는 목록에서 고르는 칸이고, 고를 거리는 `options`에, 처음 값은 `defaultValue`에 적습니다. 57행의 `'custom'` 칸에는 `render`가 돌려주는 [[#ch7]]의 `KeywordInput`이 그려집니다.

형광펜을 칠한 53~55행은 객체 대신 함수를 불렀습니다. 사무소 칸처럼 화면마다 나오는 칸은 객체를 만들어 돌려주는 함수로 준비해 두었습니다. 객체를 찍어 내는 함수라서 @@**공장 함수**|공장 함수@@(factory function)라고 부릅니다.

`officeField()`는 `name`이 `'ofcCode'`, `label`이 "사무소"인 칸을 돌려주고, 괄호 안에 건넨 객체가 그 기본값을 덮어씁니다. 54행은 칸을 비워도 되게 하고 처음 값을 50행에서 꺼낸 내 사무소로 정했습니다. 55행은 기본 라벨 "인원"을 "작성자"로 바꾸고, 사무소가 바뀌면 고른 작성자를 비우게 했습니다. 53행은 처음 값을 최근 한 달로, 기간을 366일까지로 정했습니다.

`SearchForm`은 antd의 `Form`으로 만들었고, `Form`은 [[#ch7]]에서 말한 대로 칸의 값을 `name`별로 기억합니다. 조건 칸 오른쪽의 [조회]를 누르면 폼이 제출되어, 칸마다 규칙을 검사한 뒤 값을 객체 하나에 담아 `onSearch`를 부릅니다. 폼의 손잡이 `form`은 `NoticePage.tsx` 34행에서 받아 85행에서 건넸습니다. 그래서 제목 줄의 [조회]도 69행의 `form.submit()`으로 같은 폼을 제출합니다.

같은 파일 61~64행의 `onSearch`는 표의 체크를 풀고, 폼이 건넨 값 `v`를 `toNoticeParams`로 바꿔 [[#ch12]]의 `search.search`에 넘깁니다. `v`와 서버가 받는 조건은 아래 그림처럼 모양이 다릅니다.

![폼이 건넨 값(왼쪽)을 `toNoticeParams`가 서버로 갈 조건(오른쪽)으로 바꾼다](img/ch13-values-params.svg){width=94%}

①의 `period` 같은 이름은 `fields`의 `name`이고, `ofcCode`와 `perNo`는 공장 함수가 붙인 기본 이름입니다. 기간 값은 dayjs 라이브러리의 날짜 객체 둘인데, 서버는 `'20261016'` 같은 8자리 글자를 받습니다. 이런 차이를 ②의 `toNoticeParams`(`NoticeParts.tsx` 65~77행)가 화살표대로 바꿉니다. ③은 [[#ch4]]의 `NoticeSearch` 모양이고, `search.search`가 여기에 `page`와 `size`를 붙여 묻습니다.

::: warn `name`을 바꾸면 변환 함수도 함께 바꿉니다
조건 칸의 `name`과 `toNoticeParams`가 꺼내는 이름(`v.period` 등)은 짝이라서, 한쪽만 바꾸면 그 조건이 빠진 채 조회됩니다. `v`의 타입 `Record<string, unknown>`은 이름은 아무 글자, 값은 무엇이든(`unknown`) 되는 객체라서 편집기도 빨간 줄을 긋지 않습니다.
:::

## 표, DataGrid와 컬럼 {#ch13-grid}

표도 설정 배열로 그립니다. 이번에는 객체 하나가 컬럼 하나이고, 컬럼에도 공장 함수가 준비되어 있습니다.

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

[[#ch8]]에서 `useMemo`로 감쌌던 `noticeColumns`입니다. 줄마다 공장 함수가 하나씩이고, 인자는 머리글, 속성 이름, 너비 순서입니다. 102행은 "머리글은 작성일, 값은 `wrtDate`, 너비는 100"이라고 읽고, `dateCol`이 `'20261115'`를 `2026-11-15`로 바꿔 가운데 놓습니다. `textCol`은 빈 값을 회색 `-`로 그리고, `countCol`은 쉼표를 찍어 오른쪽에 놓습니다. 순번을 만드는 85행의 `indexCol`만은 쪽 번호와 쪽 크기를 받습니다.

꺾쇠 `<Notice>`는 [[#ch4]]의 제네릭으로, 이 표의 한 행이 공지라는 표시입니다. 공장 함수에는 이 밖에도 가운데 정렬 `centerCol`, 시각 `timeCol`, 금액 `amountCol`이 있습니다. 마지막 인자로 건넨 객체는 기본 설정을 덮어씁니다. 101행은 작성자를 가운데로 옮겼고, 100행은 `render` 함수로 칸을 직접 그립니다. `render`는 칸의 값과 그 행의 공지를 받는데, 값은 쓰지 않아 `_`로 비우고 행으로 `officeText`(81행)를 불러 `[100001] 가람지점`을 만듭니다.

이 배열을 받는 표 부품이 @@`DataGrid`|DataGrid@@입니다. 아래는 [[#ch13-skeleton]]의 코드에서 건너뛴 90~98행, 곧 `DataGrid`에 건넨 props입니다.

```tsx src="src/screens/sample/NoticePage.tsx:90-98"
        columns={columns}
        rows={search.rows}
        rowKey="no"
        loading={search.loading}
        searched={search.searched}
        grade="G1"
        pagination={search.pagination}
        rowSelection={{ selectedRowKeys: selected, onChange: (keys) => setSelected(keys.map(Number)) }}
        onRowDoubleClick={openView}
```

`columns`와 `rows`는 표의 컬럼과 행이고, `rowKey="no"`는 행을 구별할 속성으로 [[#ch5]]의 `key` 노릇을 합니다. `grade="G1"`은 표 폭을 본문 폭에 맞추는 등급입니다. `pagination`은 쪽 번호 줄을, `loading`은 읽는 동안 도는 표시를 그립니다. `searched`가 `false`면 빈 표에 "조회 조건을 입력하고 [조회]를 누르세요."가, 조회했는데 행이 없으면 "검색된 데이터가 없습니다."가 보입니다.

97행의 `rowSelection`은 행 앞의 체크 칸이고, 체크한 번호가 `setSelected`로 들어가 [수정]과 [삭제]를 켭니다. 98행은 행을 두 번 누르면 상세 팝업을 여는 `openView`를 건넸습니다.

컬럼 배열은 [엑셀 다운로드]에도 쓰입니다. 65행의 `excel` 함수에서 @@`excelColumnsOf`|excelColumnsOf@@가 엑셀의 컬럼 목록을 만들고, `downloadExcel`이 지금 표의 행과 함께 파일로 내려 줍니다. 그래서 화면과 엑셀이 어긋나지 않고, 사무소 컬럼처럼 엑셀에 다르게 넣을 것만 `excel`로 적습니다. 순번은 `indexCol`에 든 `excel: false` 때문에 빠집니다.

::: try 한 줄 고쳐 표와 엑셀을 함께 바꾸기
[조회]를 눌러 둔 채 `NoticeParts.tsx` 102행의 `'작성일'`을 `'등록일'`로 바꿔 저장하세요. 표의 머리글과 [엑셀 다운로드]로 받은 파일의 첫 행에서 "작성일"이 "등록일"로 바뀝니다. 끝나면 <kbd>Ctrl</kbd>+<kbd>Z</kbd>로 되돌리고 저장합니다.
:::

## 팝업과 입력 검사 {#ch13-popup}

[등록]을 누르면 뜨는 작은 창이 [[#ch6]]의 팝업(모달)이고, 그 창은 `NoticeEditModal.tsx` 45~52행처럼 antd의 @@`Modal`|Modal@@로 그립니다. `open`이 `true`면 뜨고 `false`면 사라집니다. `onCancel`은 ×나 팝업 바깥을 누르거나 <kbd>Esc</kbd>를 눌렀을 때 부를 함수입니다. `destroyOnHidden`은 닫을 때 안쪽을 버리라는 표시라서, 다시 열면 새 폼으로 시작합니다.

팝업 안쪽의 라벨과 값 표는 @@`DetailGrid`|DetailGrid@@가 `items`라는 설정 배열을 받아 그립니다. 값 자리에 글자를 넣으면 상세 팝업이, 입력 칸을 넣으면 등록·수정 팝업이 됩니다. 상세 팝업은 `Modal`에 제목 줄과 [닫기]를 붙인 팝업 틀 @@`DetailModal`|DetailModal@@로 감쌉니다. 아래는 빈칸으로 [저장]을 누른 등록 팝업입니다.

![빈칸으로 [저장]을 누른 등록 팝업의 윗부분. 칸 아래 빨간 글자가 입력 검사의 결과다](img/shots/ch13-invalid-top.png){width=100%}

서버에 보내기 전에 화면이 먼저 막았습니다. 이 일이 @@**입력 검사**|입력 검사@@입니다. 어느 칸을 어떻게 검사할지는 팝업 파일의 위쪽에 모아 적습니다.

```tsx src="src/screens/popup/NoticeEditModal.tsx:25-29"
const RULES = {
  subject: [req('제목'), maxBytes(SUBJECT_MAX_BYTES)],
  text: [req('내용'), maxBytes(TEXT_MAX_BYTES)],
  ofcCode: [],
} satisfies Record<keyof NoticeFormValues, Rule[]>;
```

@@`RULES`|RULES@@는 칸 이름마다 규칙 배열을 짝지은 객체이고, 규칙은 `src/utils/rules.ts`의 함수가 만듭니다. `req('제목')`은 비면 안 된다는 규칙으로, 걸리면 "제목을 입력하세요."를 보여 줍니다. `maxBytes`는 길이의 상한입니다. 바이트는 글자를 저장할 때 차지하는 크기로, 지금 소스는 영문·숫자를 1바이트, 한글을 2바이트로 셉니다. 29행의 `satisfies`([[#ch4]])가 칸 이름이 빠지면 빨간 줄을 긋기 때문에, 검사할 것이 없는 사무소도 28행처럼 빈 배열로 적습니다.

규칙을 칸에 잇는 것은 antd의 `Form.Item`을 감싼 함수 @@`formItem`|formItem@@입니다. 88행은 칸 이름 `'subject'`, 입력 칸 `<Input … />`, 규칙 `RULES.subject`를 차례로 건네 제목 칸을 만듭니다. 함수여서 태그로 쓰지 않고 괄호로 부릅니다. 같은 줄의 `required: true`가 라벨 옆의 빨간 별을, 입력 칸의 `count`가 오른쪽의 `0 / 200`을 그립니다. 별은 표시일 뿐이라서, 별만 달고 `req`를 빼면 빈 제목을 막지 못합니다.

[저장]은 `form.submit()`을 부르고, `Form`은 모든 칸이 규칙을 통과해야 80행의 `onFinish`를 불러 저장합니다. 이 버튼도 `ActionBar`의 버튼과 같은 권한 버튼 `AuthButton`이고, 96행에서 공지사항 화면의 화면키로 권한을 묻습니다. 메뉴에 없는 팝업에는 조회 권한만 있기 때문입니다.

## 글자와 모양은 한곳에서 {#ch13-format}

작성일은 표에서도 상세 팝업에서도 출력물에서도 `2026-11-15` 모양입니다. 화면마다 따로 다듬었다면 어디선가 `2026.11.15`가 섞였을 것입니다. 우리 소스는 값을 보기 좋은 글자로 바꾸는 @@**포맷 함수**|포맷 함수@@를 `src/utils/format.ts` 한 파일에 모았습니다.

표: 공지사항 화면이 쓰는 포맷 함수

| 부르는 모양 | 돌려주는 글자 |
|---|---|
| `fmtDate('20261115')` | `2026-11-15` |
| `fmtCount(12345)` | `12,345` |
| `fmtOffice('100001', '가람지점')` | `[100001] 가람지점` |
| `fmtDateTime14('20261115093000')` | `2026-11-15 09:30:00` |

`fmtDate(null)`처럼 값이 없으면 `-`를 돌려주는 일도 함수가 맡습니다. `dateCol`과 `countCol`도 이 함수들을 부르니, 표와 팝업과 출력물의 날짜를 점으로 찍기로 하면 이 파일만 고칩니다.

입력 검사 문구 @@`VMSG`|VMSG@@와 확인 풍선 문구 @@`CMSG`|CMSG@@는 `src/config/messages.ts`에 모았습니다. 앞 절의 `req('제목')`은 속에서 `VMSG.required('제목')`을 불러, 받침에 맞게 조사를 고른 "제목을 입력하세요."를 받습니다. 성공 문구와 오류 문구는 [[#ch12]]에서 본 대로 서버가 만들고 공용 창구가 띄웁니다. *검사 문구와 확인 문구는 화면에서 지어 쓰지 않고 `VMSG`·`CMSG`에서 꺼내 씁니다.*

이 밖에도 표 안에서 고치는 `EditableGrid`, 목록·등록 탭을 묶는 `ListEditTabs`, 개인정보를 가리는 `MaskedText`, 결재 팝업이 있습니다. 필요한 부품은 먼저 메뉴의 [견본] 아래 @@[공통 모듈] 화면|공통 모듈 화면@@에서 찾습니다. 탭 6개에 부품이 카드로 놓여 있고, 카드의 [코드 보기]를 누르면 그 부품을 쓰는 코드가 펼쳐집니다. 다음으로 `src/components`에서 그 파일의 props를 읽고, 끝으로 견본 화면에서 쓰는 줄을 찾아봅니다. 공통 부품 파일은 혼자 고치지 않고 [[#ch10]]의 등록부처럼 리드에게 부탁합니다.

::: summary
- 조회 화면은 `PageFrame` 안에 `SearchForm`, `ResultHeader`, `DataGrid`를 차례로 쌓는다.
- 버튼, 조건 칸, 컬럼은 설정 배열로 적는다. 화면은 무엇을 놓을지만 적고 그리는 일은 공통 부품이 한다.
- 자주 쓰는 조건 칸과 컬럼은 공장 함수가 만든다. 건넨 옵션이 기본값을 덮어쓴다.
- 화면은 `SearchForm`이 건넨 값을 서버가 받는 조건으로 바꿔 `search.search`에 넘긴다.
- 컬럼 배열 하나가 표와 엑셀을 함께 만든다.
- 입력 검사는 `RULES`에 모은다. 표시 모양은 `format.ts`가, 검사·확인 문구는 `messages.ts`가 맡는다.
:::

::: quiz
1. 공지사항의 [수정] 버튼은 행을 하나만 체크했을 때 켜집니다. 이 조건은 어디에 적혀 있습니까? 권한이 없을 때 버튼을 흐리게 하는 것은 누구입니까?
2. 기간 칸에서 고른 날짜를 그대로 `search.search`에 건넬 수 없는 까닭은 무엇이고, 어느 함수가 바꿔 줍니까?
3. 표의 "조회수" 머리글을 "읽은 수"로 바꾸려 합니다. 엑셀의 첫 행까지 바뀌게 하려면 몇 군데를 고쳐야 합니까?
:::
::: answer
1. `NoticePage.tsx` 73행의 `disabled: selected.length !== 1`. 흐리게 하는 것은 `ActionBar`로, `ACTION_DEFS`의 `need`와 권한을 견준다. 2. 기간 값은 날짜 객체 둘이 든 배열인데 서버는 8자리 글자를 받는다. `toNoticeParams`가 바꾼다. 3. 한 군데(`NoticeParts.tsx` 103행). `excelColumnsOf`가 같은 컬럼 배열에서 엑셀의 컬럼을 뽑는다.
:::
