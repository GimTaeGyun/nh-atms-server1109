import { api } from '../http';
import type { FaultStatusResult, FaultStatusSearch } from '@/domain/faultStatus';
import { compactParams } from '@/utils/object';

/** 장애현황(`mgmt.faultStatus`) API — API 계약 §8. 조회만 있다 */
export const faultStatusApi = {
  /** 사무소 기기 현재 상태 + 집계 (페이징 없음) */
  list: (p: FaultStatusSearch) => api.get<FaultStatusResult>('/fault-status', { params: compactParams(p) }),
};

export const faultStatusKeys = {
  all: ['faultStatus'] as const,
  list: (p: FaultStatusSearch) => ['faultStatus', 'list', p] as const,
};
