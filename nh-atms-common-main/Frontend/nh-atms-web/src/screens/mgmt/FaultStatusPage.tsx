import { useMemo } from 'react';
import { faultStatusApi, faultStatusKeys } from '@/api/endpoints/faultStatus';
import { useSearch } from '@/hooks/usePagedSearch';
import { PageFrame } from '@/components/page/PageFrame';
import { ResultHeader } from '@/components/page/ResultHeader';
import { ExcelButton } from '@/components/page/ExcelButton';
import { EchoBar } from '@/components/page/EchoBar';
import { SearchForm, type SearchField } from '@/components/search/SearchForm';
import { useOfficeMcnFields } from '@/components/search/fields';
import { DataGrid } from '@/components/grid/DataGrid';
import { excelColumnsOf } from '@/components/grid/columns';
import { downloadExcel } from '@/utils/excel';
import { fmtDateTime14, fmtOffice } from '@/utils/format';
import type { FaultStatusRow, FaultStatusSearch } from '@/domain/faultStatus';
import type { ScreenProps } from '@/types/screen';
import { faultStatusColumns } from './FaultStatusColumns';

/** 조회구분 칸 — 사무소·기번 뒤에 붙는다 */
const VIEW_FIELD: SearchField[] = [
  {
    name: 'view',
    label: '조회구분',
    type: 'select',
    defaultValue: 'ALL',
    allowClear: false,
    options: [
      { value: 'ALL', label: '전체 보기' },
      { value: 'FAULT', label: '장애 기기만' },
      { value: 'NORMAL', label: '정상 기기만' },
    ],
  },
];

const keyOf = (r: FaultStatusRow): string => `${r.ofcCode}-${r.mcnNo}`;

/** 장애현황(`mgmt.faultStatus`) — 조회조건 → 집계 요약줄(EchoBar) → 목록(페이징 없음). 조회만 있는 화면 */
const FaultStatusPage = ({ screenKey }: ScreenProps) => {
  const fields = useOfficeMcnFields({ extra: VIEW_FIELD });
  const search = useSearch({ key: faultStatusKeys.list, fetch: faultStatusApi.list });
  const columns = useMemo(() => faultStatusColumns(), []);
  const rows = search.data?.rows ?? [];
  const kpi = search.data?.kpi;

  const onSearch = (v: Record<string, unknown>) => {
    const p: FaultStatusSearch = {
      ofcCode: v.ofcCode as string,
      mcnNo: (v.mcnNo as string) || undefined,
      view: v.view === 'ALL' ? undefined : (v.view as FaultStatusSearch['view']),
    };
    search.search(p);
  };
  const excel = () => downloadExcel<FaultStatusRow>(excelColumnsOf(columns), rows, '장애현황');

  return (
    <PageFrame screenKey={screenKey} lastUpdated={search.lastUpdated} onRefresh={() => void search.refetch()} refreshing={search.loading}>
      <SearchForm fields={fields} onSearch={onSearch} loading={search.loading} onReset={search.reset} />
      {search.data && (
        <EchoBar
          template="2fr 1fr 1fr 1fr"
          cells={[
            { label: '사무소', value: fmtOffice(search.data.ofcCode, search.data.kanm), align: 'left' },
            { label: '총 운영대수', value: kpi?.total },
            { label: '정상운영', value: kpi?.normal },
            { label: '미개국', value: kpi?.notOpen },
            { label: '조회시각', value: fmtDateTime14(search.data.asOf), align: 'left' },
            { label: '기기장애', value: kpi?.devErr, tone: kpi?.devErr ? 'danger' : undefined },
            { label: '운영장애', value: kpi?.opErr, tone: kpi?.opErr ? 'warn' : undefined },
            { label: '통신단절', value: kpi?.commLost, tone: kpi?.commLost ? 'danger' : undefined },
          ]}
        />
      )}
      <ResultHeader total={search.searched ? rows.length : undefined}>
        <ExcelButton onClick={() => void excel()} disabled={!rows.length} />
      </ResultHeader>
      <DataGrid<FaultStatusRow> columns={columns} rows={rows} rowKey={keyOf} loading={search.loading} searched={search.searched} grade="G2" clientPageSize={0} />
    </PageFrame>
  );
};

export default FaultStatusPage;
