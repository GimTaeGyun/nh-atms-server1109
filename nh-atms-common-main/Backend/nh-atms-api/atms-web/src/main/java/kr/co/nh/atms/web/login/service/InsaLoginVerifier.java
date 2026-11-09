package kr.co.nh.atms.web.login.service;

import kr.co.nh.atms.web.common.auth.CurrentUserLoader;
import kr.co.nh.atms.web.common.auth.LoginUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * 견본 검증 — 개인번호가 인사정보(TB_INSA)에 있고 비밀번호가 {@link #passwordAccepted} 를 통과하면 성공.
 * <p>
 * <b>잠정 Q-17</b>: TO-BE 테이블에 비밀번호 컬럼이 없어 무엇과 비교할지 현업 확인 전이다(docs/90_현업질문_후보.md).
 * 확인되면 {@link LoginVerifier} 를 새로 구현해 이 클래스를 바꾼다. 그때까지 비밀번호는 "복호화돼서 왔는지"만 확인하는 셈이다.
 */
@Component
@RequiredArgsConstructor
public class InsaLoginVerifier implements LoginVerifier {

    private final CurrentUserLoader loader;

    @Override
    public LoginUser verify(String perNo, String password) {
        if (perNo == null || perNo.isBlank() || !passwordAccepted(password)) return null;
        return loader.load(perNo.trim());
    }

    /** 잠정 Q-17 — 비밀번호 원천이 없어 비어 있지 않은지만 본다 */
    public static boolean passwordAccepted(String password) {
        return password != null && !password.isBlank();
    }
}
