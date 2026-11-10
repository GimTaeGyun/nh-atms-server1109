import { afterEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import forge from 'node-forge';
import { renderWithProviders } from '@/test/render';
import { LoginPage } from '@/screens/login/LoginPage';
import { resetFieldCrypto } from '@/utils/fieldCrypto';
import * as loginMock from '@/mocks/handlers/login';
import { EntryGate } from '@/app/EntryGate';
import { clearEntered, entryModeOf } from '@/app/entry';

const Where = () => {
  const loc = useLocation();
  return <span data-testid="where">{loc.pathname}</span>;
};
const AppStub = () => <div>앱 본문 <Where /></div>;

/** 로그인 화면 + 앱 자리(EntryGate 뒤) — 들어가면 '앱 본문 <주소>' 가 보인다 */
const renderApp = (path: string) =>
  renderWithProviders(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<EntryGate><AppStub /></EntryGate>} />
      </Routes>
    </MemoryRouter>,
  );
const renderLogin = () => renderApp('/login');

const fill = async (perNo: string, password: string) => {
  await userEvent.type(screen.getByLabelText('개인번호'), perNo);
  await userEvent.type(screen.getByLabelText('비밀번호'), password);
  await userEvent.click(screen.getByRole('button', { name: '로그인' }));
};

describe('LoginPage — 비밀번호 암호화 견본', () => {
  afterEach(() => {
    loginMock.setMockPublicKey(null);
    resetFieldCrypto();
    clearEntered();
  });

  it('서버가 암호화를 켜면 비밀번호를 ENC1 로 보내고, 성공하면 바로 앱으로 들어간다', async () => {
    const keys = forge.pki.rsa.generateKeyPair({ bits: 1024, e: 0x10001 });
    loginMock.setMockPublicKey({ kid: 'test', publicKey: forge.pki.publicKeyToPem(keys.publicKey) });
    renderLogin();
    expect(await screen.findByTestId('crypto-status')).toHaveTextContent('키 test');
    await fill('123456789', 'secret-pw');
    expect(await screen.findByText(/앱 본문/)).toBeInTheDocument();
    expect(loginMock.lastLoginBody?.password.startsWith('ENC1.test.')).toBe(true);
    expect(loginMock.lastLoginBody?.perNo).toBe('123456789');
    expect(document.body.textContent).not.toContain('secret-pw');
    expect(entryModeOf()).toBe('login');
  });

  it('서버가 암호화를 끄면 평문으로 보낸다고 알려 준다', async () => {
    renderLogin();
    expect(await screen.findByTestId('crypto-status')).toHaveTextContent('평문');
    await fill('123456789', 'pw');
    expect(await screen.findByText(/앱 본문/)).toBeInTheDocument();
    expect(loginMock.lastLoginBody?.password).toBe('pw');
  });

  it('검증에 실패하면(LGN_001) 결과 화면으로 넘어가지 않는다', async () => {
    renderLogin();
    await screen.findByTestId('crypto-status');
    await fill(loginMock.MOCK_LOGIN_FAIL_PERNO, 'pw');
    await waitFor(() => expect(loginMock.lastLoginBody?.perNo).toBe(loginMock.MOCK_LOGIN_FAIL_PERNO));
    expect(screen.queryByText(/앱 본문/)).toBeNull();
    expect(screen.getByLabelText('개인번호')).toBeInTheDocument();
    expect(entryModeOf()).toBeNull();
  });
});

describe('첫 화면 — 탭마다 처음 한 번 로그인 화면(EntryGate)', () => {
  afterEach(() => clearEntered());

  it('처음 열면 치려던 주소 대신 로그인 화면이 뜨고, [비로그인 진입] 하면 그 주소로 들어간다', async () => {
    renderApp('/sample/notice');
    expect(await screen.findByLabelText('개인번호')).toBeInTheDocument();
    expect(screen.queryByText(/앱 본문/)).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: '비로그인 진입' }));
    expect(await screen.findByTestId('where')).toHaveTextContent('/sample/notice');
    expect(entryModeOf()).toBe('guest');
  });

  it('이 탭에서 이미 들어왔으면(새로고침) 로그인 화면 없이 바로 앱', async () => {
    renderApp('/');
    await userEvent.click(await screen.findByRole('button', { name: '비로그인 진입' }));
    expect(await screen.findByTestId('where')).toHaveTextContent('/');
    renderApp('/home');
    expect(await screen.findAllByText(/앱 본문/)).toHaveLength(2);
  });
});
