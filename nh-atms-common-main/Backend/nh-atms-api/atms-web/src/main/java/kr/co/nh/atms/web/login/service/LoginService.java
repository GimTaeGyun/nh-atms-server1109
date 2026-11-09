package kr.co.nh.atms.web.login.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import kr.co.nh.atms.common.exception.BusinessException;
import kr.co.nh.atms.web.common.auth.FixedUserFilter;
import kr.co.nh.atms.web.common.auth.LoginUser;
import kr.co.nh.atms.web.login.dto.LoginRequest;
import kr.co.nh.atms.web.login.dto.LoginResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * 로그인 견본 — 검증({@link LoginVerifier}) 후 개인번호를 HTTP 세션에 넣는다.
 * <pre>
 *   본문(비밀번호 ENC1) ─▶ @EncryptedField 복호화 ─▶ verify ─▶ 실패 400 LGN_001
 *                                                     └▶ 성공: 옛 세션 버림 → 새 세션에 개인번호 ─▶ LoginResult
 * </pre>
 * 세션을 새로 만드는 이유: 로그인 전 세션 ID 를 그대로 쓰면 세션 고정 공격에 열린다.
 * {@code atms.login.enabled=false}(기본)면 저장은 하지만 {@link FixedUserFilter} 가 읽지 않는다 — 시연용.
 */
@Slf4j
@Service
public class LoginService {

    private final LoginVerifier verifier;
    private final boolean loginEnabled;

    public LoginService(LoginVerifier verifier, @Value("${atms.login.enabled:false}") boolean loginEnabled) {
        this.verifier = verifier;
        this.loginEnabled = loginEnabled;
    }

    public LoginResult login(LoginRequest req, HttpServletRequest http) {
        String perNo = req.getPerNo() == null ? "" : req.getPerNo().trim();
        LoginUser user = verifier.verify(perNo, req.getPassword());
        if (user == null) {
            log.info("[로그인] 실패 perNo={}", perNo);
            throw new BusinessException("LGN_001");
        }
        HttpSession old = http.getSession(false);
        if (old != null) old.invalidate();
        http.getSession(true).setAttribute(FixedUserFilter.SESSION_PER_NO, user.perNo());
        log.info("[로그인] 성공 perNo={} loginEnabled={}", user.perNo(), loginEnabled);
        return new LoginResult(user.perNo(), user.name(), loginEnabled);
    }

    public void logout(HttpServletRequest http) {
        HttpSession s = http.getSession(false);
        if (s != null) s.invalidate();
    }
}
