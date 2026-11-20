package kr.co.nh.atms.web.common.auth;

import kr.co.nh.atms.web.login.service.LoginVerifier;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import javax.sql.DataSource;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * 로그인 뒤 세션 ID 가 요청마다 바뀌지 않는지 — 내장 Tomcat 을 실제로 띄워 확인한다(DB 는 가짜, @Tag("db") 아님).
 * 예전엔 Spring Security 세션 고정 방지(changeSessionId)가 /api/** 요청마다 돌아 ID 가 바뀌었고,
 * 화면이 동시에 부른 다른 요청이 옛 ID 로 401 ME_002 를 받아 로그아웃됐다(SecurityConfig sessionFixation none).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {"spring.profiles.active=sessiontest", "atms.api-message.reload-minutes=0"})
class SessionIdStableTest {

    @TestConfiguration
    static class FakeDb {
        @Bean
        @Primary
        DataSource dataSource() {
            return Mockito.mock(DataSource.class);
        }
    }

    @MockitoBean
    LoginVerifier verifier;
    @MockitoBean
    CurrentUserLoader loader;
    @LocalServerPort
    int port;

    @Test
    void 로그인_뒤_요청마다_세션ID가_그대로다() throws Exception {
        LoginUser u = new LoginUser("12345", "테스트", null, null, null, null, null, "A", "Y");
        when(verifier.verify(anyString(), anyString())).thenReturn(u);
        when(loader.load(anyString())).thenReturn(u);
        HttpClient client = HttpClient.newHttpClient();
        String base = "http://localhost:" + port;

        HttpResponse<String> login = client.send(HttpRequest.newBuilder(URI.create(base + "/api/auth/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString("{\"perNo\":\"12345\",\"password\":\"x\"}")).build(),
                HttpResponse.BodyHandlers.ofString());
        assertThat(login.statusCode()).isEqualTo(200);
        String cookie = login.headers().firstValue("set-cookie").orElseThrow().split(";")[0];

        for (int i = 0; i < 3; i++) {
            HttpResponse<String> me = client.send(HttpRequest.newBuilder(URI.create(base + "/api/me"))
                    .header("Cookie", cookie).GET().build(), HttpResponse.BodyHandlers.ofString());
            assertThat(me.statusCode()).isEqualTo(200);
            assertThat(me.headers().allValues("set-cookie")).isEmpty();
        }
    }
}
