package kr.co.nh.atms.web.common.auth;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * TB_SCR_AUTH 1행(업무권한). 키 DEPT_CODE+OFC_CODE+PER_NO.
 * PER_NO 가 개인번호면 개인 권한, '1'({@link CurrentUserLoader#DEPT_PER_NO})이면 부서 권한.
 */
@Getter
@Setter
@NoArgsConstructor
public class ScrAuthRow {
    /** 개인번호 PER_NO — '1' 이면 부서 권한 */
    private String perNo;
    private String deptCode;
    private String ofcCode;
    private String auth;
    /** 승인상태 APV_STS CHAR(2) — 'Y' 유효 */
    private String apvSts;
    /** 만료일시 DUE_DATE CHAR(14) — 비었거나 지금 이후면 유효 */
    private String dueDate;

    public ScrAuthRow(String perNo, String deptCode, String ofcCode, String auth, String apvSts, String dueDate) {
        this.perNo = perNo;
        this.deptCode = deptCode;
        this.ofcCode = ofcCode;
        this.auth = auth;
        this.apvSts = apvSts;
        this.dueDate = dueDate;
    }

    /** 개인번호 없이(= 개인 권한으로) 만든다 — 테스트용 */
    public ScrAuthRow(String deptCode, String ofcCode, String auth, String apvSts, String dueDate) {
        this(null, deptCode, ofcCode, auth, apvSts, dueDate);
    }
}
