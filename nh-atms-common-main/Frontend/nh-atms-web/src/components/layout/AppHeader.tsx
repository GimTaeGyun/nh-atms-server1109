import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { env } from '@/config/env';
import { useAuthStore, selectIsAdmin } from '@/stores/useAuthStore';
import { useNavStore } from '@/stores/useNavStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { visibleL1Defs } from '@/screens/l1';
import type { L1Slug } from '@/types/screen';
import { GlobalSearch } from './GlobalSearch';
import { BrandMark } from './BrandMark';
import { MenuIcon } from './icons';

/** 헤더: 로고 + 시스템명 + 1뎁스 메뉴(아이콘·구분선) + 화면 검색 + 나(이름·사무소) + 로그아웃. 세션 타이머는 없음(서버 세션 만료에 맡김) */
export const AppHeader = () => {
  const navigate = useNavigate();
  const isAdmin = useAuthStore(selectIsAdmin);
  const me = useAuthStore((s) => s.me);
  const signOut = useAuthStore((s) => s.signOut);
  const activeL1 = useNavStore((s) => s.activeL1);
  const setActiveL1 = useNavStore((s) => s.setActiveL1);
  const panelCollapsed = useNavStore((s) => s.panelCollapsed);
  const setFlyout = useNavStore((s) => s.setFlyout);
  const showTopNav = useSettingsStore((s) => s.showTopNav);

  /**
   * 로그인 화면으로 먼저 옮기고(앱 셸·MeGate 가 내려가야 /api/me 를 다시 부르지 않음) 서버 세션을 끊는다.
   * 성공 문구 S013 은 서버가 보내고 자동으로 뜬다.
   */
  const logout = async () => {
    navigate('/login', { replace: true });
    await signOut();
  };

  const select = (slug: L1Slug) => {
    if (slug === 'home') {
      setActiveL1('home');
      navigate('/home');
      return;
    }
    setActiveL1(slug);
    if (panelCollapsed) setFlyout(slug);
  };

  return (
    <header className="app-header">
      <div className="brand" onClick={() => select('home')} role="link" aria-label="홈으로">
        <BrandMark />
        <span className="sys-name">자동화기기 종합관리시스템</span>
        <span className={`env-badge ${env.envLabel}`}>{env.envLabel.toUpperCase()}</span>
      </div>
      {showTopNav && (
        <nav className="top-nav" aria-label="대분류 메뉴">
          {visibleL1Defs(isAdmin).map((d) => (
            <button key={d.slug} className={activeL1 === d.slug ? 'on' : ''} onClick={() => select(d.slug)} type="button">
              <MenuIcon name={d.icon} />
              {d.label}
            </button>
          ))}
        </nav>
      )}
      <div className="header-right">
        <GlobalSearch />
        <span className="header-user" title={me ? `개인번호 ${me.perNo}${isAdmin ? ' · 관리자' : ''}` : undefined}>
          <UserOutlined />
          <b>{me?.name ?? '-'}</b>
          {me?.kanm && <span className="muted">{me.kanm}</span>}
        </span>
        <Button type="text" size="small" icon={<LogoutOutlined />} onClick={() => void logout()} data-testid="logout">
          로그아웃
        </Button>
      </div>
    </header>
  );
};
