package kr.co.nh.atms.web.login.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import kr.co.nh.atms.common.exception.BusinessException;
import kr.co.nh.atms.web.common.auth.LoginUser;
import kr.co.nh.atms.web.common.auth.SessionUserFilter;
import kr.co.nh.atms.web.login.dto.LoginRequest;
import kr.co.nh.atms.web.login.dto.LoginResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 로그인 — 검증({@link LoginVerifier}) 후 개인번호를 HTTP 세션에 넣는다. 이후 {@code /api/**} 사용자는 이 세션({@link SessionUserFilter}).
 * <pre>
 *   본문(비밀번호 ENC1) ─▶ @EncryptedField 복호화 ─▶ verify ─▶ 실패 400 LGN_001
 *                                                     └▶ 성공: 옛 세션 버림 → 새 세션에 개인번호 ─▶ LoginResult
 * </pre>
 * 세션을 새로 만드는 이유: 로그인 전 세션 ID 를 그대로 쓰면 세션 고정 공격에 열린다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LoginService {

    private final LoginVerifier verifier;

    public LoginResult login(LoginRequest req, HttpServletRequest http) {
        String perNo = req.getPerNo() == null ? "" : req.getPerNo().trim();
        LoginUser user = verifier.verify(perNo, req.getPassword());
        if (user == null) {
            log.info("[로그인] 실패 perNo={}", perNo);
            throw new BusinessException("LGN_001");
        }
        HttpSession old = http.getSession(false);
        if (old != null) old.invalidate();
        http.getSession(true).setAttribute(SessionUserFilter.SESSION_PER_NO, user.perNo());
        log.info("[로그인] 성공 perNo={}", user.perNo());
        return new LoginResult(user.perNo(), user.name());
    }

    public void logout(HttpServletRequest http) {
        HttpSession s = http.getSession(false);
        if (s != null) s.invalidate();
    }
}
