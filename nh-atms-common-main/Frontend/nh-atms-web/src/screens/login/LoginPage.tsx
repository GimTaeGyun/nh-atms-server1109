import { Alert, Button, Card, Divider, Form, Input, Typography } from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginApi, loginKeys } from '@/api/endpoints/login';
import { encryptField, fieldCryptoStatus, handleFieldCryptoError } from '@/utils/fieldCrypto';
import { useAuthStore } from '@/stores/useAuthStore';
import { markEntered, returnPathOf } from '@/app/entry';

interface LoginForm {
  perNo: string;
  password: string;
}

/**
 * 로그인 화면 — 앱의 첫 화면(탭마다 처음 한 번, EntryGate) + 비밀번호 암호화(node-forge) 견본. 라우트 /login (앱 셸·MeGate 밖), API 계약 §7.
 *  1) 화면이 서버 공개키를 받는다(GET /api/auth/public-key, enabled=false 면 평문)
 *  2) [로그인] → 비밀번호를 ENC1 암호문으로 바꿔 POST /api/auth/login (개인번호는 평문)
 *  3) 서버가 복호화 → 검증(잠정 Q-17) → 세션에 개인번호 → 성공하면 바로 앱으로(처음 치려던 주소, 없으면 '/')
 *  - [비로그인 진입] → 로그인 없이 앱으로. 화면 사용자는 고정 개인번호(atms.fixed-user.per-no).
 *  - 설정 atms.login.enabled=true 면 로그인 세션이 화면 사용자가 되고, 비로그인 진입은 MeGate 의 ME_002 에서 막힌다.
 *  - 성공·오류 문구는 서버가 만들고 자동으로 뜬다(화면은 문구를 쓰지 않음). 암호화 오류(CRYPTO_*)면 공개키를 다시 받는다.
 */
export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loadMe = useAuthStore((s) => s.loadMe);
  const [form] = Form.useForm<LoginForm>();
  const returnPath = returnPathOf(location.state);

  const crypto = useQuery({ queryKey: [...loginKeys.all, 'crypto'], queryFn: fieldCryptoStatus, meta: { silent: true } });

  const login = useMutation({
    mutationFn: async (v: LoginForm) => {
      const password = await encryptField(v.password);
      return loginApi.login({ perNo: v.perNo.trim(), password });
    },
    onSuccess: () => {
      form.setFieldValue('password', '');
      markEntered('login');
      void loadMe(true);
      navigate(returnPath, { replace: true });
    },
    onError: (e) => {
      if (handleFieldCryptoError(e)) void crypto.refetch();
    },
  });

  const enterAsGuest = () => {
    markEntered('guest');
    navigate(returnPath, { replace: true });
  };

  return (
    <div className="login-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', padding: 16 }}>
      <Card title="NH-ATMS 로그인" style={{ width: 440, maxWidth: '100%' }}>
        {crypto.isSuccess && (
          <Alert
            style={{ marginBottom: 16 }}
            showIcon
            type={crypto.data.enabled ? 'success' : 'warning'}
            data-testid="crypto-status"
            message={crypto.data.enabled ? `비밀번호를 암호화해서 보냅니다 (키 ${crypto.data.kid})` : '서버가 암호화를 꺼 두었습니다 — 비밀번호가 평문으로 갑니다'}
          />
        )}
        <Form form={form} layout="vertical" onFinish={(v) => login.mutate(v)} autoComplete="off">
          <Form.Item name="perNo" label="개인번호" rules={[{ required: true, whitespace: true, message: '개인번호를 입력하세요.' }]}>
            <Input autoFocus maxLength={20} />
          </Form.Item>
          <Form.Item name="password" label="비밀번호" rules={[{ required: true, message: '비밀번호를 입력하세요.' }]}>
            <Input.Password maxLength={100} autoComplete="new-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={login.isPending}>로그인</Button>
        </Form>
        <Divider plain style={{ margin: '16px 0 12px' }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>또는</Typography.Text>
        </Divider>
        <Button block onClick={enterAsGuest} disabled={login.isPending} data-testid="guest-entry">비로그인 진입</Button>
        <Typography.Paragraph type="secondary" style={{ fontSize: 12, margin: '8px 0 0', textAlign: 'center' }}>
          로그인 없이 기본(고정) 사용자로 들어갑니다.
        </Typography.Paragraph>
      </Card>
    </div>
  );
};

export default LoginPage;
