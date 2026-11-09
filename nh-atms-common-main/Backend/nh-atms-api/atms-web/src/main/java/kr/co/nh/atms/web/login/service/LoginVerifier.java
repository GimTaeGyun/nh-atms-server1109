package kr.co.nh.atms.web.login.service;

import kr.co.nh.atms.web.common.auth.LoginUser;

/**
 * 개인번호·비밀번호 검증 — 원천이 정해지면 이 구현 하나만 바꾼다(SSO·사내 인증·비밀번호 테이블 등).
 * 지금 구현은 {@link InsaLoginVerifier}(잠정 Q-17).
 */
public interface LoginVerifier {

    /** 맞으면 사용자, 틀리면 null. 비밀번호는 평문(복호화 끝난 값)으로 받는다 */
    LoginUser verify(String perNo, String password);
}
