import { StatusTag, type Tone } from '@/components/display/StatusTag';
import { centerCol, col, emptyOr, indexCol, type Col } from '@/components/grid/columns';
import { codeNameLabel } from '@/components/search/lookupFields';
import { fmtTime } from '@/utils/format';
import { TMN_STAT_LABEL, type FaultStatusRow } from '@/domain/faultStatus';

/** 단말기상태 → 색 (잠정 Q-18) */
const TONE: Record<string, Tone> = { '00': 'success', '01': 'warning', '02': 'danger', '03': 'danger', '09': 'neutral' };

const statText = (r: FaultStatusRow): string => (r.tmnStat ? TMN_STAT_LABEL[r.tmnStat] ?? r.tmnStat : '');
const cornerText = (r: FaultStatusRow): string => codeNameLabel(r.instPstCode, r.instPstNm);
const srcText = (r: FaultStatusRow): string => (r.src ? codeNameLabel(r.src, r.srcNm) : '');
const hoursText = (r: FaultStatusRow): string => (r.opBgnTime ? `${fmtTime(r.opBgnTime, false)} ~ ${fmtTime(r.opEndTime, false)}` : '');

/** 장애현황 목록 컬럼 — 엑셀도 이 정의로 만든다(excelColumnsOf) */
export const faultStatusColumns = (): Col<FaultStatusRow>[] => [
  indexCol<FaultStatusRow>(1, 0),
  centerCol<FaultStatusRow>('기번', 'mcnNo', 64, { fixed: 'left' }),
  col<FaultStatusRow>('코너', 'instPstCode', 180, { render: (_v, r) => cornerText(r), excel: cornerText }),
  col<FaultStatusRow>('기종', 'src', 150, { render: (_v, r) => emptyOr(srcText(r), (t) => t), excel: srcText }),
  centerCol<FaultStatusRow>('상태', 'tmnStat', 100, {
    render: (_v, r) => emptyOr(r.tmnStat, (s) => <StatusTag tone={TONE[s] ?? 'neutral'} text>{statText(r)}</StatusTag>),
    excel: statText,
  }),
  col<FaultStatusRow>('장애내용', 'errNm', 180, { render: (_v, r) => emptyOr(r.errNm, (t) => t) }),
  centerCol<FaultStatusRow>('장애발생', 'errTime', 90, { render: (_v, r) => fmtTime(r.errTime), excel: (r) => fmtTime(r.errTime) }),
  centerCol<FaultStatusRow>('최종개국', 'lastOpenTime', 90, { render: (_v, r) => fmtTime(r.lastOpenTime), excel: (r) => fmtTime(r.lastOpenTime) }),
  centerCol<FaultStatusRow>('영업시간', 'opBgnTime', 120, { render: (_v, r) => emptyOr(hoursText(r), (t) => t), excel: hoursText }),
];
