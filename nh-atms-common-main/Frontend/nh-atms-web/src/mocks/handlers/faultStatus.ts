import { http, type RequestHandler } from 'msw';
import type { FaultStatusKpi, FaultStatusResult, FaultStatusRow } from '@/domain/faultStatus';
import { dayjs } from '@/utils/date';
import { OFFICES } from '../data/lookup';
import { FAULT_STATUS_ROWS } from '../data/faultStatus';
import { LATENCY, fail, ok, q } from './_util';

/** 장애현황(`mgmt.faultStatus`) 목 핸들러 — API 계약 §8. 집계는 조회구분과 상관없이 사무소 전체 */

const kpiOf = (rows: FaultStatusRow[]): FaultStatusKpi => ({
  total: rows.length,
  normal: rows.filter((r) => r.tmnStat === '00').length,
  opErr: rows.filter((r) => r.tmnStat === '01').length,
  devErr: rows.filter((r) => r.tmnStat === '02').length,
  commLost: rows.filter((r) => r.tmnStat === '03').length,
  notOpen: rows.filter((r) => r.tmnStat === '09').length,
});

export const faultStatusHandlers: RequestHandler[] = [
  http.get('/api/fault-status', async ({ request }) => {
    await LATENCY();
    const sp = q(request);
    const ofcCode = (sp.get('ofcCode') ?? '').trim();
    if (!ofcCode) return fail(400, '사무소코드는 필수입니다.', 'V001_20');
    const mcnNo = sp.get('mcnNo');
    const view = sp.get('view');
    const all = FAULT_STATUS_ROWS.filter((r) => r.ofcCode === ofcCode && (!mcnNo || r.mcnNo === mcnNo));
    const rows = all.filter((r) => (view === 'FAULT' ? r.tmnStat !== '00' : view === 'NORMAL' ? r.tmnStat === '00' : true));
    const result: FaultStatusResult = {
      asOf: dayjs().format('YYYYMMDDHHmmss'),
      ofcCode,
      kanm: OFFICES.find((o) => o.ofcCode === ofcCode)?.kanm ?? null,
      kpi: kpiOf(all),
      rows,
    };
    return ok(result);
  }),
];
