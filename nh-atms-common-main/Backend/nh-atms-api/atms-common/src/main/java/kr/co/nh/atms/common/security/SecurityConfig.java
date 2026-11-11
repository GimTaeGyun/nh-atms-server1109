package kr.co.nh.atms.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import kr.co.nh.atms.common.response.ApiResponse;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Spring Security 공통 설정 — nh-atms atms-common SecurityConfig 를 세션 로그인(POST /api/auth/login, JWT 없음)용으로 줄인 것.
 * <ul>
 *   <li>Spring Security 자체는 세션을 쓰지 않음(STATELESS) — 로그인 세션(JSESSIONID)은 atms-web LoginService 가 직접 만들고
 *       SessionUserFilter 가 읽는다. CSRF 끔(본문이 JSON 이라 다른 사이트 폼으로는 못 보냄), CORS 는 원본과 같음({@code cors.allowed-origins})</li>
 *   <li>{@code /api/**} 는 인증 필요, swagger·api-docs·actuator 와 그 밖의 경로(정적 화면)는 허용</li>
 *   <li>현재 사용자는 {@link UserContextFilter} 빈(atms-web 의 SessionUserFilter)이 채운다 — AnonymousAuthenticationFilter 앞</li>
 *   <li>인증 없음 401 {@code SYS_401}, 권한 없음 403 {@code SYS_403} 을 JSON(ApiResponse) 으로</li>
 *   <li>{@code @EnableMethodSecurity}: {@code @PreAuthorize} 사용 가능(관리자 권한 ROLE_ADMIN)</li>
 * </ul>
 * 원본의 JWT·SSO·에이전트 .do 허용·PasswordEncoder 는 가져오지 않았다(세션 로그인, 비밀번호 원천은 잠정 Q-17).
 * 로그인(2026-11-09 견본 → 2026-11-11 필수): {@code /api/auth/**}(공개키·로그인·로그아웃)는 사용자 확인 전에 부르므로 허용.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final ObjectMapper objectMapper;
    private final ObjectProvider<UserContextFilter> userContextFilters;

    /** CORS 허용 Origin 목록(쉼표 구분). 기본 = 로컬 Vite(5173)·CRA(3000) */
    @Value("${cors.allowed-origins:http://localhost:3000,http://localhost:5173}")
    private String corsAllowedOrigins;

    public SecurityConfig(ObjectMapper objectMapper, ObjectProvider<UserContextFilter> userContextFilters) {
        this.objectMapper = objectMapper;
        this.userContextFilters = userContextFilters;
    }

    @Bean
    @Order(100)
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/actuator/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpStatus.UNAUTHORIZED.value());
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setCharacterEncoding("UTF-8");
                            objectMapper.writeValue(response.getWriter(), ApiResponse.fail("SYS_401"));
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpStatus.FORBIDDEN.value());
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setCharacterEncoding("UTF-8");
                            objectMapper.writeValue(response.getWriter(), ApiResponse.fail("SYS_403"));
                        })
                )
                // sameOrigin: 같은 출처 frame 은 허용하면서 클릭재킹은 차단
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        userContextFilters.orderedStream()
                .forEach(f -> http.addFilterBefore(f, AnonymousAuthenticationFilter.class));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origins = Arrays.stream(corsAllowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
