package kr.co.nh.atms.web.agent;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.util.Map;

/**
 * 레거시 ATM 에이전트 게이트웨이 (reverse-proxy).
 *
 * 실 에이전트(펌웨어, 수정 불가)는 INI 설정상 atms-web(:8080, 외부 19081)으로 직접
 * 접속해 레거시 .do 경로를 호출한다. 그러나 에이전트 처리 로직(open/exit/ping/
 * put.jnl.mode 등)은 구 atmr 에 해당하는 atms-journal(:8081)에 있다.
 *
 * 본 컨트롤러는 /atms/agent/**, /atmr/agent/** 요청을 atms-journal 로 그대로 전달하여
 * 로직 중복 없이 단일 출처(LegacyAgentController @ atms-journal)를 유지한다.
 * 원 클라이언트(ATM) IP 는 X-Forwarded-For 로 전파해 다운스트림이 실제 IP 를 기록한다.
 *
 * 2026-11-09: 옛 .do 경로를 atms-journal 의 /api/agent/legacy/* 로 바꿔 전달한다 ({@link #toJournalPath}).
 *   JEUS 에서는 journal-base-url 이 WebtoB(9000) 라, 옛 경로 그대로 보내면 WebtoB 가 /atms/·/atmr/ 를
 *   다시 atms-web 으로 보내 무한 루프가 된다. 새 경로(/api/agent/)는 WebtoB 가 atms-journal 로 보낸다.
 *   표에 없는 경로는 전달하지 않고 404 (journal 에도 없는 경로 — 루프 방지).
 *   요청 본문이 폼이 아니면(put.jnl.data 의 application/octet-stream) 원문 바이트 그대로 전달한다.
 */
@Slf4j
@RestController
public class LegacyAgentGatewayController {

    private final RestClient client;

    public LegacyAgentGatewayController(
            @Value("${agent.proxy.journal-base-url:http://localhost:8081}") String journalBaseUrl) {
        this.client = RestClient.builder().baseUrl(journalBaseUrl).build();
    }

    /** 옛 경로의 마지막 부분 → atms-journal 의 새 경로. /atms·/atmr 접두어는 구분하지 않는다. */
    private static final Map<String, String> JOURNAL_PATHS = Map.of(
            "open.do", "/api/agent/legacy/open",
            "exit.do", "/api/agent/legacy/exit",
            "put.jnl.mode.do", "/api/agent/legacy/put-jnl-mode",
            "put.jnl.data.do", "/api/agent/legacy/put-jnl-data");

    /** 옛 경로(컨텍스트 제외) → journal 새 경로. 모르는 경로는 null. */
    static String toJournalPath(String legacyPath) {
        if (legacyPath == null) return null;
        if (!(legacyPath.startsWith("/atms/agent/") || legacyPath.startsWith("/atmr/agent/")
                || legacyPath.startsWith("/atms/remote-exec/"))) {
            return null;
        }
        String last = legacyPath.substring(legacyPath.lastIndexOf('/') + 1);
        return JOURNAL_PATHS.get(last);
    }

    @RequestMapping({"/atms/agent/**", "/atmr/agent/**", "/atms/remote-exec/**"})
    public ResponseEntity<byte[]> forward(HttpServletRequest req) throws IOException {
        String legacyPath = pathWithinApplication(req);
        String path = toJournalPath(legacyPath);
        HttpMethod method = HttpMethod.valueOf(req.getMethod());
        if (path == null) {
            log.warn("[agent gateway] {} {} → 전달 대상 없음 (404)", method, legacyPath);
            return ResponseEntity.notFound().build();
        }
        String contentType = req.getContentType();
        boolean rawBody = method != HttpMethod.GET && contentType != null
                && !contentType.toLowerCase().startsWith(MediaType.APPLICATION_FORM_URLENCODED_VALUE);
        byte[] raw = rawBody ? req.getInputStream().readAllBytes() : null;

        // 쿼리/폼 파라미터 일괄 수집 (다운스트림은 @RequestParam 으로 읽음)
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        for (Map.Entry<String, String[]> e : req.getParameterMap().entrySet()) {
            for (String v : e.getValue()) {
                params.add(e.getKey(), v);
            }
        }

        String forwardedFor = clientIp(req);

        RestClient.RequestBodySpec spec = client.method(method)
                .uri(builder -> {
                    builder.path(path);
                    if (method == HttpMethod.GET) {
                        params.forEach((k, vs) -> vs.forEach(v -> builder.queryParam(k, v)));
                    }
                    return builder.build();
                })
                .header("X-Forwarded-For", forwardedFor);

        if (rawBody) {
            spec.contentType(MediaType.parseMediaType(contentType));
            spec.body(raw);
        } else if (method != HttpMethod.GET) {
            spec.contentType(MediaType.APPLICATION_FORM_URLENCODED);
            spec.body(params);
        }

        ResponseEntity<byte[]> down;
        try {
            down = spec.retrieve()
                    .onStatus(s -> true, (rq, rs) -> { }) // 상태/본문 그대로 통과(예외 억제)
                    .toEntity(byte[].class);
        } catch (Exception ex) {
            log.warn("[agent gateway] {} {} → journal {} 전달 실패: {}", method, legacyPath, path, ex.toString());
            return ResponseEntity.status(502).build();
        }

        HttpHeaders out = new HttpHeaders();
        MediaType ct = down.getHeaders().getContentType();
        if (ct != null) {
            out.setContentType(ct);
        }
        return new ResponseEntity<>(down.getBody(), out, down.getStatusCode());
    }

    /** 컨텍스트 경로를 뺀 요청 경로 (컨텍스트 '/' 면 getRequestURI 그대로). */
    private static String pathWithinApplication(HttpServletRequest req) {
        String uri = req.getRequestURI();
        String ctx = req.getContextPath();
        return (ctx != null && !ctx.isEmpty() && uri.startsWith(ctx)) ? uri.substring(ctx.length()) : uri;
    }

    /** 프록시(X-Forwarded-For) 우선, 없으면 remoteAddr. IPv4-mapped IPv6 정규화. */
    private static String clientIp(HttpServletRequest http) {
        String xff = http.getHeader("X-Forwarded-For");
        String ip;
        if (xff != null && !xff.isBlank()) {
            ip = xff.split(",")[0].trim();
        } else {
            ip = http.getRemoteAddr();
        }
        if (ip != null && ip.startsWith("::ffff:")) ip = ip.substring(7);
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) ip = "127.0.0.1";
        return ip;
    }
}
