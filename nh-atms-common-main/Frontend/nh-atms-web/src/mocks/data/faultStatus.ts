/**
 * 장애현황(`mgmt.faultStatus`) 목 데이터 — 응답 모양은 domain/faultStatus.ts(API 계약 §8).
 * 기기 목록은 공통 조회 목(data/lookup.ts MACHINES)과 같은 값. 상태는 createRng 로 새로고침해도 같다.
 */
import type { FaultStatusRow } from '@/domain/faultStatus';
import { createRng } from '@/utils/random';
import { MACHINES } from './lookup';

/** [devCode, errCode, errNm, 단말기상태] — 목 전용 견본 값 */
const ERRORS: [string, string, string, string][] = [
  ['01', '01', '현금부족', '01'],
  ['02', '03', '명세표 걸림', '02'],
  ['03', '05', '카드 걸림', '02'],
  ['04', '02', '저널 부족', '01'],
];

const build = (): FaultStatusRow[] => {
  const rng = createRng(20261110);
  return MACHINES.filter((m) => m.useYn === 'Y').map((m) => {
    const roll = rng.next();
    const err = roll < 0.3 ? rng.pick(ERRORS) : null;
    const tmnStat = err ? err[3] : roll < 0.38 ? '03' : roll < 0.43 ? '09' : '00';
    const errTime = tmnStat === '00' || tmnStat === '09' ? null : `${String(rng.int(8, 17)).padStart(2, '0')}${String(rng.int(0, 59)).padStart(2, '0')}00`;
    return {
      ofcCode: m.ofcCode,
      mcnNo: m.mcnNo,
      instPstCode: m.instPstCode ?? '001',
      instPstNm: m.instPstNm,
      src: m.src,
      srcNm: m.srcNm,
      tmnStat,
      devCode: err ? err[0] : null,
      errCode: err ? err[1] : null,
      errNm: err ? err[2] : null,
      errTime,
      rcvrTime: null,
      lastOpenTime: tmnStat === '09' ? null : '083000',
      opBgnTime: '0700',
      opEndTime: rng.chance(0.5) ? '2300' : '2400',
    };
  });
};

export const FAULT_STATUS_ROWS: FaultStatusRow[] = build();
