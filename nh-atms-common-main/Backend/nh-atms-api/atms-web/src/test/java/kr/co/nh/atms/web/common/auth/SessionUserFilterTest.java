package kr.co.nh.atms.web.common.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import kr.co.nh.atms.web.common.CurrentUser;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/** 로그인 사용자 필터 — 세션 없음 401 ME_002, 인사정보 없음 401 ME_001, 정상이면 CurrentUser 채움, /api 밖·/api/auth 는 통과 */
class SessionUserFilterTest {

    private final ObjectMapper om = new ObjectMapper();

    private static MockHttpServletRequest withSession(String uri, String perNo) {
        MockHttpServletRequest req = new MockHttpServletRequest("GET", uri);
        req.getSession(true).setAttribute(SessionUserFilter.SESSION_PER_NO, perNo);
        return req;
    }

    @Test
    void noSessionGivesMe002() throws Exception {
        SessionUserFilter f = new SessionUserFilter(mock(CurrentUserLoader.class), om);
        MockHttpServletResponse res = new MockHttpServletResponse();
        f.doFilter(new MockHttpServletRequest("GET", "/api/me"), res, new MockFilterChain());
        assertThat(res.getStatus()).isEqualTo(401);
        assertThat(res.getContentAsString()).contains("\"code\":\"ME_002\"");
    }

    @Test
    void unknownPersonGivesMe001() throws Exception {
        SessionUserFilter f = new SessionUserFilter(mock(CurrentUserLoader.class), om);
        MockHttpServletResponse res = new MockHttpServletResponse();
        f.doFilter(withSession("/api/lookup/sido", "123456789"), res, new MockFilterChain());
        assertThat(res.getStatus()).isEqualTo(401);
        assertThat(res.getContentAsString()).contains("\"code\":\"ME_001\"");
    }

    @Test
    void knownPersonIsSetDuringRequestAndClearedAfter() throws Exception {
        CurrentUserLoader loader = mock(CurrentUserLoader.class);
        when(loader.load("123456789")).thenReturn(AuthTestSupport.user("T", "N"));
        SessionUserFilter f = new SessionUserFilter(loader, om);
        AtomicReference<String> seen = new AtomicReference<>();
        MockHttpServletResponse res = new MockHttpServletResponse();
        f.doFilter(withSession("/api/me", "123456789"), res,
                (req, resp) -> seen.set(CurrentUser.perNo() + "/" + CurrentUser.auth()));
        assertThat(res.getStatus()).isEqualTo(200);
        assertThat(seen.get()).isEqualTo("123456789/T");
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void nonApiPathIsSkipped() throws Exception {
        SessionUserFilter f = new SessionUserFilter(mock(CurrentUserLoader.class), om);
        MockHttpServletResponse res = new MockHttpServletResponse();
        f.doFilter(new MockHttpServletRequest("GET", "/index.html"), res, new MockFilterChain());
        assertThat(res.getStatus()).isEqualTo(200);
    }

    @Test
    void authPathsSkipTheFilter() throws Exception {
        SessionUserFilter f = new SessionUserFilter(mock(CurrentUserLoader.class), om);
        MockHttpServletResponse res = new MockHttpServletResponse();
        f.doFilter(new MockHttpServletRequest("POST", "/api/auth/login"), res, new MockFilterChain());
        assertThat(res.getStatus()).isEqualTo(200);   // 로그인 전이라 세션이 없어도 로그인 API 는 막지 않는다
    }
}
