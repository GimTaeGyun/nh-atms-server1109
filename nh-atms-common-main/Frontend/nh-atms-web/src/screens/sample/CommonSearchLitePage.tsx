import { useMemo } from 'react';
import { Form } from 'antd';
import { mcnInfoApi, mcnInfoKeys } from '@/api/endpoints/mcnInfo';
import { usePagedSearch } from '@/hooks/usePagedSearch';
import { PageFrame } from '@/components/page/PageFrame';
import { ResultHeader } from '@/components/page/ResultHeader';
import { SearchForm } from '@/components/search/SearchForm';
import { DataGrid } from '@/components/grid/DataGrid';
import type { McnInfo, McnInfoSearch } from '@/domain/mcnInfo';
import type { ScreenProps } from '@/types/screen';
import { liteColumns, toLiteParams, useLiteFields } from './CommonSearchLiteParts';

const keyOf = (r: McnInfo): string => `${r.ofcCode}-${r.mcnNo}`;

/**
 * 공통 조회 화면(lite) — 가장 짧은 "조회 전용" 견본. 화면 뼈대 4단만 있다:
 *  PageFrame(제목·↻) → SearchForm(조회조건 + [조회]) → ResultHeader(건수) → DataGrid(서버 페이징)
 * 등록·수정·삭제·엑셀·인쇄·팝업이 필요하면 공지사항/기기정보 견본에서 그 부분만 가져온다.
 */
const CommonSearchLitePage = ({ screenKey }: ScreenProps) => {
  const [form] = Form.useForm();
  const fields = useLiteFields();
  const search = usePagedSearch<McnInfoSearch, McnInfo>({ key: mcnInfoKeys.list, fetch: mcnInfoApi.list });
  const columns = useMemo(() => liteColumns(search.page, search.size), [search.page, search.size]);

  return (
    <PageFrame screenKey={screenKey} lastUpdated={search.lastUpdated} onRefresh={() => void search.refetch()} refreshing={search.loading}>
      <SearchForm form={form} fields={fields} onSearch={(v) => search.search(toLiteParams(v))} loading={search.loading} />
      <ResultHeader total={search.searched ? search.total : undefined} />
      <DataGrid<McnInfo>
        columns={columns}
        rows={search.rows}
        rowKey={keyOf}
        loading={search.loading}
        searched={search.searched}
        grade="G1"
        pagination={search.pagination}
      />
    </PageFrame>
  );
};

export default CommonSearchLitePage;
