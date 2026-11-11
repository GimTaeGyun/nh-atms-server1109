import { api } from '../http';
import type { FaultCommand, FaultStatusResult, FaultStatusSearch } from '@/domain/fault';
import { compactParams } from '@/utils/object';

/**
 * 장애현황(`mgmt.faultStatus`) API — 잠정(2026-11-11): 백엔드·API 계약 절이 아직 없다.
 * 경로는 nh-atms 프론트 `api/endpoints/fault.ts` 와 같게 두었다(`/api/fault/status`, `/api/fault/command`).
 * 백엔드가 생기기 전에는 조회하면 서버 오류(404 등) 문구가 뜬다.
 */
export const faultApi = {
  status: (p: FaultStatusSearch) => api.get<FaultStatusResult>('/fault/status', { params: compactParams(p) }),
  command: (body: FaultCommand) => api.post<{ accepted: number }>('/fault/command', body),
};

export const faultKeys = {
  all: ['fault'] as const,
  status: (p: FaultStatusSearch) => ['fault', 'status', p] as const,
};
