## 표를 그리다 {#ch14-grid}

서버는 이미 답을 보냈습니다. Network 탭에서 그 줄을 눌러 응답을 열면 공지 목록이 보이는데, 화면에는 아직 한 건도 없습니다. 이 목록을 표로 그립니다.

::: step 6 표 그리기
`NoticeParts.tsx`에 컬럼 목록을 만들고, `NoticePage.tsx`가 받아 온 목록을 표로 그리게 합니다.
:::

먼저 `NoticeParts.tsx`의 가져오기 줄을 고칩니다. `antd` 줄과 `@/domain/notice` 줄은 원본(7행·21행)과 같아지고, 새 `@/utils/format` 줄은 단계 11에서 이름을 하나 더 받습니다.

```tsx title="src/screens/sample/NoticeParts.tsx" kind="고치기" diff
 import { useMemo } from 'react';
-import { Form, Input } from 'antd';
+import { Form, Input, Typography } from 'antd';
 ⋮
 import { ymdRange } from '@/components/search/params';
+import { centerCol, col, countCol, dateCol, indexCol, textCol, type Col } from '@/components/grid/columns';
+import { fmtOffice } from '@/utils/format';
 import { today, type Dayjs } from '@/utils/date';
 ⋮
-import type { NoticeField, NoticeSearch } from '@/domain/notice';
+import type { Notice, NoticeField, NoticeSearch } from '@/domain/notice';
```

이어서 파일 맨 끝, `toNoticeParams` 아래에 컬럼 목록을 칩니다.

```tsx src="src/screens/sample/NoticeParts.tsx:79-104" kind="이어 쓰기"
/* ---------- 3. 컬럼 (G1) ---------- */
/** 사무소 표시 '[코드] 사무소명' (없으면 '-') */
const officeText = (r: Notice) => fmtOffice(r.ofcCode, r.kanm);

/** 목록 컬럼 — 제목을 누르면 상세(onOpen). 엑셀은 excelColumnsOf(이 컬럼)로 같은 모양 */
export const noticeColumns = (page: number, size: number, onOpen: (r: Notice) => void): Col<Notice>[] => [
  indexCol<Notice>(page, size),
  centerCol<Notice>('번호', 'no', 70, { className: 'num' }),
  col<Notice>('제목', 'subject', 360, {
    render: (v: string | null, r) => (
      <Typography.Link
        onClick={(e) => {
          e.stopPropagation();
          onOpen(r);
        }}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        {v || '(제목 없음)'}
      </Typography.Link>
    ),
  }),
  col<Notice>('사무소', 'ofcCode', 200, { render: (_: unknown, r) => officeText(r), excel: officeText }),
  textCol<Notice>('작성자', 'name', 100, { align: 'center' }),
  dateCol<Notice>('작성일', 'wrtDate', 100),
  countCol<Notice>('조회수', 'visit', 80),
];
```

