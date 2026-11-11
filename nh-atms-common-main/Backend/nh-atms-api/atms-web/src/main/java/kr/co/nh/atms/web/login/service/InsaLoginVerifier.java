package kr.co.nh.atms.web.login.service;

import kr.co.nh.atms.web.common.auth.CurrentUserLoader;
import kr.co.nh.atms.web.common.auth.LoginUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * 개발용 검증 — 개인번호가 인사정보(TB_INSA)에 있고 비밀번호가 공통 테스트 비밀번호 {@link #TEST_PASSWORD} 와 같으면 성공.
 * <p>
 * <b>잠정 Q-17</b>: TO-BE 테이블에 비밀번호 컬럼이 없어 무엇과 비교할지 현업 확인 전이다(docs/90_현업질문_후보.md).
 * 2026-11-11 사용자 결정: 그때까지 모든 사용자가 공통 비밀번호 하나를 쓴다. 로그인 화면 옆 테스트 계정 목록
 * ({@code src/screens/login/testAccounts.ts})에도 같은 값을 보여 주므로 비밀값이 아니다.
 * 확인되면 {@link LoginVerifier} 를 새로 구현해 이 클래스를 바꾼다.
 */
@Component
@RequiredArgsConstructor
public class InsaLoginVerifier implements LoginVerifier {

    /** 공통 테스트 비밀번호 — 화면 testAccounts.ts 의 TEST_PASSWORD 와 같아야 한다 */
    public static final String TEST_PASSWORD = "atms1234!";

    private final CurrentUserLoader loader;

    @Override
    public LoginUser verify(String perNo, String password) {
        if (perNo == null || perNo.isBlank() || !passwordAccepted(password)) return null;
        return loader.load(perNo.trim());
    }

    /** 잠정 Q-17 — 공통 테스트 비밀번호와 같은지(시간 차로 새지 않게 MessageDigest.isEqual) */
    public static boolean passwordAccepted(String password) {
        if (password == null) return false;
        return MessageDigest.isEqual(password.getBytes(StandardCharsets.UTF_8), TEST_PASSWORD.getBytes(StandardCharsets.UTF_8));
    }
}
