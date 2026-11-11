package kr.co.nh.atms.web.login.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import kr.co.nh.atms.common.response.ApiResponse;
import kr.co.nh.atms.common.security.crypto.FieldPublicKeyProvider;
import kr.co.nh.atms.web.login.dto.LoginRequest;
import kr.co.nh.atms.web.login.dto.LoginResult;
import kr.co.nh.atms.web.login.service.LoginService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 로그인 + 민감필드 암호화 — API 계약 §7. {@code /api/auth/**} 는 사용자 확인 전에 부른다(SecurityConfig 허용,
 * SessionUserFilter 제외). 화면: {@code src/screens/login/LoginPage.tsx} (라우트 /login).
 */
@RestController
@RequiredArgsConstructor
public class LoginController {

    private final FieldPublicKeyProvider publicKeyProvider;
    private final LoginService loginService;

    /** 암호화 공개키 {enabled, serverTime, kid, alg, publicKey(PEM)} — enabled=false 면 화면은 평문으로 보낸다 */
    @GetMapping("/api/auth/public-key")
    public ApiResponse<Map<String, Object>> publicKey() {
        return ApiResponse.ok(publicKeyProvider.describe());
    }

    @PostMapping("/api/auth/login")
    public ApiResponse<LoginResult> login(@RequestBody @Valid LoginRequest req, HttpServletRequest http) {
        return ApiResponse.ok(loginService.login(req, http), "S012");
    }

    @PostMapping("/api/auth/logout")
    public ApiResponse<Void> logout(HttpServletRequest http) {
        loginService.logout(http);
        return ApiResponse.ok(null, "S013");
    }
}
