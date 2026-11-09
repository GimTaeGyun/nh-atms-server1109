package kr.co.nh.atms.web.login.dto;

/**
 * 로그인 결과 — API 계약 §7 {@code LoginResult}. 비밀번호는 담지 않는다.
 *
 * @param perNo        로그인한 개인번호
 * @param name         성명 TB_INSA.NAME
 * @param loginEnabled true 면 이후 /api/** 사용자가 이 세션(설정 atms.login.enabled=true),
 *                     false 면 견본 시연만 — 세션에 저장은 하지만 화면 사용자는 계속 고정 개인번호
 */
public record LoginResult(String perNo, String name, boolean loginEnabled) {
}
