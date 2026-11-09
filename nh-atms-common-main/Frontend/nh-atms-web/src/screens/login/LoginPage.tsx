import { useState } from 'react';
import { Alert, Button, Card, Descriptions, Form, Input, Result, Tag, Typography } from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { loginApi, loginKeys } from '@/api/endpoints/login';
import { encryptField, fieldCryptoStatus, handleFieldCryptoError } from '@/utils/fieldCrypto';
import { useAuthStore } from '@/stores/useAuthStore';
import type { LoginResult } from '@/domain/login';

interface LoginForm {
  perNo: string;
  password: string;
}

/** 보낸 값 미리보기 — 암호문 앞부분만 보여 준다. 평문 비밀번호는 절대 화면에 다시 쓰지 않는다 */
const previewOf = (sent: string, encrypted: boolean): string =>
  encrypted ? `${sent.split('.').slice(0, 2).join('.')}.${sent.split('.')[2]?.slice(0, 16) ?? ''}… (총 ${sent.length}자)` : '(평문 전송 — 서버가 암호화를 끔)';

/**
 * 로그인 화면 — 비밀번호 암호화(node-forge) 견본. 라우트 /login (앱 셸·MeGate 밖), API 계약 §7.
 *  1) 화면이 서버 공개키를 받는다(GET /api/auth/public-key, enabled=false 면 평문)
 *  2) [로그인] → 비밀번호를 ENC1 암호문으로 바꿔 POST /api/auth/login (개인번호는 평문)
 *  3) 서버가 복호화 → 검증(잠정 Q-17) → 세션에 개인번호 → 결과
 *  - 설정 atms.login.enabled=true 면 결과 후 앱으로 들어간다. false(기본)면 시연 결과만 보여 준다(사용자는 고정 개인번호).
 *  - 성공·오류 문구는 서버가 만들고 자동으로 뜬다(화면은 문구를 쓰지 않음). 암호화 오류(CRYPTO_*)면 공개키를 다시 받는다.
 */
export const LoginPage = () => {
  const navigate = useNavigate();
  const loadMe = useAuthStore((s) => s.loadMe);
  const [form] = Form.useForm<LoginForm>();
  const [sent, setSent] = useState<{ preview: string; encrypted: boolean } | null>(null);
  const [result, setResult] = useState<LoginResult | null>(null);

  const crypto = useQuery({ queryKey: [...loginKeys.all, 'crypto'], queryFn: fieldCryptoStatus, meta: { silent: true } });

  const login = useMutation({
    mutationFn: async (v: LoginForm) => {
      const password = await encryptField(v.password);
      const encrypted = password !== v.password;
      setSent({ preview: previewOf(password, encrypted), encrypted });
      return loginApi.login({ perNo: v.perNo.trim(), password });
    },
    onSuccess: (r) => {
      form.setFieldValue('password', '');
      setResult(r);
      if (r.loginEnabled) {
        void loadMe(true);
        navigate('/', { replace: true });
      }
    },
    onError: (e) => {
      if (handleFieldCryptoError(e)) void crypto.refetch();
    },
  });

  const logout = useMutation({
    mutationFn: loginApi.logout,
    onSuccess: () => {
      setResult(null);
      setSent(null);
    },
  });

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
        {result ? (
          <Result
            status="success"
            title={`${result.name} (${result.perNo}) 로그인 확인`}
            subTitle={result.loginEnabled ? '앱으로 이동합니다.' : '견본 모드(atms.login.enabled=false) — 화면 사용자는 계속 고정 개인번호입니다.'}
            extra={[
              <Button key="home" type="primary" onClick={() => navigate('/')}>화면으로</Button>,
              <Button key="logout" loading={logout.isPending} onClick={() => logout.mutate()}>로그아웃</Button>,
            ]}
          />
        ) : (
          <Form form={form} layout="vertical" onFinish={(v) => login.mutate(v)} autoComplete="off">
            <Form.Item name="perNo" label="개인번호" rules={[{ required: true, whitespace: true, message: '개인번호를 입력하세요.' }]}>
              <Input autoFocus maxLength={20} />
            </Form.Item>
            <Form.Item name="password" label="비밀번호" rules={[{ required: true, message: '비밀번호를 입력하세요.' }]}>
              <Input.Password maxLength={100} autoComplete="new-password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={login.isPending}>로그인</Button>
          </Form>
        )}
        {sent && (
          <Descriptions size="small" column={1} style={{ marginTop: 16 }} title={<Typography.Text type="secondary">마지막으로 보낸 비밀번호 값</Typography.Text>}>
            <Descriptions.Item label="형식">{sent.encrypted ? <Tag color="green">ENC1 암호문</Tag> : <Tag color="orange">평문</Tag>}</Descriptions.Item>
            <Descriptions.Item label="값">
              <Typography.Text code data-testid="sent-preview" style={{ wordBreak: 'break-all' }}>{sent.preview}</Typography.Text>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Card>
    </div>
  );
};

export default LoginPage;
