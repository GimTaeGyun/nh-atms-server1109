package kr.co.nh.atms.web.common.auth;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/** 현재 사용자 조회 — mapper/common/CurrentUserMapper.xml */
@Mapper
public interface CurrentUserMapper {
    /** TB_INSA 1건(없으면 null) */
    InsaRow selectInsa(@Param("perNo") String perNo);

    /** TB_SCR_AUTH 내 권한 후보 — 개인 권한(PER_NO=perNo) + 부서 권한(PER_NO=deptPerNo, DEPT_CODE=deptCode). 채택은 CurrentUserLoader.pickAuth */
    List<ScrAuthRow> selectAuths(@Param("perNo") String perNo,
                                 @Param("deptCode") String deptCode,
                                 @Param("deptPerNo") String deptPerNo);

    /** 로그인 화면 사용자 목록 — 승인된 개인·부서 권한이 있는 사람 */
    List<LoginUserRow> selectLoginUsers(@Param("deptPerNo") String deptPerNo);

    /** TB_OFC_REG_MGT.KANM (없으면 null) */
    String selectKanm(@Param("ofcCode") String ofcCode);
}
