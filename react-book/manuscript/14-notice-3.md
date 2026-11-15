## 고르고, 지우고, 내보내기 {#ch14-finish}

화면의 큰 덩어리는 다 놓였습니다. 남은 세 단계는 줄 수가 적습니다. 행을 골라 고치고 지우는 길을 내고, 목록을 엑셀 파일과 종이로 내보냅니다.

::: step 9 결과 머리줄과 행 선택
표 위에 건수 줄을 놓고, 행 앞의 체크 칸으로 고른 공지를 기억하게 합니다.
:::

`NoticePage.tsx` 하나에 일곱 줄을 넣습니다. 9행은 8행 아래, 36행은 35행 아래, 62행은 `onSearch` 안의 `search.search(…)` 줄 위, 73행은 72행 아래, 86·88행은 85행 아래, 97행은 96행 아래입니다.

```tsx src="src/screens/sample/NoticePage.tsx:9-97" kind="이어 쓰기"
import { ResultHeader } from '@/components/page/ResultHeader';
// …
  const [selected, setSelected] = useState<number[]>([]);
// …
    setSelected([]);
// …
    { key: 'update', onClick: () => setEdit({ open: true, no: selected[0] }), disabled: selected.length !== 1 },
// …
      <ResultHeader title="공지 목록" total={search.searched ? search.total : undefined} selected={selected.length} note={search.searched ? '제목 클릭·행 더블클릭 = 상세(조회수 +1), 체크 = 수정(1건)·삭제(여러 건) 대상' : undefined}>
      {/* … */}
      </ResultHeader>
// …
        rowSelection={{ selectedRowKeys: selected, onChange: (keys) => setSelected(keys.map(Number)) }}
```

