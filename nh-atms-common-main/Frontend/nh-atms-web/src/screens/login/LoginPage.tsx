import { Alert, Button, Card, Form, Input, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginApi, loginKeys } from '@/api/endpoints/login';
import { encryptField, fieldCryptoStatus, handleFieldCryptoError } from '@/utils/fieldCrypto';
import { useAuthStore } from '@/stores/useAuthStore';
import { isPlaceholder, TEST_ACCOUNTS, TEST_PASSWORD, type TestAccount } from './testAccounts';

interface LoginForm {
  perNo: string;
  password: string;
}

/** 로그인 뒤 돌아갈 주소 — MeGate 가 넘겨 준 원래 주소, 없거나 /login 이면 홈 */
const backPathOf = (state: unknown): string => {
  const from = (state as { from?: unknown } | null)?.from;
  return typeof from === 'string' && from !== '' && from.indexOf('/login') !== 0 ? from : '/';
};

const accountColumns: ColumnsType<TestAccount> = [
  { title: '구분', dataIndex: 'label', width: 110 },
  {
    title: '개인번호',
    dataIndex: 'perNo',
    width: 130,
    render: (v: string, r) => (isPlaceholder(r) ? <Typography.Text type="secondary">입력 필요</Typography.Text> : <Typography.Text code>{v}</Typography.Text>),
  },
  { title: '메모', dataIndex: 'note' },
];

/**
 * 로그인 화면 — 라우트 /login (앱 셸·MeGate 밖), API 계약 §7. 2026-11-11 사용자 결정으로 로그인 필수.
 *  1) 화면이 서버 공개키를 받는다(GET /api/auth/public-key, enabled=false 면 평문)
 *  2) [로그인] → 비밀번호를 ENC1 암호문으로 바꿔 POST /api/auth/login (개인번호는 평문)
 *  3) 서버가 복호화 → 검증(잠정 Q-17: TB_INSA 에 있는 개인번호 + 공통 테스트 비밀번호) → 세션에 개인번호
 *  4) 이전 사용자 흔적(조회 캐시·탭)을 지우고 /api/me 를 다시 읽은 뒤 원래 가려던 화면으로
 *  - 오른쪽 표는 테스트 계정 6명(testAccounts.ts). 줄을 누르면 개인번호·비밀번호가 채워진다.
 *  - 성공·오류 문구는 서버가 만들고 자동으로 뜬다(화면은 문구를 쓰지 않음). 암호화 오류(CRYPTO_*)면 공개키를 다시 받는다.
 */
export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const startSession = useAuthStore((s) => s.startSession);
  const [form] = Form.useForm<LoginForm>();

  const crypto = useQuery({ queryKey: [...loginKeys.all, 'crypto'], queryFn: fieldCryptoStatus, meta: { silent: true } });

  const login = useMutation({
    mutationFn: async (v: LoginForm) => {
      const password = await encryptField(v.password);
      return loginApi.login({ perNo: v.perNo.trim(), password });
    },
    onSuccess: async () => {
      form.setFieldValue('password', '');
      await startSession();
      navigate(backPathOf(location.state), { replace: true });
    },
    onError: (e) => {
      if (handleFieldCryptoError(e)) void crypto.refetch();
    },
  });

  const pick = (a: TestAccount) => {
    if (isPlaceholder(a)) return;
    form.setFieldsValue({ perNo: a.perNo, password: TEST_PASSWORD });
  };

  return (
    <div
      className="login-page"
      style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', padding: 16 }}
    >
      <Card title="자동화기기 종합관리시스템 로그인" style={{ width: 400, maxWidth: '100%' }}>
        {crypto.isSuccess && (
          <Alert
            style={{ marginBottom: 16 }}
            showIcon
            type={crypto.data.enabled ? 'success' : 'warning'}
            data-testid="crypto-status"
            message={crypto.data.enabled ? '비밀번호는 암호화해서 보냅니다' : '서버가 암호화를 꺼 두었습니다 — 비밀번호가 평문으로 갑니다'}
          />
        )}
        <Form form={form} layout="vertical" onFinish={(v) => login.mutate(v)} autoComplete="off">
          <Form.Item name="perNo" label="개인번호" rules={[{ required: true, whitespace: true, message: '개인번호를 입력하세요.' }]}>
            <Input autoFocus maxLength={20} />
          </Form.Item>
          <Form.Item name="password" label="비밀번호" rules={[{ required: true, message: '비밀번호를 입력하세요.' }]}>
            <Input.Password maxLength={100} autoComplete="new-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={login.isPending}>
            로그인
          </Button>
        </Form>
      </Card>

      <Card
        title="테스트 계정"
        extra={
          <span>
            공통 비밀번호 <Tag color="blue" style={{ marginInlineEnd: 0 }}>{TEST_PASSWORD}</Tag>
          </span>
        }
        style={{ width: 560, maxWidth: '100%' }}
        data-testid="test-accounts"
      >
        <Table<TestAccount>
          size="small"
          rowKey="perNo"
          pagination={false}
          columns={accountColumns}
          dataSource={[...TEST_ACCOUNTS]}
          onRow={(r) => ({ onClick: () => pick(r), style: { cursor: isPlaceholder(r) ? 'not-allowed' : 'pointer', opacity: isPlaceholder(r) ? 0.55 : 1 } })}
        />
        <Typography.Paragraph type="secondary" style={{ margin: '12px 0 0', fontSize: 12 }}>
          줄을 누르면 왼쪽에 개인번호·비밀번호가 채워집니다. 실제 메뉴·버튼 권한은 DB 권한(TB_SCR_AUTH)을 따릅니다. 개발·시험용 화면입니다.
        </Typography.Paragraph>
      </Card>
    </div>
  );
};

export default LoginPage;
