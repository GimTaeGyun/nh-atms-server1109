package kr.co.nh.atms.web.common.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import kr.co.nh.atms.common.response.ApiResponse;
import kr.co.nh.atms.common.security.UserContextFilter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * 로그인 사용자 필터 — {@code /api/**} 요청마다 HTTP 세션의 개인번호({@link #SESSION_PER_NO},
 * {@code POST /api/auth/login} 이 저장)로 {@link LoginUser} 를 SecurityContext 에 채운다.
 * <pre>
 *   요청 /api/** ─▶ 세션 개인번호 (없으면 401 ME_002 → 화면은 로그인 화면으로)
 *               ─▶ CurrentUserLoader.load (TB_INSA 에 없으면 401 ME_001, DB 오류 500 SYS_500)
 *               ─▶ principal = LoginUser, 권한 ROLE_USER (+관리자면 ROLE_ADMIN) ─▶ 다음 필터
 * </pre>
 * {@code /api/auth/**}(공개키·로그인·로그아웃)는 이 필터를 거치지 않는다.
 * 2026-11-11 사용자 결정: 로그인 필수. 예전 고정 사용자 설정(atms.fixed-user.per-no)·전환 스위치(atms.login.enabled)는 없앴다.
 * <b>SSO 를 붙일 때 바꿀 곳</b>: 이 필터 하나(같은 {@link UserContextFilter} 를 구현한 SSO 필터로 교체).
 * 빈 등록은 {@link SessionUserConfig}(보안 필터 체인 안에서만 돌게 서블릿 자동 등록을 끈다).
 */
@Slf4j
public class SessionUserFilter extends UserContextFilter {

    /** 로그인이 세션에 넣는 개인번호 속성 이름 */
    public static final String SESSION_PER_NO = "atms.login.perNo";

    private final CurrentUserLoader loader;
    private final ObjectMapper objectMapper;

    public SessionUserFilter(CurrentUserLoader loader, ObjectMapper objectMapper) {
        this.loader = loader;
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String ctx = request.getContextPath();
        String path = (ctx != null && !ctx.isEmpty() && uri.startsWith(ctx)) ? uri.substring(ctx.length()) : uri;
        return !path.startsWith("/api/") || path.startsWith("/api/auth/");
    }

    /** 이번 요청의 개인번호(세션). 없으면 null */
    private static String perNoOf(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        Object v = session == null ? null : session.getAttribute(SESSION_PER_NO);
        return v instanceof String s && !s.isBlank() ? s : null;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String current = perNoOf(request);
        if (current == null) {
            write(response, HttpStatus.UNAUTHORIZED, ApiResponse.fail("ME_002"));
            return;
        }
        LoginUser user;
        try {
            user = loader.load(current);
        } catch (RuntimeException e) {
            log.error("[로그인사용자] 사용자 조회 실패(DB): {}", e.toString());
            write(response, HttpStatus.INTERNAL_SERVER_ERROR, ApiResponse.fail("SYS_500"));
            return;
        }
        if (user == null) {
            write(response, HttpStatus.UNAUTHORIZED, ApiResponse.fail("ME_001"));
            return;
        }
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        if (user.isAdmin()) authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        SecurityContext ctx = SecurityContextHolder.createEmptyContext();
        ctx.setAuthentication(new UsernamePasswordAuthenticationToken(user, null, authorities));
        SecurityContextHolder.setContext(ctx);
        try {
            chain.doFilter(request, response);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    private void write(HttpServletResponse response, HttpStatus status, ApiResponse<?> body) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), body);
    }
}
