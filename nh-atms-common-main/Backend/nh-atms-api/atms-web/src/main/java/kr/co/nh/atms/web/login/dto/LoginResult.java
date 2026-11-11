package kr.co.nh.atms.web.login.dto;

/**
 * 로그인 결과 — API 계약 §7 {@code LoginResult}. 비밀번호는 담지 않는다.
 *
 * @param perNo 로그인한 개인번호
 * @param name  성명 TB_INSA.NAME
 */
public record LoginResult(String perNo, String name) {
}