모두 [[#ch7-multi-state]]와 [[#ch13-skeleton]]에서 읽은 줄입니다. 36행의 `selected`는 체크한 공지 번호의 배열이고, 체크 칸이 바뀔 때마다 97행이 새 배열을 넣습니다. 62행은 [조회]를 새로 누르면 체크를 비우는 줄로, 단계 5에서 비워 둔 자리입니다. 73행의 [수정]은 한 건만 골랐을 때 켜집니다. 86행의 `ResultHeader`는 조회 전에는 건수와 안내문을 감추고, `selected.length`를 받아 '1건 선택'을 붙입니다. 87행 자리는 단계 11에서 채웁니다.

::: check
- 표 위에 "공지 목록"과 건수가, 표 왼쪽에 체크 칸이 생깁니다.
- 한 행을 체크하면 "1건 선택"이 붙고 [수정]이 켜집니다. 누르면 그 공지의 수정 팝업이 뜹니다(둘러본 뒤 [닫기]). 두 행을 체크하면 [수정]이 꺼집니다.
- 체크해 둔 채 [조회]를 다시 누르면 선택이 비워집니다.
:::

![단계 9를 마친 화면. 한 행을 고르자 "1건 선택"이 붙고 [수정]이 켜졌다](img/shots/ch14-step9-select.png){width=88%}

::: step 10 삭제
[삭제] 버튼을 놓고, 고른 공지를 지우는 요청을 준비합니다.
:::

네 줄을 넣습니다. 18행은 `import type { Notice, NoticeSearch }` 줄 바로 위에, 48행은 47행 아래에, 66행은 `onSearch` 함수가 끝나는 64행 아래에, 74행은 73행 아래에 둡니다.

```tsx src="src/screens/sample/NoticePage.tsx:18-74" kind="이어 쓰기"
import { CMSG } from '@/config/messages';
// …
  const remove = useMutation({ mutationFn: noticeApi.remove, onSuccess: invalidate });
// …
  const onDelete = () => remove.mutate(selected, { onSuccess: () => setSelected([]) });
// …
    { key: 'delete', onClick: onDelete, disabled: !selected.length, loading: remove.isPending, confirm: CMSG.deleteSelected(selected.length) },
```

48행은 47행의 `view`와 같은 모양에 서버 함수만 `noticeApi.remove`로 바꾼 뮤테이션입니다. 66행은 체크한 번호 배열을 건네 지우고, 이번 삭제가 성공하면 체크를 비웁니다. 단계 8의 80행처럼 늘 하는 일(목록 다시 읽기)은 훅에, 이번 일의 마무리는 `mutate`에 적었습니다. 74행의 [삭제]는 고른 것이 없으면 꺼지고, 지우는 동안 돌며, `confirm`이 있어 바로 지우지 않고 확인 풍선부터 띄웁니다([[#ch13-frame]]). 풍선 문구는 `CMSG.deleteSelected`가 건수를 넣어 만듭니다([[#ch13-format]]).

::: check
- [삭제]가 생기고, 체크하기 전에는 꺼져 있습니다.
- 두 행을 체크하고 [삭제]를 누르면 "선택한 2건을 삭제하시겠습니까?" 풍선이 뜹니다. 여기서는 [취소]를 누릅니다. [확인]은 개발 DB의 공지를 실제로 지웁니다.
- 타입 검사는 오류 없이 끝납니다.
:::

[확인]을 누른 뒤는 아래 그림으로 봅니다. 지울 번호 배열을 실은 `POST /api/notice/delete`가 나가고, 서버가 보낸 "2건 삭제되었습니다."가 뜹니다. 48행의 무효화로 목록이 다시 읽혀 건수가 줄고, 66행이 체크를 비웁니다.

![[확인]을 누른 뒤의 화면(완성 화면에서 찍어 버튼이 더 많다). 알림이 뜨고 건수가 줄었으며 체크가 비었다](img/shots/ch14-step10-done.png){width=84%}

::: step 11 엑셀과 출력
지금 보이는 목록을 엑셀 파일로 내려받고, 인쇄 양식으로 출력하게 합니다.
:::

엑셀부터 넣습니다. `NoticePage.tsx`만 고칩니다. 10행은 9행 아래, 14·16행은 `DataGrid` 가져오기 줄 아래에 차례로, 25행은 가져오기 줄들과 머리 주석 사이, 65행은 66행 바로 위, 70행은 69행 아래, 87행은 `ResultHeader` 태그 사이에 둡니다.

```tsx src="src/screens/sample/NoticePage.tsx:10-87" kind="이어 쓰기"
import { ExcelButton } from '@/components/page/ExcelButton';
// …
import { excelColumnsOf } from '@/components/grid/columns';
// …
import { downloadExcel } from '@/utils/excel';
// …
const TITLE = '공지사항';
// …
  const excel = () => downloadExcel<Notice>(excelColumnsOf(columns), search.rows, TITLE);
// …
    { key: 'excel', onClick: excel, disabled: !search.rows.length },
// …
        <ExcelButton onClick={excel} disabled={!search.rows.length} />
```

25행의 `TITLE`은 엑셀 파일 이름과 인쇄물 제목이 함께 쓰는 화면 제목입니다. 65행은 [[#ch13-grid]]에서 읽은 대로 화면의 컬럼에서 엑셀 컬럼을 뽑아 지금 표의 행으로 파일을 만듭니다. 서버를 다시 부르지 않으니 지금 보이는 쪽의 행만 담깁니다. 70행의 [엑셀]과 87행의 [엑셀 다운로드]는 같은 함수를 부릅니다.

다음은 출력입니다. `NoticeParts.tsx`의 가져오기 줄을 고치면 17행이 원본과 같아집니다.

```tsx title="src/screens/sample/NoticeParts.tsx" kind="고치기" diff
 import { centerCol, col, countCol, dateCol, indexCol, textCol, type Col } from '@/components/grid/columns';
+import type { PrintCondition } from '@/components/print/PrintLayout';
-import { fmtOffice } from '@/utils/format';
+import { fmtDate, fmtOffice } from '@/utils/format';
```

파일 맨 끝에 인쇄물 머리에 찍을 조건 네 칸을 만드는 함수를 칩니다.

```tsx src="src/screens/sample/NoticeParts.tsx:106-115" kind="이어 쓰기"
/* ---------- 4. 인쇄 조건 ---------- */
export const noticePrintConditions = (p: NoticeSearch | null, officeLabel: string): PrintCondition[] => {
  const field = FIELD_OPTIONS.find((o) => o.value === (p?.field ?? 'ALL'))?.label ?? '전체';
  return [
    { label: '작성일', value: p?.fromDate || p?.toDate ? `${fmtDate(p?.fromDate)} ~ ${fmtDate(p?.toDate)}` : '전체' },
    { label: '사무소', value: p?.ofcCode ? officeLabel : '전체' },
    { label: '작성자', value: p?.perNo ?? '전체' },
    { label: '검색', value: p?.keyword ? `${field} : ${p.keyword}` : '전체' },
  ];
};
```

`p`는 지금 조회조건인데 조회 전이면 `null`이라, 칸마다 [[#ch3-cond]]의 `?.`로 엽니다. 108행은 안쪽부터 읽습니다. 검색구분(없으면 `'ALL'`)과 같은 값을 `FIELD_OPTIONS`에서 찾아(`find`, [[#ch3-array]]) 라벨을 꺼냅니다. 못 찾으면 `find`가 `undefined`를 돌려주니 `?.`가 멈추고 `??`가 '전체'를 고릅니다. 110~113행도 조건이 있으면 글자를, 없으면 '전체'를 넣습니다.

이제 `NoticePage.tsx`의 가져오기 줄을 고칩니다. 23행이 원본과 같아지면 이름을 더해 가던 줄은 모두 끝납니다.

```tsx title="src/screens/sample/NoticePage.tsx" kind="고치기" diff
 import { usePagedSearch } from '@/hooks/usePagedSearch';
+import { useOfficeLabel } from '@/hooks/useLookup';
+import { usePrint } from '@/hooks/usePrint';
 import { PageFrame } from '@/components/page/PageFrame';
 // …
 import { excelColumnsOf } from '@/components/grid/columns';
+import { PrintLayout } from '@/components/print/PrintLayout';
 import { downloadExcel } from '@/utils/excel';
+import { fmtCount, fmtDate, fmtOffice } from '@/utils/format';
 // …
-import { noticeColumns, toNoticeParams, useNoticeFields } from './NoticeParts';
+import { noticeColumns, noticePrintConditions, toNoticeParams, useNoticeFields } from './NoticeParts';
```

42·43행은 41행 아래에, 71행은 70행 아래에 넣습니다.

```tsx src="src/screens/sample/NoticePage.tsx:42-71" kind="이어 쓰기"
  const officeLabel = useOfficeLabel(search.params?.ofcCode);
  const { print } = usePrint(TITLE);
// …
    { key: 'print', onClick: () => print(), disabled: !search.searched },
```

42행은 [[#ch8-custom]]에서 읽은 훅으로, 조회조건의 사무소 코드를 `[코드] 사무소명` 글자로 바꿉니다. 43행의 `usePrint`는 [출력]의 인쇄를 맡는 훅입니다. 71행을 `onClick: print`로 줄이면 클릭의 이벤트 객체가 `print`의 인자로 들어가, 인쇄하는 동안 문서 제목이 `[object Object]`가 됩니다. 타입 검사도 잡지 못하는 실수라서 화살표 함수로 감쌌습니다([[#ch7-event]]). 마지막으로 110행 아래, `</PageFrame>` 바로 위에 인쇄 양식을 칩니다.

```tsx src="src/screens/sample/NoticePage.tsx:111-124" kind="이어 쓰기"
      <PrintLayout title={TITLE} conditions={noticePrintConditions(search.params, officeLabel)}>
        <table>
          <thead>
            <tr><th>순번</th><th>번호</th><th>제목</th><th>사무소</th><th>작성자</th><th>작성일</th><th>조회수</th></tr>
          </thead>
          <tbody>
            {search.rows.map((r, i) => (
              <tr key={r.no}>
                <td>{(search.page - 1) * search.size + i + 1}</td><td>{r.no}</td><td>{r.subject}</td><td>{fmtOffice(r.ofcCode, r.kanm)}</td><td>{r.name}</td><td>{fmtDate(r.wrtDate)}</td><td>{fmtCount(r.visit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </PrintLayout>
```

@@`PrintLayout`|PrintLayout@@은 화면에서는 숨어 있다가 인쇄할 때만 나타나는 양식입니다. 제목과 조건 표, 출력자와 출력일시를 그리고, 태그 사이의 표를 본문으로 씁니다. 표는 [[#ch2-tags]]에서 읽은 `table`이고, 117행은 [[#ch5-list]]처럼 `map`과 `key`로 행마다 `tr`을 만듭니다. 119행의 순번은 쪽을 넘겨도 이어지게 셉니다. 20건씩 보는 2쪽의 첫 행이면 `(2 - 1) * 20 + 0 + 1`, 곧 21입니다. 이 양식은 `PageFrame` 바로 안에 둡니다. 그래야 인쇄할 때 화면의 나머지가 빠지고 이 양식만 나온다고 `PrintLayout.tsx` 29행 주석이 적어 두었습니다.

::: check
- 제목 줄의 버튼이 조회·엑셀·출력·등록·수정·삭제 여섯 개가 되고, 표 위 오른쪽에 [엑셀 다운로드]가 생깁니다. 엑셀과 출력은 조회 전에는 꺼져 있습니다.
- [엑셀]을 누르면 `공지사항_날짜_시분.xlsx` 파일이 내려옵니다. 순번을 뺀 여섯 컬럼에 지금 쪽의 행만 들어 있습니다. [출력]을 누르면 인쇄 창이 뜨고, 인쇄하지 않고 닫아도 됩니다.
- 타입 검사가 오류 없이 끝납니다. 주석까지 모두 쳤다면 여섯 파일은 이제 원본과 같습니다.
:::

![인쇄하면 이렇게 나온다. 제목과 출력일시, 조건 네 칸, 그 아래 본문 표](img/shots/ch14-step11-print.png){width=100%}

## 창구를 나서며 {#ch14-end}

빈 파일 여섯 개로 시작해 오류 화면만 뜨던 탭이, 조회하고 고르고 고치고 지우고 내보내는 화면이 되었습니다. 창구를 나서기 전에 세 가지를 챙깁니다.

### 원본과 견주기

연습용 폴더에서 터미널을 열고 아래 명령을 칩니다. `<원본 폴더>` 자리에는 원본 `nh-atms-web` 폴더의 경로를 씁니다. 파일 탐색기의 주소 줄에서 복사해 붙이면 편합니다.

```bash
git diff --no-index --ignore-cr-at-eol --stat <원본 폴더>/src src
```

@@|git diff --no-index@@아무것도 찍히지 않으면 `src` 폴더 전체가 원본과 같습니다. 다르면 아래처럼 파일 이름과 다른 줄 수가 나옵니다. 머리 주석 여섯 줄을 치지 않았을 때의 모습입니다.

```out
 …/nh-atms-web/src => src}/screens/sample/NoticePage.tsx | 6 ------
 1 file changed, 6 deletions(-)
```

`--stat`을 빼면 어느 줄이 다른지 원본 줄은 `-`, 내 줄은 `+`로 보여 줍니다. `--ignore-cr-at-eol`은 운영체제마다 줄 끝에 붙이는 글자가 달라서 생기는 차이를 무시하라는 옵션입니다. 남는 차이는 대개 주석이나 빈 줄처럼 동작과 상관없는 것입니다. 다 견줬으면 연습용 개발 서버를 <kbd>Ctrl</kbd>+<kbd>C</kbd>로 끕니다.

### 조회만 하는 사람의 눈으로

여섯 파일에는 권한을 따지는 `if`가 한 줄도 없습니다. `ActionBar`에 화면키를 건넨 83행, 두 팝업의 `AuthButton`에 `need`를 적은 줄이 전부입니다. 그런데도 조회만 할 수 있는 사람이 열면 아래처럼 [등록]·[수정]·[삭제]가 흐려집니다. [[#ch11]]의 '권한 미리보기'를 [조회만]으로 바꾸면 내 화면에서도 같은 모습을 보고, 상세 팝업의 [수정]이 흐려진 것도 확인할 수 있습니다.

![조회 전용 사용자의 화면. 한 행을 골라도 [등록]·[수정]·[삭제]가 흐리다](img/shots/ch14-readonly.png){width=88%}

### 진짜 새 화면을 만들 때

이 장에서는 화면 등록과 메뉴가 이미 되어 있었습니다. @@|새 화면을 만들 때 할 일@@새 업무 화면을 만들 때는 파일 여섯 개 말고도 할 일이 있습니다.

표: 새 화면을 만들 때 할 일

| 할 일 | 어디에 | 누가 |
|---|---|---|
| 서버와 맞춘 자료의 모양과 API 함수 | `domain/`, `api/endpoints/` | 화면 담당 |
| 견본을 복사해 화면 파일 만들기 | `screens/` (`NoticeParts.tsx` 4행 주석) | 화면 담당 |
| 팝업의 `screenKey="sample.notice"` 바꾸기 | 팝업 파일의 `AuthButton` | 화면 담당 |
| 화면키와 팝업 화면키, `def(…)` 한 줄 | `screenIds.ts`, `registry.ts` | 화면 담당이 적어 리드에게 |
| 메뉴 표에 주소와 권한 넣기 | 서버의 메뉴 표 | 리드·백엔드([[#ch10-menu]]) |
| 넘기기 전에 검사 | `npm run check` | 화면 담당 |

셋째 줄은 놓치기 쉽습니다. 두 팝업은 공지사항의 화면키를 글자로 적어 권한을 묻습니다(`NoticeViewModal.tsx` 46행, `NoticeEditModal.tsx` 96행). 복사한 팝업에 이 글자를 그대로 두면 새 화면이 아니라 공지사항의 권한을 묻게 됩니다.

### 다음에 읽을 견본

메뉴의 [견본]에는 모양이 다른 견본이 둘 더 있습니다. 기기정보(`McnInfoPage.tsx`)는 목록 탭과 등록·수정 탭을 오가는 화면이고, 기기모델코드(`McnModelPage.tsx`)는 표 안에서 바로 고친 뒤 [저장] 한 번으로 보내는 화면입니다. 뼈대는 공지사항과 같고, state를 어디에 두고 이벤트를 어떻게 잇는지가 다릅니다. 이 장에서처럼 원본을 옆에 펼쳐 두고 한 줄씩 읽어 보세요.

머리말에서 번호표를 뽑았고, 4부를 열 때 14번 창구에 불이 들어왔습니다. 지금 여러분 손에는 빈 파일에서 시작해 직접 만든 화면 하나가 있습니다. 다음 화면도 같은 순서로 만듭니다. 자료의 모양을 적고, 서버 창구를 내고, 조건과 표와 팝업을 차례로 놓고, 단계마다 화면에서 확인합니다. 막히면 견본을 펼치고, 위의 표를 옆에 두고 시작하세요.

::: summary
- 화면 하나는 타입, API 함수, 부품 서랍, 화면 본체, 팝업 둘의 여섯 파일로 나뉜다. 가져다 쓰이는 파일부터 만든다.
- 가져오기 줄에는 그 단계에서 쓰는 이름만 적는다. 쓰지 않는 이름은 타입 검사의 오류가 된다.
- 타입 검사가 조용해도 다 맞은 것은 아니다. 단계마다 화면에서 눌러 확인한다.
- 팝업이 열렸는지는 화면 본체가 state로 기억하고, 팝업에는 `open`과 알릴 함수를 건넨다.
- 저장과 삭제는 뮤테이션이다. 늘 하는 일(목록 무효화)은 훅에, 이번 일의 마무리는 `mutate`에 적는다.
- 화면에는 권한을 따지는 `if`가 없다. `ActionBar`와 `AuthButton`에 화면키와 필요한 권한만 적는다.
:::

::: quiz
1. 단계 6을 마치면 타입 검사가 `'viewOpen' is declared but its value is never read.`를 남깁니다. 무슨 뜻이고, 단계 7의 어느 줄이 이 오류를 없앱니까?
2. 등록·수정 팝업에서 `destroyOnHidden`을 빼면 어떤 일이 생깁니까? 타입 검사로 이 실수를 찾을 수 있습니까?
3. 공지 두 건을 지우는 데 성공하면 목록이 다시 읽히고 체크가 비워집니다. 두 일은 각각 `NoticePage.tsx`의 몇 행에 적혀 있습니까?
:::
::: answer
1. `viewOpen`을 바꾸는 곳은 있는데 그 값을 읽는 부품이 없다는 뜻이다. 상세 팝업을 놓는 101행 `open={viewOpen}`이 값을 읽어 오류가 사라진다. 2. 닫아도 안쪽 폼이 버려지지 않아, 다시 열면 쓰다 만 글이 남는다. 타입은 맞으므로 타입 검사는 조용하고, 화면에서 확인해야 한다. 3. 목록 다시 읽기는 48행 `useMutation`의 `onSuccess: invalidate`, 체크 비우기는 66행 `mutate`에 건넨 `onSuccess`다.
:::
