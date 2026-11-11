/**
 * 장애현황(`mgmt.faultStatus`) 타입 — nh-atms 프론트 `domain/types.ts`(Atm·AtmKpi·ResetCmd)에서 옮겨 왔다.
 *
 * 잠정(2026-11-11): 이 화면은 **프론트만** 있다. 백엔드 API·`docs/07_API_계약.md` 절·TO-BE 테이블 매핑은 아직 없다.
 *  - 키 필드는 이 저장소의 TO-BE camelCase 를 따랐다: 사무소 `ofcCode`/`kanm`, 기번 `mcnNo`, 코너 `instPstCode`/`instPstNm`, 기종명 `srcNm`.
 *  - 상태·시재·장애·운영시간 필드(`status`, `errCd`, `errName`, `cash`, `checkCash`, `serviceStart`, `serviceEnd`)는
 *    원본 이름 그대로다. 정본(TB_NMS_* 등)에서 대응 컬럼을 찾으면 계약을 쓰면서 이름을 바꾼다.
 */

/** 기기 상태 코드 — 00 정상 · 01 운영장애 · 02 기기장애 · 03 통신단절 · 09 미개국 */
export type McnStatusCd = '00' | '01' | '02' | '03' | '09';
export const MCN_STATUS_LABEL: Record<McnStatusCd, string> = { '00': '정상', '01': '운영장애', '02': '기기장애', '03': '통신단절', '09': '미개국' };
/** 상태 → StatusTag 톤 */
export const MCN_STATUS_TONE: Record<McnStatusCd, 'success' | 'warning' | 'danger' | 'neutral'> = { '00': 'success', '01': 'warning', '02': 'danger', '03': 'danger', '09': 'neutral' };

/** 장애 리셋 명령 */
export type ResetCmd = 'RESET' | 'RESET_TEST' | 'SHUTDOWN_TEST' | 'FDS_DELETE';
export const RESET_CMD_LABEL: Record<ResetCmd, string> = { RESET: '일반리셋', RESET_TEST: '시범리셋', SHUTDOWN_TEST: '시범다운', FDS_DELETE: 'FDS 폴더삭제' };

/** 조회구분 */
export type FaultView = 'ALL' | 'FAULT' | 'NORMAL';

/** `GET /api/fault/status` 조회조건 (잠정) */
export interface FaultStatusSearch {
  ofcCode: string;
  mcnNo?: string;
  view?: FaultView;
}

/** 기기 상태 집계 */
export interface FaultKpi {
  total: number;
  normal: number;
  notOpen: number;
  devFault: number;
  opFault: number;
  commLost: number;
}

/** 기기 1대의 상태 */
export interface FaultMcn {
  ofcCode: string;
  /** 기번 3자리 */
  mcnNo: string;
  /** 기종명 */
  srcNm: string | null;
  instPstCode: string | null;
  /** 코너명 */
  instPstNm: string | null;
  status: McnStatusCd;
  errCd?: string | null;
  /** 장애상황 문구 */
  errName?: string | null;
  /** 현시재 */
  cash: number | null;
  /** 수표 시재 */
  checkCash: number | null;
  /** 운영 시작 HHmm */
  serviceStart: string | null;
  /** 운영 종료 HHmm */
  serviceEnd: string | null;
}

/** `GET /api/fault/status` 응답 (잠정) */
export interface FaultStatusResult {
  /** 조회 시각 표시 문자열 */
  asOf: string;
  ofcCode: string;
  kanm: string | null;
  kpi: FaultKpi;
  mcns: FaultMcn[];
}

/** `POST /api/fault/command` 본문 (잠정) */
export interface FaultCommand {
  ofcCode: string;
  mcnNos: string[];
  cmd: ResetCmd;
}
