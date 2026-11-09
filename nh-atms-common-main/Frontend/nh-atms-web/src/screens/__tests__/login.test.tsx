import { afterEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import forge from 'node-forge';
import { renderWithProviders } from '@/test/render';
import { LoginPage } from '@/screens/login/LoginPage';
import { resetFieldCrypto } from '@/utils/fieldCrypto';
import * as loginMock from '@/mocks/handlers/login';

const renderLogin = () => renderWithProviders(<MemoryRouter initialEntries={['/login']}><LoginPage /></MemoryRouter>);

const fill = async (perNo: string, password: string) => {
  await userEvent.type(screen.getByLabelText('개인번호'), perNo);
  await userEvent.type(screen.getByLabelText('비밀번호'), password);
  await userEvent.click(screen.getByRole('button', { name: /로그인/ }));
};

describe('LoginPage — 비밀번호 암호화 견본', () => {
  afterEach(() => {
    loginMock.setMockPublicKey(null);
    resetFieldCrypto();
  });

  it('서버가 암호화를 켜면 비밀번호를 ENC1 로 보내고, 화면에는 암호문 앞부분만 보인다', async () => {
    const keys = forge.pki.rsa.generateKeyPair({ bits: 1024, e: 0x10001 });
    loginMock.setMockPublicKey({ kid: 'test', publicKey: forge.pki.publicKeyToPem(keys.publicKey) });
    renderLogin();
    expect(await screen.findByTestId('crypto-status')).toHaveTextContent('키 test');
    await fill('123456789', 'secret-pw');
    expect(await screen.findByText(/홍길동 \(123456789\) 로그인 확인/)).toBeInTheDocument();
    expect(loginMock.lastLoginBody?.password.startsWith('ENC1.test.')).toBe(true);
    expect(loginMock.lastLoginBody?.perNo).toBe('123456789');
    expect(screen.getByTestId('sent-preview').textContent).toMatch(/^ENC1\.test\./);
    expect(document.body.textContent).not.toContain('secret-pw');
  });

  it('서버가 암호화를 끄면 평문으로 보낸다고 알려 준다', async () => {
    renderLogin();
    expect(await screen.findByTestId('crypto-status')).toHaveTextContent('평문');
    await fill('123456789', 'pw');
    expect(await screen.findByText(/로그인 확인/)).toBeInTheDocument();
    expect(loginMock.lastLoginBody?.password).toBe('pw');
  });

  it('검증에 실패하면(LGN_001) 결과 화면으로 넘어가지 않는다', async () => {
    renderLogin();
    await screen.findByTestId('crypto-status');
    await fill(loginMock.MOCK_LOGIN_FAIL_PERNO, 'pw');
    await waitFor(() => expect(loginMock.lastLoginBody?.perNo).toBe(loginMock.MOCK_LOGIN_FAIL_PERNO));
    expect(screen.queryByText(/로그인 확인/)).toBeNull();
    expect(screen.getByLabelText('개인번호')).toBeInTheDocument();
  });
});
