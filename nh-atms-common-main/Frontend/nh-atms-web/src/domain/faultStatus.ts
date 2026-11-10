/**
 * 장애현황(`mgmt.faultStatus`) 타입 — API 계약 §8 과 글자 하나까지 같다.
 * 필드 = TB_OP_ATM_STAT 정본 컬럼 camelCase (+ 조인 이름 kanm·srcNm·errNm).
 */

/** `GET /api/fault-status` 조회조건 (ofcCode 필수) */
export interface FaultStatusSearch {
  ofcCode: string;
  mcnNo?: string;
  /** 조회구분 — 없으면 전체 */
  view?: 'FAULT' | 'NORMAL';
}

/** 기기 1대의 현재 상태 */
export interface FaultStatusRow {
  ofcCode: string;
  mcnNo: string;
  /** 코너코드·설치장소명 */
  instPstCode: string;
  instPstNm: string | null;
  /** 기종 코드·이름(TB_NMS_SRC) */
  src: string | null;
  srcNm: string | null;
  /** 단말기상태 — 값의 뜻은 TMN_STAT_LABEL (잠정 Q-18) */
  tmnStat: string | null;
  /** 장애 Device·장애코드·장애명(TB_NMS_SRC_ERR) */
  devCode: string | null;
  errCode: string | null;
  errNm: string | null;
  /** 에러발생·복구·최종개국 시간 HHMMSS */
  errTime: string | null;
  rcvrTime: string | null;
  lastOpenTime: string | null;
  /** 영업 시작·종료 HHMM */
  opBgnTime: string | null;
  opEndTime: string | null;
}

/** 사무소 집계 */
export interface FaultStatusKpi {
  total: number;
  normal: number;
  opErr: number;
  devErr: number;
  commLost: number;
  notOpen: number;
}

/** `GET /api/fault-status` 응답 */
export interface FaultStatusResult {
  /** 조회 시각 YYYYMMDDHH24MISS */
  asOf: string;
  ofcCode: string;
  kanm: string | null;
  kpi: FaultStatusKpi;
  rows: FaultStatusRow[];
}

/** 단말기상태 값 → 이름 (정본에 코드표 없음, nh-atms 기준 — 잠정 Q-18) */
export const TMN_STAT_LABEL: Record<string, string> = {
  '00': '정상',
  '01': '운영장애',
  '02': '기기장애',
  '03': '통신단절',
  '09': '미개국',
};
