package kr.co.nh.atms.web.login;

import jakarta.servlet.http.HttpSession;
import kr.co.nh.atms.common.exception.BusinessException;
import kr.co.nh.atms.web.common.auth.LoginUser;
import kr.co.nh.atms.web.common.auth.SessionUserFilter;
import kr.co.nh.atms.web.login.dto.LoginRequest;
import kr.co.nh.atms.web.login.dto.LoginResult;
import kr.co.nh.atms.web.login.service.InsaLoginVerifier;
import kr.co.nh.atms.web.login.service.LoginService;
import kr.co.nh.atms.web.login.service.LoginVerifier;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/** 로그인 — 검증 성공 시 새 세션에 개인번호, 실패 시 LGN_001, 로그아웃은 세션 폐기 */
class LoginServiceTest {

    private static final LoginUser USER = new LoginUser("123456789", "홍길동", "000080", "본점", "000080", "000080", "본점", "T", "N");

    @Test
    void successStoresPerNoInNewSession() {
        LoginVerifier v = mock(LoginVerifier.class);
        when(v.verify(eq("123456789"), eq("pw"))).thenReturn(USER);
        LoginService svc = new LoginService(v);
        MockHttpServletRequest http = new MockHttpServletRequest();
        HttpSession before = http.getSession(true);

        LoginResult r = svc.login(new LoginRequest(" 123456789 ", "pw"), http);

        assertThat(r.perNo()).isEqualTo("123456789");
        assertThat(r.name()).isEqualTo("홍길동");
        HttpSession after = http.getSession(false);
        assertThat(after).isNotNull().isNotSameAs(before);       // 세션 고정 방지 — 새 세션
        assertThat(after.getAttribute(SessionUserFilter.SESSION_PER_NO)).isEqualTo("123456789");
    }

    @Test
    void failureGivesLgn001AndNoSession() {
        LoginVerifier v = mock(LoginVerifier.class);
        when(v.verify(any(), any())).thenReturn(null);
        MockHttpServletRequest http = new MockHttpServletRequest();
        assertThatThrownBy(() -> new LoginService(v).login(new LoginRequest("1", "x"), http))
                .isInstanceOf(BusinessException.class)
                .extracting("code").isEqualTo("LGN_001");
        assertThat(http.getSession(false)).isNull();
    }

    @Test
    void logoutInvalidatesSession() {
        MockHttpServletRequest http = new MockHttpServletRequest();
        HttpSession s = http.getSession(true);
        new LoginService(mock(LoginVerifier.class)).logout(http);
        assertThat(http.getSession(false)).isNull();
        assertThat(s).isNotNull();
    }

    @Test
    void provisionalPasswordRuleIsCommonTestPassword() {
        assertThat(InsaLoginVerifier.passwordAccepted(InsaLoginVerifier.TEST_PASSWORD)).isTrue();
        assertThat(InsaLoginVerifier.passwordAccepted("atms1234")).isFalse();
        assertThat(InsaLoginVerifier.passwordAccepted(" ")).isFalse();
        assertThat(InsaLoginVerifier.passwordAccepted(null)).isFalse();
    }
}
