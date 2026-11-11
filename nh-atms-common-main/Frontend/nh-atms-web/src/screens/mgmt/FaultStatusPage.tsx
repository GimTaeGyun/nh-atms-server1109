import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Checkbox, Segmented, Space } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { faultApi, faultKeys } from '@/api/endpoints/fault';
import { useSearch } from '@/hooks/usePagedSearch';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { useAppMessage } from '@/hooks/useAppMessage';
import { usePermission } from '@/hooks/usePermission';
import { useAuthStore, selectOfcCode } from '@/stores/useAuthStore';
import { EMPTY_RESULT_TEXT } from '@/config/constants';
import { PageFrame } from '@/components/page/PageFrame';
import { ResultHeader } from '@/components/page/ResultHeader';
import { EchoBar } from '@/components/page/EchoBar';
import { SearchForm, type SearchField } from '@/components/search/SearchForm';
import { officeField, mcnField, checkField } from '@/components/search/fields';
import { DataGrid, BEFORE_SEARCH_TEXT } from '@/components/grid/DataGrid';
import { centerCol, col, emptyOr, indexCol, stackCol } from '@/components/grid/columns';
import { StatusTag } from '@/components/display/StatusTag';
import { EmptyState } from '@/components/feedback/EmptyState';
import { fmtAmount, fmtHoursRange, fmtOffice } from '@/utils/format';
import { MCN_STATUS_LABEL, MCN_STATUS_TONE, RESET_CMD_LABEL, type FaultMcn, type FaultStatusResult, type FaultStatusSearch, type McnStatusCd, type ResetCmd } from '@/domain/fault';
import type { ScreenProps } from '@/types/screen';

const CMDS = Object.keys(RESET_CMD_LABEL) as ResetCmd[];
const REFRESH_OPTS = [{ value: 0, label: '안 함' }, { value: 10_000, label: '10초' }, { value: 30_000, label: '30초' }, { value: 60_000, label: '60초' }];
/** 장애상황 문구: 통신단절(03)이면 설명 덧붙임 */
const errText = (r: FaultMcn) => `${r.errName ?? ''}${r.status === '03' ? ' (기기꺼짐 or 통신단절)' : ''}`;

/** 기기 상태 알약 (원본 AtmStatusTag 를 이 화면 안으로 옮김) */
const McnStatusTag = ({ status, text }: { status: McnStatusCd; text?: boolean }) => (
  <StatusTag tone={MCN_STATUS_TONE[status] ?? 'neutral'} text={text}>
    {MCN_STATUS_LABEL[status] ?? status}
  </StatusTag>
);

/**
 * 장애현황 — nh-atms 프론트 `screens/mgmt/FaultStatusPage.tsx` 이식.
 * KPI 에코바 + 기기 타일(격자)/목록 전환, 주기 새로고침, 신규 장애 알람, 선택 기기 리셋 명령(업무실행 권한 EXE).
 * 잠정(2026-11-11): 백엔드 API 가 아직 없다(`api/endpoints/fault.ts`).
 */
