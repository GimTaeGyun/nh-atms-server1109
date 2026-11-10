import { beforeEach, describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavStore } from '@/stores/useNavStore';
import { faultStatusApi } from '@/api/endpoints/faultStatus';
import { FAULT_STATUS_ROWS } from '@/mocks/data/faultStatus';
import type { Me } from '@/types/auth';
import FaultStatusPage from '../mgmt/FaultStatusPage';

/** 장애현황(mgmt.faultStatus) — 목 API 로 조회 → 집계줄·목록, 조회구분 필터 */
const ME: Me = { perNo: '1234567', name: '홍길동', samuso: '000080', samusoName: '테크부문', deptCode: '000080', ofcCode: '000080', kanm: '테크부문', auth: 'A', adminYn: 'Y' };
const T = { timeout: 4000 };
const mine = () => FAULT_STATUS_ROWS.filter((r) => r.ofcCode === '000080');

beforeEach(() => {
  useAuthStore.getState().setMe(ME);
  useNavStore.setState({ menus: [] });
});

describe('장애현황 화면', () => {
  it('조회하면 내 사무소 기기 목록과 집계줄이 보인다', async () => {
    const { container } = renderWithProviders(<FaultStatusPage screenKey="mgmt.faultStatus" screenId="" active />);
    const panel = container.querySelector('.search-panel') as HTMLElement;
    await userEvent.click(within(panel).getByRole('button', { name: /조회/ }));
    expect(await screen.findByText(`(${mine().length}건)`, undefined, T)).toBeInTheDocument();
    expect(screen.getByText('총 운영대수')).toBeInTheDocument();
  });

  it('목: 조회구분 FAULT 는 정상 아닌 기기만, 집계는 사무소 전체', async () => {
    const r = await faultStatusApi.list({ ofcCode: '000080', view: 'FAULT' });
    expect(r.rows.every((x) => x.tmnStat !== '00')).toBe(true);
    expect(r.kpi.total).toBe(mine().length);
  });
});
