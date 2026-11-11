package kr.co.nh.atms.web.common.auth;

import lombok.Getter;
import lombok.Setter;

/** 로그인 화면 사용자 목록 1행 — TB_INSA (CurrentUserMapper.selectLoginUsers). 권한·사무소는 CurrentUserLoader 가 채운다 */
@Getter
@Setter
public class LoginUserRow {
    /** 개인번호(사번) TB_INSA.PER_NO */
    private String perNo;
    /** 성명 TB_INSA.NAME */
    private String name;
    /** 부서코드 TB_INSA.SAMUSO */
    private String samuso;
}