컬럼은 [[#ch13-grid]]에서 읽었으니 새로 볼 곳만 짚습니다. 84행의 `noticeColumns`가 배열 대신 배열을 만드는 함수인 까닭은 둘입니다. 순번(85행)이 쪽 번호와 한 쪽의 건수를 알아야 하고, 제목을 눌렀을 때 할 일 `onOpen`을 팝업의 열림을 기억하는 화면 본체에서 받아야 합니다([[#ch7-owner]]).

87~99행이 제목 컬럼입니다. `render`는 칸을 직접 그리는 함수로, 첫째 매개변수 `v`에 제목이, 둘째 매개변수 `r`에 그 행의 공지가 들어옵니다. 89행의 `Typography.Link`는 antd의 링크 글자입니다.

91행과 94행의 `e.stopPropagation()`은 처음 보는 줄입니다. 클릭 같은 이벤트는 누른 요소를 품은 바깥 요소에도 차례로 알려지는데, 이것을 @@**이벤트 전파**|이벤트 전파@@(event propagation)라고 합니다. 제목은 행 안에 있고 행에는 곧 더블클릭하면 상세를 여는 함수를 걸므로, 제목을 더블클릭하면 상세를 또 열려고 합니다. @@`stopPropagation`|stopPropagation@@은 이벤트를 여기서 멈추라는 메서드라서, 94행이 더블클릭을, 91행이 클릭을 행으로 번지지 않게 막습니다.

화면 본체에는 가져오기 3줄을 더합니다. `react` 줄은 파일 맨 첫 줄에 두고, `./NoticeParts` 줄에는 `noticeColumns`를 더합니다.

```tsx title="src/screens/sample/NoticePage.tsx" kind="고치기" diff
+import { useCallback, useMemo, useState } from 'react';
 import { Form } from 'antd';
+import { useMutation, useQueryClient } from '@tanstack/react-query';
 import { noticeApi, noticeKeys } from '@/api/endpoints/notice';
 ⋮
 import { ActionBar, type ActionItem } from '@/components/auth/ActionBar';
+import { DataGrid } from '@/components/grid/DataGrid';
 import type { Notice, NoticeSearch } from '@/domain/notice';
 import type { ScreenProps } from '@/types/screen';
-import { toNoticeParams, useNoticeFields } from './NoticeParts';
+import { noticeColumns, toNoticeParams, useNoticeFields } from './NoticeParts';
```

35·38행은 `const [form]`(34행) 아래에, 44~47행은 `const search`(41행) 아래에 넣습니다.

```tsx src="src/screens/sample/NoticePage.tsx:35-47" kind="이어 쓰기"
  const qc = useQueryClient();
  // …
  const [viewOpen, setViewOpen] = useState(false);
  // …
  const invalidate = () => qc.invalidateQueries({ queryKey: noticeKeys.all });

  // 상세 열기 = 조회수 +1 이 일어나는 요청이라 mutation 으로(다시 그릴 때 저절로 재요청되지 않게). 성공하면 목록의 조회수도 다시 읽는다
  const view = useMutation({ mutationFn: (no: number) => noticeApi.get(no, true), onSuccess: invalidate });
```

`view`(47행)는 조회수를 1 올리는 읽기라서 뮤테이션이고([[#ch12-mutation]]), 성공하면 `invalidate`(44행)가 목록에 '낡았음' 딱지를 붙입니다. `const onSearch` 줄 바로 위에는 [[#ch8-memo]]에서 읽은 10줄을 칩니다.

```tsx src="src/screens/sample/NoticePage.tsx:50-59" kind="이어 쓰기"
  const { mutate: openDetail, isPending: viewPending } = view;
  const openView = useCallback(
    (r: Notice) => {
      if (viewPending) return; // 제목 더블클릭(클릭 2번 + 더블클릭)에도 요청은 한 번만
      setViewOpen(true);
      openDetail(r.no, { onError: () => setViewOpen(false) }); // 오류 문구는 전역에서 띄운다
    },
    [viewPending, openDetail],
  );
  const columns = useMemo(() => noticeColumns(search.page, search.size, openView), [search.page, search.size, openView]);
```

`openView`(51행)는 `viewOpen`을 켜고 상세를 읽으며, 59행이 이 함수를 컬럼에 건넵니다. 끝으로 `SearchForm` 줄(85행) 바로 아래에 표를 놓습니다.

```tsx src="src/screens/sample/NoticePage.tsx:89-99" kind="이어 쓰기"
      <DataGrid<Notice>
        columns={columns}
        rows={search.rows}
        rowKey="no"
        loading={search.loading}
        searched={search.searched}
        grade="G1"
        pagination={search.pagination}
        // …
        onRowDoubleClick={openView}
      />
```

props는 [[#ch13-grid]]에서 읽었고, 태그 이름 뒤의 `<Notice>`는 한 행이 공지라는 [[#ch4-generic]]의 제네릭입니다. 97행 자리의 체크 칸은 단계 9에서 넣습니다.

::: check
- [조회]를 누르면 공지 행과 맨 아래 쪽 번호 줄이 생깁니다. 2쪽이 있으면 순번이 21부터 이어집니다.
- 표가 비어 있으면 코드보다 조건 탓일 때가 많습니다. 작성일 칸을 눌러 [3개월]을 고르고 사무소 칸을 비워 다시 [조회]합니다. 그래도 비면 선배에게 연습용 공지를 두세 건 부탁합니다.
- 제목을 누르면 Network 탭에 `notice/번호?hit=Y`와 목록 요청이 차례로 생깁니다. 팝업은 아직 없고, 그 행의 조회수만 1 오릅니다.
- `npm run typecheck`가 `error TS6133: 'viewOpen' is declared but its value is never read.` 오류 하나를 남깁니다. `viewOpen`을 바꾸는 곳은 있는데 읽는 부품이 아직 없다는 뜻이고, 다음 단계에서 사라집니다.
:::

## 팝업 두 개 {#ch14-popup}

제목을 누르면 서버가 공지 한 건을 보내 주지만 보여 줄 창이 없습니다. 이 절에서 공지를 보여 주기만 하는 상세 팝업과, 입력을 받아 서버에 보내는 등록·수정 팝업을 만듭니다.

::: step 7 상세 팝업
`NoticeViewModal.tsx`에 상세 팝업을 만들고, 제목을 누르면 `NoticePage.tsx`가 이 팝업을 띄우게 합니다.
:::

비워 둔 `src/screens/popup/NoticeViewModal.tsx`에 53줄을 모두 칩니다. 맨 앞은 가져오기 6줄입니다.

```tsx src="src/screens/popup/NoticeViewModal.tsx:1-6" kind="새 파일"
import { EditOutlined } from '@ant-design/icons';
import { DetailModal } from '@/components/display/DetailModal';
import { DetailGrid, type DetailItem } from '@/components/display/DetailGrid';
import { AuthButton } from '@/components/auth/AuthButton';
import { fmtCount, fmtDate, fmtDateTime14, fmtOffice } from '@/utils/format';
import type { Notice } from '@/domain/notice';
```

연필 아이콘, 팝업 틀 `DetailModal`, 라벨·값 표 `DetailGrid`, 권한 버튼 `AuthButton`([[#ch13-popup]]), 포맷 함수 넷([[#ch13-format]])을 가져옵니다. 한 줄을 띄우고 8~16행의 `Props`를 칩니다. [[#ch6-callback]]에서 읽은 9줄 그대로입니다. 그 아래에 공지 한 건을 화면에 보일 항목으로 바꾸는 함수 둘을 칩니다.

```tsx src="src/screens/popup/NoticeViewModal.tsx:18-31" kind="이어 쓰기"
/** '이름 (개인번호)' — 둘 다 없으면 undefined(회색 '-') */
const writerOf = (name?: string | null, perNo?: string | null): string | undefined => (name || perNo ? `${name ?? ''}${perNo ? ` (${perNo})` : ''}`.trim() : undefined);

/** 상세 항목 — 번호·사무소·작성자·작성일·조회수·최종변경, 제목과 내용(줄바꿈 그대로) */
const itemsOf = (n: Notice): DetailItem[] => [
  { label: '제목', value: n.subject, span: 2 },
  { label: '번호', value: n.no, num: true },
  { label: '사무소', value: n.ofcCode ? fmtOffice(n.ofcCode, n.kanm) : undefined },
  { label: '작성자', value: writerOf(n.name, n.perNo) },
  { label: '작성일', value: fmtDate(n.wrtDate) },
  { label: '조회수', value: fmtCount(n.visit), num: true },
  { label: '최종변경', value: n.lschgDtm ? `${fmtDateTime14(n.lschgDtm)}${n.lsCmeno ? ` · ${n.lsCmeno}` : ''}` : undefined },
  { label: '내용', value: n.text, span: 2, pre: true },
];
```

19행의 `writerOf`는 이름과 개인번호를 받아 `'김하늘 (12345678)'` 같은 글자를 만듭니다. 삼항 연산자와 템플릿 문자열이 겹친 줄이니 바깥부터 읽습니다. 이름과 개인번호가 둘 다 없으면 `undefined`를, 하나라도 있으면 템플릿 문자열을 돌려줍니다. 그 안의 첫째 `${…}`는 이름(없으면 빈 글자)이고, 둘째 `${…}`는 개인번호가 있을 때만 빈칸과 괄호로 감싼 개인번호를 붙입니다. 이름이 없으면 맨 앞에 빈칸이 남는데, 그 빈칸은 `.trim()`이 뗍니다.

22~31행의 `itemsOf`는 [[#ch13-frame]]의 버튼 배열처럼 그릴 것을 적은 설정 배열이고, 항목 순서가 곧 화면의 순서입니다. `span: 2`는 한 줄을 다 쓰고, `num`은 오른쪽에 붙이고, `pre`는 줄바꿈을 그대로 보여 줍니다. 값이 `undefined`인 칸은 `DetailGrid`가 회색 `-`로 그립니다. 마지막 덩이가 팝업 컴포넌트입니다.

```tsx src="src/screens/popup/NoticeViewModal.tsx:33-53" kind="이어 쓰기"
/**
 * 공지 상세 팝업(`popup.noticeView`) — 조회 전용. 여는 쪽(NoticePage)이 `GET /api/notice/{no}?hit=Y` 로 읽어 넘긴다(조회수 +1).
 * [수정]은 화면 권한 UPD 가 있어야 눌린다(sample.notice 기준).
 */
export const NoticeViewModal = ({ open, notice, loading, onClose, onEdit }: Props) => (
  <DetailModal
    open={open}
    onClose={onClose}
    title="공지사항 상세"
    screenKey="popup.noticeView"
    width={760}
    loading={loading || !notice}
    actions={
      <AuthButton screenKey="sample.notice" need="upd" type="primary" icon={<EditOutlined />} disabled={!notice} onClick={() => notice && onEdit(notice)}>
        수정
      </AuthButton>
    }
  >
    {notice && <DetailGrid cols={2} labelWidth={100} items={itemsOf(notice)} />}
  </DetailModal>
);
```

37행의 컴포넌트는 화살표 뒤에 중괄호 없이 JSX를 바로 돌려줍니다. state도 훅도 없이 받은 props만으로 그리고, 서버를 부르는 일은 화면 본체의 47행이 했습니다. 44행은 읽는 중이거나 공지가 없으면 회색 막대를 그리게 합니다. [닫기]는 `DetailModal`이 그리고, 45~49행은 그 오른쪽의 [수정]으로 수정 권한(`need="upd"`)을 공지사항의 화면키로 묻습니다. 51행은 공지가 있을 때만 그리는 [[#ch5-cond]]의 `&&`입니다.

화면 본체에는 2줄을 넣습니다. 22행은 `./NoticeParts` 가져오기 줄 바로 위에, 37행은 38행(`viewOpen`) 바로 위에 둡니다.

```tsx src="src/screens/sample/NoticePage.tsx:22-37" kind="이어 쓰기"
import { NoticeViewModal } from '../popup/NoticeViewModal';
// …
  const [edit, setEdit] = useState<{ open: boolean; no: number | null }>({ open: false, no: null });
```

그리고 표가 끝나는 `/>` 줄(99행) 아래에 [[#ch6-callback]]에 실린 100~109행 10줄을 그대로 칩니다. 101행이 드디어 `viewOpen`을 읽고, 102·103행이 `view`가 받아 온 공지와 읽는 중인지를 건넵니다. 37행의 `edit`는 등록·수정 팝업이 열렸는지와 고칠 번호를 함께 기억하는 state로([[#ch7-multi-state]]), 107행이 `setEdit`를 부르므로 함께 칩니다.

::: tip [수정]·[등록]·[삭제]가 흐리게 보이면
계정에 그 권한이 없는 것입니다. [[#ch11]]의 해 보기처럼 '권한 미리보기'를 [전부]로 바꾸면 화면의 버튼만 켜지고, 서버의 검사는 그대로입니다. 미리보기는 <kbd>F5</kbd>를 누르면 풀리니 그때마다 다시 켭니다.
:::

::: check
- 제목을 누르거나 행을 더블클릭하면 "공지사항 상세" 팝업이 뜹니다. 회색 막대가 잠깐 보인 뒤 아래 그림처럼 항목이 채워지고, 연 공지의 조회수가 1 오릅니다.
- [수정]을 누르면 팝업이 닫히기만 합니다. 열어 줄 입력 팝업은 다음 단계에서 만듭니다.
- 타입 검사의 `viewOpen` 오류가 사라집니다. 대신 `error TS6133: 'edit' is declared but its value is never read.`가 하나 남습니다. `edit`를 읽는 곳이 아직 없어서이고, 다음 단계에서 사라집니다.
:::

![단계 7을 마친 화면의 상세 팝업](img/shots/ch14-step7-view.png){width=70%}

::: step 8 등록·수정 팝업
`NoticeEditModal.tsx`에 입력 팝업을 만들고, [등록] 버튼과 상세 팝업의 [수정]이 이 팝업을 열게 합니다.
:::

부품 서랍의 상수, 팝업 파일, 화면 본체 순서로 고칩니다. 먼저 `NoticeParts.tsx`의 가져오기 줄들 아래, `/* ---------- 1. 조회조건` 주석 위에 상수 둘을 넣습니다.

```tsx src="src/screens/sample/NoticeParts.tsx:23-27" kind="이어 쓰기"
/* ---------- 0. 바이트 상한(잠정 Q-07 — 계산은 공통 utils/rules byteLength·maxBytes·byteCount) ---------- */
/** 제목 최대 바이트 — TB_NOTICE.SUBJECT VARCHAR2(200) */
export const SUBJECT_MAX_BYTES = 200;
/** 내용 최대 바이트 — TB_NOTICE.TEXT VARCHAR2(4000) */
export const TEXT_MAX_BYTES = 4000;
```

제목과 내용 길이의 상한을 [[#ch13-popup]]의 바이트로 적은 상수입니다. 주석의 '잠정'처럼 바뀔 수 있는 값이라 이름을 붙여 한곳에 둡니다.

팝업 파일은 102줄로 이 장에서 가장 길어 여섯 덩이로 나눠 싣습니다. 첫 덩이는 가져오기입니다.

```tsx src="src/screens/popup/NoticeEditModal.tsx:1-15" kind="새 파일"
import { Button, Form, Input, Modal, Skeleton } from 'antd';
import type { Rule } from 'antd/es/form';
import { SaveOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { noticeApi, noticeKeys } from '@/api/endpoints/notice';
import { DetailGrid } from '@/components/display/DetailGrid';
import { EmptyState } from '@/components/feedback';
import { ModalTitle } from '@/components/display/ModalTitle';
import { AuthButton } from '@/components/auth/AuthButton';
import { formItem } from '@/components/forms/formItem';
import { OfficeSelector } from '@/components/search/fields';
import { useAuthStore } from '@/stores/useAuthStore';
import { byteCount, maxBytes, req } from '@/utils/rules';
import type { Notice, NoticeSave } from '@/domain/notice';
import { SUBJECT_MAX_BYTES, TEXT_MAX_BYTES } from '../sample/NoticeParts';
```

2행은 antd 안쪽 폴더에서 규칙 타입 `Rule`을, 15행은 방금 만든 상수를 한 폴더 위(`..`)의 `sample` 폴더에서 가져옵니다. 둘째 덩이는 폼 값의 모양, 검사 목록, 본문을 만드는 함수, props 타입입니다.

```tsx src="src/screens/popup/NoticeEditModal.tsx:17-38" kind="이어 쓰기"
/** 폼 값(화면 안) — 보낼 때 toBody 로 계약 NoticeSave 모양 */
interface NoticeFormValues {
  subject: string;
  text: string;
  ofcCode?: string;
}

/* 이 팝업의 검사 목록 — 바이트 상한은 서버 DbBytes 와 같은 규칙(잠정 Q-07) */
const RULES = {
  subject: [req('제목'), maxBytes(SUBJECT_MAX_BYTES)],
  text: [req('내용'), maxBytes(TEXT_MAX_BYTES)],
  ofcCode: [],
} satisfies Record<keyof NoticeFormValues, Rule[]>;

const toBody = (v: NoticeFormValues): NoticeSave => ({ subject: v.subject.trim(), text: v.text, ofcCode: v.ofcCode || undefined });

interface Props {
  open: boolean;
  /** null = 등록, 번호 = 수정 */
  no: number | null;
  onClose: () => void;
}
```

25~29행은 [[#ch13-popup]]에서 읽은 검사 목록입니다. 폼 안의 값 모양(18~22행)은 서버에 보낼 본문 `NoticeSave`([[#ch4-interface]])와 따로 둡니다. 31행의 `toBody`가 보내기 직전에 제목의 앞뒤 빈칸을 떼고 빈 사무소를 `undefined`로 바꿔 본문을 만듭니다(객체를 감싼 소괄호는 [[#ch3-array]]). `Props`의 `no`가 `null`이면 등록, 번호가 있으면 수정이라 팝업 하나가 두 가지 일을 합니다.

남은 64줄은 컴포넌트 셋입니다. 아래 그림처럼 겉, 가운데, 속 세 겹으로 서로를 감쌉니다.

![등록·수정 팝업의 세 겹. 화면 본체의 props를 겉이 받아 안으로 넘기고, 점선 안쪽은 팝업을 닫을 때 버려진다](img/ch14-edit-layers.svg){width=92%}

셋째 덩이가 겉입니다.

```tsx src="src/screens/popup/NoticeEditModal.tsx:40-55" kind="이어 쓰기"
/**
 * 공지 등록/수정 팝업(`popup.noticeEdit`). 모달 안 폼은 열릴 때마다 새로 마운트(destroyOnHidden + 안쪽 컴포넌트, dev-guide §5-5).
 * 작성자는 서버가 로그인 사용자로 채운다(화면은 보여 주기만). 성공 문구(S002·S003)는 서버 → 자동 표시.
 */
export const NoticeEditModal = ({ open, no, onClose }: Props) => (
  <Modal
    open={open}
    onCancel={onClose}
    width={760}
    title={<ModalTitle title={no === null ? '공지사항 등록' : '공지사항 수정'} screenKey="popup.noticeEdit" />}
    footer={null}
    destroyOnHidden
  >
    <NoticeEditBody no={no} onClose={onClose} />
  </Modal>
);
```

45~52행이 [[#ch13-popup]]의 antd `Modal`입니다. 49행은 `no`로 제목을 고르고, 50행의 `footer={null}`은 기본 버튼을 없앱니다. [닫기]와 [저장]은 속의 폼이 그립니다. 51행의 @@`destroyOnHidden`|destroyOnHidden@@은 닫힐 때 안쪽을 버리라는 표시라서, 다시 열면 점선 안쪽이 새로 만들어지고 쓰다 만 글이 남지 않습니다. 없어도 되는 props라 빠뜨려도 타입 검사는 조용하니, 닫았다 다시 열어 글이 사라지는지 화면에서 봅니다.

겉은 화면 본체에 늘 그려져 있어 겉에 둔 훅의 기억은 버려지지 않습니다. 그래서 훅은 모두 안쪽에 둡니다. 넷째 덩이가 가운데입니다.

```tsx src="src/screens/popup/NoticeEditModal.tsx:57-64" kind="이어 쓰기"
/** 수정이면 원문(text 포함, 조회수 증가 없음)을 읽은 뒤 폼을 그린다. 닫으면 캐시도 버린다(gcTime 0) → 다음에 열 때 새로 읽음 */
const NoticeEditBody = ({ no, onClose }: { no: number | null; onClose: () => void }) => {
  const detail = useQuery({ queryKey: noticeKeys.detail(no ?? 0), queryFn: () => noticeApi.get(no as number), enabled: no !== null, gcTime: 0 });
  // 읽기 실패(404 등) — 문구는 서버가 이미 띄웠다. 끝없는 로딩 대신 닫기만 준다
  if (no !== null && detail.isError) return <EmptyState text="공지를 불러오지 못했습니다." action={<Button onClick={onClose}>닫기</Button>} />;
  if (no !== null && !detail.data) return <Skeleton active paragraph={{ rows: 6 }} />;
  return <NoticeForm target={no === null ? null : (detail.data ?? null)} onClose={onClose} />;
};
```

59행은 [[#ch12-query]]에서 읽은 줄로, 수정일 때만(`enabled`) 원문을 읽습니다. 목록의 공지에는 내용(`text`)이 없어서 다시 읽는 것이고, `hit`을 주지 않았으니 조회수는 그대로입니다. 61~63행은 [[#ch5-cond]]의 이른 `return`으로 나눈 세 갈래이고, 훅은 그보다 위에서 늘 부릅니다([[#ch8-rules]]).

62행이 원문을 기다리는 것은 폼이 처음 값을 맨 처음 그릴 때 한 번만 읽기 때문입니다. 이 줄을 빼면 수정 팝업이 빈칸으로 뜹니다. 다섯째 덩이는 속 `NoticeForm`의 저장 준비입니다.

```tsx src="src/screens/popup/NoticeEditModal.tsx:66-80" kind="이어 쓰기"
const NoticeForm = ({ target, onClose }: { target: Notice | null; onClose: () => void }) => {
  const [form] = Form.useForm<NoticeFormValues>();
  const qc = useQueryClient();
  const me = useAuthStore((s) => s.me);
  const save = useMutation({
    mutationFn: (body: NoticeSave) => (target ? noticeApi.update(target.no, body) : noticeApi.create(body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: noticeKeys.all }),
  });
  const writer = target ? { name: target.name, perNo: target.perNo } : { name: me?.name ?? null, perNo: me?.perNo ?? null };
  const initial: Partial<NoticeFormValues> = target
    ? { subject: target.subject ?? '', text: target.text ?? '', ofcCode: target.ofcCode ?? undefined }
    : { ofcCode: me?.ofcCode ?? undefined };

  // 검증을 통과했을 때만 불린다. 닫기는 이 요청이 성공했을 때만
  const onFinish = (v: NoticeFormValues) => save.mutate(toBody(v), { onSuccess: onClose });
```

`target`은 고칠 공지이고 등록이면 `null`입니다. `me`(69행)는 [[#ch11]]의 스토어에서 꺼낸 로그인한 사람이고, `save`(70~73행)는 [[#ch12-mutation]]의 저장 뮤테이션입니다. `writer`(74행)는 작성자 칸에 보일 사람, `initial`(75~77행)은 폼의 처음 값입니다. `Partial`([[#ch4-table]])은 칸을 다 채우지 않아도 된다는 표시입니다.

80행의 @@`onFinish`|onFinish@@는 폼이 모든 칸의 검사를 통과했을 때만 부르는 함수입니다. 성공했을 때 할 일이 두 곳에 있습니다. 72행은 저장할 때마다 늘 하는 일(목록 다시 읽기), 80행의 `{ onSuccess: onClose }`는 이번 호출에만 하는 일(팝업 닫기)입니다. 여섯째 덩이는 폼을 그립니다.

```tsx src="src/screens/popup/NoticeEditModal.tsx:82-102" kind="이어 쓰기"
  return (
    <Form<NoticeFormValues> form={form} component={false} initialValues={initial} onFinish={onFinish} scrollToFirstError>
      <DetailGrid
        cols={2}
        labelWidth={90}
        items={[
          { label: '제목', required: true, span: 2, value: formItem('subject', <Input placeholder="제목" count={byteCount(SUBJECT_MAX_BYTES)} aria-label="제목" />, RULES.subject) },
          { label: '사무소', value: formItem('ofcCode', <OfficeSelector allowEmpty />, RULES.ofcCode) },
          { label: '작성자', value: <span aria-label="작성자">{`${writer.name ?? '-'}${writer.perNo ? ` (${writer.perNo})` : ''}`}</span> },
          { label: '내용', required: true, span: 2, value: formItem('text', <Input.TextArea rows={10} placeholder="내용" count={byteCount(TEXT_MAX_BYTES)} aria-label="내용" />, RULES.text) },
        ]}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <Button onClick={onClose}>닫기</Button>
        <AuthButton screenKey="sample.notice" need={target ? 'upd' : 'reg'} type="primary" icon={<SaveOutlined />} loading={save.isPending} onClick={() => form.submit()}>
          저장
        </AuthButton>
      </div>
    </Form>
  );
};
```

83행의 `component={false}`는 `<form>` 태그를 따로 만들지 않는다는 antd의 옵션입니다. 그래서 [저장]은 96행처럼 `form.submit()`으로 폼을 제출합니다. 84~93행은 상세 팝업의 `itemsOf`와 같은 모양인데, 값 자리에 글자 대신 [[#ch13-popup]]의 `formItem`으로 만든 입력 칸이 들어갑니다. 작성자(90행)만은 글자인데, 42행 주석대로 서버가 로그인한 사람으로 채우기 때문입니다. 96행의 [저장]은 수정이면 수정 권한을, 등록이면 등록 권한을 묻고, 저장하는 동안 도는 표시를 냅니다.

끝으로 `NoticePage.tsx`에 3줄을 넣습니다. 21행은 `NoticeViewModal` 가져오기 줄(22행) 바로 위, 72행은 [조회] 버튼 줄(69행) 바로 아래입니다. 110행은 상세 팝업이 끝나는 `/>` 줄(109행) 아래입니다.

```tsx src="src/screens/sample/NoticePage.tsx:21-110" kind="이어 쓰기"
import { NoticeEditModal } from '../popup/NoticeEditModal';
// …
    { key: 'create', onClick: () => setEdit({ open: true, no: null }) },
// …
      <NoticeEditModal open={edit.open} no={edit.no} onClose={() => setEdit({ open: false, no: null })} />
```

[[#ch7-multi-state]]과 [[#ch7-owner]]에서 읽은 줄입니다. [등록]은 `no`에 `null`을, 상세 팝업의 [수정]은 공지 번호를 넣어 같은 팝업을 엽니다. 110행이 `edit`를 읽으므로 남은 오류도 사라집니다.

::: check
- [등록]을 누르면 "공지사항 등록" 팝업이 뜹니다. 아무것도 치지 않은 채 [저장]을 누르면 칸 아래에 "제목을 입력하세요." "내용을 입력하세요."가 뜨고, 요청은 나가지 않습니다.
- 제목 칸에 글을 치면 오른쪽 숫자가 바이트로 오릅니다("연습용 공지입니다"는 17 / 200). 글을 친 뒤에는 [저장]을 누르지 않고 [닫기]로 닫습니다([[#ch14-ready]]의 주의 상자). [등록]을 다시 누르면 친 글은 남아 있지 않습니다.
- 상세 팝업의 [수정]을 누르면 원문이 채워진 "공지사항 수정" 팝업이 뜹니다. 둘러본 뒤 [닫기]로 닫습니다. 타입 검사는 오류 없이 끝납니다.
:::

제목과 내용을 채운 [저장]은 개발 DB에 실제로 쓰므로 그다음은 그림으로 봅니다. 80행이 `POST /api/notice` 요청을 보내면, 서버가 보낸 "등록되었습니다."를 공용 창구가 띄웁니다([[#ch12-http]]). 72행의 무효화로 새 글이 맨 위에 보이고, `onClose`가 팝업을 닫습니다. 수정 팝업은 `PUT /api/notice/번호`를 보내고 "수정되었습니다."가 뜹니다.

![칸을 채워 [저장]한 뒤(가운데를 잘라 냈다). 위쪽의 알림과 목록 맨 위의 새 글](img/shots/ch14-step8-saved.png){width=90%}
