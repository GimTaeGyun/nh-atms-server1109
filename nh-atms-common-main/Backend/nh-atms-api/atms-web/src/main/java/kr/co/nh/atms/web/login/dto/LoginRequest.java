package kr.co.nh.atms.web.login.dto;

import jakarta.validation.constraints.NotBlank;
import kr.co.nh.atms.common.security.crypto.EncryptedField;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 로그인 본문 — API 계약 §7 {@code LoginRequest}.
 * {@code password} 는 화면이 node-forge 로 암호화한 {@code ENC1.…} 값이다. {@link EncryptedField} 가 본문을 읽는 단계에서
 * 평문으로 바꾸므로 컨트롤러·서비스는 평문만 본다(암호화를 끈 환경이면 평문이 그대로 온다). 빈 값은 400 VAL_001.
 */
@Getter
@Setter
@NoArgsConstructor
public class LoginRequest {
    /** 개인번호 TB_INSA.PER_NO */
    @NotBlank
    private String perNo;
    /** 비밀번호 — 화면에서 암호화해 보낸다. 로그·응답에 남기지 않는다 */
    @NotBlank
    @EncryptedField
    private String password;

    public LoginRequest(String perNo, String password) {
        this.perNo = perNo;
        this.password = password;
    }
}
