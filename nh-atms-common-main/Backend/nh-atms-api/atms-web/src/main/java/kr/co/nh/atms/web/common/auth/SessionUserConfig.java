package kr.co.nh.atms.web.common.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import kr.co.nh.atms.common.audit.AuditUserProvider;
import kr.co.nh.atms.web.common.CurrentUser;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 로그인 사용자 연결.
 * <ul>
 *   <li>{@link SessionUserFilter} 빈 — atms-common SecurityConfig 가 보안 필터 체인에 끼운다</li>
 *   <li>서블릿 자동 등록 끔 — 체인 밖에서 한 번 더 돌지 않게</li>
 *   <li>감사 컬럼 개인번호 = {@link CurrentUser#perNo()}</li>
 * </ul>
 */
@Configuration
public class SessionUserConfig {

    @Bean
    public SessionUserFilter sessionUserFilter(CurrentUserLoader loader, ObjectMapper objectMapper) {
        return new SessionUserFilter(loader, objectMapper);
    }

    @Bean
    public FilterRegistrationBean<SessionUserFilter> sessionUserFilterRegistration(SessionUserFilter filter) {
        FilterRegistrationBean<SessionUserFilter> reg = new FilterRegistrationBean<>(filter);
        reg.setEnabled(false);
        return reg;
    }

    @Bean
    public AuditUserProvider auditUserProvider() {
        return CurrentUser::perNo;
    }
}