const FaultStatusPage = ({ screenKey, active }: ScreenProps) => {
  const ofcCode = useAuthStore(selectOfcCode);
  const { canExe } = usePermission(screenKey);
  const { notification } = useAppMessage();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<string[]>([]);
  const [refreshMs, setRefreshMs] = useState(0);
  const [alarm, setAlarm] = useState(false);
  const prevFaults = useRef<Set<string> | null>(null);

  const q = useSearch<FaultStatusSearch, FaultStatusResult>({ key: faultKeys.status, fetch: faultApi.status });
  useAutoRefresh(!!q.params && refreshMs > 0, refreshMs || null, () => void q.refetch(), active);

  // 신규 장애 알람: 이전 조회 대비 새로 장애가 된 기번
  useEffect(() => {
    const mcns = q.data?.mcns;
    if (!mcns) return;
    const now = new Set(mcns.filter((a) => a.status !== '00').map((a) => a.mcnNo));
    const prev = prevFaults.current;
    if (alarm && prev) {
      const fresh = Array.from(now).filter((t) => !prev.has(t));
      if (fresh.length) notification.warning({ title: '신규 장애 발생', description: `기번 ${fresh.join(', ')} 에서 장애가 발생했습니다.`, duration: 8 });
    }
    prevFaults.current = now;
  }, [q.data, alarm, notification]);

  // 조회구분이 사무소와 기번 사이에 오므로 useOfficeMcnFields(사무소·기번 연속) 대신 개별 팩토리 사용
  const fields: SearchField[] = useMemo(
    () => [
      officeField({ defaultValue: ofcCode }),
      { name: 'view', label: '조회구분', type: 'select', defaultValue: 'ALL', allowClear: false, options: [{ value: 'ALL', label: '전체 보기' }, { value: 'FAULT', label: '장애 기기만' }, { value: 'NORMAL', label: '정상 기기만' }] },
      mcnField(),
      { name: 'refresh', label: '새로고침', type: 'select', defaultValue: 0, allowClear: false, widthClass: 'code', options: REFRESH_OPTS },
      checkField('alarm', '장애 알람', { widthClass: 'long', componentProps: { children: <>장애 알람 <span className="muted" style={{ fontSize: 12 }}>※ 체크하면 신규 장애 발생 시 알람 기능이 작동됩니다.</span></> } }),
    ],
    [ofcCode],
  );

  const onSearch = (v: Record<string, unknown>) => {
    setRefreshMs(Number(v.refresh ?? 0));
    setAlarm(!!v.alarm);
    setSelected([]);
    prevFaults.current = null;
    const mcnNo = v.mcnNo as string | undefined;
    q.search({ ofcCode: v.ofcCode as string, mcnNo: mcnNo && mcnNo !== 'ALL' ? mcnNo : undefined, view: v.view as FaultStatusSearch['view'] });
  };

  // 대상 기번은 호출 시점에 넘긴다(행 버튼이 setSelected 직후 mutate 하면 이전 렌더의 selected 가 전송되던 문제)
  const cmd = useMutation({
    mutationFn: ({ c, mcnNos }: { c: ResetCmd; mcnNos: string[] }) => faultApi.command({ ofcCode: q.params?.ofcCode ?? '', mcnNos, cmd: c }),
    onSuccess: () => setSelected([]),
  });

  const mcns = useMemo(() => q.data?.mcns ?? [], [q.data]);
  const kpi = q.data?.kpi;
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const cmdDisabled = (a: FaultMcn) => a.status === '09' || a.status === '03';

  const listColumns = useMemo(
    () => [
      stackCol<FaultMcn>('코너정보', 200, (r) => [`${r.instPstNm ?? ''} [${r.instPstCode ?? ''}]`, `[${fmtHoursRange(r.serviceStart, r.serviceEnd)}]`], {
        onCell: (r, i) => {
          const idx = i ?? 0;
          const prev = mcns[idx - 1];
          const same = prev && prev.instPstCode === r.instPstCode;
          const span = same ? 0 : mcns.slice(idx).findIndex((x) => x.instPstCode !== r.instPstCode);
          return { rowSpan: same ? 0 : span === -1 ? mcns.length - idx : span };
        },
      }),
      { title: <Checkbox checked={!!mcns.length && selected.length === mcns.length} indeterminate={selected.length > 0 && selected.length < mcns.length} onChange={(e) => setSelected(e.target.checked ? mcns.map((a) => a.mcnNo) : [])} />, key: 'sel', width: 44, align: 'center' as const, render: (_: unknown, r: FaultMcn) => <Checkbox checked={selected.includes(r.mcnNo)} onChange={() => toggle(r.mcnNo)} /> },
      indexCol<FaultMcn>(1, 0, 56, { fixed: undefined }),
      centerCol<FaultMcn>('기번', 'mcnNo', 64),
      col<FaultMcn>('기종', 'srcNm', 150),
      { title: '시재현황', key: 'cash', width: 230, render: (_: unknown, r: FaultMcn) => <div style={{ display: 'flex', gap: 12 }}><span>현시재 : <b className="num">{fmtAmount(r.cash)}</b></span><span>수표 : <b className="num">{fmtAmount(r.checkCash)}</b></span></div> },
      centerCol<FaultMcn>('상태', 'status', 100, { render: (v: McnStatusCd) => <McnStatusTag status={v} text /> }),
      col<FaultMcn>('장애상황', 'errName', 170, { render: (v: string, r) => emptyOr(v, () => errText(r)) }),
      { title: '실행', key: 'cmds', width: 330, render: (_: unknown, r: FaultMcn) => <Space size={4}>{CMDS.map((c) => <Button key={c} size="small" disabled={!canExe || cmdDisabled(r)} onClick={() => { setSelected([r.mcnNo]); cmd.mutate({ c, mcnNos: [r.mcnNo] }); }}>{RESET_CMD_LABEL[c]}</Button>)}</Space> },
    ],
    [mcns, selected, canExe, cmd],
  );

  return (
    <PageFrame screenKey={screenKey} lastUpdated={q.lastUpdated} onRefresh={() => void q.refetch()} refreshing={q.loading}>
      <SearchForm fields={fields} onSearch={onSearch} loading={q.loading} onReset={q.reset} />
      <ResultHeader
        total={q.searched ? mcns.length : undefined}
        selected={selected.length}
        leftActions={
          canExe && (
            <Space size={6} style={{ marginLeft: 8 }}>
              {CMDS.map((c) => (
                <Button key={c} size="small" disabled={!selected.length} loading={cmd.isPending && cmd.variables?.c === c} onClick={() => cmd.mutate({ c, mcnNos: selected })}>
                  {RESET_CMD_LABEL[c]}
                </Button>
              ))}
            </Space>
          )
        }
      >
        <Segmented className="view-toggle" value={view} onChange={(v) => setView(v as typeof view)} options={[{ value: 'grid', label: '격자 보기', icon: <AppstoreOutlined /> }, { value: 'list', label: '목록 보기', icon: <UnorderedListOutlined /> }]} />
      </ResultHeader>
      {q.searched && (
        <EchoBar
          template="2.2fr 1fr 1fr 1fr"
          cells={[
            { label: '사무소', value: fmtOffice(q.data?.ofcCode, q.data?.kanm), align: 'left' }, { label: '총 운영대수', value: kpi?.total ?? '-' }, { label: '정상운영', value: kpi?.normal ?? '-' }, { label: '미개국', value: kpi?.notOpen ?? '-' },
            { label: '조회일자', value: q.data?.asOf ?? '-', align: 'left' }, { label: '기기장애', value: kpi?.devFault ?? '-', tone: kpi?.devFault ? 'danger' : undefined }, { label: '운영장애', value: kpi?.opFault ?? '-', tone: kpi?.opFault ? 'warn' : undefined }, { label: '통신단절', value: kpi?.commLost ?? '-', tone: kpi?.commLost ? 'danger' : undefined },
          ]}
        />
      )}
      {view === 'grid' ? (
        <div className="atm-grid">
          {!q.searched && <div className="panel" style={{ gridColumn: '1 / -1' }}><EmptyState text={BEFORE_SEARCH_TEXT} /></div>}
          {q.searched && mcns.length === 0 && <div className="panel" style={{ gridColumn: '1 / -1' }}><EmptyState text={EMPTY_RESULT_TEXT} /></div>}
          {mcns.map((a) => {
            const tone = MCN_STATUS_TONE[a.status];
            const sel = selected.includes(a.mcnNo);
            return (
              <div key={a.mcnNo} className={`atm-card st-${tone}${sel ? ' selected' : ''}`} onClick={() => toggle(a.mcnNo)} role="checkbox" aria-checked={sel}>
                <div className="ac-head">
                  <Space size={6}>
                    <Checkbox checked={sel} onClick={(e) => e.stopPropagation()} onChange={() => toggle(a.mcnNo)} />
                    <McnStatusTag status={a.status} />
                  </Space>
                  <span className="desc">{a.status === '03' ? '기기꺼짐 or 통신단절' : a.errName ?? MCN_STATUS_LABEL[a.status]}</span>
                </div>
                <div className="ac-body">
                  <div className="ac-thumb" />
                  <div>
                    <div className={`ac-id${tone === 'danger' ? ' danger' : ''}`}>[{a.mcnNo}]</div>
                    <div className="ac-model">{a.srcNm}</div>
                  </div>
                </div>
                <div className="ac-kv">
                  <span className="k">현 시재</span><span className="v">{fmtAmount(a.cash)}</span>
                  <span className="k">수표</span><span className="v">{fmtAmount(a.checkCash)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 다중 선택(체크박스) 화면이라 단일 키용 selectedKey 대신 rowClassName 유지 */
        <DataGrid<FaultMcn> columns={listColumns} rows={mcns} rowKey="mcnNo" loading={q.loading} searched={q.searched} grade="G3" clientPageSize={0} rowClassName={(r) => (selected.includes(r.mcnNo) ? 'ant-table-row-selected' : '')} />
      )}
    </PageFrame>
  );
};
export default FaultStatusPage;
