# tobe DB 테이블 명세 (NH-ATMS 차세대)

> 원본: [`docs/db-tobe/`](db-tobe/) 사진 46장 (2026-11-06 반입, 인쇄본 촬영) — **테이블 정의서(컬럼) 39쪽 + 테이블 목록 6쪽 + 중복 사진 1장**. 2026-11-06 Claude 가 사진을 한 줄씩 판독해 텍스트로 옮김.
> - 판독이 불확실한 곳은 `[판독주의]`, 사진이 기울어 열을 맞춰 읽은 테이블은 **비고**에 표시했다. DDL 작성·매퍼 수정 전에는 원본 사진과 대조할 것
> - 원문 오기로 보이는 값도 고치지 않고 `[원문 그대로]` 로 남겼다
> - 공통 감사 컬럼(대부분 테이블 끝): `CRT_DTM` 생성일시 CHAR(14) · `CRT_CMENO` 생성개인번호 VARCHAR2(9) · `LSCHG_DTM` 최종변경일시 CHAR(14) · `LS_CMENO` 최종변경자개인번호 VARCHAR2(9) — 표에서는 이 4개를 한 줄 **(감사 4컬럼)** 으로 줄였다
> - 공통 도메인: 사무소코드 `OFC_CODE` CHAR(6), 기번 `MCN_NO` CHAR(3) (자동화기기기번호), 일자 CHAR(8) (`일자C8`), 일시 CHAR(14) (`일시C14`)


## 1. 전체 목록 (114개)

| # | 주제영역 | 테이블ID | 엔티티명 | 설명 | 생성·갱신 규칙 | 컬럼 정의 쪽 |
|---|---|---|---|---|---|---|
| 1 | 기기관리 | [`TB_ATM_BAL`](#tb_atm_bal) | ATM시재(운영) | 운영 중인 ATM의 현재 시재 정보를 관리한다 | 시재정보 수신 및 시재 변동 시 생성,갱신한다 | 35/39 |
| 2 | 기기관리 | [`TB_ATM_BALHIST`](#tb_atm_balhist) | ATM시재이력 | ATM별 시재 변동 이력을 관리한다 | 시재정보 수신 및 변동 시 이력을 기록한다 | 35/39 |
| 3 | 기기관리 | [`TB_AUD_JOB_LOG`](#tb_aud_job_log) | 배치로그 | 배치 작업의 실행 내역과 처리 결과를 관리한다 | 배치 실행 시 생성하고, 종료 시 처리 결과를 기록한다 | 37/39 |
| 4 | 기기관리 | [`TB_AUD_RESP_MEMO`](#tb_aud_resp_memo) | 대응메모이력 | 장애 및 운영 업무의 대응 메모 이력을 관리한다 | 담당자의 대응 메모 등록 시 이력을 생성한다 | 37/39, 38/39 |
| 5 | 기기관리 | [`TB_CODE_DTL`](#tb_code_dtl) | 상세코드 | 코드 구분별 상세코드와 설명을 관리한다 | 상세코드 등록 및 변경 시 생성,갱신한다 | 7/39 |
| 6 | 기기관리 | [`TB_CODE_MASTER`](#tb_code_master) | 코드마스터 | 업무에서 사용하는 기준 코드 정보를 관리한다 | 코드 구분별 상세코드를 등록,변경한다 | 6/39, 7/39 |
| 7 | 기기관리 | [`TB_CO_CODE`](#tb_co_code) | 공통코드 | 업무 공통으로 사용하는 상세코드를 관리한다 | 코드 구분별 상세코드를 등록,변경한다 | 7/39 |
| 8 | 기기관리 | [`TB_CO_CODE_MST`](#tb_co_code_mst) | 공통코드구분 | 공통코드를 분류하는 코드 그룹을 관리한다 | 코드 그룹 등록 및 변경 시 생성,갱신한다 | 7/39 |
| 9 | 기기관리 | [`TB_CO_DTL_ERRCODE`](#tb_co_dtl_errcode) | 명세표오류코드 | 명세표 관련 오류코드와 오류 내용을 관리한다 | 오류코드 등록 및 변경 시 생성,갱신한다 | 7/39 |
| 10 | 기기관리 | [`TB_CO_MODEL`](#tb_co_model) | 기기모델코드 | 자동화기기의 모델별 코드와 기준정보를 관리한다 | 기기 모델 등록 및 변경 시 생성,갱신한다 | 7/39 |
| 11 | 기기관리 | [`TB_CO_MSG_SND`](#tb_co_msg_snd) | 메시지송신 | 송신 대상 메시지와 송신 처리 결과를 관리한다 | 메시지 송신 요청 시 생성하고 송신 상태와 결과를 갱신한다 | 7/39, 8/39 |
| 12 | 기기관리 | [`TB_CO_SIDO`](#tb_co_sido) | 시도위치정보 | 시도별 위치 및 지역 정보를 관리한다 | 시도 정보 등록 및 변경 시 생성,갱신한다 | 8/39 |
| 13 | 기기관리 | [`TB_CO_SIGUN`](#tb_co_sigun) | 시군위치정보 | 시군별 위치 및 소속 지역 정보를 관리한다 | 시군 정보 등록 및 변경 시 생성,갱신한다 | 8/39 |
| 14 | 기기관리 | [`TB_CO_UMS_MSG`](#tb_co_ums_msg) | UMS메시지 | UMS 발송 메시지와 처리 상태를 관리한다 | 메시지 발송 요청 시 생성하고, 발송 결과를 갱신한다 | 8/39 |
| 15 | 기기관리 | [`TB_EE_ADDT_TRANS_RPT`](#tb_ee_addt_trans_rpt) | 추가_현송_보고서 | 추가 현송에 대한 보고 내역을 관리한다 | 추가 현송 보고 등록시 생성하고, 변경 사항을 반영한다 | 10/39 |
| 16 | 기기관리 | [`TB_EE_CLOSE_BD`](#tb_ee_close_bd) | 마감_내역 | 자동화기기 업무의 마감 내역을 관리한다 | 마감 처리 시 생성하고, 마감 결과를 기록한다 | 10/39 |
| 17 | 기기관리 | [`TB_EE_CNR_SLA_VALU`](#tb_ee_cnr_sla_valu) | 코너_SLA_평가 | 자동화기기 코너별 SLA 평가 결과를 관리한다 | 평가 기간별 SLA 산정 시 생성,갱신한다 | 10/39 |
| 18 | 기기관리 | [`TB_EE_CNR_VALU`](#tb_ee_cnr_valu) | 코너평가 | 자동화기기 코너별 평가 결과를 관리한다 | 코너 평가 수행 시 생성하고, 평가 결과를 반영한다 | 11/39 |
| 19 | 기기관리 | [`TB_EE_DT_SEV_YN_MCN_INFO`](#tb_ee_dt_sev_yn_mcn_info) | 일자별용역대상여부기기정보 | 일자별 기기의 용역 대상 여부를 관리한다 | 일자별 용역 대상 판정 시 생성,갱신한다 | 11/39 |
| 20 | 기기관리 | [`TB_EE_ERR_MO_MGT`](#tb_ee_err_mo_mgt) | 장애출동관리 | 기기 장애에 따른 출동 및 처리 현황을 관리한다 | 장애 출동 접수 시 생성하고, 진행 상태를 갱신한다 | 11/39 |
| 21 | 기기관리 | [`TB_EE_FORCE_CLOSE_SYNC`](#tb_ee_force_close_sync) | 강제마감전문싱크 | 강제마감 전문의 동기화 정보를 관리한다 | 강제마감 전문 처리 시 생성하고, 동기화 상태를 갱신한다 | 11/39, 12/39 |
| 22 | 기기관리 | [`TB_EE_IOA_BD_NOTI`](#tb_ee_ioa_bd_noti) | 입출금_내역_통보 | 입출금 내역의 통보 정보와 처리 상태를 관리한다 | 입출금 내역 통보 시 생성하고, 처리 결과를 기록한다 | 12/39 |
| 23 | 기기관리 | [`TB_EE_MCN_ERR_HIST`](#tb_ee_mcn_err_hist) | 기기_장애_이력 | 자동화기기별 장애 발생 및 처리 이력을 관리한다 | 장애 발생 및 처리 상태 변경 시 이력을 기록한다 | 12/39, 13/39 |
| 24 | 기기관리 | [`TB_EE_MCN_LAST_ERR_INFO`](#tb_ee_mcn_last_err_info) | 기기_마지막_장애_정보 | 기기별 가장 최근의 장애 정보를 관리한다 | 신규 장애 발생 및 해당 장애 상태 변경 시 갱신한다 | 13/39 |
| 25 | 기기관리 | [`TB_EE_MCN_SEV_AMT_CAL`](#tb_ee_mcn_sev_amt_cal) | 기기별_용역료산정 | 자동화기기별 용역료 산정 결과를 관리한다 | 정산 기간별 용역료 계산 시 생성,갱신한다 | 13/39 |
| 26 | 기기관리 | [`TB_EE_MCN_TRO_HIST`](#tb_ee_mcn_tro_hist) | 기기_가동률_이력 | 자동화기기별 용역료 산정 이력을 관리한다(원문 그대로) | 기기 운영 및 장애 내역을 기준으로 가동률 산정 시 생성한다 | 13/39 |
| 27 | 기기관리 | [`TB_EE_MGM_REST`](#tb_ee_mgm_rest) | 조치_결과 | 장애 및 운영 업무에 대한 조치 결과를 관리한다 | 조치 결과 등록 시 생성하고, 보완 사항을 반영한다 | 13/39, 14/39 |
| 28 | 기기관리 | [`TB_EE_NOP_RSN_MGT`](#tb_ee_nop_rsn_mgt) | 미가동_사유_관리 | 자동화기기의 미가동 사유와 관련 내역을 관리한다 | 미가동 사유 등록 및 변경 시 생성,갱신한다 | 14/39 |
| 29 | 기기관리 | [`TB_EE_OP_FUND_CLM_BD`](#tb_ee_op_fund_clm_bd) | 운영_자금_청구서_내역 | 자동화기기 운영자금의 청구 내역을 관리한다 | 운영자금 청구 등록 시 생성하고, 처리 상태를 갱신한다 | 14/39 |
| 30 | 기기관리 | [`TB_EE_PNI_LV`](#tb_ee_pni_lv) | PNI_등급 | PNI 평가에 사용하는 등급 기준을 관리한다 | 등급 기준 등록 및 변경 시 생성,갱신한다 | 14/39 |
| 31 | 기기관리 | [`TB_EE_PRO_LOG`](#tb_ee_pro_log) | 프로시저_로그 | 프로시저 실행 내역과 처리 결과를 관리한다 | 프로시저 실행 시 실행 정보와 결과를 기록한다 | 14/39, 15/39 |
| 32 | 기기관리 | [`TB_EE_PST_SEV_CAL`](#tb_ee_pst_sev_cal) | 코너별_용역료산정 | 자동화기기 코너별 용역료 산정 결과를 관리한다 | 정산 기간별 코너 용역료 계산 시 생성,갱신한다 | 15/39 |
| 33 | 기기관리 | [`TB_EE_SCR_LOG`](#tb_ee_scr_log) | 일괄용역화면로그 | 일괄용역 업무 화면의 사용 및 처리 이력을 관리한다 | 해당 화면 사용 및 업무 처리 시 로그를 기록한다 | 35/39, 36/39 |
| 34 | 기기관리 | [`TB_EE_SENT_SNDRCV_HIST`](#tb_ee_sent_sndrcv_hist) | 전문송수신이력 | 대내외 연계 전문의 송수신 이력을 관리한다 | 전문 송수신 시 내역과 처리 결과를 기록한다 | 15/39 |
| 35 | 기기관리 | [`TB_EE_SEVMGT_MCNINFO`](#tb_ee_sevmgt_mcninfo) | 용역관리_기기정보 | 용역업체에서 담당하는 기기정보를 관리한다 | 용역업체 관리기기 변동시 생성,갱신한다 | 38/39 |
| 36 | 기기관리 | [`TB_EE_SEV_AMT_STD`](#tb_ee_sev_amt_std) | 용역료_기준 | 용역료 산정에 적용하는 기준 정보를 관리한다 | 산정 기준 등록 및 변경 시 생성,갱신한다 | 15/39, 16/39 |
| 37 | 기기관리 | [`TB_EE_SEV_CNT_VALU`](#tb_ee_sev_cnt_valu) | 용역사_건수_평가 | 용역사별 업무 처리 건수에 대한 평가 결과를 관리한다 | 평가 기간별 처리 건수 집계 및 평가 시 생성,갱신한다 | 16/39 |
| 38 | 기기관리 | [`TB_EE_SEV_PNI_PT`](#tb_ee_sev_pni_pt) | 용역사_PNI_점수 | 용역사별 PNI 평가 점수를 관리한다 | 평가 기간별 PNI 점수 산정 시 생성,갱신한다 | 16/39 |
| 39 | 기기관리 | [`TB_EE_SEV_SLA_VALU`](#tb_ee_sev_sla_valu) | 용역사_SLA_평가 | 용역사별 SLA 평가 결과를 관리한다 | 평가 기간별 SLA 산정 시 생성,갱신한다 | 16/39 |
| 40 | 기기관리 | [`TB_EE_STAT_RES_HIST`](#tb_ee_stat_res_hist) | 상태전문_용역응답_이력 | 상태전문에 대한 용역업체의 응답 이력을 관리한다 | 응답 전문 수신 시 수신 내용과 처리 결과를 기록한다 | 16/39 |
| 41 | 기기관리 | [`TB_EE_TRANS_PN_BD`](#tb_ee_trans_pn_bd) | 현송_계획서_내역 | 현송계획서의 상세 내역을 관리한다 | 현송 계획 등록 및 변경 시 생성,갱신한다 | 16/39, 17/39 |
| 42 | 기기관리 | [`TB_EE_TRANS_PN_STIC`](#tb_ee_trans_pn_stic) | 현송_계획_통계 | 현송 계획에 대한 집계 및 통계 정보를 관리한다 | 현송 계획 내역 집계 시 생성,갱신한다 | 17/39 |
| 43 | 기기관리 | [`TB_EE_VALU_KIND`](#tb_ee_valu_kind) | 평가_구분 | 평가 업무에 사용하는 평가 구분을 관리한다 | 평가 구분 등록 및 변경 시 생성,갱신한다 | 17/39 |
| 44 | 기기관리 | [`TB_EE_VALU_STD_TY_1`](#tb_ee_valu_std_ty_1) | 평가_기준_타입_1 | 타입1에 해당하는 평가 기준을 관리한다 | 해당 평가 기준 등록 및 변경 시 생성,갱신한다 | 17/39 |
| 45 | 기기관리 | [`TB_EE_VALU_STD_TY_2`](#tb_ee_valu_std_ty_2) | 평가_기준_타입_2 | 타입2에 해당하는 평가 기준을 관리한다 | 해당 평가 기준 등록 및 변경 시 생성,갱신한다 | 17/39 |
| 46 | 기기관리 | [`TB_EE_VALU_STD_TY_3`](#tb_ee_valu_std_ty_3) | 평가_기준_타입_3 | 타입3에 해당하는 평가 기준을 관리한다 | 해당 평가 기준 등록 및 변경 시 생성,갱신한다 | 17/39 |
| 47 | 기기관리 | [`TB_EE_VALU_STD_TY_4`](#tb_ee_valu_std_ty_4) | 평가_기준_타입_4 | 타입4에 해당하는 평가 기준을 관리한다 | 해당 평가 기준 등록 및 변경 시 생성,갱신한다 | 17/39, 18/39 |
| 48 | 기기관리 | [`TB_EE_VEND_REFUND`](#tb_ee_vend_refund) | 자금반환 | 용역업체 관련 자금 반환 내역을 관리한다 | 자금 반환 등록 시 생성하고, 처리 결과를 갱신한다 | 18/39 |
| 49 | 기기관리 | [`TB_EE_WITH_FUND_REST_NOTI`](#tb_ee_with_fund_rest_noti) | 회수_자금_결과_통보 | 회수자금 처리 결과의 통보 내역을 관리한다 | 결과 통보 시 생성하고, 송수신 처리 결과를 기록한다 | 18/39 |
| 50 | 기기관리 | [`TB_EMR_HIST`](#tb_emr_hist) | 긴급승인이력 | 일괄용역장애의 처리 이력을 관리한다 | 일괄용역장애 처리 시 이력을 기록한다 | 18/39 |
| 51 | 기기관리 | [`TB_ERR_DAY_OPRATE`](#tb_err_day_oprate) | 업체/기기/장애유형별일별가동률 | 업체,기기,장애유형별 일별 가동률을 관리한다 | 일별 운영 및 장애 내역 집계 시 생성,갱신한다 | 18/39, 19/39 |
| 52 | 기기관리 | [`TB_ERR_MON_OPRATE`](#tb_err_mon_oprate) | 업체/기기/장애유형별월별가동률 | 업체,기기,장애유형별 월별 가동률을 관리한다 | 월별 운영 및 장애 내역 집계 시 생성,갱신한다 | 19/39 |
| 53 | 기기관리 | [`TB_GEN_TEMP`](#tb_gen_temp) | 자동화기기상태GEN | 자동화기기 상태정보와 GEN 간 동기화용 임시 정보를 관리한다 | 동기화 대상 정보 수신 및 반영 과정에서 생성,갱신한다 | 19/39, 20/39 |
| 54 | 기기관리 | [`TB_INOUT_DAY_OPRATE`](#tb_inout_day_oprate) | 코너별일가동률 | 자동화기기 코너별 일별 가동률을 관리한다 | 코너별 일일 운영 내역 집계 시 생성,갱신한다 | 20/39 |
| 55 | 기기관리 | [`TB_INOUT_MON_OPRATE`](#tb_inout_mon_oprate) | 코너별월가동률 | 자동화기기 코너별 월별 가동률을 관리한다 | 코너별 월간 운영 및 중단시간 집계 시 생성,갱신한다 | 35/39 |
| 56 | 기기관리 | [`TB_INSA`](#tb_insa) | 인사정보 | 직원의 인사 기본정보를 관리한다 | 인사정보 등록,연계 및 변경 시 생성,갱신한다 | 8/39, 9/39 |
| 57 | 전자저널 | [`TB_JL_AGNT_STAT`](#tb_jl_agnt_stat) | 전자저널_Agent접속현황모니터링 | 전자저널 Agent의 접속 및 동작 상태를 관리한다 | Agent 접속 및 상태 보고시 생성,갱신한다 | 1/39 |
| 58 | 전자저널 | [`TB_JL_ATM_INIT`](#tb_jl_atm_init) | 전자저널_자동화기기초기환경설정 | 자동화기기의 전자저널 수집,전송 초기 설정을 관리한다 | 기기 등록 및 초기 설정 변경 시 생성,갱신한다 | 1/39 |
| 59 | 전자저널 | [`TB_JL_BPR_REQ`](#tb_jl_bpr_req) | 전자저널_BPR등록요청 | BPR 연계를 위한 등록 요청 및 처리 상태를 관리한다 | BPR 등록 요청시 생성하고, 처리 결과를 갱신한다 | 1/39 |
| 60 | 전자저널 | [`TB_JL_CNNT`](#tb_jl_cnnt) | 전자저널_접속정보 | 전자저널 시스템의 통신 접속 정보를 관리한다 | 접속 정보 등록 및 변경 시 생성,갱신한다 | 1/39 |
| 61 | 전자저널 | [`TB_JL_CODE`](#tb_jl_code) | 전자저널_공통코드 | 전자저널 업무에서 사용하는 공통코드 상세를 관리한다 | 코드 구분별 상세코드를 등록,변경한다 | 1/39 |
| 62 | 전자저널 | [`TB_JL_CODE_MST`](#tb_jl_code_mst) | 전자저널_공통코드구분 | 전자저널 업무에서 사용하는 공통코드 상세를 관리한다(원문 그대로) | 코드 구분별 상세코드를 등록,변경한다 | 1/39, 2/39 |
| 63 | 전자저널 | [`TB_JL_COMM_SESS`](#tb_jl_comm_sess) | 전자저널_세션정보 | 전자저널 통신 세션의 연결 및 상태 정보를 관리한다 | 통신 세션 연결 시 생성하고, 상태 변경 및 종료 시 갱신한다 [상세업무 자동화기기관리_저널, 주제영역 전자저널] | 5/39 |
| 64 | 전자저널 | [`TB_JL_DAY_ERR`](#tb_jl_day_err) | 전자저널_일별장애통계 | 전자저널 장애 발생 현황을 일단위로 집계한다 | 장애 내역을 기준으로 일별 집계 정보를 생성,갱신한다 | 2/39 |
| 65 | 전자저널 | [`TB_JL_DAY_JNAL`](#tb_jl_day_jnal) | 전자저널_일별저널처리통계 | 전자저널 처리 현황을 일 단위로 집계한다 | 저널 처리 결과를 기준으로 일별 집계 정보를 생성,갱신한다 | 2/39 |
| 66 | 전자저널 | [`TB_JL_ERR_LOG`](#tb_jl_err_log) | 전자저널_오류로그 | 전자저널 수집,전송,처리 중 발생한 오류 내역을 관리한다 | 오류 발생 시 오류 내용과 발생 정보를 기록한다 | 2/39 |
| 67 | 전자저널 | [`TB_JL_IMG_HIST`](#tb_jl_img_hist) | 전자저널_이미지_이력 | 전자저널 관련 이미지의 처리 이력을 관리한다 | 이미지 처리 시 처리 내역과 결과를 기록한다 | 2/39 |
| 68 | 전자저널 | [`TB_JL_IMG_UPLOAD`](#tb_jl_img_upload) | 전자저널_이미지_업로드 | 전자저널 관련 이미지 업로드 정보와 처리 상태를 관리한다 | 이미지 업로드 접수 시 생성하고, 처리 결과를 갱신한다 | 2/39 |
| 69 | 전자저널 | [`TB_JL_JNAL`](#tb_jl_jnal) | 전자저널_저널정보 | 자동화기기에서 수집한 전자저널을 관리한다 | 전자저널 수신 및 저장 처리 시 생성한다 [저널_ILM, 전자저널 ILM] | 2/39, 3/39, 5/39, 6/39 |
| 70 | 전자저널 | [`TB_JL_JNAL_CHK`](#tb_jl_jnal_chk) | 전자저널_저널수표정보 | 전자저널에 포함된 수표 거래 상세정보를 관리한다 | 수표 관련 저널 처리 시 해당 저널과 연계하여 생성한다 [저널_ILM] | 3/39, 6/39 |
| 71 | 전자저널 | [`TB_JL_JNAL_CHK_ILM`](#tb_jl_jnal_chk_ilm) | 전자저널_저널수표정보_ILM | 전자저널에 포함된 수표 거래 상세정보 내역을 관리한다 | 수표 관련 저널 처리 시 해당 저널과 연계하여 생성한다 [저널_ILM] | 6/39 |
| 72 | 전자저널 | [`TB_JL_JNAL_ILM`](#tb_jl_jnal_ilm) | 전자저널_저널정보_ILM | 자동화기기에서 수집한 전자저널 내역을 관리한다 | 전자저널 수신 및 저장 처리 시 생성한다 [저널_ILM] | 6/39 |
| 73 | 전자저널 | [`TB_JL_LOG_UPLOAD`](#tb_jl_log_upload) | 전자저널_로그_업로드 | 자동화기기 로그 파일의 업로드 정보와 처리 상태를 관리한다 | 로그 업로드 접수 시 생성하고, 처리 결과를 갱신한다 | 3/39 |
| 74 | 전자저널 | [`TB_JL_MON_ERR`](#tb_jl_mon_err) | 전자저널_월별장애통계 | 전자저널 장애 발생 현황을 월단위로 집계한다 | 장애 내역 또는 일별 통계를 기준으로 월별 집계를 생성,갱신한다 | 3/39 |
| 75 | 전자저널 | [`TB_JL_MON_JNAL`](#tb_jl_mon_jnal) | 전자저널_월별저널처리통계 | 전자저널 처리 현황을 월 단위로 집계한다 | 저널 처리 내역 또는 일별 통계를 기준으로 월별 집계를 생성,갱신한다 | 3/39, 4/39 |
| 76 | 전자저널 | [`TB_JL_PHOT_UPLOAD`](#tb_jl_phot_upload) | 전자저널_사진_업로드 | 자동화기기 관련 사진의 업로드 정보와 처리 상태를 관리한다 | 사진 업로드 접수 시 생성하고, 처리 결과를 갱신한다 | 4/39 |
| 77 | 전자저널 | [`TB_JL_PROC_STAT`](#tb_jl_proc_stat) | 전자저널_처리건수모니터링 | 전자저널 수집 및 처리 건수 현황을 관리한다 | 저널 수집,처리 결과에 따라 처리 건수를 생성,갱신한다 | 4/39 |
| 78 | 전자저널 | [`TB_JL_RESOURCE`](#tb_jl_resource) | 전자저널_자동화기기정보 | 전자저널 관리 대상 자동화기기의 기본정보를 관리한다 | 기기 등록 및 정보 변경 시 생성,갱신한다 | 4/39 |
| 79 | 전자저널 | [`TB_JL_RMT_ORD`](#tb_jl_rmt_ord) | 전자저널_원격지시 | 자동화기기 Agent에 전달하는 원격 명령과 처리 결과를 관리한다 | 원격 명령 요청 시 생성하고, 수행 상태 및 결과를 갱신한다 | 5/39 |
| 80 | 기기관리 | [`TB_MATN_ACCEPT`](#tb_matn_accept) | 보수업체접수정보 | 보수업체의 장애 및 보수 요청 접수정보를 관리한다 | 보수 요청 접수 시 생성하고 접수 상태를 갱신한다 | 20/39 |
| 81 | 기기관리 | [`TB_MATN_CORRECTION`](#tb_matn_correction) | 보수업체조치정보 | 보수업체의 장애 조치 내용과 결과를 관리한다 | 조치 내역 등록시 생성하고, 진행 상태와 결과를 갱신한다 | 20/39, 21/39 |
| 82 | 기기관리 | [`TB_MATN_ERR_MGT`](#tb_matn_err_mgt) | 보수업체장애정보 | 보수업체에서 처리하는 기기 장애 정보를 관리한다 | 장애 등록 및 연계 정보 수신 시 생성,갱신한다 | 21/39 |
| 83 | 기기관리 | [`TB_MATN_PROCID`](#tb_matn_procid) | 보수업체장애처리번호 | 보수업체 장애 업무의 처리번호를 관리한다 | 장애 처리번호 발급 시 채번 정보를 생성,갱신한다 | 21/39 |
| 84 | 기기관리 | [`TB_MCN_INFO`](#tb_mcn_info) | 자동화기기_기기정보 | 자동화기기 기기 유형, 상태를 관리한다 | 자동화기기 기기 유형, 상태 변경시 생성,갱신한다 (원문에 같은 행이 두 번 인쇄됨) | 39/39 |
| 85 | 기기관리 | [`TB_MCN_TARGET_IP`](#tb_mcn_target_ip) | 기기HOSTIP정보 | 자동화기기별 HOST IP 정보를 관리한다 | 자동화기기 HOST IP 변동시 생성,갱신한다 | 38/39 |
| 86 | 기기관리 | [`TB_MO_DAY_RATE`](#tb_mo_day_rate) | 보수업체일별출동현황통계 | 보수업체별 일별 출동 현황과 통계를 관리한다 | 출동 내역을 일 단위로 집계하여 생성,갱신한다 | 21/39 |
| 87 | 기기관리 | [`TB_MO_MON_RATE`](#tb_mo_mon_rate) | 보수업체월별출동현황통계 | 보수업체별 월별 출동 현황과 통계를 관리한다 | 출동 내역을 월 단위로 집계하여 생성,갱신한다 | 21/39, 22/39 |
| 88 | 기기관리 | [`TB_NMS_DAY_OPRATE`](#tb_nms_day_oprate) | 일가동률 | 자동화기기의 일별 가동률을 관리한다 | 일별 운영 및 중단시간 집계 시 생성,갱신한다 | 22/39, 23/39 |
| 89 | 기기관리 | [`TB_NMS_ERR_LOG`](#tb_nms_err_log) | 일별자동화기기장애현황 | 자동화기기의 일별 장애 발생 현황을 관리한다 | 장애정보 수집 및 일별현황 반영 시 생성,갱신한다 | 23/39, 24/39 |
| 90 | 기기관리 | [`TB_NMS_ERR_RISK`](#tb_nms_err_risk) | 장애집계 | 자동화기기 장애 관련 위험 정보를 관리한다 | 장애 위험 판정 및 정보 변경 시 생성,갱신한다 | 24/39 |
| 91 | 기기관리 | [`TB_NMS_HDAY`](#tb_nms_hday) | 휴일코드 | 업무에 적용하는 휴일 정보를 관리한다 | 휴일 등록 및 일정 변경 시 생성,갱신한다 | 9/39 |
| 92 | 기기관리 | [`TB_NMS_MON_OPRATE`](#tb_nms_mon_oprate) | 월가동률 | 자동화기기의 월별 가동률을 관리한다 | 월별 운영 및 중단시간 집계 시 생성,갱신한다 | 24/39, 25/39, 26/39 |
| 93 | 기기관리 | [`TB_NMS_SRC`](#tb_nms_src) | SRC단말/자동화기기구분코드 | SRC 단말 및 자동화기기의 구분코드를 관리한다 | SRC 단말 및 자동화기기의 구분코드를 관리한다 | 9/39 |
| 94 | 기기관리 | [`TB_NMS_SRC_ERR`](#tb_nms_src_err) | 장애코드 | 단말 및 자동화기기의 장애코드와 설명을 관리한다 | 장애코드 등록 및 변경 시 생성,갱신한다 | 9/39 |
| 95 | 기기관리 | [`TB_NOTICE`](#tb_notice) | 공지사항 | 공지할 사항을 등록 관리한다 | 공지할 사항 변동시 생성,갱신한다 | 39/39 |
| 96 | 기기관리 | [`TB_OFC_RAW`](#tb_ofc_raw) | 사무소정보(Raw Data) | 사무소 정보 ROW DATA를 기록 관리한다 | 사무소 정보 ROW DATA를 일일 배치로 생성,갱신한다 | 39/39 |
| 97 | 기기관리 | [`TB_OFC_REG_MGT`](#tb_ofc_reg_mgt) | 사무소등록관리 | 관리 대상 사무소의 등록정보를 관리한다 | 사무소 등록 및 정보 변경 시 생성,갱신한다 | 9/39, 10/39 |
| 98 | 기기관리 | [`TB_OP_ATM_LARGECHK_ERR`](#tb_op_atm_largechk_err) | 고액수표오류 | ATM 고액 수표 관련 오류 내역을 관리한다 | 관련 오류 발생 시 내역과 처리 결과를 기록한다 | 26/39 |
| 99 | 기기관리 | [`TB_OP_ATM_STAT`](#tb_op_atm_stat) | 자동화기기상태(GEN포함) | GEN을 포함한 자동화기기의 현재 상태를 관리한다 | 기기 상태정보 수신 및 변경 시 생성,갱신한다 | 26/39, 27/39, 28/39, 29/39 |
| 100 | 기기관리 | [`TB_OP_ATM_STATHIST`](#tb_op_atm_stathist) | 자동화기기상태이력 | 자동화기기 상태의 변동 이력을 관리한다 | 기기 상태정보 수신 및 변경 시 이력을 기록한다 | 29/39, 30/39, 31/39 |
| 101 | 기기관리 | [`TB_OP_DEAL_OFCSUM`](#tb_op_deal_ofcsum) | 거래집계 | 사무소별 거래 건수 및 금액의 집계를 관리한다 | 거래 내역을 기준으로 집계 정보를 생성,갱신한다 | 31/39, 32/39 |
| 102 | 기기관리 | [`TB_OP_FUND_DEMD`](#tb_op_fund_demd) | 운영자금청구서 | 자동화기기 운영자금의 청구 정보를 관리한다 | 운영자금 청구 시 생성하고, 처리 상태를 갱신한다 | 32/39 |
| 103 | 기기관리 | [`TB_OP_RESOURCE`](#tb_op_resource) | 운영자원 | 외부 시스템과 연계하는 전산기기 자원정보를 관리한다 | 자원정보 수신 및 연계 처리 시 생성,갱신한다 | 32/39, 33/39 |
| 104 | 기기관리 | [`TB_OP_RMT_ORD`](#tb_op_rmt_ord) | 원격지시이력 | 자동화기기에 대한 원격지시 및 수행 이력을 관리한다 | 원격지시 요청 시 생성하고, 수행 결과를 갱신한다 | 33/39 |
| 105 | 기기관리 | [`TB_OP_RMT_ORDPLAN`](#tb_op_rmt_ordplan) | 원격지시계획 | 자동화기기 원격지시의 예약 및 실행 계획을 관리한다 | 원격지시 계획 등록 시 생성하고, 변경,실행 상태를 갱신한다 | 33/39 |
| 106 | 기기관리 | [`TB_SCRT_ERR_MGT`](#tb_scrt_err_mgt) | 경비업체장애관리 | 경비업체와 연계한 장애 접수 및 처리 내역을 관리한다 | 장애 접수 시 생성하고, 처리 상태와 결과를 갱신한다 | 33/39, 34/39 |
| 107 | 기기관리 | [`TB_SCRT_INST_PST`](#tb_scrt_inst_pst) | 설치위치/업체관리ID매칭코드 | 설치위치와 경비업체 관리ID의 매핑 정보를 관리한다 | 매핑 등록 및 변경 시 생성,갱신한다 | 34/39, 35/39 |
| 108 | 기기관리 | [`TB_SCRT_INST_PST_HIST`](#tb_scrt_inst_pst_hist) | 설치위치/업체관리ID매칭코드사용이력 | 설치위치와 업체 관리ID 간 매칭코드의 사용 이력을 관리한다 | 매칭코드 사용 시 관련 내역을 기록한다 | 36/39 |
| 109 | 기기관리 | [`TB_SCR_AUTH`](#tb_scr_auth) | 사용자별업무권한 | 사용자별 업무시스템 권한을 관리한다 | 사용자별 업무시스템 권한 변동시 생성,갱신한다 | 38/39 |
| 110 | 기기관리 | [`TB_SCR_AUTH_HIST`](#tb_scr_auth_hist) | 사용자별업무권한 |  |  | 38/39 |
| 111 | 기기관리 | [`TB_SCR_AUTH_MENU`](#tb_scr_auth_menu) | 권한별메뉴관리 | 권한별 메뉴 접근 권한을 관리한다 | 권한별 메뉴 접근 권한 변동시 생성,갱신한다 | 38/39, 39/39 |
| 112 | 기기관리 | [`TB_SCR_MENU`](#tb_scr_menu) | 업무시스템메뉴 | 업무시스템 메뉴를 관리한다 | 업무시스템 메뉴 변동시 생성,갱신한다 | 38/39 |
| 113 | 기기관리 | [`TB_STM_HOP_PSTT`](#tb_stm_hop_pstt) | STM호퍼현황 | STM 호퍼의 상태 및 현황 정보를 관리한다 | 호퍼 현황정보 수신 및 상태 변경 시 생성,갱신한다 | 36/39, 37/39 |
| 114 | 기기관리 | [`TB_SYS_COMM_MGT`](#tb_sys_comm_mgt) | 시스템공통관리 | 시스템 공통 관리 항목을 기록 관리한다 | 시스템 공통 관리 항목 변경시 생성,갱신한다 | **없음** |

### 확인이 필요한 점

- `TB_SYS_COMM_MGT` (시스템공통관리): 목록(6/6쪽)에만 있고 컬럼 정의 39쪽 안에 없음 → 정의서 누락 여부 확인
- `TB_SCR_AUTH_HIST` (사용자별업무권한 이력): 컬럼 정의(38/39쪽)에는 있으나 목록 6쪽에 없음
- `TB_MCN_INFO` 는 목록에 같은 행이 두 번 인쇄됨, `TB_JL_JNAL`·`TB_JL_JNAL_CHK` 는 컬럼 정의에 두 번(3쪽·5~6쪽) 인쇄됨 — 내용은 같음
- 27/39쪽은 사진 두 장(`KakaoTalk_20261106_154235676_02.jpg`·`_03.jpg`)이 같은 쪽
- 39/39쪽은 사진 오른쪽 NULL 열이 잘려 PK 컬럼만 NOT NULL 로 적었다 (`TB_NOTICE`, `TB_MCN_INFO`, `TB_OFC_RAW`)

## 2. 테이블별 컬럼

표 열: 컬럼명 · 속성명 · 데이터타입 · PK(Y) · NOT NULL(NN). FK 표시는 원문 전체가 N 이라 생략.

### TB_JL_AGNT_STAT

**전자저널_Agent접속현황모니터링** · 전자저널 — 전자저널 Agent의 접속 및 동작 상태를 관리한다

원본 쪽: 1/39 (KakaoTalk_20261106_154235676_15.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `AGNT_VER` | AGENT버전 | VARCHAR2(10) |  |  |
| `AGNT_STAT` | AGENT접속상태 | VARCHAR2(2) |  |  |
| `SVR_ID` | 서버ID | VARCHAR2(2) |  |  |
| `VPN_YN` | VPN여부 | CHAR(1) |  |  |
| `IP` | IP | VARCHAR2(15) |  |  |
| `INTC_NO` | 인스턴스NO | NUMBER(8) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_JL_ATM_INIT

**전자저널_자동화기기초기환경설정** · 전자저널 — 자동화기기의 전자저널 수집,전송 초기 설정을 관리한다

원본 쪽: 1/39 (KakaoTalk_20261106_154235676_15.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `VEND_CODE` | 업체코드 | VARCHAR2(2) | Y | NOT NULL |
| `MCN_TYPE` | 기기구분 | VARCHAR2(2) | Y | NOT NULL |
| `MODEL_CODE` | 모델코드 | VARCHAR2(2) | Y | NOT NULL |
| `AJMS_PSBL_YN` | 전자저널가능여부 | CHAR(1) |  |  |
| `FACE_IMG_PSBL_YN` | 안면이미지가능여부 | CHAR(1) |  |  |
| `ACPT_IMG_PSBL_YN` | 수취이미지가능여부 | CHAR(1) |  |  |
| `CARD_IMG_PSBL_YN` | 카드이미지가능여부 | CHAR(1) |  |  |
| `JNAL_OP_TYPE` | 저널운영구분 | CHAR(1) |  |  |
| `JNAL_TERM_TYPE` | 저널범위구분 | CHAR(1) |  |  |
| `MGT_DIR` | 관리디렉토리 | VARCHAR2(256) |  |  |
| `JNAL_COMT_SAV_TERM` | 저널내용보관주기 | NUMBER(2) |  |  |
| `JNAL_COMT_DEL_TERM` | 저널내용삭제주기 | NUMBER(2) |  |  |
| `FACE_IMG_SAV_TERM` | 안면이미지보관주기 | NUMBER(2) |  |  |
| `FACE_IMG_DEL_TERM` | 안면이미지삭제주기 | NUMBER(2) |  |  |
| `ACPT_IMG_SAV_TERM` | 수취이미지보관주기 | NUMBER(2) |  |  |
| `ACPT_IMG_DEL_TERM` | 수취이미지삭제주기 | NUMBER(2) |  |  |
| `CARD_IMG_SAV_TERM` | 카드이미지보관주기 | NUMBER(2) |  |  |
| `CARD_IMG_DEL_TERM` | 카드이미지삭제주기 | NUMBER(2) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_JL_BPR_REQ

**전자저널_BPR등록요청** · 전자저널 — BPR 연계를 위한 등록 요청 및 처리 상태를 관리한다

원본 쪽: 1/39 (KakaoTalk_20261106_154235676_15.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `SVR_ID` | 서버ID | VARCHAR2(2) | Y | NOT NULL |
| `DEAL_DATE` | 거래날짜 | CHAR(8) | Y | NOT NULL |
| `REG_REQ_SEQNO` | 등록요청일련번호 | NUMBER(6) | Y | NOT NULL |
| `DEAL_TIME` | 거래시간 | CHAR(6) |  |  |
| `MGT_DIR` | 관리디렉토리 | VARCHAR2(256) |  |  |
| `PROC_STAT` | 처리상태 | VARCHAR2(2) |  |  |
| `IMG_CNT` | 이미지건수 | NUMBER(3) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_JL_CNNT

**전자저널_접속정보** · 전자저널 — 전자저널 시스템의 통신 접속 정보를 관리한다

원본 쪽: 1/39 (KakaoTalk_20261106_154235676_15.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `DEAL_DATE` | 거래날짜 | CHAR(8) |  |  |
| `DEAL_TIME` | 거래시간 | CHAR(6) |  |  |
| `JNAL_OP_TYPE` | 저널운영구분 | CHAR(1) |  |  |
| `JNAL_TERM_TYPE` | 저널범위구분 | CHAR(1) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_JL_CODE

**전자저널_공통코드** · 전자저널 — 전자저널 업무에서 사용하는 공통코드 상세를 관리한다

원본 쪽: 1/39 (KakaoTalk_20261106_154235676_15.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `CODE_TYPE` | 코드구분 | VARCHAR2(10) | Y | NOT NULL |
| `CODE` | 코드 | VARCHAR2(10) | Y | NOT NULL |
| `CODE_NM` | 코드명 | VARCHAR2(80) |  |  |
| `DESC1` | 설명1 | VARCHAR2(80) |  |  |
| `DESC2` | 설명2 | VARCHAR2(80) |  |  |
| `DESC3` | 설명3 | VARCHAR2(80) |  |  |
| `SORT_ORD` | 정렬순서 | NUMBER(4) |  |  |
| `USE_YN` | 사용유무 | CHAR(1) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_JL_CODE_MST

**전자저널_공통코드구분** · 전자저널 — 전자저널 업무에서 사용하는 공통코드 상세를 관리한다(원문 그대로)

원본 쪽: 1/39 (KakaoTalk_20261106_154235676_15.jpg), 2/39 (KakaoTalk_20261106_154124088_18.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `CODE_TYPE` | 코드구분 | VARCHAR2(10) | Y | NOT NULL |
| `CODE_NM` | 코드명 | VARCHAR2(80) |  |  |
| `DESC1` | 설명1 | VARCHAR2(80) |  |  |
| `DESC2` | 설명2 | VARCHAR2(80) |  |  |
| `DESC3` | 설명3 | VARCHAR2(80) |  |  |
| `USE_YN` | 사용유무 | CHAR(1) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_JL_COMM_SESS

**전자저널_세션정보** · 전자저널 — 전자저널 통신 세션의 연결 및 상태 정보를 관리한다

원본 쪽: 5/39 (KakaoTalk_20261106_154235676_12.jpg)

비고: 원문에 PK 표시가 없음

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `DEAL_DATE` | 거래날짜 | CHAR(8) |  | NOT NULL |
| `SESS_SEQNO` | 세션일련번호 | VARCHAR2(50) |  | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) |  | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) |  | NOT NULL |
| `DEAL_DTL_TIME` | 운영상세시간 | CHAR(9) |  | NOT NULL |
| `SVR_ID` | 서버ID | VARCHAR2(2) |  |  |
| `CONN_STAT` | 접속상태 | VARCHAR2(2) |  |  |
| `CONN_TIME` | 접속시간 | CHAR(6) |  |  |
| `IP` | IP | VARCHAR2(15) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_JL_DAY_ERR

**전자저널_일별장애통계** · 전자저널 — 전자저널 장애 발생 현황을 일단위로 집계한다

원본 쪽: 2/39 (KakaoTalk_20261106_154124088_18.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `DEAL_DATE` | 거래날짜 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `ERR_CNT` | 장애건수 | NUMBER(6) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_JL_DAY_JNAL

**전자저널_일별저널처리통계** · 전자저널 — 전자저널 처리 현황을 일 단위로 집계한다

원본 쪽: 2/39 (KakaoTalk_20261106_154124088_18.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `DEAL_DATE` | 거래날짜 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `OP_JNAL_CNT` | 운영저널건수 | NUMBER(6) |  |  |
| `NRM_CNT` | 정상건수 | NUMBER(6) |  |  |
| `BUL_CNT` | 불능건수 | NUMBER(6) |  |  |
| `CUST_CAN_CNT` | 고객취소건수 | NUMBER(6) |  |  |
| `CAN_NRM_CNT` | 취소정상건수 | NUMBER(6) |  |  |
| `CAN_BUL_CNT` | 취소불능건수 | NUMBER(6) |  |  |
| `INCMPT_CNT` | 확인요망건수 | NUMBER(6) |  |  |
| `FACE_IMG_CNT` | 안면이미지건수 | NUMBER(6) |  |  |
| `ACPT_IMG_CNT` | 수취이미지건수 | NUMBER(6) |  |  |
| `CARD_IMG_CNT` | 카드이미지건수 | NUMBER(6) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_JL_ERR_LOG

**전자저널_오류로그** · 전자저널 — 전자저널 수집,전송,처리 중 발생한 오류 내역을 관리한다

원본 쪽: 2/39 (KakaoTalk_20261106_154124088_18.jpg)

비고: 원문에 PK 표시가 없음

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `DEAL_DATE` | 거래날짜 | CHAR(8) |  | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) |  | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) |  | NOT NULL |
| `ERR_CODE` | 장애코드 | VARCHAR2(10) |  |  |
| `DEAL_DTL_TIME` | 운영상세시간 | CHAR(9) |  | NOT NULL |
| `ERR_SVR_ID` | 서버ID | VARCHAR2(2) |  |  |
| `ERR_MDL_NM` | 에러서비스명 | VARCHAR2(20) |  |  |
| `ERR_BIZ_NM` | 에러모듈명 | VARCHAR2(20) |  |  |
| `ERR_COMT` | 장애내용 | VARCHAR2(80) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_JL_IMG_HIST

**전자저널_이미지_이력** · 전자저널 — 전자저널 관련 이미지의 처리 이력을 관리한다

원본 쪽: 2/39 (KakaoTalk_20261106_154124088_18.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `DEAL_DATE` | 거래날짜 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `DTLS_SEQNO` | 명세표일련번호 | CHAR(4) | Y | NOT NULL |
| `REQ_PERNO` | 요청자개인번호 | VARCHAR2(10) | Y | NOT NULL |
| `REQ_DATE` | 요청일자 | CHAR(8) | Y | NOT NULL |
| `REQ_TIME` | 요청시간 | CHAR(6) | Y | NOT NULL |
| `REQ_ORG` | 요청기관 | VARCHAR2(30) |  |  |
| `REQ_REASON` | 요청근거사유 | VARCHAR2(50) |  |  |
| `REQ_ETC` | 기타 | VARCHAR2(50) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_JL_IMG_UPLOAD

**전자저널_이미지_업로드** · 전자저널 — 전자저널 관련 이미지 업로드 정보와 처리 상태를 관리한다

원본 쪽: 2/39 (KakaoTalk_20261106_154124088_18.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `DEAL_DATE` | 거래날짜 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `JNAL_SEQNO` | 저널일련번호 | CHAR(6) | Y | NOT NULL |
| `RMT_ORD_DT` | 원격지시일자 | CHAR(8) |  | NOT NULL |
| `RMT_ORD_SEQNO` | 원격지시일련번호 | NUMBER(6) |  | NOT NULL |
| `FACE_IMG_SIZE` | 안면이미지사이즈 | NUMBER(6) |  |  |
| `FACE_IMG` | 안면이미지 | BLOB |  |  |
| `ACPT_IMG_SIZE` | 수취이미지사이즈 | NUMBER(6) |  |  |
| `ACPT_IMG` | 수취이미지 | BLOB |  |  |
| `CARD_IMG_SIZE` | 카드이미지사이즈 | NUMBER(6) |  |  |
| `CARD_IMG` | 카드이미지 | BLOB |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_JL_JNAL

**전자저널_저널정보** · 전자저널 — 자동화기기에서 수집한 전자저널을 관리한다

원본 쪽: 2/39 (KakaoTalk_20261106_154124088_18.jpg), 3/39 (KakaoTalk_20261106_154235676_14.jpg), 5/39 (KakaoTalk_20261106_154235676_12.jpg), 6/39 (KakaoTalk_20261106_154124088_16.jpg)

비고: 원문에 같은 테이블이 두 번 인쇄됨

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `JNAL_DT` | 저널일자 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `JNAL_SEQNO` | 저널일련번호 | CHAR(6) | Y | NOT NULL |
| `JNAL_TYPE` | 저널구분 | VARCHAR2(2) |  |  |
| `JNAL_TIME` | 저널시간 | CHAR(6) |  |  |
| `JRNL_PROC_REST` | 저널처리결과 | VARCHAR2(2) |  |  |
| `JNAL_INCMPT_YN` | 저널미완료여부 | CHAR(1) |  |  |
| `ATM_COPT_YN` | ATM완료여부 | VARCHAR2(2) |  |  |
| `DEAL_DATE` | 거래날짜 | CHAR(8) |  |  |
| `DEAL_TIME` | 거래시간 | CHAR(6) |  |  |
| `DTLS_SEQNO` | 명세표일련번호 | CHAR(4) |  |  |
| `SCR_NO` | 화면번호 | CHAR(4) |  |  |
| `DEAL_NM` | 거래명 | VARCHAR2(30) |  |  |
| `ACCT_NO` | 계좌번호 | VARCHAR2(50) |  |  |
| `MDN_TYPE` | 매체구분 | VARCHAR2(2) |  |  |
| `ESTB_BANK_CODE` | 개설은행코드 | VARCHAR2(2) |  |  |
| `CARD_NO` | 카드번호 | VARCHAR2(50) |  |  |
| `CHK_CNT` | 수표건수 | NUMBER(2) |  |  |
| `CHK_ISSUE_REST` | 수표발급결과 | VARCHAR2(2) |  |  |
| `DEAL_AMT` | 거래금액 | NUMBER(22) |  |  |
| `IMG_TYPE` | 이미지구분 | VARCHAR2(1) |  |  |
| `FACE_IMG_YN` | 안면이미지여부 | VARCHAR2(1) |  |  |
| `ACPT_IMG_YN` | 수취이미지여부 | VARCHAR2(1) |  |  |
| `CARD_IMG_YN` | 카드이미지여부 | VARCHAR2(1) |  |  |
| `BPR_PROC_STAT` | BPR처리상태 | VARCHAR2(2) |  |  |
| `BFO_COMT` | 전인자내용 | VARCHAR2(2048) |  |  |
| `AFT_COMT` | 후인자내용 | VARCHAR2(2048) |  |  |
| `ERR_SVR_ID` | 서버ID | VARCHAR2(2) |  |  |
| `ERR_MDL_NM` | 에러서비스명 | VARCHAR2(20) |  |  |
| `ERR_BIZ_NM` | 에러모듈명 | VARCHAR2(20) |  |  |
| `ERR_CODE` | 장애코드 | VARCHAR2(10) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_JL_JNAL_CHK

**전자저널_저널수표정보** · 전자저널 — 전자저널에 포함된 수표 거래 상세정보를 관리한다

원본 쪽: 3/39 (KakaoTalk_20261106_154235676_14.jpg), 6/39 (KakaoTalk_20261106_154124088_16.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `JNAL_DT` | 저널일자 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `JNAL_SEQNO` | 저널일련번호 | CHAR(6) | Y | NOT NULL |
| `SEQNO` | 일련번호(SQ_CO_REQSEQ.NEXTVAL) | CHAR(2) | Y | NOT NULL |
| `DEAL_DATE` | 거래날짜 | CHAR(8) |  |  |
| `DTLS_SEQNO` | 명세표일련번호 | CHAR(4) |  |  |
| `CHK_NO` | 수표번호 | VARCHAR2(17) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_JL_JNAL_CHK_ILM

**전자저널_저널수표정보_ILM** · 전자저널 — 전자저널에 포함된 수표 거래 상세정보 내역을 관리한다

원본 쪽: 6/39 (KakaoTalk_20261106_154124088_16.jpg)

비고: 사진이 기울어 타입·PK·NULL 열을 한 줄씩 맞춰 보정 판독 — 원본 대조 권장

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| (동일) | TB_JL_JNAL_CHK 와 같은 컬럼·타입·PK (JNAL_DT,OFC_CODE,MCN_NO,JNAL_SEQNO,SEQNO PK / DEAL_DATE CHAR(8), DTLS_SEQNO CHAR(4), CHK_NO VARCHAR2(17)) |  |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_JL_JNAL_ILM

**전자저널_저널정보_ILM** · 전자저널 — 자동화기기에서 수집한 전자저널 내역을 관리한다

원본 쪽: 6/39 (KakaoTalk_20261106_154124088_16.jpg)

비고: 사진이 기울어 타입·PK·NULL 열을 한 줄씩 맞춰 보정 판독 — 원본 대조 권장

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `JNAL_DT` | 저널일자 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `JNAL_SEQNO` | 저널일련번호 | CHAR(6) | Y | NOT NULL |
| `JNAL_TYPE` | 저널구분 | VARCHAR2(2) |  |  |
| `JNAL_TIME` | 저널시간 | CHAR(6) |  |  |
| `JRNL_PROC_REST` | 저널처리결과 | VARCHAR2(2) |  |  |
| `JNAL_INCMPT_YN` | 저널미완료여부 | CHAR(1) |  |  |
| `ATM_COPT_YN` | ATM완료여부 | VARCHAR2(2) |  |  |
| `DEAL_DATE` | 거래날짜 | CHAR(8) |  |  |
| `DEAL_TIME` | 거래시간 | CHAR(6) |  |  |
| `DTLS_SEQNO` | 명세표일련번호 | CHAR(4) |  |  |
| `SCR_NO` | 화면번호 | CHAR(4) |  |  |
| `DEAL_NM` | 거래명 | VARCHAR2(30) |  |  |
| `ACCT_NO` | 계좌번호 | VARCHAR2(50) |  |  |
| `MDN_TYPE` | 매체구분 | VARCHAR2(2) |  |  |
| `ESTB_BANK_CODE` | 개설은행코드 | VARCHAR2(2) |  |  |
| `CARD_NO` | 카드번호 | VARCHAR2(50) |  |  |
| `CHK_CNT` | 수표건수 | NUMBER(2) |  |  |
| `CHK_ISSUE_REST` | 수표발급결과 | VARCHAR2(2) |  |  |
| `DEAL_AMT` | 거래금액 | NUMBER(22) |  |  |
| `IMG_TYPE` | 이미지구분 | VARCHAR2(1) |  |  |
| `FACE_IMG_YN` | 안면이미지여부 | CHAR(1) |  |  |
| `ACPT_IMG_YN` | 수취이미지여부 | CHAR(1) |  |  |
| `CARD_IMG_YN` | 카드이미지여부 | CHAR(1) |  |  |
| `BPR_PROC_STAT` | BPR처리상태 | VARCHAR2(2) |  |  |
| `BFO_COMT` | 전인자내용 | VARCHAR2(2048) |  |  |
| `AFT_COMT` | 후인자내용 | VARCHAR2(2048) |  |  |
| `ERR_SVR_ID` | 서버ID | VARCHAR2(2) |  |  |
| `ERR_MDL_NM` | 에러서비스명 | VARCHAR2(20) |  |  |
| `ERR_BIZ_NM` | 에러모듈명 | VARCHAR2(20) |  |  |
| `ERR_CODE` | 장애코드 | VARCHAR2(10) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_JL_LOG_UPLOAD

**전자저널_로그_업로드** · 전자저널 — 자동화기기 로그 파일의 업로드 정보와 처리 상태를 관리한다

원본 쪽: 3/39 (KakaoTalk_20261106_154235676_14.jpg)

비고: 원문에 PK 표시가 없음

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `DEAL_DATE` | 거래날짜 | CHAR(8) |  | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) |  | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) |  | NOT NULL |
| `RMT_ORD_DT` | 원격지시일자 | CHAR(8) |  | NOT NULL |
| `RMT_ORD_SEQNO` | 원격지시일련번호 | NUMBER(6) |  | NOT NULL |
| `DEAL_TIME` | 거래시간 | CHAR(6) |  |  |
| `LOG_SIZE` | 로그사이즈 | NUMBER(4) |  |  |
| `LOG_COMT` | 로그내용 | VARCHAR2(2048) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_JL_MON_ERR

**전자저널_월별장애통계** · 전자저널 — 전자저널 장애 발생 현황을 월단위로 집계한다

원본 쪽: 3/39 (KakaoTalk_20261106_154235676_14.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OP_YM` | 운영월 | CHAR(6) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `ERR_CNT` | 장애건수 | NUMBER(6) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_JL_MON_JNAL

**전자저널_월별저널처리통계** · 전자저널 — 전자저널 처리 현황을 월 단위로 집계한다

원본 쪽: 3/39 (KakaoTalk_20261106_154235676_14.jpg), 4/39 (KakaoTalk_20261106_154124088_17.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OP_YM` | 운영월 | CHAR(6) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `OP_JNAL_CNT` | 운영저널건수 | NUMBER(6) |  |  |
| `NRM_CNT` | 정상건수 | NUMBER(6) |  |  |
| `BUL_CNT` | 불능건수 | NUMBER(6) |  |  |
| `CUST_CAN_CNT` | 고객취소건수 | NUMBER(6) |  |  |
| `CAN_NRM_CNT` | 취소정상건수 | NUMBER(6) |  |  |
| `CAN_BUL_CNT` | 취소불능건수 | NUMBER(6) |  |  |
| `INCMPT_CNT` | 확인요망건수 | NUMBER(6) |  |  |
| `FACE_IMG_CNT` | 안면이미지건수 | NUMBER(6) |  |  |
| `ACPT_IMG_CNT` | 수취이미지건수 | NUMBER(6) |  |  |
| `CARD_IMG_CNT` | 카드이미지건수 | NUMBER(6) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_JL_PHOT_UPLOAD

**전자저널_사진_업로드** · 전자저널 — 자동화기기 관련 사진의 업로드 정보와 처리 상태를 관리한다

원본 쪽: 4/39 (KakaoTalk_20261106_154124088_17.jpg)

비고: 원문에 PK 표시가 없음

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `DEAL_DATE` | 거래날짜 | CHAR(8) |  | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) |  | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) |  | NOT NULL |
| `RMT_ORD_DT` | 원격지시일자 | CHAR(8) |  | NOT NULL |
| `RMT_ORD_SEQNO` | 원격지시일련번호 | NUMBER(6) |  | NOT NULL |
| `DEAL_TIME` | 거래시간 | CHAR(6) |  |  |
| `PHOT_IMG_SIZE` | 사진이미지사이즈 | NUMBER(6) |  |  |
| `PHOT_IMG` | 사진이미지 | BLOB |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_JL_PROC_STAT

**전자저널_처리건수모니터링** · 전자저널 — 전자저널 수집 및 처리 건수 현황을 관리한다

원본 쪽: 4/39 (KakaoTalk_20261106_154124088_17.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `DEAL_DATE` | 거래날짜 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `OP_JNAL_CNT` | 운영저널건수 | NUMBER(6) |  |  |
| `NRM_CNT` | 정상건수 | NUMBER(6) |  |  |
| `BUL_CNT` | 불능건수 | NUMBER(6) |  |  |
| `CUST_CAN_CNT` | 고객취소건수 | NUMBER(6) |  |  |
| `CAN_NRM_CNT` | 취소정상건수 | NUMBER(6) |  |  |
| `CAN_BUL_CNT` | 취소불능건수 | NUMBER(6) |  |  |
| `INCMPT_CNT` | 확인요망건수 | NUMBER(6) |  |  |
| `FACE_IMG_CNT` | 안면이미지건수 | NUMBER(6) |  |  |
| `ACPT_IMG_CNT` | 수취이미지건수 | NUMBER(6) |  |  |
| `CARD_IMG_CNT` | 카드이미지건수 | NUMBER(6) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_JL_RESOURCE

**전자저널_자동화기기정보** · 전자저널 — 전자저널 관리 대상 자동화기기의 기본정보를 관리한다

원본 쪽: 4/39 (KakaoTalk_20261106_154124088_17.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `AJMS_PSBL_YN` | 전자저널가능여부 | CHAR(1) |  |  |
| `FACE_IMG_PSBL_YN` | 안면이미지가능여부 | CHAR(1) |  |  |
| `ACPT_IMG_PSBL_YN` | 수취이미지가능여부 | CHAR(1) |  |  |
| `CARD_IMG_PSBL_YN` | 카드이미지가능여부 | CHAR(1) |  |  |
| `ENCRPT_YN` | 암호여부 | CHAR(1) |  |  |
| `JNAL_OP_TYPE` | 저널운영구분 | CHAR(1) |  |  |
| `JNAL_TERM_TYPE` | 저널범위구분 | CHAR(1) |  |  |
| `MCN_PRIV_ID` | 기기고유번호 | VARCHAR2(20) |  |  |
| `IP` | IP | VARCHAR2(15) |  |  |
| `VPN_IP` | VPNIP | VARCHAR2(15) |  |  |
| `AGNT_SETUP_YN` | AGNT_SETUP_YN | CHAR(1) |  |  |
| `AGNT_VER` | AGENT버전 | VARCHAR2(10) |  |  |
| `SETUP_DT` | SETUP_DT | CHAR(8) |  |  |
| `SETUP_TIME` | SETUP_TIME | CHAR(6) |  |  |
| `MGT_DIR` | 관리디렉토리 | VARCHAR2(256) |  |  |
| `JNAL_COMT_SAV_TERM` | 저널내용보관주기 | NUMBER(2) |  |  |
| `JNAL_COMT_DEL_TERM` | 저널내용삭제주기 | NUMBER(2) |  |  |
| `FACE_IMG_SAV_TERM` | 안면이미지보관주기 | NUMBER(2) |  |  |
| `FACE_IMG_DEL_TERM` | 안면이미지삭제주기 | NUMBER(2) |  |  |
| `ACPT_IMG_SAV_TERM` | 수취이미지보관주기 | NUMBER(2) |  |  |
| `ACPT_IMG_DEL_TERM` | 수취이미지삭제주기 | NUMBER(2) |  |  |
| `CARD_IMG_SAV_TERM` | 카드이미지보관주기 | NUMBER(2) |  |  |
| `CARD_IMG_DEL_TERM` | 카드이미지삭제주기 | NUMBER(2) |  |  |
| `BIZ_OPEN_DT` | 업무개시일자 | CHAR(8) |  |  |
| `BIZ_OPEN_TIME` | 업무개시시간 | CHAR(6) |  |  |
| `IMG_OPEN_DT` | 이미지개시일자 | CHAR(8) |  |  |
| `IMG_OPEN_TIME` | 이미지개시시간 | CHAR(6) |  |  |
| `RMT_ORD_YN` | RMT_ORD_YN | CHAR(1) |  |  |
| `RMT_ORD_DT` | 원격지시일자 | CHAR(8) |  |  |
| `RMT_ORD_SEQNO` | 원격지시일련번호 | NUMBER(6) |  |  |
| `FIRST_OPEN_DT` | 최초개시일자 | CHAR(8) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_JL_RMT_ORD

**전자저널_원격지시** · 전자저널 — 자동화기기 Agent에 전달하는 원격 명령과 처리 결과를 관리한다

원본 쪽: 5/39 (KakaoTalk_20261106_154235676_12.jpg)

비고: 원문에 PK 표시가 없음

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `DEAL_DATE` | 거래날짜 | CHAR(8) |  | NOT NULL |
| `RMT_ORD_SEQNO` | 원격지시일련번호 | NUMBER(22) |  | NOT NULL |
| `DEAL_TIME` | 거래시간 | CHAR(6) |  |  |
| `OFC_CODE` | 사무소코드 | CHAR(6) |  | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) |  | NOT NULL |
| `RMT_ORD_TYPE` | 원격지시구분 | VARCHAR2(2) |  |  |
| `PER_NO` | 담당텔러 | VARCHAR2(9) |  |  |
| `PROC_REST` | 처리결과 | VARCHAR2(2) |  |  |
| `RESP_YN` | 응답여부 | CHAR(1) |  |  |
| `JNAL_OP_TYPE` | 저널운영구분 | CHAR(1) |  |  |
| `REQ_TERM_TYPE` | 요청범위구분 | CHAR(1) |  |  |
| `MGT_DIR` | 관리디렉토리 | VARCHAR2(256) |  |  |
| `JNAL_COMT_SAV_TERM` | 저널내용보관주기 | NUMBER(2) |  |  |
| `JNAL_COMT_DEL_TERM` | 저널내용삭제주기 | NUMBER(2) |  |  |
| `FACE_IMG_SAV_TERM` | 안면이미지보관주기 | NUMBER(2) |  |  |
| `FACE_IMG_DEL_TERM` | 안면이미지삭제주기 | NUMBER(2) |  |  |
| `ACPT_IMG_SAV_TERM` | 수취이미지보관주기 | NUMBER(2) |  |  |
| `ACPT_IMG_DEL_TERM` | 수취이미지삭제주기 | NUMBER(2) |  |  |
| `CARD_IMG_SAV_TERM` | 카드이미지보관주기 | NUMBER(2) |  |  |
| `CARD_IMG_DEL_TERM` | 카드이미지삭제주기 | NUMBER(2) |  |  |
| `BIZ_OPEN_DT` | 업무개시일자 | CHAR(8) |  |  |
| `BIZ_OPEN_TIME` | 업무개시시간 | CHAR(6) |  |  |
| `IMG_OPEN_DT` | 이미지개시일자 | CHAR(8) |  |  |
| `IMG_OPEN_TIME` | 이미지개시시간 | CHAR(6) |  |  |
| `JNAL_DT` | 저널일자 | CHAR(8) |  |  |
| `JNAL_SEQNO` | 저널일련번호 | CHAR(6) |  |  |
| `LOG_DT` | 로그일자 | CHAR(8) |  |  |
| `SVR_ID` | 서버ID | VARCHAR2(2) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_ATM_BAL

**ATM시재(운영)** · 기기관리 — 운영 중인 ATM의 현재 시재 정보를 관리한다

원본 쪽: 35/39 (KakaoTalk_20261106_154124088_26.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `DEAL_DATE` | 거래날짜 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `CURC` | CURC | CHAR(3) | Y | NOT NULL |
| `UPD_TIME` | UPD_TIME | CHAR(6) | Y | NOT NULL |
| `BD_CASH_BAL` | BD_CASH_BAL | NUMBER(19,2) |  |  |
| `CASH_HOV_AM` | CASH_HOV_AM | NUMBER(19,2) |  |  |
| `CASH_ACP_AM` | CASH_ACP_AM | NUMBER(19,2) |  |  |
| `CHK_BGN_NO` | CHK_BGN_NO | VARCHAR2(8) |  |  |
| `CHK_REG_CN` | CHK_REG_CN | NUMBER(5) |  |  |
| `CHK_REG_DT` | CHK_REG_DT | CHAR(8) |  |  |
| `CHK_REG_TIME` | CHK_REG_TIME | CHAR(6) |  |  |
| `CHK_ISU_CN_BD` | CHK_ISU_CN_BD | NUMBER(5) |  |  |
| `CHK_ISU_CN_TODAY` | CHK_ISU_CN_TODAY | NUMBER(5) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_ATM_BALHIST

**ATM시재이력** · 기기관리 — ATM별 시재 변동 이력을 관리한다

원본 쪽: 35/39 (KakaoTalk_20261106_154124088_26.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `DEAL_DATE` | 거래날짜 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `CURC` | CURC | CHAR(3) | Y | NOT NULL |
| `INFO_TYPE` | 정보구분 | CHAR(1) | Y | NOT NULL |
| `UPD_TIME` | UPD_TIME | CHAR(6) | Y | NOT NULL |
| `BD_CASH_BAL` | BD_CASH_BAL | NUMBER(19,2) |  |  |
| `CASH_HOV_AM` | CASH_HOV_AM | NUMBER(19,2) |  |  |
| `CASH_ACP_AM` | CASH_ACP_AM | NUMBER(19,2) |  |  |
| `CHK_BGN_NO` | CHK_BGN_NO | VARCHAR2(8) |  |  |
| `CHK_REG_CN` | CHK_REG_CN | NUMBER(5) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_AUD_JOB_LOG

**배치로그** · 기기관리 — 배치 작업의 실행 내역과 처리 결과를 관리한다

원본 쪽: 37/39 (KakaoTalk_20261106_154124088_27.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `JOB_DT` | JOB일자 | CHAR(8) | Y | NOT NULL |
| `JOB_TIME` | JOB시간 | VARCHAR2(6) | Y | NOT NULL |
| `JOB_NM` | JOB명 | VARCHAR2(20) | Y | NOT NULL |
| `SUBJOB_NM` | SUBJOB명 | VARCHAR2(40) | Y | NOT NULL |
| `JOB_PROC_YN` | JOB처리여부 | CHAR(1) |  |  |
| `ERR_MSG` | 장애메시지 | VARCHAR2(200) |  |  |
| `REMARK` | 상세사유 | VARCHAR2(4000) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_AUD_RESP_MEMO

**대응메모이력** · 기기관리 — 장애 및 운영 업무의 대응 메모 이력을 관리한다

원본 쪽: 37/39 (KakaoTalk_20261106_154124088_27.jpg), 38/39 (KakaoTalk_20261106_154124088.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `COUNS_NO` | 상담번호 | VARCHAR2(10) | Y | NOT NULL |
| `COUNS_DT` | 상담일자 | CHAR(8) |  | NOT NULL |
| `COUNS_TIME` | 상담시간 | VARCHAR2(6) |  | NOT NULL |
| `COUNS_ID` | 상담자ID | VARCHAR2(10) |  |  |
| `OFC_CODE` | 사무소코드 | CHAR(6) |  |  |
| `MCN_NO` | 기번 | CHAR(3) |  |  |
| `CUST_NM` | 고객성명 | VARCHAR2(12) |  |  |
| `TEL_NO` | 전화번호 | VARCHAR2(15) |  |  |
| `CUST_NO` | 고객번호 | NUMBER(10,0) |  |  |
| `NCUST_NO` | 비고객번호 | NUMBER(10,0) |  |  |
| `ACCT_NO` | 계좌번호 | VARCHAR2(50) |  |  |
| `DEAL_AMT` | 거래금액 | NUMBER(10) |  |  |
| `HIST_COMM_NO` | 히스토리통번 | CHAR(16) |  |  |
| `DEAL_RCVR_YN` | 거래복구유무 | CHAR(1) |  |  |
| `RMT_TRT_YN` | 원격조치유무 | CHAR(1) |  |  |
| `MO_REQ_YN` | 출동의뢰유무 | CHAR(1) |  |  |
| `MSG_SND_YN` | 단말메시지송신유무 | CHAR(1) |  |  |
| `COUNS_END_DT` | 상담종료일자 | CHAR(8) |  |  |
| `COUNS_END_TIME` | 상담종료시간 | CHAR(6) |  |  |
| `MEMO` | 메모 | VARCHAR2(200) |  |  |
| `OFC_SND_YN` | 영업점통보여부 | CHAR(1) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_CODE_DTL

**상세코드** · 기기관리 — 코드 구분별 상세코드와 설명을 관리한다

원본 쪽: 7/39 (KakaoTalk_20261106_154235676_13.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `CODE_SECT` | 코드구분 | VARCHAR2(10) | Y | NOT NULL |
| `CODE` | 코드 | VARCHAR2(10) | Y | NOT NULL |
| `CODE_NM` | 코드명 | VARCHAR2(80) |  |  |
| `DATA1` | 데이터1 | VARCHAR2(80) |  |  |
| `DATA2` | 데이터2 | VARCHAR2(80) |  |  |
| `DATA3` | 데이터3 | VARCHAR2(80) |  |  |
| `DATA4` | 데이터4 | NUMBER(4) |  |  |
| `DATA5` | 데이터5 | CHAR(1) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_CODE_MASTER

**코드마스터** · 기기관리 — 업무에서 사용하는 기준 코드 정보를 관리한다

원본 쪽: 6/39 (KakaoTalk_20261106_154124088_16.jpg), 7/39 (KakaoTalk_20261106_154235676_13.jpg)

비고: 사진이 기울어 타입·PK·NULL 열을 한 줄씩 맞춰 보정 판독 — 원본 대조 권장

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `CODE_SECT` | 코드구분 | VARCHAR2(2) | Y | NOT NULL |
| `CODE_SECT_NM` | 코드구분명 | VARCHAR2(100) |  |  |
| `DESC1` | 설명1 | VARCHAR2(100) |  |  |
| `DESC2` | 설명2 | VARCHAR2(100) |  |  |
| `DESC3` | 설명3 | VARCHAR2(100) |  |  |
| `DESC4` | 설명4 | VARCHAR2(100) |  |  |
| `DESC5` | 설명5 | VARCHAR2(100) |  |  |
| `TASK_SECT` | 업무구분 | VARCHAR2(10) |  |  |
| `PRC_SECT` | 처리구분 | CHAR(1) |  |  |
| `USED_YN` | 사용여부 | CHAR(1) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_CO_CODE

**공통코드** · 기기관리 — 업무 공통으로 사용하는 상세코드를 관리한다

원본 쪽: 7/39 (KakaoTalk_20261106_154235676_13.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `CODE_TYPE` | 코드구분 | VARCHAR2(10) | Y | NOT NULL |
| `CODE` | 코드 | VARCHAR2(10) | Y | NOT NULL |
| `CODE_NM` | 코드명 | VARCHAR2(80) |  |  |
| `DESC1` | 설명1 | VARCHAR2(80) |  |  |
| `DESC2` | 설명2 | VARCHAR2(80) |  |  |
| `DESC3` | 설명3 | VARCHAR2(80) |  |  |
| `SORT_ORD` | 정렬순서 | NUMBER(4) |  |  |
| `USE_YN` | 사용유무 | CHAR(1) |  |  |
| `INSERT_DATE` | 입력일시 | DATE |  |  |
| `INSERT_PERSNO` | 입력자개인번호 | VARCHAR2(10) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_CO_CODE_MST

**공통코드구분** · 기기관리 — 공통코드를 분류하는 코드 그룹을 관리한다

원본 쪽: 7/39 (KakaoTalk_20261106_154235676_13.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `CODE_TYPE` | 코드구분 | VARCHAR2(10) | Y | NOT NULL |
| `CODE_NM` | 코드명 | VARCHAR2(80) |  |  |
| `DESC1` | 설명1 | VARCHAR2(80) |  |  |
| `DESC2` | 설명2 | VARCHAR2(80) |  |  |
| `DESC3` | 설명3 | VARCHAR2(80) |  |  |
| `USE_YN` | 사용유무 | CHAR(1) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_CO_DTL_ERRCODE

**명세표오류코드** · 기기관리 — 명세표 관련 오류코드와 오류 내용을 관리한다

원본 쪽: 7/39 (KakaoTalk_20261106_154235676_13.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `CODE_TYPE` | 코드구분 | VARCHAR2(2) | Y | NOT NULL |
| `CODE` | 코드 | VARCHAR2(4) | Y | NOT NULL |
| `CODE_NM` | 코드명 | VARCHAR2(100) |  |  |
| `DTL_MSG1` | 명세표메시지1 | VARCHAR2(40) |  |  |
| `DTL_MSG2` | 명세표메시지2 | VARCHAR2(40) |  |  |
| `SCR_MSG1` | 화면메시지1 | VARCHAR2(40) |  |  |
| `SCR_MSG2` | 화면메시지2 | VARCHAR2(40) |  |  |
| `SCR_MSG3` | 화면메시지3 | VARCHAR2(40) |  |  |
| `SCR_MSG4` | 화면메시지4 | VARCHAR2(40) |  |  |
| `ERR_CODE` | 장애코드 | VARCHAR2(6) |  |  |
| `ERR_MSG` | 장애메시지 | VARCHAR2(100) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_CO_MODEL

**기기모델코드** · 기기관리 — 자동화기기의 모델별 코드와 기준정보를 관리한다

원본 쪽: 7/39 (KakaoTalk_20261106_154235676_13.jpg)

비고: 사진이 기울어 타입·PK·NULL 열을 한 줄씩 맞춰 보정 판독 — 원본 대조 권장

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `VEND_CODE` | 업체코드 | VARCHAR2(2) | Y | NOT NULL |
| `MCN_TYPE` | 기기구분 | VARCHAR2(2) | Y | NOT NULL |
| `MODEL_CODE` | 모델코드 | VARCHAR2(2) | Y | NOT NULL |
| `MODEL_NM` | 모델명 | VARCHAR2(80) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_CO_MSG_SND

**메시지송신** · 기기관리 — 송신 대상 메시지와 송신 처리 결과를 관리한다

원본 쪽: 7/39 (KakaoTalk_20261106_154235676_13.jpg), 8/39 (KakaoTalk_20261106_154124088_15.jpg)

비고: 사진이 기울어 타입·PK·NULL 열을 한 줄씩 맞춰 보정 판독 — 원본 대조 권장

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `SND_DT` | 송신일자 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `SND_TIME` | 송신시간 | VARCHAR2(6) | Y | NOT NULL |
| `SND_TIME_MICRO` | 송신시간(Micro초) | VARCHAR2(3) | Y | NOT NULL |
| `CONF_DT` | 확인일자 | CHAR(8) |  |  |
| `CONF_TIME` | 확인시간 | VARCHAR2(6) |  |  |
| `MSG_ID` | 메시지ID | VARCHAR2(38) |  |  |
| `MSG_KIND` | 메시지종류(MSGKIND) | CHAR(1) |  |  |
| `MSG_LEN` | 메시지길이 | NUMBER(4) |  |  |
| `MSG_COMT` | 메시지내용 | VARCHAR2(1024) |  |  |
| `SND_REST` | 송신결과(SNDREST) | CHAR(1) |  |  |
| `SND_CNT` | 송신횟수 | NUMBER(4) |  |  |
| `COUNS_NO` | 상담번호 | VARCHAR2(10) |  |  |
| `OCCR_TIME` | 발생시간 | VARCHAR2(6) |  |  |
| `ATMS_MCN_NO` | 장애기번 | VARCHAR2(3) |  |  |
| `MSG_SEQNO` | 전문일련번호 | NUMBER(4) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_CO_SIDO

**시도위치정보** · 기기관리 — 시도별 위치 및 지역 정보를 관리한다

원본 쪽: 8/39 (KakaoTalk_20261106_154124088_15.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `SIDO_CODE` | 지역코드 | VARCHAR2(2) | Y | NOT NULL |
| `WID_PST` | 가로위치 | NUMBER(6) |  |  |
| `LEN_PST` | 세로위치 | NUMBER(6) |  |  |
| `SIDO_NM` | 지역명칭 | VARCHAR2(50) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_CO_SIGUN

**시군위치정보** · 기기관리 — 시군별 위치 및 소속 지역 정보를 관리한다

원본 쪽: 8/39 (KakaoTalk_20261106_154124088_15.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `SIDO_CODE` | 지역코드 | VARCHAR2(2) | Y | NOT NULL |
| `SIGUN_CODE` | 시군코드 | VARCHAR2(3) | Y | NOT NULL |
| `WID_PST` | 가로위치 | NUMBER(6) |  |  |
| `LEN_PST` | 세로위치 | NUMBER(6) |  |  |
| `SIGUN_NM` | 시군명칭 | VARCHAR2(50) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_CO_UMS_MSG

**UMS메시지** · 기기관리 — UMS 발송 메시지와 처리 상태를 관리한다

원본 쪽: 8/39 (KakaoTalk_20261106_154124088_15.jpg)

비고: 사진이 기울어 타입·PK·NULL 열을 한 줄씩 맞춰 보정 판독 — 원본 대조 권장

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `MSG_ID` | 메시지ID | VARCHAR2(38) | Y | NOT NULL |
| `SVC_CODE` | 서비스코드 | VARCHAR2(4) |  |  |
| `MSG_LEN` | 메시지길이 | NUMBER(4) |  | NOT NULL |
| `MSG_TYPE` | 전문구분(MSGTYPE) | CHAR(1) |  |  |
| `MSG_TITLE` | 전문제목 | VARCHAR2(40) |  |  |
| `MSG_COMT` | 메시지내용 | VARCHAR2(1000) |  |  |
| `RCV_NO` | 수신번호 | VARCHAR2(80) |  |  |
| `SND_NO` | 송신번호 | VARCHAR2(80) |  |  |
| `PROC_YN` | 처리여부 | CHAR(1) |  |  |
| `ERR_CODE` | 장애코드 | VARCHAR2(10) |  |  |
| `ERR_MSG` | 장애메시지 | VARCHAR2(80) |  |  |
| `INSERT_DATE` | 입력일시 | DATE |  |  |
| `OFC_CODE` | 사무소코드 | CHAR(6) |  |  |
| `MCN_NO` | 기번 | CHAR(3) |  |  |
| `MSG_SEQNO` | 전문일련번호 | CHAR(4) |  |  |
| `CUR_DT` | 일자 | VARCHAR2(8) [판독주의: 도메인 일자C8] |  |  |
| `CUR_TIME` | 시간 | VARCHAR2(6) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_ADDT_TRANS_RPT

**추가_현송_보고서** · 기기관리 — 추가 현송에 대한 보고 내역을 관리한다

원본 쪽: 10/39 (KakaoTalk_20261106_154124088_14.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `TRANS_DT` | 전송일자 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `AD_TRANS_SEQ_NUM` | 추가현송일련번호추가현송건수의시리얼번… | VARCHAR2(3) | Y | NOT NULL |
| `VEND_CODE` | 업체코드 | CHAR(3) |  |  |
| `RT_RCV_YN` | 실시간_수신_여부(1:수신,NULL:미수신) | CHAR(1) |  |  |
| `BTC_RCV_YN` | 배치_수신_여부(2:수신,NULL:미수신) | CHAR(1) |  |  |
| `CLM_EPT_DT` | 청구예상일자YYYYMMDD | CHAR(8) |  |  |
| `AD_TRANS_AMT` | 추가현송액금액단위:원 | NUMBER(15) |  |  |
| `B10000_AMT` | 만원권금액 | NUMBER(15) |  |  |
| `B50000_AMT` | 오만원권금액 | NUMBER(15) |  |  |
| `MGT_OFC` | 관리사무소 | VARCHAR2(20) |  |  |
| `CLOSE_KIND` | 마감구분0:마감전1:마감후 | CHAR(1) |  |  |
| `NRCV_PROC_YN` | 미수신_처리_여부(Y,N) | CHAR(1) |  |  |
| `CHAG_DONE_LV_CODE` | 인수_성공_단계_코드 | CHAR(2) |  |  |
| `TRSF_DONE_LV_CODE` | 인도_성공_단계_코드 | CHAR(2) |  |  |
| `BLT_OLD_OFC_CODE` | 소속영업점코드(기존물리적영업점) | CHAR(6) |  |  |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_CLOSE_BD

**마감_내역** · 기기관리 — 자동화기기 업무의 마감 내역을 관리한다

원본 쪽: 10/39 (KakaoTalk_20261106_154124088_14.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `CLOSE_YMD` | 마감년월일YYYYMMDD | VARCHAR2(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `VEND_CODE` | 업체코드 | CHAR(3) |  |  |
| `CLOSE_TIME` | 마감시각HHMMSS | VARCHAR2(6) |  |  |
| `BIZ_KIND` | 업무구분(1:마감조회,2:강제마감,3:미현송…) | CHAR(1) |  |  |
| `TOT_PMT_AMT` | 총지급액금액단위:원(현금+수표) | NUMBER(15) |  |  |
| `TOT_DEPO_AMT` | 총입금액금액단위:원(현금+수표) | NUMBER(15) |  |  |
| `B50000_CASH_PMT_AMT` | 오만원권현금지급액금액단위:원 | NUMBER(15) |  |  |
| `B50000_CASH_DEPO_AMT` | 오만원권현금입금액금액단위:원 | NUMBER(15) |  |  |
| `B10000_CASH_PMT_AMT` | 만원권현금지급액금액단위:원 | NUMBER(15) |  |  |
| `B10000_CASH_DEPO_AMT` | 만원권현금입금액금액단위:원 | NUMBER(15) |  |  |
| `B5000_CASH_DEPO_AMT` | 오천권현금입금액금액단위:원 | NUMBER(15) |  |  |
| `B1000_CASH_DEPO_AMT` | 천권현금입금액금액단위:원 | NUMBER(15) |  |  |
| `CHK_PMT_AMT` | 수표발행액금액단위:원 | NUMBER(15) |  |  |
| `CHK_DEPO_AMT` | 수표입금액금액단위:원 | NUMBER(15) |  |  |
| `BANK_CLOSE_BALAMT` | 은행_마감_잔액금액단위:원 | NUMBER(15) |  |  |
| `CHAG_DONE_LV_CODE` | 인수_성공_단계_코드 | CHAR(2) |  |  |
| `TRSF_DONE_LV_CODE` | 인도_성공_단계_코드 | CHAR(2) |  |  |
| `BLT_OLD_OFC_CODE` | 소속영업점코드(기존물리적영업점) | CHAR(6) |  |  |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_CNR_SLA_VALU

**코너_SLA_평가** · 기기관리 — 자동화기기 코너별 SLA 평가 결과를 관리한다

원본 쪽: 10/39 (KakaoTalk_20261106_154124088_14.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) | Y | NOT NULL |
| `VALU_YM` | 평가_년월(YYYYMM) | VARCHAR2(6) | Y | NOT NULL |
| `VALU_KIND_CODE` | 평가_구분_코드(가동률,30분장애출동율) | CHAR(2) | Y | NOT NULL |
| `VEND_CODE` | 업체코드 | CHAR(3) |  |  |
| `VALU_ST` | 평가_구간 | NUMBER(7,2) |  |  |
| `VALU_PT` | 평가_점수 | NUMBER(7,2) |  |  |
| `BLT_OLD_OFC_CODE` | 소속영업점코드(기존물리적영업점) | CHAR(6) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_CNR_VALU

**코너평가** · 기기관리 — 자동화기기 코너별 평가 결과를 관리한다

원본 쪽: 11/39 (KakaoTalk_20261106_154235676_10.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) | Y | NOT NULL |
| `VALU_YM` | 평가_년월(YYYYMM) | VARCHAR2(6) | Y | NOT NULL |
| `VALU_KIND_CODE` | 평가_구분_코드(가동률,30분장애출동율) | CHAR(2) | Y | NOT NULL |
| `ITEM_CODE` | 세목코드 | CHAR(2) | Y | NOT NULL |
| `VEND_CODE` | 업체코드 | CHAR(3) |  |  |
| `VALU_ST` | 평가_구간 | NUMBER(5,2) |  |  |
| `VALU_PT` | 평가_점수 | NUMBER(5,2) |  |  |
| `VALU_T_CNT` | 항목코드에대한총평가건수 | NUMBER(4) |  |  |
| `VALU_B_CNT` | 항목코드에대한총불량평가건수 | NUMBER(4) |  |  |
| `BLT_OLD_OFC_CODE` | 소속영업점코드(기존물리적영업점) | CHAR(6) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_DT_SEV_YN_MCN_INFO

**일자별용역대상여부기기정보** · 기기관리 — 일자별 기기의 용역 대상 여부를 관리한다

원본 쪽: 11/39 (KakaoTalk_20261106_154235676_10.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `STD_DT` | 기준_날짜(YYYYMMDD) | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(18) [원문 그대로] |  |  |
| `IAL_SEV_VEND_OP_YN` | 일괄_용역_업체_운영_여부 | CHAR(1) |  |  |
| `IAL_SEV_VEND_CODE` | 일괄_용역_업체_코드 | VARCHAR2(3) |  |  |
| `SEV_MGT_BGN_DT` | 용역_관리_시작_일자 | CHAR(8) |  |  |
| `CNR_PST_SPEC_CODE` | 코너_장소_특성_코드 | CHAR(2) |  |  |
| `CNR_PST_ETC_SPEC_DESC` | 코너_장소_기타_특성_설명 | VARCHAR2(200) |  |  |
| `IAL_SEVCH_RGLPRC` | 일괄_용역료_조정가 | NUMBER(10) |  |  |
| `SLA_VALU_TARGET_YN` | SLA_평가_대상_여부 | CHAR(1) |  |  |
| `CHK_BIZ_YN` | 수표_업무_여부 | CHAR(1) |  |  |
| `BLT_OLD_OFC_CODE` | 소속영업점코드(기존물리적영업점) | CHAR(6) |  |  |
| `INST_PST_OP_KIND` | 코너_운영_구분 | CHAR(2) |  |  |
| `PER_NO` | 담당텔러 | VARCHAR2(9) |  |  |
| `SRC` | 기종_구분_코드(SELECT SRC,SRC_NM FROM …) | VARCHAR2(3) |  |  |
| `OP_BGN_TIME` | 영업시작시간 | VARCHAR2(4) |  |  |
| `OP_END_TIME` | 영업_시작_시간 [원문 속성명 그대로] | VARCHAR2(4) |  |  |
| `OPEN_YN` | 개국여부 | CHAR(1) |  |  |
| `SEV_AMT_TYPE` | 수표_업무_코드(TB_CO_CODE:CHK_BIZ) | VARCHAR2(1) |  |  |
| `CHK_BIZ_CODE` | 수표_업무_코드 | VARCHAR2(2) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_ERR_MO_MGT

**장애출동관리** · 기기관리 — 기기 장애에 따른 출동 및 처리 현황을 관리한다

원본 쪽: 11/39 (KakaoTalk_20261106_154235676_10.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `HIST_COMM_NO` | 히스토리통번 | VARCHAR2(18) | Y | NOT NULL |
| `ERR_PROC_REQ_DT` | 장애처리요청일,출동요청일 | CHAR(8) | Y | NOT NULL |
| `VEND_CODE` | 업체코드 | CHAR(3) |  |  |
| `OFC_CODE` | 사무소코드 | CHAR(6) |  |  |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) |  |  |
| `MCN_NO` | 기번 | CHAR(3) |  |  |
| `ERR_PROC_REQ_TIME` | 장애처리요청시간,출동요청시간 | VARCHAR2(6) |  |  |
| `ARV_EPT_DT` | 도착_예정_일(YYYYMMDD) | CHAR(8) |  |  |
| `ARV_EPT_TIME` | 도착_예정_시간(HHMMSS) | VARCHAR2(6) |  |  |
| `ARV_EPT_AGENT_NM` | 조치예정자명 | VARCHAR2(10) |  |  |
| `ARV_EPT_AGENT_TEL_NUM` | 조치예정자전화번호 | VARCHAR2(13) |  |  |
| `ARV_DT` | 도착일(YYYYMMDD) | CHAR(8) |  |  |
| `ARV_TIME` | 도착시간(HHMMSS) | VARCHAR2(6) |  |  |
| `AGENT_NM` | 조치자명 | VARCHAR2(10) |  |  |
| `AGENT_TEL_NUM` | 업체전화번호 | VARCHAR2(13) |  |  |
| `CANC_REQ_DT` | 취소요청일(YYYYMMDD) | CHAR(8) |  |  |
| `CANC_REQ_TIME` | 취소요청시간(HHMMSS) | VARCHAR2(6) |  |  |
| `CANC_RSN_CODE` | 1:민원해결,2:출동등록오류 | VARCHAR2(2) |  |  |
| `MO_REQ_CHG_NOFT` | 출동요청업무구분코드 | NUMBER(1) |  |  |
| `MO_NOFT_KIND` | 용역사기기사출동구분코드 | CHAR(1) |  |  |
| `MGM_REST_CHG_NOFT` | 출동요청횟수 | NUMBER(2) |  |  |
| `BLT_OLD_OFC_CODE` | 소속영업점코드(기존물리적영업점) | CHAR(6) |  |  |
| `BLT_OLD_OFC_NM` | 소속영업점명칭(기존물리적영업점) | VARCHAR2(30) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_FORCE_CLOSE_SYNC

**강제마감전문싱크** · 기기관리 — 강제마감 전문의 동기화 정보를 관리한다

원본 쪽: 11/39 (KakaoTalk_20261106_154235676_10.jpg), 12/39 (KakaoTalk_20261106_154124088_13.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `CLOSE_YMD` | 마감년월일YYYYMMDD | VARCHAR2(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `VEND_CODE` | 업체코드 | CHAR(3) |  |  |
| `VEND_SENT_SEQ_NUM` | 제휴_기관_전문_일련_번호(제휴기관에서번…) | VARCHAR2(7) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_IOA_BD_NOTI

**입출금_내역_통보** · 기기관리 — 입출금 내역의 통보 정보와 처리 상태를 관리한다

원본 쪽: 12/39 (KakaoTalk_20261106_154124088_13.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `DEAL_YMD` | 거래_년월일 | VARCHAR2(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `KIND_KIND_CODE` | 권종구분코드1:만원권,2:오만원권 | CHAR(1) | Y | NOT NULL |
| `DEPO_AMT_01~24 / PMT_AMT_01~24` | 입금_금액_01~24 / 출금_금액_01~24 (시간대별, DEPO_AMT_nn·PMT_AMT_nn 이 번갈아 01→24, 48개) | NUMBER(8) 각각 |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_MCN_ERR_HIST

**기기_장애_이력** · 기기관리 — 자동화기기별 장애 발생 및 처리 이력을 관리한다

원본 쪽: 12/39 (KakaoTalk_20261106_154124088_13.jpg), 13/39 (KakaoTalk_20261106_154235676_09.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `HIST_COMM_NO` | 히스토리통번 | VARCHAR2(18) | Y | NOT NULL |
| `ERR_OCR_DT` | 장애_발생_일자 | CHAR(8) | Y | NOT NULL |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) |  |  |
| `VEND_CODE` | 업체코드 | CHAR(3) |  |  |
| `BLT_OLD_OFC_CODE` | 소속영업점코드(기존물리적영업점) | CHAR(6) |  |  |
| `SRC` | 기종_구분_코드(SELECT SRC,SRC_NM FROM …) | VARCHAR2(3) |  |  |
| `MO_KIND` | 출동종류(즉시출동=1,10분후출동=2,수동…) | CHAR(1) |  |  |
| `ERR_NM` | 장애_명 | VARCHAR2(80) |  |  |
| `ERR_OCR_TIME` | 장애_발생_시간 | VARCHAR2(6) |  |  |
| `MO_REQ_DT` | 출동_요청_일자 | CHAR(8) |  |  |
| `MO_REQ_TIME` | 출동_요청_시간 | VARCHAR2(6) |  |  |
| `ARV_DT` | 도착일(YYYYMMDD) | CHAR(8) |  |  |
| `ARV_TIME` | 도착시간(HHMMSS) | VARCHAR2(6) |  |  |
| `MO_NOFT_KIND` | 1:용역사1차출동,2:기기사2차출동 | VARCHAR2(1) |  |  |
| `MGM_END_DT` | 조치종료일(YYYYMMDD) | CHAR(8) |  |  |
| `MGM_END_TIME` | 조치종료시간(HHMMSS) | VARCHAR2(6) |  |  |
| `MGM_REST` | 1:미조치2:조치완료(1차출동에관한것) | VARCHAR2(1) |  |  |
| `ERR_MO_USE_TIME` | 장애_출동_소요_시간(초) | NUMBER(15) |  |  |
| `ERR_RCVR_USE_TIME` | 장애_복구_소요_시간(초) | NUMBER(15) |  |  |
| `HMIN_MO_YN` | 30분_출동_여부 | CHAR(1) |  |  |
| `QMIN_RCVR_YN` | 15분_복구_여부 | CHAR(1) |  |  |
| `CASH_END_PROC_TIME` | 현금부족_처리시간(초) | NUMBER(15) |  |  |
| `CT_DT` | 생성_일시(YYYYMMDDHH24MISS) | CHAR(14) |  |  |
| `SLA_VALU_TARGET_YN` | SLA_평가_대상_여부 | CHAR(1) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_MCN_LAST_ERR_INFO

**기기_마지막_장애_정보** · 기기관리 — 기기별 가장 최근의 장애 정보를 관리한다

원본 쪽: 13/39 (KakaoTalk_20261106_154235676_09.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `HIST_COMM_NO` | 히스토리통번 | VARCHAR2(18) |  |  |
| `MO_REQ_CHG_NOFT` | 최초출동요청송신시'1'로설정되며출동요청… | NUMBER(1) |  |  |
| `MO_KIND` | 출동종류(즉시출동=1,10분후출동=2,수동…) | CHAR(1) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_MCN_SEV_AMT_CAL

**기기별_용역료산정** · 기기관리 — 자동화기기별 용역료 산정 결과를 관리한다

원본 쪽: 13/39 (KakaoTalk_20261106_154235676_09.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `CHARGE_YM` | 청구_년월(YYYYMM) | VARCHAR2(6) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `OP_KIND_CODE` | 운영구분코드 | VARCHAR2(2) |  |  |
| `VEND_CODE` | 업체코드 | CHAR(3) |  |  |
| `OP_S_DT` | 운영시작일 | CHAR(8) |  |  |
| `OP_E_DT` | 운영종료일 | CHAR(8) |  |  |
| `ABL_DAYS` | 가용일수(운영종료일-운영시작일) | NUMBER(2) |  |  |
| `SEV_KIND_CODE` | 용역료구분코드 | VARCHAR2(1) |  |  |
| `SEV_AMT` | 용역료 | NUMBER(10) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_MCN_TRO_HIST

**기기_가동률_이력** · 기기관리 — 자동화기기별 용역료 산정 이력을 관리한다(원문 그대로)

원본 쪽: 13/39 (KakaoTalk_20261106_154235676_09.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `DYS_KIND` | 기간_구분(M:월통계,D:일통계) | CHAR(1) | Y | NOT NULL |
| `VALU_YMD` | 평가_년월일 | VARCHAR2(8) | Y | NOT NULL |
| `VEND_CODE` | 업체코드 | CHAR(3) |  |  |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) |  |  |
| `OPCUST_EPT_TIME` | 가동_예정_시간(초) | NUMBER(7) |  |  |
| `ROP_TIME` | 실가동_시간(초) | NUMBER(7) |  |  |
| `NOP_ELD_TIME` | 미가동_소명_시간(초) | NUMBER(7) |  |  |
| `SLA_OPCUST_TIME` | SLA_가동_시간(초) | NUMBER(7) |  |  |
| `TRO` | 가동률(%) | NUMBER(5,2) |  |  |
| `BLT_OLD_OFC_CODE` | 소속영업점코드(기존물리적영업점) | CHAR(6) |  |  |
| `OP_BGN_EPT_TIME` | 영업_시작_예정_시간 | VARCHAR2(6) |  |  |
| `OP_END_EPT_TIME` | 영업_종료_예정_시간 | VARCHAR2(6) |  |  |
| `OP_YN` | 운영_여부(N:평가년월일이휴일이고휴일운…) | CHAR(1) |  |  |
| `CT_DT` | 생성_일시(YYYYMMDDHH24MISS) | CHAR(14) |  |  |
| `OP_BGN_TIME` | 운영시작시간 | VARCHAR2(6) |  |  |
| `OP_END_TIME` | 영업_종료_시간 | VARCHAR2(6) |  |  |
| `SEV_AMT_TYPE` | 수표_업무_코드(TB_CO_CODE:CHK_BIZ) | VARCHAR2(1) |  |  |
| `CHK_BIZ_CODE` | 수표_업무_코드 | VARCHAR2(2) |  |  |
| `IAL_SEVCH_RGLPRC` | 일괄_용역료_조정가 | NUMBER(10) |  |  |
| `INST_PST_OP_KIND` | 코너_운영_구분 | CHAR(2) |  |  |
| `AREA_CODE` | 지역코드 | VARCHAR2(2) |  |  |
| `SLA_VALU_TARGET_YN` | SLA_평가_대상_여부 | CHAR(1) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_MGM_REST

**조치_결과** · 기기관리 — 장애 및 운영 업무에 대한 조치 결과를 관리한다

원본 쪽: 13/39 (KakaoTalk_20261106_154235676_09.jpg), 14/39 (KakaoTalk_20261106_154124088_12.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `HIST_COMM_NO` | 히스토리통번 | VARCHAR2(18) | Y | NOT NULL |
| `MO_NOFT_KIND` | 1:용역사1차출동,2:기기사2차출동 | CHAR(1) | Y | NOT NULL |
| `MGM_REST_CHG_NOFT` | 최초1이며변경이요청될때마다1씩증가하여… | NUMBER(2) | Y | NOT NULL |
| `MGM_END_DT` | 조치종료일(YYYYMMDD) | CHAR(8) | Y | NOT NULL |
| `VEND_CODE` | 업체코드 | CHAR(3) |  |  |
| `ERR_PROC_REQ_DT` | YYYYMMDD(장애처리요청일또는출동요청…) | CHAR(8) |  |  |
| `ERR_PROC_REQ_TIME` | HHMMSS(장애처리요청시간또는출동요청…) | VARCHAR2(6) |  |  |
| `OFC_CODE` | 사무소코드 | CHAR(6) |  |  |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) |  |  |
| `MCN_NO` | 기번 | CHAR(3) |  |  |
| `MGM_END_TIME` | 조치종료시간(HHMMSS) | VARCHAR2(6) |  |  |
| `MGM_REST` | 1:미조치2:조치완료(1차출동에관한것) | CHAR(1) |  |  |
| `VS_YN` | 1:미방문2:방문 | CHAR(1) |  |  |
| `MGM_TY_CODE` | 조치분류코드(A/S매체코드) | VARCHAR2(2) |  |  |
| `MGM_BD` | 조치내역 | VARCHAR2(200) |  |  |
| `MGM_NO_RSN_CODE` | 조치불가사유코드 | VARCHAR2(2) |  |  |
| `AGENT_NM` | 조치자명 | VARCHAR2(10) |  |  |
| `AGENT_BLT_CENT_NM` | 조치자소속센터명 | VARCHAR2(40) |  |  |
| `AGENT_TEL_NUM` | XXX-XXXX-XXXX또는Space로구분되거나… | VARCHAR2(13) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_NOP_RSN_MGT

**미가동_사유_관리** · 기기관리 — 자동화기기의 미가동 사유와 관련 내역을 관리한다

원본 쪽: 14/39 (KakaoTalk_20261106_154124088_12.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `RSN_OCR_DT` | 사유_발생_일(YYYYMMDD) | CHAR(8) | Y | NOT NULL |
| `RSN_OCR_BGN_TIME` | 사유_발생_시작시간(HH24MISS) | VARCHAR2(6) | Y | NOT NULL |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) |  |  |
| `VEND_CODE` | 업체코드 | CHAR(3) |  |  |
| `RSN_OCR_END_TIME` | 사유_발생_종료시간(HH24MISS) | VARCHAR2(6) |  |  |
| `NOP_ELD_TIME` | 미가동_소명_시간(초) | NUMBER(5) |  |  |
| `RSN` | 사유 | VARCHAR2(300) |  |  |
| `BLT_OLD_OFC_CODE` | 소속영업점코드(기존물리적영업점) | CHAR(6) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_OP_FUND_CLM_BD

**운영_자금_청구서_내역** · 기기관리 — 자동화기기 운영자금의 청구 내역을 관리한다

원본 쪽: 14/39 (KakaoTalk_20261106_154124088_12.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `VEND_CODE` | 업체코드 | CHAR(3) | Y | NOT NULL |
| `REQ_DT` | 요청일자 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) |  |  |
| `FUND_USE_STDT` | 자금소요시작일YYYYMMDD,자금소요기간… | VARCHAR2(8) |  |  |
| `FUND_USE_ENDDT` | 자금소요마지막일YYYYMMDD,자금소요기… | VARCHAR2(8) |  |  |
| `FUND_USE_DYS` | 자금소요기간자금소요기간 | VARCHAR2(2) |  |  |
| `CLM_AMT` | 청구금액금액단위:원 | NUMBER(15) |  |  |
| `TND_TRANS_AMT` | 익일현송액금액단위:원 | NUMBER(15) |  |  |
| `BFR_AD_TRANS_AMT` | 전일추가현송액금액단위:원 | NUMBER(15) |  |  |
| `BFR_WITH_AMT` | 전일회수금액금액단위:원 | NUMBER(15) |  |  |
| `BFR_OVREMA_AMT` | 전일과여금액금액단위:원 | NUMBER(15) |  |  |
| `BFR_CLAMT_RCC_AMT` | 전일회수금재활용금액금액단위:원 | NUMBER(15) |  |  |
| `TODY_EPT_CLAMT_RCC_AMT` | 금일예상회수금재활용금액금액단위:원 | NUMBER(15) |  |  |
| `IVT_AMT` | 재고액금액단위:원 | NUMBER(15) |  |  |
| `BFBF_BIZDAY_IVT_AMT` | 전전영업일재고액금액단위:원 | NUMBER(15) |  |  |
| `BFO_BIZDAY_TK_AMT` | 전영업일수수금액금액단위:원 | NUMBER(15) |  |  |
| `BFO_BIZDAY_OVREMA_AMT` | 전영업일과여금액금액단위:원 | NUMBER(15) |  |  |
| `BFO_BIZDAY_PMT_AMT` | 전영업일지급금액금액단위:원 | NUMBER(15) |  |  |
| `BFO_BIZDAY_DEPO_AMT` | 전영업일입금금액금액단위:원 | NUMBER(15) |  |  |
| `MGT_OFC` | 관리사무소 | VARCHAR2(20) |  |  |
| `CLOSE_YMD` | 마감년월일YYYYMMDD | VARCHAR2(8) |  |  |
| `TRSF_COPT_YN` | 이체완료_여부 | CHAR(1) |  |  |
| `TRSF_PROC_REQ_DT` | 이체처리_요청_일자(YYYYMMDD) | CHAR(8) |  |  |
| `TRSF_PROC_REQ_TIME` | 이체처리_요청_시간(HH24MI) | VARCHAR2(4) |  |  |
| `TRSF_PROC_REQ_YN` | 이체_처리_요청_여부 | CHAR(1) |  |  |
| `BS_BALAMT` | B/S잔액금액단위:원 | NUMBER(15) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_PNI_LV

**PNI_등급** · 기기관리 — PNI 평가에 사용하는 등급 기준을 관리한다

원본 쪽: 14/39 (KakaoTalk_20261106_154124088_12.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `PNI_VALU_YM` | PNI_평가_년월(YYYYMM) | VARCHAR2(6) | Y | NOT NULL |
| `PNI_LV` | PNI_등급 | CHAR(1) | Y | NOT NULL |
| `MN_PT` | 최저_점수 | NUMBER(4) |  |  |
| `MX_PT` | 최고_점수 | NUMBER(4) |  |  |
| `PNI_AR` | PNI_적용율 | NUMBER(3) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_PRO_LOG

**프로시저_로그** · 기기관리 — 프로시저 실행 내역과 처리 결과를 관리한다

원본 쪽: 14/39 (KakaoTalk_20261106_154124088_12.jpg), 15/39 (KakaoTalk_20261106_154235676_08.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `LOG_SEQ` | 로그_시퀀스 | NUMBER(22) | Y | NOT NULL |
| `BIZ_NM` | 업무_명 | VARCHAR2(50) |  |  |
| `PRO_NM` | 프로시저_명 | VARCHAR2(30) |  |  |
| `PRO_STEP` | PROCEDURE내에서어떤단계에서ERROR가… | NUMBER(22) |  |  |
| `SQL_VAR_VAL` | PROCEDURE에서사용하는변수값 | VARCHAR2(200) |  |  |
| `SQL_ERR_MSG` | SQL_에러_메시지 | VARCHAR2(200) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_PST_SEV_CAL

**코너별_용역료산정** · 기기관리 — 자동화기기 코너별 용역료 산정 결과를 관리한다

원본 쪽: 15/39 (KakaoTalk_20261106_154235676_08.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `CHARGE_YM` | 청구_년월(YYYYMM) | VARCHAR2(6) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) | Y | NOT NULL |
| `OP_KIND_CODE` | 운영구분코드 | VARCHAR2(2) |  |  |
| `VEND_CODE` | 업체코드 | CHAR(3) |  |  |
| `SIDO_CODE` | 지역코드 | VARCHAR2(2) |  |  |
| `SEV_KIND_CODE` | 용역료구분코드 | VARCHAR2(1) |  |  |
| `MCN_CNT` | 해당코너운영총기기수 | NUMBER(3) |  |  |
| `BASE_SEV_AMT` | 기본용역료 | NUMBER(8) |  |  |
| `PNI_LV` | PNI_등급 | CHAR(1) |  |  |
| `PNI_AR` | PNI_적용율 | NUMBER(3) |  |  |
| `ICT_SEV_AMT` | 인센티브적용용역료 | NUMBER(8) |  |  |
| `CHK_PMT_SEV_AMT` | 수표출금용역료 | NUMBER(8) |  |  |
| `CHK_DEPO_SEV_AMT` | 수표입금용역료 | NUMBER(8) |  |  |
| `MCN_ADD_SEV_AMT` | 기기추가_용역료 | NUMBER(8) |  |  |
| `NEW_SEV_AMT` | 신규설치공사_용역료 | NUMBER(8) |  |  |
| `CHG_SEV_AMT` | 교체설치공사_용역료 | NUMBER(8) |  |  |
| `TIME_ET` | 기본운영시간에서연장된시간 | VARCHAR2(5) |  |  |
| `TIME_ET_SEV_AMT` | 시간연장_용역료 | NUMBER(8) |  |  |
| `CUT_SEV_AMT_1` | 일반장애출동30분초과건수삭감용역료 | NUMBER(8) |  |  |
| `CUT_SEV_AMT_2` | 현금부족처리60분초과건수삭감용역료 | NUMBER(8) |  |  |
| `ETC_VAR_SEV_AMT` | 기타추가/삭감되는용역료 | NUMBER(8) |  |  |
| `DECISION_SEV_AMT` | 모든사항을적용한최종부과용역료 | NUMBER(8) |  |  |
| `MCN_CNT_N` | 해당코너운영총기기수-업체 | VARCHAR2(50) |  |  |
| `ABL_DAYS_N` | ABL_DAYS_N | VARCHAR2(50) |  |  |
| `BASE_SEV_AMT_N` | 기본용역료-업체 | VARCHAR2(50) |  |  |
| `PNI_LV_N` | PNI_등급-업체 | VARCHAR2(50) |  |  |
| `ICT_SEV_AMT_N` | 인센티브적용용역료-업체 | VARCHAR2(50) |  |  |
| `CHK_PMT_SEV_AMT_N` | 수표출금용역료-업체 | VARCHAR2(50) |  |  |
| `CHK_DEPO_SEV_AMT_N` | 수표입금용역료-업체 | VARCHAR2(50) |  |  |
| `SEV_KIND_NM_N` | SEV_KIND_NM_N | VARCHAR2(50) |  |  |
| `MCN_ADD_SEV_AMT_N` | 기기추가_용역료-업체 | VARCHAR2(50) |  |  |
| `NEW_SEV_AMT_N` | 신규설치공사_용역료-업체 | VARCHAR2(50) |  |  |
| `CHG_SEV_AMT_N` | 교체설치공사_용역료-업체 | VARCHAR2(50) |  |  |
| `TIME_ET_SEV_AMT_N` | 시간연장_용역료-업체 | VARCHAR2(50) |  |  |
| `ETC_VAR_SEV_AMT_N` | 기타추가/삭감되는용역료-업체 | VARCHAR2(50) |  |  |
| `DECISION_SEV_AMT_N` | 모든사항을적용한최종부과용역료-업체 | VARCHAR2(50) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_SCR_LOG

**일괄용역화면로그** · 기기관리 — 일괄용역 업무 화면의 사용 및 처리 이력을 관리한다

원본 쪽: 35/39 (KakaoTalk_20261106_154124088_26.jpg), 36/39 (KakaoTalk_20261106_154124088_02.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `FUNCSEQNO` | 순번 | NUMBER(*,0) | Y | NOT NULL |
| `FUNCTIME` | 함수시간 | CHAR(14) | Y | NOT NULL |
| `PER_NO` | 담당텔러 | VARCHAR2(9) | Y | NOT NULL |
| `FUNCNM` | 함수명 | VARCHAR2(50) |  |  |
| `INPUTVAL` | 입력값 | VARCHAR2(255) |  |  |
| `SCR_NO` | 화면번호 | CHAR(4) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_SENT_SNDRCV_HIST

**전문송수신이력** · 기기관리 — 대내외 연계 전문의 송수신 이력을 관리한다

원본 쪽: 15/39 (KakaoTalk_20261106_154235676_08.jpg)

비고: 사진이 기울어 타입·PK·NULL 열을 한 줄씩 맞춰 보정 판독 — 원본 대조 권장

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `DEAL_DT` | 거래일자 | CHAR(8) | Y | NOT NULL |
| `NACF_SENT_SEQ_NUM` | 농협_전문_일련_번호(농협에서번호부여) | VARCHAR2(7) | Y | NOT NULL |
| `VEND_SENT_SEQ_NUM` | 제휴_기관_전문_일련_번호(제휴기관에서번…) | VARCHAR2(7) | Y | NOT NULL |
| `VEND_CODE` | 업체코드 | CHAR(3) | Y | NOT NULL |
| `FMT_TY` | FORMAT_TYPE(EM:장애관리,CM:시재관리,…) | CHAR(2) |  |  |
| `DEAL_TIME` | 거래시간 | CHAR(6) |  |  |
| `SENT_KIND` | 전문종류(전문코드)참조 | CHAR(4) |  |  |
| `BIZ_KIND` | 업무구분(1:마감조회,2:강제마감,3:미현송…) | CHAR(4) [판독주의] |  |  |
| `RESP_CODE` | 응답코드참고 | VARCHAR2(2) |  |  |
| `TRMLO_KIND` | 0:농협송신,1:업체송신 | CHAR(1) |  |  |
| `SNDRCV_RESP_DT` | 송수신_응답_일자(YYYYMMDD) | CHAR(8) |  |  |
| `SNDRCV_RESP_TIME` | 송수신_응답_시각(HHMMSS) | VARCHAR2(6) |  |  |
| `SND_SENT` | 송신_전문 | VARCHAR2(1000) |  |  |
| `RCV_SENT` | 수신_전문 | VARCHAR2(1000) |  |  |
| `RESP_RCV_YN` | 응답_수신_여부(Y,N,-:DEFAULT) | CHAR(1) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_SEVMGT_MCNINFO

**용역관리_기기정보** · 기기관리 — 용역업체에서 담당하는 기기정보를 관리한다

원본 쪽: 38/39 (KakaoTalk_20261106_154124088.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OFC_CODE` | 사무소코드 | VARCHAR2(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | VARCHAR2(3) | Y | NOT NULL |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) |  |  |
| `BLT_OLD_OFC_CODE` | 소속영업점코드 | VARCHAR2(6) |  |  |
| `IAL_SEV_VEND_CODE` | 일괄용역업체코드 | VARCHAR2(3) |  |  |
| `SEV_MGT_BGN_DT` | 용역관리시작일자 | VARCHAR2(8) |  |  |
| `SEV_MGT_END_DT` | 용역관리종료일자 | VARCHAR2(8) |  |  |
| `CNR_PST_SPEC_CODE` | 코너장소특성코드 | CHAR(2) |  |  |
| `CNR_PST_ETC_SPEC_DESC` | 코너장소기타특성설명 | VARCHAR2(200) |  |  |
| `IAL_SEVCH_RGLPRC` | 일괄용역조정가 | NUMBER(10) |  |  |
| `CHK_BIZ_YN` | 수표업무여부 | CHAR(1) |  |  |
| `INST_PST_OP_KIND` | 코너운영구분 | CHAR(2) |  |  |
| `MGR_PER_NO` | 텔러책임자 | VARCHAR2(9) |  |  |
| `PER_NO` | 담당텔러 | VARCHAR2(9) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_SEV_AMT_STD

**용역료_기준** · 기기관리 — 용역료 산정에 적용하는 기준 정보를 관리한다

원본 쪽: 15/39 (KakaoTalk_20261106_154235676_08.jpg), 16/39 (KakaoTalk_20261106_154124088_11.jpg)

비고: 사진이 기울어 타입·PK·NULL 열을 한 줄씩 맞춰 보정 판독 — 원본 대조 권장

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `CHARGE_YM` | 청구_년월(YYYYMM) | VARCHAR2(6) | Y | NOT NULL |
| `OP_KIND_CODE` | 운영구분코드 | VARCHAR2(2) | Y | NOT NULL |
| `VEND_CODE` | 업체코드 | CHAR(3) | Y | NOT NULL |
| `OP_CNT` | 코너의기본기기운영대수 | NUMBER(3) |  |  |
| `CHARGE_A` | 기준용역료(적용가) | NUMBER(8) |  |  |
| `CHARGE_B` | 동일건물동일층경비구획필요추가용역료 | NUMBER(8) |  |  |
| `CHARGE_C` | 동일건물동일층경비구획불필요추가용역료 | NUMBER(8) |  |  |
| `CHARGE_D` | 동일건물다른층추가용역료 | NUMBER(8) |  |  |
| `CHARGE_E` | 인접건물100M이내추가용역료 | NUMBER(8) |  |  |
| `CHARGE_F` | 동일기관내100M이상추가용역료 | NUMBER(8) |  |  |
| `CHARGE_G` | 예비_1추가용역료 | NUMBER(8) |  |  |
| `CHARGE_H` | 예비_2추가용역료 | NUMBER(8) |  |  |
| `CHARGE_I` | 예비_3추가용역료 | NUMBER(8) |  |  |
| `ICT_LIMIT_AMT` | 기본용역료에대한인센티브한도액 | NUMBER(8) |  |  |
| `CHK_PMT_SEV_AMT` | 수표출금용역료 | NUMBER(8) |  |  |
| `CHK_DEPO_SEV_AMT` | 수표입금용역료 | NUMBER(8) |  |  |
| `OP_S_TIME` | 표준운영시작시간 | VARCHAR2(6) |  |  |
| `OP_E_TIME` | 표준운영종료시간 | VARCHAR2(6) |  |  |
| `OP_S_TIME2` | 토요일표준운영시작시간 | VARCHAR2(6) |  |  |
| `OP_E_TIME2` | 토요일표준운영종료시간 | VARCHAR2(6) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_SEV_CNT_VALU

**용역사_건수_평가** · 기기관리 — 용역사별 업무 처리 건수에 대한 평가 결과를 관리한다

원본 쪽: 16/39 (KakaoTalk_20261106_154124088_11.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `VEND_CODE` | 업체코드 | CHAR(3) | Y | NOT NULL |
| `VALU_YM` | 평가_년월(YYYYMM) | VARCHAR2(6) | Y | NOT NULL |
| `VALU_KIND_CODE` | 평가_구분_코드(가동률,30분장애출동율) | CHAR(2) | Y | NOT NULL |
| `ITEM_CODE` | 세목코드 | CHAR(2) | Y | NOT NULL |
| `VALU_CNT` | 평가_건수 | NUMBER(3) |  |  |
| `VALU_PT` | 평가_점수 | NUMBER(4) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_SEV_PNI_PT

**용역사_PNI_점수** · 기기관리 — 용역사별 PNI 평가 점수를 관리한다

원본 쪽: 16/39 (KakaoTalk_20261106_154124088_11.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `VEND_CODE` | 업체코드 | CHAR(3) | Y | NOT NULL |
| `PNI_VALU_YM` | PNI_평가_년월(YYYYMM) | VARCHAR2(6) | Y | NOT NULL |
| `PNI_LV` | PNI_등급 | CHAR(1) |  |  |
| `PNI_PT` | PNI_점수 | NUMBER(4) |  |  |
| `PNI_AR` | PNI_적용률 | NUMBER(3) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_SEV_SLA_VALU

**용역사_SLA_평가** · 기기관리 — 용역사별 SLA 평가 결과를 관리한다

원본 쪽: 16/39 (KakaoTalk_20261106_154124088_11.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `VEND_CODE` | 업체코드 | CHAR(3) | Y | NOT NULL |
| `VALU_YM` | 평가_년월(YYYYMM) | VARCHAR2(6) | Y | NOT NULL |
| `VALU_KIND_CODE` | 평가_구분_코드(가동률,30분장애출동율) | CHAR(2) | Y | NOT NULL |
| `VALU_ST` | 평가_구간 | NUMBER(6,2) |  |  |
| `VALU_PT` | 평가_점수 | NUMBER(6,2) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_STAT_RES_HIST

**상태전문_용역응답_이력** · 기기관리 — 상태전문에 대한 용역업체의 응답 이력을 관리한다

원본 쪽: 16/39 (KakaoTalk_20261106_154124088_11.jpg)

비고: 원문에 PK 표시가 없음

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OFC_CODE` | 사무소코드 | CHAR(6) |  |  |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) |  |  |
| `MCN_NO` | 기번 | CHAR(3) |  |  |
| `BLT_OLD_OFC_CODE` | 소속영업점코드(기존물리적영업점) | CHAR(6) |  |  |
| `VEND_CODE` | 업체코드 | CHAR(3) |  |  |
| `HIST_COMM_NO` | 히스토리통번 | VARCHAR2(18) |  |  |
| `ERR_OCR_DT` | 장애_발생_일자 | CHAR(8) |  |  |
| `ERR_OCR_TIME` | 장애_발생_시간 | VARCHAR2(6) |  |  |
| `TMN_STAT` | 단말기상태 | VARCHAR2(2) |  |  |
| `TMN_STAT_DTL1` | 단말_상태_상세1 | CHAR(8) |  |  |
| `TMN_STAT_DTL2` | 단말_상태_상세2 | CHAR(8) |  |  |
| `TMN_STAT_DTL3` | 단말_상태_상세3 | CHAR(8) |  |  |
| `TMN_STAT_DTL4` | 단말_상태_상세4(즉시출동) | CHAR(8) |  |  |
| `TMN_STAT_DTL5` | 단말_상태_상세5 | CHAR(8) |  |  |
| `TMN_STAT_DTL6` | 단말_상태_상세6(10분후출동) | CHAR(8) |  |  |
| `TMN_STAT_DTL7` | 단말_상태_상세7(10분후출동) | CHAR(8) |  |  |
| `TMN_STAT_DTL8` | 단말_상태_상세8(즉시출동) | CHAR(8) |  |  |
| `TMN_STAT_DTL9` | 단말_상태_상세9(즉시출동) | CHAR(8) |  |  |
| `TMN_STAT_DTL10` | 단말_상태_상세10 | CHAR(8) |  |  |
| `SRC` | 기종_구분_코드(SELECT SRC,SRC_NM FROM …) | VARCHAR2(3) |  |  |
| `T_HIST_COMM_NO` | 선장애일련번호 | VARCHAR2(18) |  |  |
| `RESP_CODE` | 응답코드참고 | VARCHAR2(2) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_TRANS_PN_BD

**현송_계획서_내역** · 기기관리 — 현송계획서의 상세 내역을 관리한다

원본 쪽: 16/39 (KakaoTalk_20261106_154124088_11.jpg), 17/39 (KakaoTalk_20261106_154235676_07.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `TRANS_DT` | 전송일자 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `VEND_CODE` | 업체코드 | CHAR(3) |  |  |
| `TRANS_AMT` | 현송금액금액단위:원 | NUMBER(15) |  |  |
| `B50000_TRANS_AMT` | 오만원권현송금액금액단위:원 | NUMBER(15) |  |  |
| `B10000_TRANS_AMT` | 만원권현송금액금액단위:원 | NUMBER(15) |  |  |
| `MGT_OFC` | 관리사무소 | VARCHAR2(20) |  |  |
| `BLT_OLD_OFC_CODE` | 소속영업점코드(기존물리적영업점) | CHAR(6) |  |  |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_TRANS_PN_STIC

**현송_계획_통계** · 기기관리 — 현송 계획에 대한 집계 및 통계 정보를 관리한다

원본 쪽: 17/39 (KakaoTalk_20261106_154235676_07.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `STIC_YR` | 통계산출연도 | VARCHAR2(4) | Y | NOT NULL |
| `STIC_M_QT` | 통계산출월혹은3개월평균종료월 | VARCHAR2(2) | Y | NOT NULL |
| `M_QT_KIND` | 월_분기_구분(0:월,1:3개월평균) | CHAR(1) | Y | NOT NULL |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) |  |  |
| `INST_PST_NM` | 설치장소명 | VARCHAR2(40) |  |  |
| `TRANS_AVG_AMT` | 현송_평균_금액 | NUMBER(15) |  |  |
| `B50000_TRANS_AVG_AMT` | 오만원권_현송_평균_금액 | NUMBER(15) |  |  |
| `B10000_TRANS_AVG_AMT` | 만원권_현송_평균_금액 | NUMBER(15) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_VALU_KIND

**평가_구분** · 기기관리 — 평가 업무에 사용하는 평가 구분을 관리한다

원본 쪽: 17/39 (KakaoTalk_20261106_154235676_07.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `VALU_YM` | 평가_년월(YYYYMM) | VARCHAR2(6) | Y | NOT NULL |
| `VALU_KIND_CODE` | 평가_구분_코드(가동률,30분장애출동율) | CHAR(2) | Y | NOT NULL |
| `VALU_KIND_NM` | 평가_구분_명 | VARCHAR2(80) |  |  |
| `VALU_TY1_YN` | 평가_타입1_여부 | CHAR(1) |  |  |
| `VALU_TY2_YN` | 평가_타입2_여부 | CHAR(1) |  |  |
| `VALU_TY3_YN` | 평가_타입3_여부 | CHAR(1) |  |  |
| `VALU_TY4_YN` | 평가_타입4_여부 | CHAR(1) |  |  |
| `MN_PT` | 최저_점수 | NUMBER(4) |  |  |
| `MX_PT` | 최고_점수 | NUMBER(4) |  |  |
| `ORDER_BY` | 정렬기준 | NUMBER(2) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_VALU_STD_TY_1

**평가_기준_타입_1** · 기기관리 — 타입1에 해당하는 평가 기준을 관리한다

원본 쪽: 17/39 (KakaoTalk_20261106_154235676_07.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `VALU_YM` | 평가_년월(YYYYMM) | VARCHAR2(6) | Y | NOT NULL |
| `VALU_KIND_CODE` | 평가_구분_코드(가동률,30분장애출동율) | CHAR(2) | Y | NOT NULL |
| `ITEM_CODE` | 세목코드 | CHAR(2) | Y | NOT NULL |
| `ITEM_NM` | 항목_명 | VARCHAR2(80) |  |  |
| `ITEM_PT` | 항목_점수 | NUMBER(5,2) |  |  |
| `ORDER_BY` | 정렬기준 | NUMBER(2) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_VALU_STD_TY_2

**평가_기준_타입_2** · 기기관리 — 타입2에 해당하는 평가 기준을 관리한다

원본 쪽: 17/39 (KakaoTalk_20261106_154235676_07.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `VALU_YM` | 평가_년월(YYYYMM) | VARCHAR2(6) | Y | NOT NULL |
| `VALU_KIND_CODE` | 평가_구분_코드(가동률,30분장애출동율) | CHAR(2) | Y | NOT NULL |
| `TRS_MAX` | 구간율_MAX | NUMBER(5,2) |  |  |
| `TRS_SP` | 구간율_간격 | NUMBER(5,2) |  |  |
| `ST_PT_MAX` | 구간_점수_MAX | NUMBER(5,2) |  |  |
| `ST_PT_SP` | 구간_점수_간격 | NUMBER(5,2) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_VALU_STD_TY_3

**평가_기준_타입_3** · 기기관리 — 타입3에 해당하는 평가 기준을 관리한다

원본 쪽: 17/39 (KakaoTalk_20261106_154235676_07.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `VALU_YM` | 평가_년월(YYYYMM) | VARCHAR2(6) | Y | NOT NULL |
| `VALU_KIND_CODE` | 평가_구분_코드(가동률,30분장애출동율) | CHAR(2) | Y | NOT NULL |
| `ITEM_CODE` | 세목코드 | CHAR(2) | Y | NOT NULL |
| `ITEM_NM` | 항목_명 | VARCHAR2(80) |  |  |
| `ORDER_BY` | 정렬기준 | NUMBER(2) |  |  |
| `UPD_DT` | 수정_일시 | CHAR(14) |  |  |
| `UPDOR_ID` | 수정자_ID | VARCHAR2(9) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_VALU_STD_TY_4

**평가_기준_타입_4** · 기기관리 — 타입4에 해당하는 평가 기준을 관리한다

원본 쪽: 17/39 (KakaoTalk_20261106_154235676_07.jpg), 18/39 (KakaoTalk_20261106_154124088_10.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `VALU_YM` | 평가_년월(YYYYMM) | VARCHAR2(6) | Y | NOT NULL |
| `VALU_KIND_CODE` | 평가_구분_코드(가동률,30분장애출동율) | CHAR(2) | Y | NOT NULL |
| `VALU_RT` | 평가_백분율 | NUMBER(5,2) | Y | NOT NULL |
| `VALU_PT` | 평가_점수 | NUMBER(5,2) |  |  |
| `UPD_DT` | 수정_일시 | CHAR(14) |  |  |
| `UPDOR_ID` | 수정자_ID | VARCHAR2(9) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_VEND_REFUND

**자금반환** · 기기관리 — 용역업체 관련 자금 반환 내역을 관리한다

원본 쪽: 18/39 (KakaoTalk_20261106_154124088_10.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `VEND_CODE` | 업체코드 | VARCHAR2(3) | Y | NOT NULL |
| `DEAL_DATE` | 거래날짜 | CHAR(8) | Y | NOT NULL |
| `SEQ_NUM` | 일련번호 | VARCHAR2(2) | Y | NOT NULL |
| `REFUND_ACCT_NO` | 상환계좌번호 | VARCHAR2(50) | Y | NOT NULL |
| `REFUND_COPT_YN` | 상환완료여부 | VARCHAR2(2) | Y | NOT NULL |
| `REQ_TIME` | 요청시간 | VARCHAR2(6) |  |  |
| `DEAL_TIME` | 거래시간 | CHAR(6) |  |  |
| `REFUND_AMT` | 상환거래금액 | NUMBER(15) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EE_WITH_FUND_REST_NOTI

**회수_자금_결과_통보** · 기기관리 — 회수자금 처리 결과의 통보 내역을 관리한다

원본 쪽: 18/39 (KakaoTalk_20261106_154124088_10.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `CLOSE_YMD` | 마감년월일YYYYMMDD | VARCHAR2(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `VEND_CODE` | 업체코드 | CHAR(3) |  |  |
| `BFR_TRANS_AMT` | 전일현송액금액단위:원 | NUMBER(15) |  |  |
| `DEPO_AMT` | 입금금액금액단위:원 | NUMBER(15) |  |  |
| `PMT_AMT` | 납부금액 | NUMBER(15) |  |  |
| `CLOSE_AMT` | 마감금액금액단위:원 | NUMBER(15) |  |  |
| `WITH_FUND` | 회수자금금액단위:원 | NUMBER(15) |  |  |
| `RPT_YN` | 보고서Y:미처리금액보고서있음,N:보고서없음 | CHAR(1) |  |  |
| `MGT_OFC` | 관리사무소 | VARCHAR2(20) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_EMR_HIST

**긴급승인이력** · 기기관리 — 일괄용역장애의 처리 이력을 관리한다

원본 쪽: 18/39 (KakaoTalk_20261106_154124088_10.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `INST_PST_CODE` | 코너코드 | CHAR(3) | Y | NOT NULL |
| `DEAL_DATE` | 거래날짜 | CHAR(8) | Y | NOT NULL |
| `DEAL_TIME` | 거래시간 | CHAR(6) | Y | NOT NULL |
| `EMR_REASON` | EMR_REASON | VARCHAR2(40) |  |  |
| `EMR_REGISTER` | EMR_REGISTER | VARCHAR2(30) |  |  |
| `EMR_REQUEST` | EMR_REQUEST | VARCHAR2(30) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_ERR_DAY_OPRATE

**업체/기기/장애유형별일별가동률** · 기기관리 — 업체,기기,장애유형별 일별 가동률을 관리한다

원본 쪽: 18/39 (KakaoTalk_20261106_154124088_10.jpg), 19/39 (KakaoTalk_20261106_154235676_06.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `JUNGJO_TYPE` | 중조구분 | CHAR(1) | Y | NOT NULL |
| `OP_DT` | 운영일 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) | Y | NOT NULL |
| `VEND_CODE` | 업체코드 | VARCHAR2(2) | Y | NOT NULL |
| `MCN_TYPE` | 기기구분 | VARCHAR2(2) | Y | NOT NULL |
| `MODEL_CODE` | 모델코드 | VARCHAR2(2) | Y | NOT NULL |
| `MCN_CNT` | 해당코너운영총기기수 | NUMBER(5) |  |  |
| `HOFC_CODE` | 지역본부코드 | VARCHAR2(2) |  |  |
| `MCN_ERR_SEC` | 기기장애시간-초 | NUMBER(9) |  |  |
| `MCN_ERR_CNT` | 기기장애건수 | NUMBER(5) |  |  |
| `*_JAM_SEC/*_JAM_CNT` | 현금·수표·명세표·저널·카드·통장·지로 걸림(매체걸림)(초)/건수 — CASH_,CHK_,DTL_,JNAL_,CARD_,BKBK_,JRO_ 순서로 각 SEC NUMBER(9), CNT NUMBER(5) |  |  |  |
| `*_MODULE_ERR_SEC/CNT` | 현금·수표·명세표·저널 모듈장애(모듈장애)(초)/건수 — CASH_,CHK_,DTL_,JNAL_ 순서로 SEC NUMBER(9), CNT NUMBER(5) |  |  |  |
| `CARD_MODULE_ERR_SEC` | 카드모듈장애(모듈장애)(초) | NUMBER(9) |  |  |
| `CARD_MODULE_ERR_CNT` | 카드모듈장애(모듈장애)건수 | NUMBER(5) |  |  |
| `BKBK_MODULE_ERR_SEC` | 통장모듈장애(모듈장애)(초) | NUMBER(9) |  |  |
| `BKBK_MODULE_ERR_CNT` | 통장모듈장애(모듈장애)건수 | NUMBER(5) |  |  |
| `JRO_MODULE_ERR_SEC` | 지로모듈장애(모듈장애)(초) | NUMBER(9) |  |  |
| `JRO_MODULE_ERR_CNT` | 지로모듈장애(모듈장애)건수 | NUMBER(5) |  |  |
| `ETC_ERR_SEC` | 기타장애(기타)(초) | NUMBER(22) [원문 그대로] |  |  |
| `ETC_ERR_CNT` | 기타장애(기타)건수 | NUMBER(5) |  |  |
| `MODULE_REJECT_SEC` | 모듈빠짐(초) | NUMBER(9) |  |  |
| `MODULE_REJECT_CNT` | 모듈빠짐건수 | NUMBER(5) |  |  |
| `OP_TIME` | 운용시간(초) | NUMBER(9) |  |  |
| `DEAL_CNT` | 거래건수 | CHAR(16) [원문 그대로 — 다른 표는 NUMBER(16)] |  |  |
| `MCN_ERR_RATE` | 장애율 | NUMBER(17,2) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_ERR_MON_OPRATE

**업체/기기/장애유형별월별가동률** · 기기관리 — 업체,기기,장애유형별 월별 가동률을 관리한다

원본 쪽: 19/39 (KakaoTalk_20261106_154235676_06.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `JUNGJO_TYPE` | 중조구분 | CHAR(1) | Y | NOT NULL |
| `OP_YM` | 운영월 | VARCHAR2(6) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) | Y | NOT NULL |
| `VEND_CODE` | 업체코드 | VARCHAR2(2) | Y | NOT NULL |
| `MCN_TYPE` | 기기구분 | VARCHAR2(2) | Y | NOT NULL |
| `MODEL_CODE` | 모델코드 | VARCHAR2(5) | Y | NOT NULL |
| `MCN_CNT` | 해당코너운영총기기수 | NUMBER(5) |  |  |
| `HOFC_CODE` | 지역본부코드 | VARCHAR2(2) |  |  |
| `OP_CNT` | 코너의기본기기운영대수 | NUMBER(5) |  |  |
| `MCN_ERR_SEC` | 기기장애시간-초 | NUMBER(9) |  |  |
| `MCN_ERR_CNT` | 기기장애건수 | NUMBER(5) |  |  |
| `CASH_/CHK_/DTL_/JNAL_/CARD_/BKBK_/JRO_ JAM_SEC / JAM_CNT` | 현금·수표·명세표·저널·카드·통장·지로 걸림(매체걸림)(초)/건수 | SEC NUMBER(9), CNT NUMBER(5) |  |  |
| `CASH_/CHK_/DTL_/JNAL_/CARD_/BKBK_/JRO_ MODULE_ERR_SEC / _CNT` | 현금·수표·명세표·저널·카드·통장·지로 모듈장애(모듈장애)(초)/건수 | SEC NUMBER(9), CNT NUMBER(5) |  |  |
| `ETC_ERR_SEC` | 기타장애(기타)(초) | NUMBER(9) |  |  |
| `ETC_ERR_CNT` | 기타장애(기타)건수 | NUMBER(5) |  |  |
| `MODULE_REJECT_SEC` | 모듈빠짐(초) | NUMBER(9) |  |  |
| `MODULE_REJECT_CNT` | 모듈빠짐건수 | NUMBER(5) |  |  |
| `OP_TIME` | 운용시간(초) | NUMBER(22) [판독주의] |  |  |
| `DEAL_CNT` | 거래건수 | NUMBER(5) [판독주의] |  |  |
| `MCN_ERR_RATE` | 장애율 | NUMBER(17,2) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_GEN_TEMP

**자동화기기상태GEN** · 기기관리 — 자동화기기 상태정보와 GEN 간 동기화용 임시 정보를 관리한다

원본 쪽: 19/39 (KakaoTalk_20261106_154235676_06.jpg), 20/39 (KakaoTalk_20261106_154124088_09.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `JUNGJO_TYPE` | 중조구분 | CHAR(1) |  | NOT NULL |
| `CENT_CODE` | 지역센터코드 | CHAR(2) |  |  |
| `TERM_GB` | 단말기구분코드 | CHAR(1) |  |  |
| `ONL_IP` | 기번IP | VARCHAR2(15) |  |  |
| `VPN_IP` | VPNIP | VARCHAR2(15) |  |  |
| `SRC` | 기종구분코드 | VARCHAR2(2) |  |  |
| `LAN_IP` | 단말IP | VARCHAR2(15) |  |  |
| `OP_TYPE` | 점내외구분 | CHAR(1) |  |  |
| `INOUT_TYPE` | 입출구분(INOUTTYPE) | CHAR(1) |  |  |
| `GENDATE` | GEN적용일시 | VARCHAR2(18) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_INOUT_DAY_OPRATE

**코너별일가동률** · 기기관리 — 자동화기기 코너별 일별 가동률을 관리한다

원본 쪽: 20/39 (KakaoTalk_20261106_154124088_09.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `JUNGJO_TYPE` | 중조구분 | CHAR(1) | Y | NOT NULL |
| `OP_DT` | 운영일 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) | Y | NOT NULL |
| `MCN_CNT` | 해당코너운영총기기수 | NUMBER(5) |  |  |
| `HOFC_CODE` | 지역본부코드 | VARCHAR2(2) |  |  |
| `BF_ERR_SEC` | 온라인운용시간이전장애시간-초 | NUMBER(9) |  |  |
| `MID_ERR_SEC` | 온라인운용시간중장애시간-초 | NUMBER(9) |  |  |
| `AF_ERR_SEC` | 온라인운용시간이후장애시간-초 | NUMBER(9) |  |  |
| `OP_ERR_SEC` | 운용장애시간(A1) | NUMBER(9) |  |  |
| `OP_ERR_CNT` | 운용장애건수(A1) | NUMBER(5) |  |  |
| `OP_ERR_SECA2` | 운용장애시간(A2) | NUMBER(9) |  |  |
| `OP_ERR_CNTA2` | 운용장애건수(A2) | NUMBER(5) |  |  |
| `MCN_ERR_SEC` | 기기장애시간-초 | NUMBER(9) |  |  |
| `MCN_ERR_CNT` | 기기장애건수 | NUMBER(5) |  |  |
| `MGT_OPEN_SEC` | 보수상태시간(C1) | NUMBER(9) |  |  |
| `MGT_OPEN_CNT` | 보수상태건수(C1) | NUMBER(5) |  |  |
| `POWER_OFF_SEC` | 전원OFF시간-초(F0) | NUMBER(9) |  |  |
| `POWER_OFF_CNT` | 전원OFF건수(F0) | NUMBER(5) |  |  |
| `SYSTEM_DOWN_SEC` | 시스템장애시간(S0) | NUMBER(9) |  |  |
| `SYSTEM_DOWN_CNT` | 시스템장애건수(S0) | NUMBER(5) |  |  |
| `DEAL_CNT` | 거래건수 | NUMBER(16) |  |  |
| `OP_PST_SEC` | 코너가동시간(초) | NUMBER(9) |  |  |
| `OP_PST_CUSTSEC` | 고객체감코너가동시간(초) | NUMBER(9) |  |  |
| `OP_TIME` | 운용시간(초) | NUMBER(9) |  |  |
| `OP_RATE` | 가동률 | NUMBER(5,2) |  |  |
| `OP_CUST_RATE` | 가동률(고객체감) | NUMBER(5,2) |  |  |
| `OP_PST_AVG_SEC` | 코너가동시간(평균) | NUMBER(9) |  |  |
| `OP_PST_AVG_CUSTSEC` | 고객체감코너가동시간(평균) | NUMBER(9) |  |  |
| `OP_AVG_RATE` | 가동률(평균) | NUMBER(5,2) |  |  |
| `OP_CUST_AVG_RATE` | 가동률(고객체감,평균) | NUMBER(5,2) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_INOUT_MON_OPRATE

**코너별월가동률** · 기기관리 — 자동화기기 코너별 월별 가동률을 관리한다

원본 쪽: 35/39 (KakaoTalk_20261106_154124088_26.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `JUNGJO_TYPE` | 중조구분 | CHAR(1) | Y | NOT NULL |
| `OP_YM` | 운영월 | VARCHAR2(6) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) | Y | NOT NULL |
| `MCN_CNT` | 해당코너운영총기기수 | NUMBER(5) |  |  |
| `HOFC_CODE` | 지역본부코드 | VARCHAR2(2) |  |  |
| `OP_CNT` | 운용일수 | NUMBER(5) |  |  |
| `BF_ERR_SEC` | 온라인운용시간이전장애시간-초 | NUMBER(9) |  |  |
| `MID_ERR_SEC` | 온라인운용시간중장애시간-초 | NUMBER(9) |  |  |
| `AF_ERR_SEC` | 온라인운용시간이후장애시간-초 | NUMBER(9) |  |  |
| `OP_ERR_SEC` | 운용장애시간(A1) | NUMBER(9) |  |  |
| `OP_ERR_CNT` | 운용장애건수(A1) | NUMBER(5) |  |  |
| `OP_ERR_SECA2` | 운용장애시간(A2) | NUMBER(9) |  |  |
| `OP_ERR_CNTA2` | 운용장애건수(A2) | NUMBER(5) |  |  |
| `MCN_ERR_SEC` | 기기장애시간-초 | NUMBER(9) |  |  |
| `MCN_ERR_CNT` | 기기장애건수 | NUMBER(5) |  |  |
| `MGT_OPEN_SEC` | 보수상태시간(C1) | NUMBER(9) |  |  |
| `MGT_OPEN_CNT` | 보수상태건수(C1) | NUMBER(5) |  |  |
| `POWER_OFF_SEC` | 전원OFF시간-초(F0) | NUMBER(9) |  |  |
| `POWER_OFF_CNT` | 전원OFF건수(F0) | NUMBER(5) |  |  |
| `SYSTEM_DOWN_SEC` | 시스템장애시간(S0) | NUMBER(9) |  |  |
| `SYSTEM_DOWN_CNT` | 시스템장애건수(S0) | NUMBER(5) |  |  |
| `DEAL_CNT` | 거래건수 | NUMBER(16) |  |  |
| `OP_PST_SEC` | 코너가동시간(초) | NUMBER(9) |  |  |
| `OP_PST_CUSTSEC` | 고객체감코너가동시간(초) | NUMBER(9) |  |  |
| `OP_TIME` | 운용시간(초) | NUMBER(9) |  |  |
| `OP_RATE` | 가동률 | NUMBER(5,2) |  |  |
| `OP_CUST_RATE` | 가동률(고객체감) | NUMBER(5,2) |  |  |
| `OP_PST_AVG_SEC` | 코너가동시간(평균) | NUMBER(9) |  |  |
| `OP_PST_AVG_CUSTSEC` | 고객체감코너가동시간(평균) | NUMBER(9) |  |  |
| `OP_AVG_RATE` | 가동률(평균) | NUMBER(5,2) |  |  |
| `OP_CUST_AVG_RATE` | 가동률(고객체감,평균) | NUMBER(5,2) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_INSA

**인사정보** · 기기관리 — 직원의 인사 기본정보를 관리한다

원본 쪽: 8/39 (KakaoTalk_20261106_154124088_15.jpg), 9/39 (KakaoTalk_20261106_154235676_11.jpg)

비고: 사진이 기울어 타입·PK·NULL 열을 한 줄씩 맞춰 보정 판독 — 원본 대조 권장

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `PER_NO` | 담당텔러 | VARCHAR2(9) | Y | NOT NULL |
| `NAME` | 인사성명 | VARCHAR2(10) |  | NOT NULL |
| `GUBUN` | 구분 | CHAR(1) |  | NOT NULL |
| `WONJANG` | 인사원장상태 | CHAR(1) |  | NOT NULL |
| `JIK_GUBUN` | 인사직원구분 | CHAR(1) |  |  |
| `JIKEUB` | 인사직급 | VARCHAR2(2) |  |  |
| `JIKEUB_NAME` | 인사직급명 | VARCHAR2(30) |  |  |
| `JIKMYUNG` | 인사직명 | VARCHAR2(3) |  |  |
| `JIKMYUNG_NAME` | 인사직명명 | VARCHAR2(30) |  |  |
| `CHEYONG_DATE` | 인사채용일 | VARCHAR2(14) |  |  |
| `BUIM_DATE` | 인사부임일 | VARCHAR2(14) |  |  |
| `RETIRE_DATE` | 인사퇴직일 | VARCHAR2(14) |  |  |
| `SIDO` | 인사시도 | VARCHAR2(2) |  | NOT NULL |
| `SIDO_NAME` | 인사시도명 | VARCHAR2(16) |  | NOT NULL |
| `SAMUSO` | 인사사무소 | VARCHAR2(6) |  | NOT NULL |
| `ONLINE_CODE` | 인사온라인코드 | VARCHAR2(6) |  |  |
| `SAMUSO_TEL` | 인사사무소전화번호 | VARCHAR2(14) |  |  |
| `SAMUSO_NAME` | 인사사무소명 | VARCHAR2(36) |  | NOT NULL |
| `SAMUSO_TYPE` | 인사사무소형태 | VARCHAR2(2) |  | NOT NULL |
| `MOJUM` | 모점번호 | VARCHAR2(6) |  | NOT NULL |
| `GUNJIBU` | 인사군지부 | VARCHAR2(6) |  | NOT NULL |
| `POST_NO` | 우편번호 | VARCHAR2(7) |  |  |
| `ADDRESS` | 사무소주소 | VARCHAR2(100) |  |  |
| `CALL_CONF_YN` | 콜센터확인여부 | CHAR(1) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_MATN_ACCEPT

**보수업체접수정보** · 기기관리 — 보수업체의 장애 및 보수 요청 접수정보를 관리한다

원본 쪽: 20/39 (KakaoTalk_20261106_154124088_09.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OCCR_DT` | 장애발생일자 | CHAR(8) | Y | NOT NULL |
| `VEND_CODE` | 업체코드 | VARCHAR2(2) | Y | NOT NULL |
| `SEQNO` | 일련번호(SQ_CO_REQSEQ.NEXTVAL) | NUMBER(10) | Y | NOT NULL |
| `VEND_MGT_NO` | 업체별관리번호 | NUMBER(10) |  | NOT NULL |
| `CUR_DT` | 일자 | CHAR(8) |  | NOT NULL |
| `CUR_TIME` | 시간 | VARCHAR2(6) |  |  |
| `CE_NM` | 출동할CD명 | VARCHAR2(16) |  |  |
| `CE_PHONE` | 출동할CE연락처 | VARCHAR2(14) |  | NOT NULL |
| `MO_PLAN_TIME` | 출동예정시간 | VARCHAR2(6) |  |  |
| `ARV_PLAN_TIME` | 도착예정시간 | VARCHAR2(6) |  | NOT NULL |
| `PROC_SEQ` | 처리순서일련번호 | NUMBER(3) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_MATN_CORRECTION

**보수업체조치정보** · 기기관리 — 보수업체의 장애 조치 내용과 결과를 관리한다

원본 쪽: 20/39 (KakaoTalk_20261106_154124088_09.jpg), 21/39 (KakaoTalk_20261106_154235676_05.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OCCR_DT` | 장애발생일자 | CHAR(8) | Y | NOT NULL |
| `VEND_CODE` | 업체코드 | VARCHAR2(2) | Y | NOT NULL |
| `SEQNO` | 일련번호(SQ_CO_REQSEQ.NEXTVAL) | NUMBER(10) | Y | NOT NULL |
| `SEQ` | 순번 | NUMBER(10) | Y | NOT NULL |
| `RCVR_TYPE` | 복구구분(1:자동,2:업체) | CHAR(1) |  |  |
| `VEND_MGT_NO` | 업체별관리번호 | NUMBER(22) |  |  |
| `CUR_DT` | 일자 | CHAR(8) |  |  |
| `CUR_TIME` | 시간 | VARCHAR2(6) |  | NOT NULL |
| `ARV_TIME` | 도착시간(HHMMSS) | VARCHAR2(6) |  |  |
| `COPT_TIME` | 완료시간 | VARCHAR2(6) |  | NOT NULL |
| `ERR_FACT` | 장애원인 | VARCHAR2(80) |  |  |
| `TRT_REST` | 조치결과 | VARCHAR2(6) |  |  |
| `CE_NM` | 출동할CD명 | VARCHAR2(20) |  |  |
| `TRT_COMT` | 조치내용 | VARCHAR2(160) |  |  |
| `OFC_CHAG` | 영업점담당자명 | VARCHAR2(20) |  |  |
| `PROC_SEQ` | 처리순서일련번호 | NUMBER(3) |  |  |
| `MEMO` | 메모 | VARCHAR2(130) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_MATN_ERR_MGT

**보수업체장애정보** · 기기관리 — 보수업체에서 처리하는 기기 장애 정보를 관리한다

원본 쪽: 21/39 (KakaoTalk_20261106_154235676_05.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OCCR_DT` | 장애발생일자 | CHAR(8) | Y | NOT NULL |
| `VEND_CODE` | 업체코드 | VARCHAR2(2) | Y | NOT NULL |
| `SEQNO` | 일련번호(SQ_CO_REQSEQ.NEXTVAL) | NUMBER(10) | Y | NOT NULL |
| `ERR_SEQNO` | 장애일련번호 | VARCHAR2(14) |  | NOT NULL |
| `CUR_DT` | 일자 | CHAR(8) |  | NOT NULL |
| `CUR_TIME` | 시간 | VARCHAR2(6) |  | NOT NULL |
| `JUNGJO_TYPE` | 중조구분 | CHAR(1) |  | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) |  |  |
| `MCN_NO` | 기번 | CHAR(3) |  |  |
| `SRC` | 기종_구분_코드(SELECT SRC,SRC_NM FROM …) | VARCHAR2(2) |  | NOT NULL |
| `OCCR_TIME` | 발생시간 | VARCHAR2(6) |  | NOT NULL |
| `OP_TYPE` | 점내외구분 | CHAR(1) |  | NOT NULL |
| `MCN_STAT` | 기기상태 | VARCHAR2(40) |  |  |
| `DEAL_TYPE` | 거래구분 | CHAR(1) |  |  |
| `DEV_CODE` | Device코드 | VARCHAR2(2) |  | NOT NULL |
| `ERR_CODE` | 장애코드 | CHAR(2) |  | NOT NULL |
| `ETC` | 기타 | VARCHAR2(124) |  |  |
| `HW_ERR_CODE` | H/W장애코드 | VARCHAR2(40) |  |  |
| `INOUT_TYPE` | 입출구분(INOUTTYPE) | CHAR(1) |  |  |
| `INST_PST_NM` | 설치장소명 | VARCHAR2(80) |  |  |
| `OFC_NM` | 직장명 | VARCHAR2(80) |  |  |
| `OFC_TEL` | 사무소전화번호 | VARCHAR2(28) |  |  |
| `AREA_CENT_NM` | 관할지역센터명 | VARCHAR2(12) |  |  |
| `AREA_CENT_TEL` | 관할지역센터전화번호 | VARCHAR2(28) |  |  |
| `AREA_CENT_CHAG` | 관할지역센터담당자명 | VARCHAR2(20) |  |  |
| `OFC_CHAG` | 영업점담당자명 | VARCHAR2(20) |  |  |
| `ERR_STAT` | 장애상태 | CHAR(1) |  |  |
| `PROC_SEQ` | 처리순서일련번호 | NUMBER(3) |  |  |
| `STEPID` | SetpID | VARCHAR2(1) |  |  |
| `RECV_TIME` | 복구시간 | VARCHAR2(6) |  |  |
| `MSG_SEQNO` | 전문일련번호 | CHAR(4) |  |  |
| `ERR_RANK_CODE` | Error구분 | VARCHAR2(2) |  |  |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) |  |  |
| `AUTO_RECV` | 자동복구(기기상태) | CHAR(1) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_MATN_PROCID

**보수업체장애처리번호** · 기기관리 — 보수업체 장애 업무의 처리번호를 관리한다

원본 쪽: 21/39 (KakaoTalk_20261106_154235676_05.jpg)

비고: 사진이 기울어 타입·PK·NULL 열을 한 줄씩 맞춰 보정 판독 — 원본 대조 권장

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OCCR_DT` | 장애발생일자 | CHAR(8) | Y | NOT NULL |
| `VEND_CODE` | 업체코드 | VARCHAR2(2) | Y | NOT NULL |
| `SEQNO` | 일련번호(SQ_CO_REQSEQ.NEXTVAL) | NUMBER(10) |  |  |
| `HWINFO_SEQNO` | HWINFO_SEQNO | NUMBER(10) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_MCN_INFO

**자동화기기_기기정보** · 기기관리 — 자동화기기 기기 유형, 상태를 관리한다

원본 쪽: 39/39 (KakaoTalk_20261106_154124088_25.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `INST_PST_CODE` | 코너코드 | CHAR(3) |  |  |
| `SRC` | SRC_CODE | VARCHAR2(2) |  |  |
| `KOM_TYPE` | 기기유형 | VARCHAR2(5) |  |  |
| `VEND_CODE` | 기기업체 | VARCHAR2(2) |  |  |
| `OP_TYPE` | 운영구분(365) | CHAR(1) |  |  |
| `INOUT_TYPE` | 점내외구분(I,O) | CHAR(1) |  |  |
| `USE_YN` | 사용여부 | CHAR(1) |  |  |
| `CNR_PST_SPEC_CODE` | 코너장소특성 | CHAR(2) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_MCN_TARGET_IP

**기기HOSTIP정보** · 기기관리 — 자동화기기별 HOST IP 정보를 관리한다

원본 쪽: 38/39 (KakaoTalk_20261106_154124088.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OFC_CODE` | 사무소코드 | VARCHAR2(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | VARCHAR2(3) | Y | NOT NULL |
| `IP1` | HOSTIP | VARCHAR2(15) |  |  |
| `IP2` | BACKUPIP | VARCHAR2(15) |  |  |
| `INST_YN` | 기기지시여부 | VARCHAR2(1) |  |  |
| `LAST_INST` | 최종지시일자 | VARCHAR2(14) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_MO_DAY_RATE

**보수업체일별출동현황통계** · 기기관리 — 보수업체별 일별 출동 현황과 통계를 관리한다

원본 쪽: 21/39 (KakaoTalk_20261106_154235676_05.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `JUNGJO_TYPE` | 중조구분 | CHAR(1) | Y | NOT NULL |
| `OP_DT` | 운영일 | CHAR(8) | Y | NOT NULL |
| `VEND_ID` | 업무구분 | CHAR(1) | Y | NOT NULL |
| `VEND_CODE` | 업체코드 | VARCHAR2(2) | Y | NOT NULL |
| `SEQ_NO` | 일련번호(DDHH24MISSsss) | NUMBER(5) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) |  |  |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) |  |  |
| `MCN_NO` | 기번 | CHAR(3) |  |  |
| `SRC` | 기종_구분_코드(SELECT SRC,SRC_NM FROM …) | VARCHAR2(3) |  |  |
| `HOFC_CODE` | 지역본부코드 | VARCHAR2(2) |  |  |
| `ERR_STAT` | 장애상태 | VARCHAR2(2) |  |  |
| `ERR_CNT` | 장애건수 | NUMBER(5) |  |  |
| `TOT_RCVR_TIME` | 총복구시간 | NUMBER(5) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_MO_MON_RATE

**보수업체월별출동현황통계** · 기기관리 — 보수업체별 월별 출동 현황과 통계를 관리한다

원본 쪽: 21/39 (KakaoTalk_20261106_154235676_05.jpg), 22/39 (KakaoTalk_20261106_154124088_08.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `JUNGJO_TYPE` | 중조구분 | CHAR(1) | Y | NOT NULL |
| `OP_YM` | 운영월 | VARCHAR2(6) | Y | NOT NULL |
| `VEND_ID` | 업무구분 | CHAR(1) | Y | NOT NULL |
| `VEND_CODE` | 업체코드 | VARCHAR2(2) | Y | NOT NULL |
| `SEQ_NO` | 일련번호(DDHH24MISSsss) | NUMBER(5) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) |  |  |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) |  |  |
| `MCN_NO` | 기번 | CHAR(3) |  |  |
| `SRC` | 기종_구분_코드(SELECT SRC,SRC_NM FROM …) | VARCHAR2(3) |  |  |
| `HOFC_CODE` | 지역본부코드 | VARCHAR2(2) |  |  |
| `OP_CNT` | 코너의기본기기운영대수 | NUMBER(5) |  |  |
| `ERR_STAT` | 장애상태 | VARCHAR2(2) |  |  |
| `ERR_CNT` | 장애건수 | NUMBER(9) |  |  |
| `TOT_RCVR_TIME` | 총복구시간 | NUMBER(9) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_NMS_DAY_OPRATE

**일가동률** · 기기관리 — 자동화기기의 일별 가동률을 관리한다

원본 쪽: 22/39 (KakaoTalk_20261106_154124088_08.jpg), 23/39 (KakaoTalk_20261106_154235676_04.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `JUNGJO_TYPE` | 중조구분 | CHAR(1) | Y | NOT NULL |
| `OP_DT` | 운영일 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `SRC` | 기종_구분_코드(SELECT SRC,SRC_NM FROM …) | VARCHAR2(2) | Y | NOT NULL |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) | Y | NOT NULL |
| `HDAY_TYPE` | 휴일구분 | CHAR(1) |  |  |
| `OP_HOUR` | HOUR24 | CHAR(1) |  |  |
| `CENT_CODE` | 지역센터코드 | VARCHAR2(2) |  |  |
| `HOFC_CODE` | 지역본부코드 | VARCHAR2(2) |  |  |
| `GAESO` | 개소(GAESO) | VARCHAR2(3) |  |  |
| `BF_ERR_SEC` | 온라인운용시간이전장애시간-초 | NUMBER(5) |  |  |
| `MID_ERR_SEC` | 온라인운용시간중장애시간-초 | NUMBER(5) |  |  |
| `AF_ERR_SEC` | 온라인운용시간이후장애시간-초 | NUMBER(5) |  |  |
| `OP_ERR_SEC` | 운용장애시간(A1) | NUMBER(5) |  |  |
| `OP_ERR_CNT` | 운용장애건수(A1) | NUMBER(5) |  |  |
| `MCN_ERR_SEC` | 기기장애시간-초 | NUMBER(5) |  |  |
| `MCN_ERR_CNT` | 기기장애건수 | NUMBER(5) |  |  |
| `POWER_OFF_SEC` | 전원OFF시간-초(F0) | NUMBER(5) |  |  |
| `POWER_OFF_CNT` | 전원OFF건수(F0) | NUMBER(5) |  |  |
| `TRT_STOP_CNT` | 취급중지건수 | NUMBER(5) |  |  |
| `CASH_PMT_STOP_CNT` | 지급제한거래(제한거래)건수 | NUMBER(5) |  |  |
| `CHECK_ACPT_TIMEOUT_CNT` | 수표미수취(미수취)건수 | NUMBER(5) |  |  |
| `DTL_ACPT_TIMEOUT_CNT` | 명세표미수취(미수취)건수 | NUMBER(5) |  |  |
| `CASH_ACPT_TIMEOUT_CNT` | 현금미수취(미수취)건수 | NUMBER(5) |  |  |
| `BKBK_ACPT_TIMEOUT_CNT` | 통장미수취(미수취)건수 | NUMBER(5) |  |  |
| `CARD_ACPT_TIMEOUT_CNT` | 카드미수취(미수취)건수 | NUMBER(5) |  |  |
| `REC_FULL_CNT` | rejectfull건수 | NUMBER(5) |  |  |
| `JNAL_END_CNT` | 저널부족(매체과부족)건수 | NUMBER(5) |  |  |
| `DTL_END_CNT` | 명세표부족(매체과부족)건수 | NUMBER(5) |  |  |
| `B10000_END_CNT` | 현금부족(매체과부족)건수 | NUMBER(5) |  |  |
| `CASH_DEPO_STOP_CNT` | 입금제한거래(제한거래)건수 | NUMBER(5) |  |  |
| `CHK_PMT_STOP_CNT` | 수표지급중지건수 | NUMBER(5) |  |  |
| `CHK_DEPO_STOP_CNT` | 수표입금중지건수 | NUMBER(5) |  |  |
| `DEAL_CNT` | 거래건수 | NUMBER(16) |  |  |
| `OP_RATE` | 가동률 | NUMBER(5,2) |  |  |
| `OP_ERR_SECA2` | 운용장애시간(A2) | NUMBER(5) |  |  |
| `OP_ERR_CNTA2` | 운용장애건수(A2) | NUMBER(5) |  |  |
| `MGT_OPEN_SEC` | 보수상태시간(C1) | NUMBER(5) |  |  |
| `MGT_OPEN_CNT` | 보수상태건수(C1) | NUMBER(5) |  |  |
| `SYSTEM_DOWN_SEC` | 시스템장애시간(S0) | NUMBER(5) |  |  |
| `SYSTEM_DOWN_CNT` | 시스템장애건수(S0) | NUMBER(5) |  |  |
| `JRO_ACPT_TIMEOUT_CNT` | 지로미수취_타임아웃_건수 | NUMBER(5) |  |  |
| `CHECK_END_CNT` | 수표마감건수 | NUMBER(5) |  |  |
| `CASH_DEPO_STOP_SEC` | 입금제한거래(제한거래)(초) | NUMBER(5) |  |  |
| `CASH_PMT_STOP_SEC` | 지급제한거래(제한거래)(초) | NUMBER(5) |  |  |
| `BKBK_LM_DEAL_SEC` | 통장제한거래(제한거래)(초) | NUMBER(5) |  |  |
| `BKBK_LM_DEAL_CNT` | 통장제한거래(제한거래)건수 | NUMBER(5) |  |  |
| `TRSF_LM_DEAL_SEC` | 이체제한거래(제한거래)(초) | NUMBER(5) |  |  |
| `TRSF_LM_DEAL_CNT` | 이체제한거래(제한거래)건수 | NUMBER(5) |  |  |
| `BC_LM_DEAL_SEC` | 비씨제한거래(제한거래)(초) | NUMBER(5) |  |  |
| `BC_LM_DEAL_CNT` | 비씨제한거래(제한거래)건수 | NUMBER(5) |  |  |
| `OBK_LM_DEAL_SEC` | 타행제한거래(제한거래)(초) | NUMBER(5) |  |  |
| `OBK_LM_DEAL_CNT` | 타행제한거래(제한거래)건수 | NUMBER(5) |  |  |
| `JRO_LM_DEAL_CNT` | 지로제한거래(제한거래)(초) ※원문 속성명·컬럼명 짝이 바뀌어 인쇄됨 | NUMBER(5) |  |  |
| `JRO_LM_DEAL_SEC` | 지로제한거래(제한거래)건수 ※원문 그대로 | NUMBER(5) |  |  |
| `CASH_ACPT_TIMEOUT_SEC` | 현금미수취(미수취)(초) | NUMBER(5) |  |  |
| `CHECK_ACPT_TIMEOUT_SEC` | 수표미수취(미수취)(초) | NUMBER(5) |  |  |
| `DTL_ACPT_TIMEOUT_SEC` | 명세표미수취(미수취)(초) | NUMBER(5) |  |  |
| `CARD_ACPT_TIMEOUT_SEC` | 카드미수취(미수취)(초) | NUMBER(5) |  |  |
| `BKBK_ACPT_TIMEOUT_SEC` | 통장미수취(미수취)(초) | NUMBER(5) |  |  |
| `JRO_ACPT_TO_SEC` | 지로미수취(미수취)(초) | NUMBER(5) |  |  |
| `JRO_ACPT_TO_CNT` | 지로미수취(미수취)건수 | NUMBER(5) |  |  |
| `B10000_END_SEC` | 현금부족(매체과부족)(초) | NUMBER(5) |  |  |
| `CHK_END_SEC` | 수표부족(매체과부족)(초) | NUMBER(5) |  |  |
| `CHK_END_CNT` | 수표부족(매체과부족)건수 | NUMBER(5) |  |  |
| `DTL_END_SEC` | 명세표부족(매체과부족)(초) | NUMBER(5) |  |  |
| `JNAL_END_SEC` | 저널부족(매체과부족)(초) | NUMBER(5) |  |  |
| `SAFE_FULL_SEC / SAFE_FULL_CNT` | 현금Full(매체과부족)(초)/건수 | NUMBER(5) |  |  |
| `FURY_CASH_SHRT_SEC / _CNT` | 순수현금부족(매체과부족)(초)/건수 | NUMBER(5) |  |  |
| `B10000_NEAREND_SEC / _CNT` | 현금부족경고(매체과부족)(초)/건수 | NUMBER(5) |  |  |
| `CHK_NEAREND_SEC / _CNT` | 수표부족경고(매체과부족)(초)/건수 | NUMBER(5) |  |  |
| `DTL_NEAREND_SEC / _CNT` | 명세표부족경고(매체과부족)(초)/건수 | NUMBER(5) |  |  |
| `JNAL_NEAREND_SEC / _CNT` | 저널부족경고(매체과부족)(초)/건수 | NUMBER(5) |  |  |
| `CASH_/CHK_/DTL_/JNAL_/CARD_/BKBK_/JRO_ JAM_SEC / JAM_CNT` | 현금·수표·명세표·저널·카드·통장·지로 걸림(매체걸림)(초)/건수 (14개) | NUMBER(5) |  |  |
| `CASH_/CHK_/DTL_/JNAL_/CARD_/BKBK_/JRO_ MODULE_ERR_SEC / _CNT` | 현금·수표·명세표·저널·카드·통장·지로 모듈장애(모듈장애)(초)/건수 (14개) | NUMBER(5) |  |  |
| `ETC_ERR_SEC / ETC_ERR_CNT` | 기타장애(기타)(초)/건수 | NUMBER(5) |  |  |
| `ETC_SW_ERR_SEC / ETC_SW_ERR_CNT` | 기타장애(SW)(초)/건수 | NUMBER(5) |  |  |
| `MODULE_REJECT_SEC / MODULE_REJECT_CNT` | 모듈빠짐(초)/건수 | NUMBER(5) |  |  |
| `OP_CUST_SEC` | 고객체감운용시간 | NUMBER(9) |  |  |
| `OP_TIME` | 운용시간(초) | NUMBER(9) |  |  |
| `OP_CUST_RATE` | 가동률(고객체감) | NUMBER(5,2) |  |  |
| `SEQ_NO` | 일련번호(DDHH24MISSsss) | VARCHAR2(5) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_NMS_ERR_LOG

**일별자동화기기장애현황** · 기기관리 — 자동화기기의 일별 장애 발생 현황을 관리한다

원본 쪽: 23/39 (KakaoTalk_20261106_154235676_04.jpg), 24/39 (KakaoTalk_20261106_154124088_06.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `CUR_DT` | 일자 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `SEQ_NO` | 일련번호(DDHH24MISSsss) | NUMBER(9) | Y | NOT NULL |
| `JUNGJO_TYPE` | 중조구분 | CHAR(1) |  |  |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) |  |  |
| `MSG_SEQNO` | 전문일련번호 | CHAR(4) |  |  |
| `STRT_TIME` | 장애시작시간 | VARCHAR2(6) |  |  |
| `END_TIME` | 장애종료시간 | VARCHAR2(6) |  |  |
| `SRC` | 기종_구분_코드(SELECT SRC,SRC_NM FROM …) | VARCHAR2(2) |  |  |
| `ERR_TYPE` | 오류구분 | CHAR(2) |  |  |
| `DEV_CODE` | Device코드 | VARCHAR2(2) |  |  |
| `ERR_CODE` | 장애코드 | VARCHAR2(2) |  |  |
| `ERR_RANK_CODE` | Error구분 | VARCHAR2(2) |  |  |
| `ERR_MODE` | 장애모드(기기상태) | VARCHAR2(1) |  |  |
| `LONG_ERR_MSG` | 장장애전문 | VARCHAR2(10) |  |  |
| `USE_STOP` | 중지모드(기기상태) | CHAR(1) |  |  |
| `MGT_MODE` | 관리모드(기기상태) | CHAR(1) |  |  |
| `HOST_ORD` | HOST지시(기기상태) | CHAR(1) |  |  |
| `AUTO_RECV` | 자동복구(기기상태) | CHAR(1) |  |  |
| `TRSF_STOP` | 이체중지_기기상태 | CHAR(1) |  |  |
| `CASH_DEPO_STOP` | 입금제한거래(제한거래) | CHAR(1) |  |  |
| `CASH_PMT_STOP` | 지급제한거래(제한거래) | CHAR(1) |  |  |
| `BKBK_LM_DEAL` | 통장제한거래(제한거래) | CHAR(1) |  |  |
| `TRSF_LM_DEAL` | 이체제한거래(제한거래) | CHAR(1) |  |  |
| `BC_LM_DEAL` | 비씨제한거래(제한거래) | CHAR(1) |  |  |
| `OBK_LM_DEAL` | 타행제한거래(제한거래) | CHAR(1) |  |  |
| `JRO_LM_DEAL` | 지로제한거래(제한거래) | CHAR(1) |  |  |
| `CASH_ACPT_TO` | 현금미수취(미수취) | CHAR(1) |  |  |
| `CHK_ACPT_TO` | 수표미수취(미수취) | CHAR(1) |  |  |
| `DTL_ACPT_TO` | 명세표미수취(미수취) | CHAR(1) |  |  |
| `CARD_ACPT_TO` | 카드미수취(미수취) | CHAR(1) |  |  |
| `BKBK_ACPT_TO` | 통장미수취(미수취) | CHAR(1) |  |  |
| `JRO_ACPT_TO` | 지로미수취(미수취) | CHAR(1) |  |  |
| `B10000_END` | 현금부족(매체과부족) | CHAR(1) |  |  |
| `CHK_END` | 수표부족(매체과부족) | CHAR(1) |  |  |
| `DTL_END` | 명세표부족(매체과부족) | CHAR(1) |  |  |
| `JNAL_END` | 저널부족(매체과부족) | CHAR(1) |  |  |
| `SAFE_FULL` | 현금Full(매체과부족) | CHAR(1) |  |  |
| `FURY_CASH_SHRT` | 순수현금부족(매체과부족) | CHAR(1) |  |  |
| `B10000_NEAREND` | 현금부족경고(매체과부족) | CHAR(1) |  |  |
| `CHK_NEAREND` | 수표부족경고(매체과부족) | CHAR(1) |  |  |
| `DTL_NEAREND` | 명세표부족경고(매체과부족) | CHAR(1) |  |  |
| `JNAL_NEAREND` | 저널부족경고(매체과부족) | CHAR(1) |  |  |
| `CASH_JAM` | 현금걸림(매체걸림) | CHAR(1) |  |  |
| `CHK_JAM` | 수표걸림(매체걸림) | CHAR(1) |  |  |
| `DTL_JAM` | 명세표걸림(매체걸림) | CHAR(1) |  |  |
| `JNAL_JAM` | 저널걸림(매체걸림) | CHAR(1) |  |  |
| `CARD_JAM` | 카드걸림(매체걸림) | CHAR(1) |  |  |
| `BKBK_JAM` | 통장걸림(매체걸림) | CHAR(1) |  |  |
| `JRO_JAM` | 지로걸림(매체걸림) | CHAR(1) |  |  |
| `CASH_MODULE_ERR` | 현금모듈장애(모듈장애) | CHAR(1) |  |  |
| `CHK_MODULE_ERR` | 수표모듈장애(모듈장애) | CHAR(1) |  |  |
| `DTL_MODULE_ERR` | 명세표모듈장애(모듈장애) | CHAR(1) |  |  |
| `JNAL_MODULE_ERR` | 저널모듈장애(모듈장애) | CHAR(1) |  |  |
| `CARD_MODULE_ERR` | 카드모듈장애(모듈장애) | CHAR(1) |  |  |
| `BKBK_MODULE_ERR` | 통장모듈장애(모듈장애) | CHAR(1) |  |  |
| `JRO_MODULE_ERR` | 지로모듈장애(모듈장애) | CHAR(1) |  |  |
| `ETC_ERR` | 기타장애(HD) | CHAR(1) |  |  |
| `ETC_SW_ERR` | 기타장애(SW) | CHAR(1) |  |  |
| `MODULE_REJECT` | 모듈빠짐 | CHAR(1) |  |  |
| `DUP_ERR_STAT` | 중복송신 | CHAR(1) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_NMS_ERR_RISK

**장애집계** · 기기관리 — 자동화기기 장애 관련 위험 정보를 관리한다

원본 쪽: 24/39 (KakaoTalk_20261106_154124088_06.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `CUR_DT` | 일자 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `SEQ_NO` | 일련번호(DDHH24MISSsss) | NUMBER(22) | Y | NOT NULL |
| `ERR_TYPE` | 오류구분 | CHAR(2) |  |  |
| `ERR_RANK_CODE` | Error구분 | VARCHAR2(2) |  |  |
| `ERR_TIME` | 에러발생시간 | VARCHAR2(6) |  |  |
| `STRT_TIME` | 장애시작시간 | VARCHAR2(14) |  |  |
| `END_TIME` | 장애종료시간 | VARCHAR2(14) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_NMS_HDAY

**휴일코드** · 기기관리 — 업무에 적용하는 휴일 정보를 관리한다

원본 쪽: 9/39 (KakaoTalk_20261106_154235676_11.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `HDAY_DT` | 해당일자 | CHAR(8) | Y | NOT NULL |
| `DAY_TYPE` | 날짜구분 | NUMBER(1) |  |  |
| `HDAY_YN` | 휴일여부 | CHAR(1) |  |  |
| `CLOSE_YN` | 해당일자마감여부 | CHAR(1) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_NMS_MON_OPRATE

**월가동률** · 기기관리 — 자동화기기의 월별 가동률을 관리한다

원본 쪽: 24/39 (KakaoTalk_20261106_154124088_06.jpg), 25/39 (KakaoTalk_20261106_154235676_01.jpg), 26/39 (KakaoTalk_20261106_154124088_07.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `JUNGJO_TYPE` | 중조구분 | CHAR(1) | Y | NOT NULL |
| `OP_YM` | 운영월 | VARCHAR2(6) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `SRC` | 기종_구분_코드(SELECT SRC,SRC_NM FROM …) | VARCHAR2(2) | Y | NOT NULL |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(7) | Y | NOT NULL |
| `OP_HOUR` | HOUR24 | CHAR(1) |  |  |
| `CENT_CODE` | 지역센터코드 | VARCHAR2(2) |  |  |
| `HOFC_CODE` | 지역본부코드 | VARCHAR2(2) |  |  |
| `GAESO` | 개소(GAESO) | VARCHAR2(3) |  |  |
| `BF_ERR_SEC` | 온라인운용시간이전장애시간-초 | NUMBER(10) |  |  |
| `MID_ERR_SEC` | 온라인운용시간중장애시간-초 | NUMBER(10) |  |  |
| `AF_ERR_SEC` | 온라인운용시간이후장애시간-초 | NUMBER(10) |  |  |
| `OP_ERR_SEC` | 운용장애시간(A1) | NUMBER(10) |  |  |
| `OP_ERR_CNT` | 운용장애건수(A1) | NUMBER(7) |  |  |
| `MCN_ERR_SEC` | 기기장애시간-초 | NUMBER(10) |  |  |
| `MCN_ERR_CNT` | 기기장애건수 | NUMBER(7) |  |  |
| `POWER_OFF_SEC` | 전원OFF시간-초(F0) | NUMBER(10) |  |  |
| `POWER_OFF_CNT` | 전원OFF건수(F0) | NUMBER(7) |  |  |
| `TRT_STOP_CNT` | 취급중지건수 | NUMBER(7) |  |  |
| `CASH_PMT_STOP_CNT` | 지급제한거래(제한거래)건수 | NUMBER(7) |  |  |
| `CHECK_ACPT_TIMEOUT_CNT` | 수표미수취(미수취)건수 | NUMBER(7) |  |  |
| `DTL_ACPT_TIMEOUT_CNT` | 명세표미수취(미수취)건수 | NUMBER(7) |  |  |
| `CASH_ACPT_TIMEOUT_CNT` | 현금미수취(미수취)건수 | NUMBER(7) |  |  |
| `BKBK_ACPT_TIMEOUT_CNT` | 통장미수취(미수취)건수 | NUMBER(7) |  |  |
| `CARD_ACPT_TIMEOUT_CNT` | 카드미수취(미수취)건수 | NUMBER(7) |  |  |
| `REC_FULL_CNT` | rejectfull건수 | NUMBER(7) |  |  |
| `JNAL_END_CNT` | 저널부족(매체과부족)건수 | NUMBER(7) |  |  |
| `DTL_END_CNT` | 명세표부족(매체과부족)건수 | NUMBER(7) |  |  |
| `OP_CNT` | 코너의기본기기운영대수 | NUMBER(7) |  |  |
| `HOLIDAY_CNT` | 휴일수 | NUMBER(7) |  |  |
| `B10000_END_CNT` | 현금부족(매체과부족)건수 | NUMBER(7) |  |  |
| `CASH_DEPO_STOP_CNT` | 입금제한거래(제한거래)건수 | NUMBER(7) |  |  |
| `CHK_PMT_STOP_CNT` | 수표지급중지건수 | NUMBER(7) |  |  |
| `CHK_DEPO_STOP_CNT` | 수표입금중지건수 | NUMBER(7) |  |  |
| `DEAL_CNT` | 거래건수 | NUMBER(16) |  |  |
| `OP_RATE` | 가동률 | NUMBER(5,2) |  |  |
| `OP_ERR_SECA2` | 운용장애시간(A2) | NUMBER(10) |  |  |
| `OP_ERR_CNTA2` | 운용장애건수(A2) | NUMBER(7) |  |  |
| `MGT_OPEN_SEC` | 보수상태시간(C1) | NUMBER(10) |  |  |
| `MGT_OPEN_CNT` | 보수상태건수(C1) | NUMBER(7) |  |  |
| `SYSTEM_DOWN_SEC` | 시스템장애시간(S0) | NUMBER(10) |  |  |
| `SYSTEM_DOWN_CNT` | 시스템장애건수(S0) | NUMBER(7) |  |  |
| `CASH_DEPO_STOP_SEC` | 입금제한거래(제한거래)(초) | NUMBER(9) |  |  |
| `CASH_PMT_STOP_SEC` | 지급제한거래(제한거래)(초) | NUMBER(7) [원문 그대로, SEC 인데 7자리] |  |  |
| `BKBK_LM_DEAL_SEC` | 통장제한거래(제한거래)(초) | NUMBER(9) |  |  |
| `BKBK_LM_DEAL_CNT` | 통장제한거래(제한거래)건수 | NUMBER(7) |  |  |
| `TRSF_LM_DEAL_SEC` | 이체제한거래(제한거래)(초) | NUMBER(9) |  |  |
| `TRSF_LM_DEAL_CNT` | 이체제한거래(제한거래)건수 | NUMBER(7) |  |  |
| `BC_LM_DEAL_SEC` | 비씨제한거래(제한거래)(초) | NUMBER(9) |  |  |
| `BC_LM_DEAL_CNT` | 비씨제한거래(제한거래)건수 | NUMBER(7) |  |  |
| `OBK_LM_DEAL_SEC` | 타행제한거래(제한거래)(초) | NUMBER(9) |  |  |
| `OBK_LM_DEAL_CNT` | 타행제한거래(제한거래)건수 | NUMBER(7) |  |  |
| `JRO_LM_DEAL_CNT` | 지로제한거래(제한거래)(초) ※원문 짝 바뀜 | NUMBER(7) |  |  |
| `JRO_LM_DEAL_SEC` | 지로제한거래(제한거래)건수 ※원문 짝 바뀜 | NUMBER(9) |  |  |
| `CASH_ACPT_TIMEOUT_SEC` | 현금미수취(미수취)(초) | NUMBER(9) |  |  |
| `CHECK_ACPT_TIMEOUT_SEC` | 수표미수취(미수취)(초) | NUMBER(9) |  |  |
| `DTL_ACPT_TIMEOUT_SEC` | 명세표미수취(미수취)(초) | NUMBER(9) |  |  |
| `CARD_ACPT_TIMEOUT_SEC` | 카드미수취(미수취)(초) | NUMBER(9) |  |  |
| `BKBK_ACPT_TIMEOUT_SEC` | 통장미수취(미수취)(초) | NUMBER(9) |  |  |
| `JRO_ACPT_TO_SEC` | 지로미수취(미수취)(초) | NUMBER(9) |  |  |
| `JRO_ACPT_TO_CNT` | 지로미수취(미수취)건수 | NUMBER(7) |  |  |
| `B10000_END_SEC` | 현금부족(매체과부족)(초) | NUMBER(9) |  |  |
| `CHK_END_SEC` | 수표부족(매체과부족)(초) | NUMBER(9) |  |  |
| `CHK_END_CNT` | 수표부족(매체과부족)건수 | NUMBER(7) |  |  |
| `DTL_END_SEC` | 명세표부족(매체과부족)(초) | NUMBER(9) |  |  |
| `JNAL_END_SEC` | 저널부족(매체과부족)(초) | NUMBER(9) |  |  |
| `SAFE_FULL_SEC` | 현금Full(매체과부족)(초) | NUMBER(9) |  |  |
| `SAFE_FULL_CNT` | 현금Full(매체과부족)건수 | NUMBER(7) |  |  |
| `FURY_CASH_SHRT_SEC` | 순수현금부족(매체과부족)(초) | NUMBER(9) |  |  |
| `FURY_CASH_SHRT_CNT` | 순수현금부족(매체과부족)건수 | NUMBER(7) |  |  |
| `B10000_NEAREND_SEC` | 현금부족경고(매체과부족)(초) | NUMBER(9) |  |  |
| `B10000_NEAREND_CNT` | 현금부족경고(매체과부족)건수 | NUMBER(7) |  |  |
| `CHK_NEAREND_SEC` | 수표부족경고(매체과부족)(초) | NUMBER(9) |  |  |
| `CHK_NEAREND_CNT` | 수표부족경고(매체과부족)건수 | NUMBER(7) |  |  |
| `DTL_NEAREND_SEC` | 명세표부족경고(매체과부족)(초) | NUMBER(9) |  |  |
| `DTL_NEAREND_CNT` | 명세표부족경고(매체과부족)건수 | NUMBER(7) |  |  |
| `JNAL_NEAREND_SEC` | 저널부족경고(매체과부족)(초) | NUMBER(9) |  |  |
| `JNAL_NEAREND_CNT` | 저널부족경고(매체과부족)건수 | NUMBER(7) |  |  |
| `CASH_JAM_SEC` | 현금걸림(매체걸림)(초) | NUMBER(9) |  |  |
| `CASH_JAM_CNT` | 현금걸림(매체걸림)건수 | NUMBER(7) |  |  |
| `CHK_JAM_SEC` | 수표걸림(매체걸림)(초) | NUMBER(9) |  |  |
| `CHK_JAM_CNT` | 수표걸림(매체걸림)건수 | NUMBER(7) |  |  |
| `DTL_JAM_SEC` | 명세표걸림(매체걸림)(초) | NUMBER(9) |  |  |
| `DTL_JAM_CNT` | 명세표걸림(매체걸림)건수 | NUMBER(7) |  |  |
| `JNAL_JAM_SEC` | 저널걸림(매체걸림)(초) | NUMBER(9) |  |  |
| `JNAL_JAM_CNT` | 저널걸림(매체걸림)건수 | NUMBER(7) |  |  |
| `CARD_JAM_SEC` | 카드걸림(매체걸림)(초) | NUMBER(9) |  |  |
| `CARD_JAM_CNT` | 카드걸림(매체걸림)건수 | NUMBER(7) |  |  |
| `BKBK_JAM_SEC` | 통장걸림(매체걸림)(초) | NUMBER(9) |  |  |
| `BKBK_JAM_CNT` | 통장걸림(매체걸림)건수 | NUMBER(7) |  |  |
| `JRO_JAM_SEC` | 지로걸림(매체걸림)(초) | NUMBER(9) |  |  |
| `JRO_JAM_CNT` | 지로걸림(매체걸림)건수 | NUMBER(7) |  |  |
| `CASH_MODULE_ERR_SEC` | 현금모듈장애(모듈장애)(초) | NUMBER(9) |  |  |
| `CASH_MODULE_ERR_CNT` | 현금모듈장애(모듈장애)건수 | NUMBER(7) |  |  |
| `CHK_MODULE_ERR_SEC` | 수표모듈장애(모듈장애)(초) | NUMBER(9) |  |  |
| `CHK_MODULE_ERR_CNT` | 수표모듈장애(모듈장애)건수 | NUMBER(7) |  |  |
| `DTL_MODULE_ERR_SEC` | 명세표모듈장애(모듈장애)(초) | NUMBER(9) |  |  |
| `DTL_MODULE_ERR_CNT` | 명세표모듈장애(모듈장애)건수 | NUMBER(7) |  |  |
| `JNAL_MODULE_ERR_SEC` | 저널모듈장애(모듈장애)(초) | NUMBER(9) |  |  |
| `JNAL_MODULE_ERR_CNT` | 저널모듈장애(모듈장애)건수 | NUMBER(7) |  |  |
| `CARD_MODULE_ERR_SEC` | 카드모듈장애(모듈장애)(초) | NUMBER(9) |  |  |
| `CARD_MODULE_ERR_CNT` | 카드모듈장애(모듈장애)건수 | NUMBER(7) |  |  |
| `BKBK_MODULE_ERR_SEC` | 통장모듈장애(모듈장애)(초) | NUMBER(9) |  |  |
| `BKBK_MODULE_ERR_CNT` | 통장모듈장애(모듈장애)건수 | NUMBER(7) |  |  |
| `JRO_MODULE_ERR_SEC` | 지로모듈장애(모듈장애)(초) | NUMBER(9) |  |  |
| `JRO_MODULE_ERR_CNT` | 지로모듈장애(모듈장애)건수 | NUMBER(7) |  |  |
| `ETC_ERR_SEC` | 기타장애(기타)(초) | NUMBER(9) |  |  |
| `ETC_ERR_CNT` | 기타장애(기타)건수 | NUMBER(7) |  |  |
| `ETC_SW_ERR_SEC` | 기타장애(SW)(초) | NUMBER(9) |  |  |
| `ETC_SW_ERR_CNT` | 기타장애(SW)건수 | NUMBER(7) |  |  |
| `MODULE_REJECT_SEC` | 모듈빠짐(초) | NUMBER(9) |  |  |
| `MODULE_REJECT_CNT` | 모듈빠짐건수 | NUMBER(7) |  |  |
| `OP_CUST_SEC` | 고객체감운용시간 | NUMBER(9) |  |  |
| `OP_TIME` | 운용시간(초) | NUMBER(9) |  |  |
| `OP_CUST_RATE` | 가동률(고객체감) | NUMBER(5,2) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_NMS_SRC

**SRC단말/자동화기기구분코드** · 기기관리 — SRC 단말 및 자동화기기의 구분코드를 관리한다

원본 쪽: 9/39 (KakaoTalk_20261106_154235676_11.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `SRC` | 기종_구분_코드(SELECT SRC,SRC_NM FROM …) | VARCHAR2(2) | Y | NOT NULL |
| `SRC_NM` | 제조사/기기명칭 | VARCHAR2(40) |  |  |
| `VEND_CODE` | 업체코드 | VARCHAR2(2) |  |  |
| `KOM_TYPE` | 기종분류 | VARCHAR2(5) |  |  |
| `SMTY` | SMTY | VARCHAR2(4) |  |  |
| `EQ_TYPE` | EQ_TYPE | NUMBER(2) |  |  |
| `EQ_SUB_TYPE` | EQ_SUB_TYPE | NUMBER(3) |  |  |
| `MODEL` | MODEL | NUMBER(7) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_NMS_SRC_ERR

**장애코드** · 기기관리 — 단말 및 자동화기기의 장애코드와 설명을 관리한다

원본 쪽: 9/39 (KakaoTalk_20261106_154235676_11.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `SRC` | 기종_구분_코드(SELECT SRC,SRC_NM FROM …) | VARCHAR2(2) | Y | NOT NULL |
| `DEV_CODE` | Device코드 | VARCHAR2(2) | Y | NOT NULL |
| `ERR_CODE` | 장애코드 | VARCHAR2(2) | Y | NOT NULL |
| `ERR_TYPE` | 오류구분 | VARCHAR2(14) |  |  |
| `ERR_NM` | 장애_명 | VARCHAR2(80) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_NOTICE

**공지사항** · 기기관리 — 공지할 사항을 등록 관리한다

원본 쪽: 39/39 (KakaoTalk_20261106_154124088_25.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `NO` | 번호 | NUMBER(22) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) |  |  |
| `SUBJECT` | 제목 | VARCHAR2(200) |  |  |
| `TEXT` | 내용 | VARCHAR2(4000) |  |  |
| `VISIT` | 글방문횟수 | NUMBER(22) |  |  |
| `NAME` | 등록자이름 | VARCHAR2(10) |  |  |
| `PER_NO` | 개인번호 | VARCHAR2(9) |  |  |
| `WRT_DATE` | 작성일자 | DATE |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_OFC_RAW

**사무소정보(Raw Data)** · 기기관리 — 사무소 정보 ROW DATA를 기록 관리한다

원본 쪽: 39/39 (KakaoTalk_20261106_154124088_25.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `SAMUSO` | 부서코드 | VARCHAR2(6) | Y | NOT NULL |
| `SAMUSO_NAME` | 부서명 | VARCHAR2(36) |  |  |
| `ONLINE_CODE` | 사무소코드 | VARCHAR2(6) |  |  |
| `MOJUM1` | 모점코드 | VARCHAR2(6) |  |  |
| `M1_ON` | 본소코드 | VARCHAR2(6) |  |  |
| `MOJUM2` | 시도환코드 | VARCHAR2(6) |  |  |
| `M2_ON` | 시군온라인코드 | VARCHAR2(6) |  |  |
| `HYUNGTAE` | 사무소형태(본/지소등) | VARCHAR2(2) |  |  |
| `SIDO` | 시도코드 | VARCHAR2(2) |  |  |
| `SAUB_TYPE` | 사업구분 | VARCHAR2(1) |  |  |
| `SOGWANISA` | 소관 | VARCHAR2(1) |  |  |
| `SOONBUN` | 순번 | VARCHAR2(4) |  |  |
| `TEL_DDD` | 전화번호지역 | VARCHAR2(4) |  |  |
| `TEL_GUK` | 전화번호국번 | VARCHAR2(4) |  |  |
| `TEL_NO` | 전화번호 | VARCHAR2(4) |  |  |
| `OPEN_DATE` | 개시일 | VARCHAR2(8) |  |  |
| `CLOSE_DATE` | 폐쇄일 | VARCHAR2(8) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_OFC_REG_MGT

**사무소등록관리** · 기기관리 — 관리 대상 사무소의 등록정보를 관리한다

원본 쪽: 9/39 (KakaoTalk_20261106_154235676_11.jpg), 10/39 (KakaoTalk_20261106_154124088_14.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `REG_DATE` | 등록일자 | VARCHAR2(8) |  |  |
| `CHK_DEPO_PSBL_BANK` | 수표입금가능은행 | VARCHAR2(100) |  |  |
| `OBKCHK_W41TATIME` | 타행수표평41타점시간 | VARCHAR2(2) |  |  |
| `OBKCHK_S41TATIME` | 타행수표토41타점시간 | VARCHAR2(2) |  |  |
| `OBKCHK_H41TATIME` | 타행수표휴41타점시간 | VARCHAR2(2) |  |  |
| `OBKCHK_W41LMBIT` | 타행수표평41제한비트 | CHAR(1) |  |  |
| `OBKCHK_S41LMBIT` | 타행수표토41제한비트 | CHAR(1) |  |  |
| `OBKCHK_H41LMBIT` | 타행수표휴41제한비트 | CHAR(1) |  |  |
| `OBKCHK_W41LMTIME` | 타행수표평41제한시간 | VARCHAR2(2) |  |  |
| `OBKCHK_S41LMTIME` | 타행수표토41제한시간 | VARCHAR2(2) |  |  |
| `OBKCHK_H41LMTIME` | 타행수표휴41제한시간 | VARCHAR2(2) |  |  |
| `REG_TYP_365` | 365등록유형 | VARCHAR2(2) |  |  |
| `BGN_TIME_365` | 365시작시간 | VARCHAR2(2) |  |  |
| `END_TIME_365` | 365종료시간 | VARCHAR2(2) |  |  |
| `EXTN_REG_DATE_365` | 365연장등록일자 | VARCHAR2(8) |  |  |
| `GRO_BIT` | 지로비트 | CHAR(1) |  |  |
| `GRO_CODE` | 지로코드 | VARCHAR2(6) |  |  |
| `TASK_STP_FLAG` | 업무정지FLAG | CHAR(1) |  |  |
| `REPL_ECH_CODE` | 상호교환코드 | VARCHAR2(2) |  |  |
| `HALT_REG_FLAG` | 장애등록FLAG | CHAR(1) |  |  |
| `KANM` | 한글명칭 | VARCHAR2(40) |  |  |
| `EHNM` | 영문명칭 | VARCHAR2(24) |  |  |
| `PHN_NO` | 전화번호 | VARCHAR2(14) |  |  |
| `CLS_YN` | 마감여부 | CHAR(1) |  |  |
| `HLD_YN` | 휴일여부 | CHAR(1) |  |  |
| `BANK_HLD_YN` | 금융휴무여부 | CHAR(1) |  |  |
| `OLN_CODE` | 온라인코드 | VARCHAR2(6) |  |  |
| `ECH_CODE` | 환코드 | VARCHAR2(6) |  |  |
| `SIDO_CODE` | 지역코드 | VARCHAR2(2) |  |  |
| `EXCS_NO` | EXCS_NO | VARCHAR2(12) |  |  |
| `POST_NO` | 우편번호 | VARCHAR2(6) |  |  |
| `ADDRESS` | 사무소주소 | VARCHAR2(52) |  |  |
| `PSTN_INFO` | PSTN_INFO | VARCHAR2(40) |  |  |
| `FORM` | FORM | VARCHAR2(4) |  |  |
| `BIZ_SECT` | BIZ_SECT | VARCHAR2(2) |  |  |
| `TOP_MOJUM` | TOP_MOJUM | VARCHAR2(6) |  |  |
| `JUNG_MOJUM` | JUNG_MOJUM | VARCHAR2(6) |  |  |
| `ECH_MOJUM` | ECH_MOJUM | VARCHAR2(6) |  |  |
| `FAX_NO` | FAX번호 | VARCHAR2(8) |  |  |
| `VEND_NO` | VEND_NO | VARCHAR2(10) |  |  |
| `OPEN_DAY` | OPEN_DAY | VARCHAR2(8) |  |  |
| `CLOSE_DAY` | CLOSE_DAY | VARCHAR2(8) |  |  |
| `SMS_RCV_TEL` | SMS수신전화 | VARCHAR2(14) |  |  |
| `SMS_RCV_HP` | SMS수신핸드폰 | VARCHAR2(14) |  |  |
| `SMS_RCV_USE_TYPE` | SMS수신사용구분 | CHAR(1) |  |  |
| `SMS_RCV_NM` | SMS수신자 | VARCHAR2(10) |  |  |
| `ARS_RCV_USE_TYPE` | ARS수신사용구분 | CHAR(1) |  |  |
| `DOFF_RCV_YN` | 휴무일수신여부 | CHAR(1) |  |  |
| `WEEK_RCV_YN` | 주수신여부 | CHAR(1) |  |  |
| `RGN_FORM` | 지역형태코드 | CHAR(2) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_OP_ATM_LARGECHK_ERR

**고액수표오류** · 기기관리 — ATM 고액 수표 관련 오류 내역을 관리한다

원본 쪽: 26/39 (KakaoTalk_20261106_154124088_07.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `BILL_5_ERR_YN` | BILL_5_ERR_YN | CHAR(1) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_OP_ATM_STAT

**자동화기기상태(GEN포함)** · 기기관리 — GEN을 포함한 자동화기기의 현재 상태를 관리한다

원본 쪽: 26/39 (KakaoTalk_20261106_154124088_07.jpg), 27/39 (KakaoTalk_20261106_154235676_02.jpg), 28/39 (KakaoTalk_20261106_154124088_05.jpg), 29/39 (KakaoTalk_20261106_154124088_29.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `CUR_DT` | 일자 | CHAR(8) |  | NOT NULL |
| `CUR_TIME` | 시간 | VARCHAR2(6) |  | NOT NULL |
| `HIST_COMM_NO` | 히스토리통번 | VARCHAR2(18) |  | NOT NULL |
| `HIST_KIND` | 히스토리종별 | CHAR(1) |  |  |
| `HIST_SUB_KIND` | 히스토리서브종별 | CHAR(1) |  |  |
| `ERR_CODE2` | 에러코드2 | VARCHAR2(4) |  |  |
| `POWER_OFF` | 전원OFF | CHAR(1) |  |  |
| `USE_STOP` | 중지모드(기기상태) | CHAR(1) |  |  |
| `CHK_DEPO_STOP` | 수표입금중지(9934전문) | CHAR(1) |  |  |
| `CHK_PMT_STOP` | 수표지급중지(9934전문) | CHAR(1) |  |  |
| `TRSF_STOP` | 이체중지_거래상태 | CHAR(1) |  |  |
| `ENT_STOP` | 진입중지(9934전문) | CHAR(1) |  |  |
| `WRBK_STOP` | 기장중지(9934전문) | CHAR(1) |  |  |
| `CASH_DEPO_STOP` | 입금제한거래(제한거래) | CHAR(1) |  |  |
| `CASH_PMT_STOP` | 지급제한거래(제한거래) | CHAR(1) |  |  |
| `ERR_MODE` | 장애모드(기기상태) | CHAR(1) |  |  |
| `CHK_OPEN_RCV_END` | 수표개시수신끝(9934전문) | CHAR(1) |  |  |
| `TRSF_OPEN_RCV_END` | 이체개시수신끝(9934전문) | CHAR(1) |  |  |
| `LOAD_OPEN_RCV_END` | 진입개시수신끝(9934전문) | CHAR(1) |  |  |
| `BKBK_OPEN_RCV_END` | 통장개시수신끝(9934전문) | CHAR(1) |  |  |
| `DEPO_OPEN_RCV_END` | 입금개시수신끝(9934전문) | CHAR(1) |  |  |
| `PMT_OPEN_RCV_END` | 지급개시수신끝(9934전문) | CHAR(1) |  |  |
| `WRBK_JNAL` | 기장저널(9934전문) | CHAR(1) |  |  |
| `DEAL_REST_OK` | 거래결과OK(9934전문) | CHAR(1) |  |  |
| `CHK_ACPT_TO` | 수표미수취(미수취) | CHAR(1) |  |  |
| `DTL_ACPT_TO` | 명세표미수취(미수취) | CHAR(1) |  |  |
| `CASH_ACPT_TO` | 현금미수취(미수취) | CHAR(1) |  |  |
| `BKBK_ACPT_TO` | 통장미수취(미수취) | CHAR(1) |  |  |
| `CARD_ACPT_TO` | 카드미수취(미수취) | CHAR(1) |  |  |
| `MCN_ALARM` | 기기ALARM(9934전문) | CHAR(1) |  |  |
| `SAFE_ALARM` | 금고ALARM(9934전문) | CHAR(1) |  |  |
| `SAFE_FULL` | 현금Full(매체과부족) | CHAR(1) |  |  |
| `REJ_FULL` | REJECTFULL(9934전문) | CHAR(1) |  |  |
| `JNAL_END` | 저널부족(매체과부족) | CHAR(1) |  |  |
| `DTL_END` | 명세표부족(매체과부족) | CHAR(1) |  |  |
| `B1000_END` | 천원END(9934전문) | CHAR(1) |  |  |
| `B10000_END` | 현금부족(매체과부족) | CHAR(1) |  |  |
| `RESET_HOLD` | RESET대기(9934전문) | CHAR(1) |  |  |
| `RESET_YN` | RESET가부(9934전문) | CHAR(1) |  |  |
| `JNAL_NEAREND` | 저널부족경고(매체과부족) | CHAR(1) |  |  |
| `DTL_NEAREND` | 명세표부족경고(매체과부족) | CHAR(1) |  |  |
| `B1000_NEAREND` | 천원NEAREND(9934전문) | CHAR(1) |  |  |
| `B10000_NEAREND` | 현금부족경고(매체과부족) | CHAR(1) |  |  |
| `CHK_NEAREND` | 수표부족경고(매체과부족) | CHAR(1) |  |  |
| `CHK_END` | 수표부족(매체과부족) | CHAR(1) |  |  |
| `CHK_FULL` | 수표FULL(9934전문) | CHAR(1) |  |  |
| `BKBK_END` | 통장END(9934전문) | CHAR(1) |  |  |
| `FURY_CASH_SHRT` | 순수현금부족(매체과부족) | CHAR(1) |  |  |
| `LONG_ERR_MSG` | 장장애전문 | VARCHAR2(10) |  |  |
| `ERR_SEQNO` | 장애일련번호 | VARCHAR2(4) |  |  |
| `ERR_AMT` | 장애금액 | VARCHAR2(10) |  |  |
| `DTL_ERR_STEP` | 상세장애스텝 | VARCHAR2(10) |  |  |
| `TMN_STAT` | 단말기상태 | VARCHAR2(2) |  |  |
| `SECT_OUTOFC` | 부속출장소 | CHAR(1) |  |  |
| `ARGMT_PST` | 배치장소 | CHAR(1) |  |  |
| `AP_VERS` | AP버전 | VARCHAR2(10) |  |  |
| `ATMS_RESP` | ATMS대응 | CHAR(1) |  |  |
| `AGENT_YN` | AGENT유무 | CHAR(1) |  |  |
| `MSG_TYPE` | 전문구분(MSGTYPE) | CHAR(1) |  |  |
| `MAIN_ACCT_INFO` | 주계좌정보 | VARCHAR2(24) |  |  |
| `CASH_LOAD_NOSHT` | 현금장전매수 | VARCHAR2(5) |  |  |
| `CHK_NOSHT` | EZ_수표매수 | VARCHAR2(4) |  |  |
| `CHK_NO` | 수표번호 | VARCHAR2(8) |  |  |
| `CTL_SERIAL` | 제어시리얼 | VARCHAR2(10) |  |  |
| `FUNC_GRP` | 기능분류 | CHAR(1) |  |  |
| `FUNC_NO` | 기능번호 | CHAR(1) |  |  |
| `ADDT_INFO` | 부가정보 | VARCHAR2(80) |  |  |
| `CTL_ADDT_INFO` | 제어부가정보 | VARCHAR2(80) |  |  |
| `CTL_REST` | 제어결과 | CHAR(1) |  |  |
| `AUD_TGET_FLAG` | 감시대상플래그 | CHAR(1) |  |  |
| `TD_OP_MODE` | 오늘운용모드 | VARCHAR2(2) |  |  |
| `ND_OP_MODE` | 다음날운용모드 | VARCHAR2(2) |  |  |
| `TD_OP_PATN_NO` | 오늘운용패턴NO | NUMBER(4) |  |  |
| `DEAL_FLAG` | 거래플래그 | CHAR(1) |  |  |
| `DEPO_FLAG` | 입금플래그 | CHAR(1) |  |  |
| `STOCK_FLAG` | 재고플래그 | CHAR(1) |  |  |
| `MATN_COMP_CODE` | 보수업체관리대상 | CHAR(1) |  |  |
| `OP_TYPE` | 점내외구분 | CHAR(1) |  |  |
| `INOUT_TYPE` | 입출구분(INOUTTYPE) | CHAR(1) |  |  |
| `DEAL_ERR_INFO` | 거래장애정보 | CHAR(1) |  |  |
| `ERR_DTL_STEP_INFO` | 장애상세스텝정보 | CHAR(1) |  |  |
| `CASH_LOAD_INFO` | 현금장전정보 | CHAR(1) |  |  |
| `CHK_LOAD_INFO` | 수표장전정보 | CHAR(1) |  |  |
| `STAT_INFO` | 상태정보 | CHAR(1) |  |  |
| `POWER_CTL_INFO` | 전원제어정보 | CHAR(1) |  |  |
| `MODE_CONV_INFO` | 모드전환정보 | CHAR(1) |  |  |
| `CLOSE_CTL_INFO` | 폐국제어정보 | CHAR(1) |  |  |
| `IMAGE_INFO` | 사진정보 | CHAR(1) |  |  |
| `PDL_INFO` | PDL정보 | CHAR(1) |  |  |
| `ERR_INFO` | 장애정보 | CHAR(1) |  |  |
| `SW_RESET` | SW리셋 | CHAR(1) |  |  |
| `CARD_SECT_RESET` | 카드부리셋 | CHAR(1) |  |  |
| `DTL_SECT_RESET` | 명세표부리셋 | CHAR(1) |  |  |
| `JNAL_SECT_RESET` | 저널부리셋 | CHAR(1) |  |  |
| `BKBK_SECT_RESET` | 통장부리셋 | CHAR(1) |  |  |
| `CASH_SECT_RESET` | 현금부리셋 | CHAR(1) |  |  |
| `CHK_SECT_RESET` | 수표부리셋 | CHAR(1) |  |  |
| `CARD_DISCHG_WITH` | 카드배출회수 | CHAR(1) |  |  |
| `BKBK_DISCHG_WITH` | 통장배출회수 | CHAR(1) |  |  |
| `DTL_DISCHG_WITH` | 명세표배출회수 | CHAR(1) |  |  |
| `CASH_WITH` | 현금회수 | CHAR(1) |  |  |
| `CHK_WITH` | 수표회수 | CHAR(1) |  |  |
| `AP_LOG_INFO` | AP로그정보 | CHAR(1) |  |  |
| `IMAGE_FILE_INFO` | 사진파일정보 | CHAR(1) |  |  |
| `ELEC_JNAL_INFO` | 전자저널정보 | CHAR(1) |  |  |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) |  | NOT NULL |
| `JUNGJO_TYPE` | 중조구분 | CHAR(1) |  |  |
| `CENT_CODE` | 지역센터코드 | VARCHAR2(2) |  |  |
| `SRC` | 기종_구분_코드(SELECT SRC,SRC_NM FROM …) | VARCHAR2(2) |  |  |
| `CUR_DAY_ON_YN` | 당일ON여부 | CHAR(1) |  |  |
| `TMN_TYPE` | 단말구분(LAN단말,자동화,LAN) | CHAR(1) |  | NOT NULL |
| `BP_NO` | BP번호 | NUMBER(6) |  | NOT NULL |
| `BP_CH` | BP채널 | NUMBER(4) |  |  |
| `CUR_BP_NO` | 현재BP번호 | NUMBER(6) |  |  |
| `CUR_BP_CH` | 현재BP채널 | NUMBER(4) |  |  |
| `GAESO` | 개소(GAESO) | VARCHAR2(3) |  |  |
| `LAN_IP` | 단말IP | VARCHAR2(15) |  |  |
| `OP_TIME_TYPE` | 운영시간구분(22/24) | VARCHAR2(2) |  |  |
| `MSG_RCV_TYPE` | 메시지수신구분 | CHAR(1) |  |  |
| `BUZZ_USE_YN` | 부저사용(장애수신시) | CHAR(1) |  |  |
| `CASH_NEAREND_SET` | 현금NEARENDSET | CHAR(1) |  |  |
| `PREP_CASH_BOX_YN` | 예비현금박스여부 | CHAR(1) |  |  |
| `CHK_LOAD_YN` | 수표탑재여부 | CHAR(1) |  |  |
| `RCT_TMN_YN` | 수납단말기여부(파출) | CHAR(1) |  |  |
| `ERR_TIME` | 에러발생시간 | VARCHAR2(6) |  |  |
| `RCVR_TIME` | 복구시간 | VARCHAR2(6) |  |  |
| `LAST_OPEN_TIME` | 최종개국시간 | VARCHAR2(6) |  |  |
| `LAST_TIME_TYPE` | 최종TIME판별 | CHAR(1) |  |  |
| `ERR_TYPE` | 오류구분 | CHAR(1) |  |  |
| `DEV_CODE` | Device코드 | VARCHAR2(2) |  |  |
| `ERR_CODE` | 장애코드 | VARCHAR2(2) |  |  |
| `ERR_RANK_CODE` | Error구분 | VARCHAR2(2) |  |  |
| `RLA_CONN_TYPE` | RLA접속방식 | CHAR(1) |  |  |
| `RLA_CONN_PORT` | RLA접속PORT | CHAR(1) |  |  |
| `BP_SEQ` | BP일련번호 | NUMBER(8) |  |  |
| `ERR_STAT01` | 장애상태01 | CHAR(8) |  |  |
| `ERR_STAT02` | 장애상태02 | CHAR(8) |  |  |
| `ERR_STAT03` | 장애상태03 | CHAR(8) |  |  |
| `ERR_STAT04` | 장애상태04 | CHAR(8) |  |  |
| `ERR_STAT05` | 장애상태05 | CHAR(8) |  |  |
| `ERR_STAT06` | 장애상태06 | CHAR(8) |  |  |
| `ERR_STAT07` | 장애상태07 | CHAR(8) |  |  |
| `ERR_STAT08` | 장애상태08 | CHAR(8) |  |  |
| `ERR_STAT09` | 장애상태09 | CHAR(8) |  |  |
| `ERR_STAT10` | 장애상태10 | CHAR(8) |  |  |
| `SMS_MSG_CNT` | SMS전송횟수(NMS) | NUMBER(3) |  |  |
| `GEN_DT` | BPGEN일자 | CHAR(8) |  |  |
| `SCRT_CODE` | 경비업체 | VARCHAR2(2) |  |  |
| `NEAR_OFC_CODE` | 인근사무소위치(365) | VARCHAR2(40) |  |  |
| `RLA_IP` | RLA서버IP | VARCHAR2(15) |  |  |
| `ONL_IP` | 기번IP | VARCHAR2(15) |  |  |
| `VPN_IP` | VPNIP | VARCHAR2(15) |  |  |
| `BBP_CONN_TYPE` | 대형BP접속유형 | NUMBER(2) |  |  |
| `ARS_MSG_CNT` | 음성메시지건수 | NUMBER(3) |  |  |
| `ISD_MSG_YN` | 인수도메시지여부 | CHAR(1) |  |  |
| `MSG_INST_YN` | 메시지설치여부 | CHAR(1) |  |  |
| `MSG_INST_VER` | 메시지설치버전 | VARCHAR2(10) |  |  |
| `MSG_INST_DT` | 메시지설치일자 | CHAR(8) |  |  |
| `CASH_SHRT_AMT` | 현금부족금액 | NUMBER(10) |  |  |
| `OP_BGN_TIME` | 영업시작시간 | VARCHAR2(4) |  |  |
| `OP_END_TIME` | 영업_종료_시간 | VARCHAR2(4) |  |  |
| `OFC_DIST` | 사무소와의거리 | VARCHAR2(2) |  |  |
| `SET_OP_TYPE` | 설정운영구분(WEB설정) | CHAR(1) |  |  |
| `SET_INOUT_TYPE` | 설정내외구분(WEB설정) | CHAR(1) |  |  |
| `INST_PST_NM` | 설치장소명 | VARCHAR2(40) |  |  |
| `VEND_CODE` | 업체코드 | VARCHAR2(2) |  |  |
| `OFC_CHAG` | 영업점담당자명 | VARCHAR2(10) |  |  |
| `MSG_SEQNO` | 전문일련번호 | CHAR(4) |  |  |
| `MGT_MODE` | 관리모드(기기상태) | CHAR(1) |  |  |
| `HOST_ORD` | HOST지시(기기상태) | CHAR(1) |  |  |
| `AUTO_RECV` | 자동복구(기기상태) | CHAR(1) |  |  |
| `BKBK_LM_DEAL` | 통장제한거래(제한거래) | CHAR(1) |  |  |
| `TRSF_LM_DEAL` | 이체제한거래(제한거래) | CHAR(1) |  |  |
| `BC_LM_DEAL` | 비씨제한거래(제한거래) | CHAR(1) |  |  |
| `OBK_LM_DEAL` | 타행제한거래(제한거래) | CHAR(1) |  |  |
| `JRO_LM_DEAL` | 지로제한거래(제한거래) | CHAR(1) |  |  |
| `JRO_ACPT_TO` | 지로미수취(미수취) | CHAR(1) |  |  |
| `CASH_JAM` | 현금걸림(매체걸림) | CHAR(1) |  |  |
| `CHK_JAM` | 수표걸림(매체걸림) | CHAR(1) |  |  |
| `DTL_JAM` | 명세표걸림(매체걸림) | CHAR(1) |  |  |
| `JNAL_JAM` | 저널걸림(매체걸림) | CHAR(1) |  |  |
| `CARD_JAM` | 카드걸림(매체걸림) | CHAR(1) |  |  |
| `JRO_JAM` | 지로걸림(매체걸림) | CHAR(1) |  |  |
| `BKBK_JAM` | 통장걸림(매체걸림) | CHAR(1) |  |  |
| `CASH_MODULE_ERR` | 현금모듈장애(모듈장애) | CHAR(1) |  |  |
| `CHK_MODULE_ERR` | 수표모듈장애(모듈장애) | CHAR(1) |  |  |
| `DTL_MODULE_ERR` | 명세표모듈장애(모듈장애) | CHAR(1) |  |  |
| `JNAL_MODULE_ERR` | 저널모듈장애(모듈장애) | CHAR(1) |  |  |
| `CARD_MODULE_ERR` | 카드모듈장애(모듈장애) | CHAR(1) |  |  |
| `BKBK_MODULE_ERR` | 통장모듈장애(모듈장애) | CHAR(1) |  |  |
| `JRO_MODULE_ERR` | 지로모듈장애(모듈장애) | CHAR(1) |  |  |
| `ETC_ERR` | 기타장애(HD) | CHAR(1) |  |  |
| `ETC_SW_ERR` | 기타장애(SW) | CHAR(1) |  |  |
| `MODULE_REJECT` | 모듈빠짐 | CHAR(1) |  |  |
| `DEAL_SEQNO` | 거래일련번호 | NUMBER(4) |  |  |
| `DEAL_AMT` | 거래금액 | NUMBER(10) |  |  |
| `SCR_NO` | 화면번호 | VARCHAR2(4) |  |  |
| `CASH_MODEL_TYPE` | 현금입출금부Model구분 | VARCHAR2(10) |  |  |
| `NEW_CASH_STEP` | 신권운영Step | VARCHAR2(1) |  |  |
| `NEW_CASH_OPINFO` | 스테커신/구권운영정보 | VARCHAR2(1) |  |  |
| `DUP_ERR_STAT` | 중복송신 | CHAR(1) |  |  |
| `MSG_VIP_YN` | MSG_VIP_YN | CHAR(4) |  |  |
| `MATN_SND_YN` | 보수업체송신여부 | CHAR(1) |  |  |
| `SECOM_SND_YN` | 경비업체송신여부 | CHAR(1) |  |  |
| `VEND_SND_YN` | 용역업체송신여부 | CHAR(1) |  |  |
| `UMS_SND_YN` | UMS송신여부 | CHAR(1) |  |  |
| `ARS_SND_YN` | ARS송신여부 | CHAR(1) |  |  |
| `TMN_SND_YN` | 단말클라이언트송신여부 | CHAR(1) |  |  |
| `B50000_END` | 5만원권부족 | CHAR(1) |  |  |
| `B50000_NEAREND` | 5만원권부족경고 | CHAR(1) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_OP_ATM_STATHIST

**자동화기기상태이력** · 기기관리 — 자동화기기 상태의 변동 이력을 관리한다

원본 쪽: 29/39 (KakaoTalk_20261106_154124088_29.jpg), 30/39 (KakaoTalk_20261106_154124088_04.jpg), 31/39 (KakaoTalk_20261106_154235676.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `CUR_DT` | 일자 | CHAR(8) | Y | NOT NULL |
| `NO` | 상태이력일련번호 | NUMBER(9) | Y | NOT NULL |
| `CUR_TIME` | 시간 | VARCHAR2(6) | Y | NOT NULL |
| `HIST_COMM_NO` | 히스토리통번 | VARCHAR2(18) |  |  |
| `OFC_CODE` | 사무소코드 | CHAR(6) |  | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) |  | NOT NULL |
| `HIST_KIND` | 히스토리종별 | CHAR(1) |  |  |
| `HIST_SUB_KIND` | 히스토리서브종별 | CHAR(1) |  |  |
| `ERR_CODE2` | 장애에러코드 | VARCHAR2(4) |  |  |
| `POWER_OFF` | 전원OFF | CHAR(1) |  |  |
| `USE_STOP` | 중지모드(기기상태) | CHAR(1) |  |  |
| `CHK_DEPO_STOP` | 수표입금중지(9934전문) | CHAR(1) |  |  |
| `CHK_PMT_STOP` | 수표지급중지(9934전문) | CHAR(1) |  |  |
| `TRSF_STOP` | 이체거래_중지상태 | CHAR(1) |  |  |
| `ENT_STOP` | 진입중지(9934전문) | CHAR(1) |  |  |
| `WRBK_STOP` | 기장중지(9934전문) | CHAR(1) |  |  |
| `CASH_DEPO_STOP` | 입금제한거래(제한거래) | CHAR(1) |  |  |
| `CASH_PMT_STOP` | 지급제한거래(제한거래) | CHAR(1) |  |  |
| `ERR_MODE` | 장애모드(기기상태) | CHAR(1) |  |  |
| `CHK_OPEN_RCV_END` | 수표개시수신끝(9934전문) | CHAR(1) |  |  |
| `TRSF_OPEN_RCV_END` | 이체개시수신끝(9934전문) | CHAR(1) |  |  |
| `LOAD_OPEN_RCV_END` | 진입개시수신끝(9934전문) | CHAR(1) |  |  |
| `BKBK_OPEN_RCV_END` | 통장개시수신끝(9934전문) | CHAR(1) |  |  |
| `DEPO_OPEN_RCV_END` | 입금개시수신끝(9934전문) | CHAR(1) |  |  |
| `PMT_OPEN_RCV_END` | 지급개시수신끝(9934전문) | CHAR(1) |  |  |
| `WRBK_JNAL` | 기장저널(9934전문) | CHAR(1) |  |  |
| `DEAL_REST_OK` | 거래결과OK(9934전문) | CHAR(1) |  |  |
| `CHK_ACPT_TO` | 수표미수취(미수취) | CHAR(1) |  |  |
| `DTL_ACPT_TO` | 명세표미수취(미수취) | CHAR(1) |  |  |
| `CASH_ACPT_TO` | 현금미수취(미수취) | CHAR(1) |  |  |
| `BKBK_ACPT_TO` | 통장미수취(미수취) | CHAR(1) |  |  |
| `CARD_ACPT_TO` | 카드미수취(미수취) | CHAR(1) |  |  |
| `MCN_ALARM` | 기기ALARM(9934전문) | CHAR(1) |  |  |
| `SAFE_ALARM` | 금고ALARM(9934전문) | CHAR(1) |  |  |
| `SAFE_FULL` | 현금Full(매체과부족) | CHAR(1) |  |  |
| `REJ_FULL` | REJECTFULL(9934전문) | CHAR(1) |  |  |
| `JNAL_END` | 저널부족(매체과부족) | CHAR(1) |  |  |
| `DTL_END` | 명세표부족(매체과부족) | CHAR(1) |  |  |
| `B1000_END` | 천원END(9934전문) | CHAR(1) |  |  |
| `B10000_END` | 현금부족(매체과부족) | CHAR(1) |  |  |
| `RESET_HOLD` | RESET대기(9934전문) | CHAR(1) |  |  |
| `RESET_YN` | RESET가부(9934전문) | CHAR(1) |  |  |
| `JNAL_NEAREND` | 저널부족경고(매체과부족) | CHAR(1) |  |  |
| `DTL_NEAREND` | 명세표부족경고(매체과부족) | CHAR(1) |  |  |
| `B1000_NEAREND` | 천원NEAREND(9934전문) | CHAR(1) |  |  |
| `B10000_NEAREND` | 현금부족경고(매체과부족) | CHAR(1) |  |  |
| `CHK_NEAREND` | 수표부족경고(매체과부족) | CHAR(1) |  |  |
| `CHK_END` | 수표부족(매체과부족) | CHAR(1) |  |  |
| `CHK_FULL` | 수표FULL(9934전문) | CHAR(1) |  |  |
| `BKBK_END` | 통장END(9934전문) | CHAR(1) |  |  |
| `FURY_CASH_SHRT` | 순수현금부족(매체과부족) | CHAR(1) |  |  |
| `LONG_ERR_MSG` | 장장애전문 | VARCHAR2(10) |  |  |
| `ERR_SEQNO` | 장애일련번호 | VARCHAR2(4) |  |  |
| `ERR_AMT` | 장애금액 | VARCHAR2(10) |  |  |
| `DTL_ERR_STEP` | 상세장애스텝 | VARCHAR2(10) |  |  |
| `TMN_STAT` | 단말기상태 | VARCHAR2(2) |  |  |
| `SECT_OUTOFC` | 부속출장소 | CHAR(1) |  |  |
| `ARGMT_PST` | 배치장소 | CHAR(1) |  |  |
| `AP_VERS` | AP버전 | VARCHAR2(10) |  |  |
| `ATMS_RESP` | ATMS대응 | CHAR(1) |  |  |
| `AGENT_YN` | AGENT유무 | CHAR(1) |  |  |
| `MSG_TYPE` | 전문구분(MSGTYPE) | CHAR(1) |  |  |
| `MAIN_ACCT_INFO` | 주계좌정보 | VARCHAR2(24) |  |  |
| `CASH_LOAD_NOSHT` | 현금장전매수 | VARCHAR2(5) |  |  |
| `CHK_NOSHT` | EZ_수표매수 | VARCHAR2(4) |  |  |
| `CHK_NO` | 수표번호 | VARCHAR2(8) |  |  |
| `CTL_SERIAL` | 제어시리얼 | VARCHAR2(10) |  |  |
| `FUNC_GRP` | 기능분류 | CHAR(1) |  |  |
| `FUNC_NO` | 기능번호 | CHAR(1) |  |  |
| `ADDT_INFO` | 부가정보 | VARCHAR2(80) |  |  |
| `CTL_ADDT_INFO` | 제어부가정보 | VARCHAR2(80) |  |  |
| `RESP_MEMO_FLAG` | 대응메모플래그 | CHAR(1) |  |  |
| `OFC_NM` | 직장명 | VARCHAR2(40) |  |  |
| `KOM_NM` | 기종명 | VARCHAR2(40) |  |  |
| `INST_PST_NM` | 설치장소명 | VARCHAR2(40) |  |  |
| `SCRT_ARV_TIME` | 경비도착시간 | NUMBER(2) |  |  |
| `PROC_PROG` | 처리진도 | VARCHAR2(2) |  |  |
| `ERR_COMT` | 장애내용 | VARCHAR2(80) |  |  |
| `ERR_RESP` | 에러대응 | VARCHAR2(80) |  |  |
| `CTL_REST` | 제어결과 | CHAR(1) |  |  |
| `MATN_COMP_CODE` | 보수업체관리대상 | CHAR(1) |  |  |
| `OP_TYPE` | 점내외구분 | CHAR(1) |  |  |
| `INOUT_TYPE` | 입출구분(INOUTTYPE) | CHAR(1) |  |  |
| `DEAL_ERR_INFO` | 거래장애정보 | CHAR(1) |  |  |
| `ERR_DTL_STEP_INFO` | 장애상세스텝정보 | CHAR(1) |  |  |
| `CASH_LOAD_INFO` | 현금장전정보 | CHAR(1) |  |  |
| `CHK_LOAD_INFO` | 수표장전정보 | CHAR(1) |  |  |
| `STAT_INFO` | 상태정보 | CHAR(1) |  |  |
| `POWER_CTL_INFO` | 전원제어정보 | CHAR(1) |  |  |
| `MODE_CONV_INFO` | 모드전환정보 | CHAR(1) |  |  |
| `CLOSE_CTL_INFO` | 폐국제어정보 | CHAR(1) |  |  |
| `IMAGE_INFO` | 사진정보 | CHAR(1) |  |  |
| `PDL_INFO` | PDL정보 | CHAR(1) |  |  |
| `ERR_INFO` | 장애정보 | CHAR(1) |  |  |
| `SW_RESET` | SW리셋 | CHAR(1) |  |  |
| `CARD_SECT_RESET` | 카드부리셋 | CHAR(1) |  |  |
| `DTL_SECT_RESET` | 명세표부리셋 | CHAR(1) |  |  |
| `JNAL_SECT_RESET` | 저널부리셋 | CHAR(1) |  |  |
| `BKBK_SECT_RESET` | 통장부리셋 | CHAR(1) |  |  |
| `CASH_SECT_RESET` | 현금부리셋 | CHAR(1) |  |  |
| `CHK_SECT_RESET` | 수표부리셋 | CHAR(1) |  |  |
| `CARD_DISCHG_WITH` | 카드배출회수 | CHAR(1) |  |  |
| `BKBK_DISCHG_WITH` | 통장배출회수 | CHAR(1) |  |  |
| `DTL_DISCHG_WITH` | 명세표배출회수 | CHAR(1) |  |  |
| `CASH_WITH` | 현금회수 | CHAR(1) |  |  |
| `CHK_WITH` | 수표회수 | CHAR(1) |  |  |
| `AP_LOG_INFO` | AP로그정보 | CHAR(1) |  |  |
| `IMAGE_FILE_INFO` | 사진파일정보 | CHAR(1) |  |  |
| `ELEC_JNAL_INFO` | 전자저널정보 | CHAR(1) |  |  |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) |  | NOT NULL |
| `SRC` | 기종_구분_코드(SELECT SRC,SRC_NM FROM …) | VARCHAR2(2) |  |  |
| `SCRT_CODE` | 경비업체 | VARCHAR2(2) |  |  |
| `CUR_DAY_ON_YN` | 당일ON여부 | CHAR(1) |  |  |
| `VEND_CODE` | 업체코드 | VARCHAR2(2) |  |  |
| `MSG_SEQNO` | 전문일련번호 | NUMBER(4) |  |  |
| `ERR_TIME` | 에러발생시간 | CHAR(6) |  |  |
| `DEV_CODE` | Device코드 | CHAR(2) |  |  |
| `ERR_CODE` | 장애코드 | CHAR(2) |  |  |
| `ERR_RANK_CODE` | Error구분 | CHAR(2) |  |  |
| `ERR_STAT01~ERR_STAT10` | 장애상태01~10 | CHAR(8) 각각 |  |  |
| `ERR_TYPE` | 오류구분 | CHAR(1) |  |  |
| `MGT_MODE` | 관리모드(기기상태) | CHAR(1) |  |  |
| `HOST_ORD` | HOST지시(기기상태) | CHAR(1) |  |  |
| `AUTO_RECV` | 자동복구(기기상태) | CHAR(1) |  |  |
| `BKBK_LM_DEAL` | 통장제한거래(제한거래) | CHAR(1) |  |  |
| `TRSF_LM_DEAL` | 이체제한거래(제한거래) | CHAR(1) |  |  |
| `BC_LM_DEAL` | 비씨제한거래(제한거래) | CHAR(1) |  |  |
| `OBK_LM_DEAL` | 타행제한거래(제한거래) | CHAR(1) |  |  |
| `JRO_LM_DEAL` | 지로제한거래(제한거래) | CHAR(1) |  |  |
| `JRO_ACPT_TO` | 지로미수취(미수취) | CHAR(1) |  |  |
| `CASH_JAM / CHK_JAM / DTL_JAM / JNAL_JAM / CARD_JAM / JRO_JAM / BKBK_JAM` | 현금·수표·명세표·저널·카드·지로·통장 걸림(매체걸림) | CHAR(1) 각각 |  |  |
| `CASH_MODULE_ERR / CHK_ / DTL_ / JNAL_ / CARD_ / BKBK_ / JRO_MODULE_ERR` | 현금·수표·명세표·저널·카드·통장·지로 모듈장애(모듈장애) | CHAR(1) 각각 |  |  |
| `ETC_ERR` | 기타장애(HD) | CHAR(1) |  |  |
| `ETC_SW_ERR` | 기타장애(SW) | CHAR(1) |  |  |
| `MODULE_REJECT` | 모듈빠짐 | CHAR(1) |  |  |
| `DEAL_SEQNO` | 거래일련번호 | NUMBER(4) |  |  |
| `DEAL_AMT` | 거래금액 | NUMBER(10) |  |  |
| `SCR_NO` | 화면번호 | VARCHAR2(4) |  |  |
| `MATN_SND_YN` | 보수업체송신여부 | CHAR(1) |  |  |
| `SECOM_SND_YN` | 경비업체송신여부 | CHAR(1) |  |  |
| `VEND_SND_YN` | 용역업체송신여부 | CHAR(1) |  |  |
| `UMS_SND_YN` | UMS송신여부 | CHAR(1) |  |  |
| `TMN_SND_YN` | 단말클라이언트송신여부 | CHAR(1) |  |  |
| `ARS_SND_YN` | ARS송신여부 | CHAR(1) |  |  |
| `DUP_ERR_STAT` | 중복송신 | CHAR(1) |  |  |
| `B50000_END` | 5만원권부족 | CHAR(1) |  |  |
| `B50000_NEAREND` | 5만원권부족경고 | CHAR(1) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_OP_DEAL_OFCSUM

**거래집계** · 기기관리 — 사무소별 거래 건수 및 금액의 집계를 관리한다

원본 쪽: 31/39 (KakaoTalk_20261106_154235676.jpg), 32/39 (KakaoTalk_20261106_154124088_03.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `DEAL_DT` | 거래일자 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `DEAL_TIME` | 거래시간 | CHAR(6) | Y | NOT NULL |
| `CASH_PMT_CNT` | 현금지급건수 | NUMBER(8) |  |  |
| `CASH_PMT_AMT` | 현금지급금액 | NUMBER(12) |  |  |
| `CHK_PMT_CNT` | 수표지급건수 | NUMBER(8) |  |  |
| `CHK_PMT_AMT` | 수표발행액금액단위:원 | NUMBER(12) |  |  |
| `CASH_DEPO_CNT` | 현금입금건수 | NUMBER(8) |  |  |
| `CASH_DEPO_AMT` | 현금입금금액 | NUMBER(12) |  |  |
| `CHK_DEPO_CNT` | 수표입금건수 | NUMBER(8) |  |  |
| `CHK_DEPO_AMT` | 수표입금액금액단위:원 | NUMBER(12) |  |  |
| `B10000_PMT_AMT` | 만원권_출금_금액 | NUMBER(12) |  |  |
| `B50000_PMT_AMT` | 오만원권_출금_금액 | NUMBER(12) |  |  |
| `B1000_DEPO_AMT` | 천원권_입금_금액 | NUMBER(12) |  |  |
| `B5000_DEPO_AMT` | 오천원권_입금_금액 | NUMBER(12) |  |  |
| `B10000_DEPO_AMT` | 만원권_입금_금액 | NUMBER(12) |  |  |
| `B50000_DEPO_AMT` | 오만원권_입금_금액 | NUMBER(12) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_OP_FUND_DEMD

**운영자금청구서** · 기기관리 — 자동화기기 운영자금의 청구 정보를 관리한다

원본 쪽: 32/39 (KakaoTalk_20261106_154124088_03.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `PROC_DT` | 날짜 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `REQ_DT` | 요청일자 | CHAR(8) |  |  |
| `FUND_USE_BGN_DT` | 자금소요시작일 | CHAR(8) |  |  |
| `FUND_USE_END_DT` | 자금소요종료일 | CHAR(8) |  |  |
| `FUND_USE_TERM` | 자금소요기간 | VARCHAR2(2) |  |  |
| `TOT_TRANS_AMT` | 총현송액 | NUMBER(15) |  |  |
| `AF_TRANS_AMT` | 익일현송액 | NUMBER(15) |  |  |
| `BF_ADDT_TRANS_AMT` | 전일추가현송액 | NUMBER(15) |  |  |
| `BF_WITH_CLOSE_AMT` | 전일회수마감액 | NUMBER(15) |  |  |
| `EXCES_OCCR_AMT` | 초과발생액 | NUMBER(15) |  |  |
| `NADJ_B1000_BF_BAL_AMT` | 미정산천원전잔액 | NUMBER(15) |  |  |
| `USE_FUND_AMT` | 소요자금액 | NUMBER(15) |  |  |
| `NADJ_B1000_BAL_AMT` | 미정산천원잔액 | NUMBER(15) |  |  |
| `BAL_AMT` | 잔액(재고액) | NUMBER(15) |  |  |
| `MGT_OFC_CODE` | 관리사무소 | VARCHAR2(20) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_OP_RESOURCE

**운영자원** · 기기관리 — 외부 시스템과 연계하는 전산기기 자원정보를 관리한다

원본 쪽: 32/39 (KakaoTalk_20261106_154124088_03.jpg), 33/39 (KakaoTalk_20261106_154124088_28.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `SERIAL_NO` | 제품번호 | VARCHAR2(20) |  |  |
| `VEND_CODE` | 업체코드 | VARCHAR2(2) |  |  |
| `OP_TYPE` | 점내외구분 | CHAR(1) |  |  |
| `INOUT_TYPE` | 입출구분(INOUTTYPE) | CHAR(1) |  |  |
| `LOAD_DT` | 개국일자-YYYYMMDD | CHAR(8) |  |  |
| `STAT` | 상태(1:출력요구,2:출력완료,3:사용자확인) | VARCHAR2(2) |  |  |
| `MCN_TYPE` | 기기구분 | VARCHAR2(2) |  |  |
| `MODEL_CODE` | 모델코드 | VARCHAR2(2) |  |  |
| `SRC` | 기종_구분_코드(SELECT SRC,SRC_NM FROM …) | VARCHAR2(2) |  |  |
| `OS_TYPE` | BPOS | VARCHAR2(10) |  |  |
| `MEMORY` | 메모리-CLASS=RC,TXT_VALUE1=MM | VARCHAR2(10) |  |  |
| `CPU` | CPU-CLASS=RC,TXT_VALUE1=CP | VARCHAR2(12) |  |  |
| `CLOCK` | CPUCLOCKSPEED-CLASS=RC,TXT_VALUE… | VARCHAR2(10) |  |  |
| `HDD_QTY` | 하드디스크장착개수 | NUMBER(2) |  |  |
| `USEFUL_HDD1` | 하드디스크1가용량 | VARCHAR2(10) |  |  |
| `HDD1` | 하드디스크1총용량 | VARCHAR2(10) |  |  |
| `CASH_TYPE` | 권종 | VARCHAR2(3) |  |  |
| `CASH_BOX` | 현금박스개수 | VARCHAR2(3) |  |  |
| `CHECK_BOX` | 수표박스개수 | VARCHAR2(3) |  |  |
| `IP` | IP | VARCHAR2(15) |  |  |
| `MAC_ADDRESS` | 맥어드레스 | VARCHAR2(20) |  |  |
| `PROTOCOL` | 회선방식 | VARCHAR2(10) |  |  |
| `SPEED` | 전송속도 | VARCHAR2(10) |  |  |
| `SW_VER` | S/W버전 | VARCHAR2(10) |  |  |
| `BANK_ON_YN` | 뱅크온장착여부-MOBILE과동일 | CHAR(1) |  |  |
| `K_CASH_YN` | K-CASH장착여부 | CHAR(1) |  |  |
| `MYBI_YN` | MYBI장착여부 | CHAR(1) |  |  |
| `IC_CARD_YN` | 금융IC카드장착여부 | CHAR(1) |  |  |
| `EMV1` | EMV1 | CHAR(1) |  |  |
| `EMV2` | EMV2 | CHAR(1) |  |  |
| `RESERVE_YN10` | SEED | CHAR(1) |  |  |
| `RESERVE_YN11` | 보안 | CHAR(1) |  |  |
| `RESERVE_YN12` | 백신 | CHAR(1) |  |  |
| `RESERVE_YN20` | MOBILE | CHAR(1) |  |  |
| `RESERVE_YN21` | DES | CHAR(1) |  |  |
| `RESERVE_YN22` | CAMERA | CHAR(1) |  |  |
| `RESERVE_YN23` | SOUND | CHAR(1) |  |  |
| `RESERVE_YN24` | TOUCH | CHAR(1) |  |  |
| `RESERVE_YN25` | UPS | CHAR(1) |  |  |
| `RESERVE_YN30` | CD-ROM | CHAR(1) |  |  |
| `SERVICE_YN` | 용역관리 | CHAR(1) |  |  |
| `CHANGE_AP_YN` | ATMS대응 | CHAR(1) |  |  |
| `SETUP_DATE` | 도입일자-이관시갱신여부에따라init_setup… | VARCHAR2(8) |  |  |
| `INF_DATE` | 전송일시 | DATE |  |  |
| `INSERT_DATE` | 입력일시 | DATE |  | NOT NULL |
| `INSERT_PSN` | 생성자 | VARCHAR2(13) |  | NOT NULL |
| `MCN_HW_INFO` | 기기H/W정보 | VARCHAR2(200) |  |  |
| `OP_UPS` | OP_UPS | CHAR(1) |  |  |
| `OP_TOUCH` | OP_TOUCH | CHAR(1) |  |  |
| `OP_SOUND` | OP_SOUND | CHAR(1) |  |  |
| `OP_CAMERA` | OP_CAMERA | CHAR(1) |  |  |
| `OP_DES` | OP_DES | CHAR(1) |  |  |
| `OP_MOBILE` | OP_MOBILE | CHAR(1) |  |  |
| `NEWCASH_OP_STEP` | NEWCASH_OP_STEP | CHAR(2) |  |  |
| `NEWCASH_SUPPLY2` | NEWCASH_SUPPLY2 | CHAR(1) |  |  |
| `NEWCASH_SUPPLY1` | NEWCASH_SUPPLY1 | CHAR(1) |  |  |
| `NEWCASH_FLOWBOX4` | NEWCASH_FLOWBOX4 | CHAR(1) |  |  |
| `NEWCASH_FLOWBOX3` | NEWCASH_FLOWBOX3 | CHAR(1) |  |  |
| `NEWCASH_FLOWBOX2` | NEWCASH_FLOWBOX2 | CHAR(1) |  |  |
| `NEWCASH_FLOWBOX1` | NEWCASH_FLOWBOX1 | CHAR(1) |  |  |
| `ADV_ID` | ADV_ID | VARCHAR2(10) |  |  |
| `RF_MOBILE` | RF_MOBILE | CHAR(1) |  |  |
| `OP_RF_MOBILE` | OP_RF_MOBILE | CHAR(1) |  |  |
| `FWVER` | 펌웨어버전정보 | VARCHAR2(20) |  |  |
| `FIVE_BANKNOTE` | 5만원권동작여부 | CHAR(1) |  |  |
| `OP_FIVE_BANKNOTE` | 5만원권설정여부 | CHAR(1) |  |  |
| `RESERVE_YN31` | BMGuard설치여부 | CHAR(1) |  |  |
| `RESERVE_YN42` | RESERVE_YN42 | CHAR(1) |  |  |
| `RESERVE` | RESERVE | VARCHAR2(20) |  |  |
| `RESERVE_YN32` | OS패치여부 | CHAR(1) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_OP_RMT_ORD

**원격지시이력** · 기기관리 — 자동화기기에 대한 원격지시 및 수행 이력을 관리한다

원본 쪽: 33/39 (KakaoTalk_20261106_154124088_28.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `ORD_DT` | 지시일자 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `ORD_TIME` | 지시시간 | VARCHAR2(6) | Y | NOT NULL |
| `COUNS_NO` | 상담번호 | VARCHAR2(10) |  |  |
| `ORD_ITEM` | 지시항목 | VARCHAR2(50) |  |  |
| `PROC_REST` | 처리결과 | CHAR(1) |  |  |
| `RESP_YN` | 응답여부 | CHAR(1) |  |  |
| `PER_NO` | 담당텔러 | VARCHAR2(9) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_OP_RMT_ORDPLAN

**원격지시계획** · 기기관리 — 자동화기기 원격지시의 예약 및 실행 계획을 관리한다

원본 쪽: 33/39 (KakaoTalk_20261106_154124088_28.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `CLS_PLAN_YN` | 폐국계획여부(Y:예약,N:미사용) | CHAR(1) |  |  |
| `CLS_PLAN_TIME` | 폐국계획시간 | VARCHAR2(4) |  |  |
| `TOT_PLAN_YN` | 합계계획여부(Y:예약,N:미사용) | CHAR(1) |  |  |
| `TOT_PLAN_TIME` | 합계계획시간 | VARCHAR2(4) |  |  |
| `TOT_AFT_IND` | 합계후지시(0:DOWN,1:OPEN) | CHAR(1) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_SCRT_ERR_MGT

**경비업체장애관리** · 기기관리 — 경비업체와 연계한 장애 접수 및 처리 내역을 관리한다

원본 쪽: 33/39 (KakaoTalk_20261106_154124088_28.jpg), 34/39 (KakaoTalk_20261106_154124088_01.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OCCR_DT` | 장애발생일자 | CHAR(8) | Y | NOT NULL |
| `VEND_CODE` | 업체코드 | VARCHAR2(2) | Y | NOT NULL |
| `SEQNO` | 일련번호(SQ_CO_REQSEQ.NEXTVAL) | NUMBER(6) | Y | NOT NULL |
| `OCCR_TIME` | 발생시간 | VARCHAR2(6) |  |  |
| `RCVR_DT` | 복구발생일자 | CHAR(8) |  |  |
| `RCVR_TIME` | 복구시간 | VARCHAR2(6) |  |  |
| `SND_DT` | 송신일자 | CHAR(8) |  |  |
| `SND_TIME` | 송신시간 | VARCHAR2(6) |  | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) |  | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) |  | NOT NULL |
| `VEND_MGT_ID` | 업체관리ID | VARCHAR2(10) |  |  |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) |  |  |
| `SCRT_ERR_CODE` | 경비장애코드 | VARCHAR2(2) |  | NOT NULL |
| `OP_TYPE` | 점내외구분 | CHAR(1) |  | NOT NULL |
| `INOUT_TYPE` | 입출구분(INOUTTYPE) | CHAR(1) |  | NOT NULL |
| `SRC` | 기종_구분_코드(SELECT SRC,SRC_NM FROM …) | VARCHAR2(2) |  | NOT NULL |
| `DEV_CODE` | Device코드 | VARCHAR2(2) |  |  |
| `ERR_CODE` | 장애코드 | VARCHAR2(2) |  |  |
| `ERR_TYPE` | 오류구분 | CHAR(1) |  |  |
| `RECEIPT_NO` | 접수번호 | VARCHAR2(10) |  |  |
| `ARV_DT` | 도착일(YYYYMMDD) | CHAR(8) |  |  |
| `ARV_TIME` | 도착시간(HHMMSS) | VARCHAR2(6) |  |  |
| `ARV_CE_NM` | 도착CE이름 | VARCHAR2(20) |  |  |
| `ARV_CE_TEL` | 도착CE연락처 | VARCHAR2(20) |  |  |
| `ERR_STAT` | 장애상태 | CHAR(1) |  | NOT NULL |
| `ARV_STAT` | 도착상태 | CHAR(1) |  | NOT NULL |
| `RESND_CNT` | 재전송횟수 | NUMBER(2) |  | NOT NULL |
| `RESND_REST` | 재전송결과(응답전문) | CHAR(1) |  | NOT NULL |
| `RESP_CODE` | 응답코드참고 | VARCHAR2(2) |  |  |
| `MSG_SEQNO` | 전문일련번호 | NUMBER(4) |  |  |
| `ERR_RANK_CODE` | Error구분 | VARCHAR2(2) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_SCRT_INST_PST

**설치위치/업체관리ID매칭코드** · 기기관리 — 설치위치와 경비업체 관리ID의 매핑 정보를 관리한다

원본 쪽: 34/39 (KakaoTalk_20261106_154124088_01.jpg), 35/39 (KakaoTalk_20261106_154124088_26.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `INST_PST_CODE` | 코너코드 | VARCHAR2(3) | Y | NOT NULL |
| `INST_PST_NM` | 설치장소명 | VARCHAR2(80) |  | NOT NULL |
| `VEND_CODE` | 업체코드 | VARCHAR2(2) |  | NOT NULL |
| `VEND_MGT_ID` | 업체관리ID | VARCHAR2(10) |  |  |
| `OP_TYPE` | 점내외구분 | CHAR(1) |  |  |
| `INOUT_TYPE` | 입출구분(INOUTTYPE) | CHAR(1) |  |  |
| `USE_YN` | 사용유무 | CHAR(1) |  | NOT NULL |
| `INS_DATE` | 설치일시 | DATE |  |  |
| `INS_PSN` | INS_PSN | VARCHAR2(20) |  |  |
| `INS_MEMO` | INS_MEMO | VARCHAR2(40) |  |  |
| `DEL_DATE` | DEL_DATE | DATE |  |  |
| `DEL_PSN` | DEL_PSN | VARCHAR2(20) |  |  |
| `DEL_MEMO` | DEL_MEMO | VARCHAR2(40) |  |  |
| `SCRT_BRCH_NM` | 경비업체지사명 | VARCHAR2(40) |  |  |
| `SCRT_TEL` | 경비업체전화번호 | VARCHAR2(20) |  |  |
| `SCRT_FAX` | 경비업체팩스번호 | VARCHAR2(20) |  |  |
| `CONT_STAT` | 계약상태 | CHAR(1) |  |  |
| `APRV_REST_CODE` | 승인결과코드 | VARCHAR2(2) |  |  |
| `CONT_REQ_DT` | 계약요청일자 | CHAR(8) |  |  |
| `CONT_REQ_TIME` | 계약요청시간 | VARCHAR2(6) |  |  |
| `CONT_RESP_DT` | 계약응답일자 | CHAR(8) |  |  |
| `CONT_REST_TIME` | 계약응답시간 | VARCHAR2(6) |  |  |
| `CONT_BGN_DT` | 계약시작일자 | CHAR(8) |  |  |
| `CONT_BGN_TIME` | 계약시작시간 | VARCHAR2(6) |  |  |
| `CONT_END_DT` | 계약종료일자 | CHAR(8) |  |  |
| `CONT_END_TIME` | 계약종료시간 | VARCHAR2(6) |  |  |
| `OFC_DIST` | 사무소와의거리 | VARCHAR2(2) |  |  |
| `OP_BGN_TIME` | 영업시작시간 | VARCHAR2(4) |  |  |
| `OP_END_TIME` | 영업_종료_시간 | VARCHAR2(4) |  |  |
| `CASH_GOING` | CASH_GOING | CHAR(1) |  |  |
| `CONFIRM_YN` | CONFIRM_YN | CHAR(1) |  |  |
| `BANKHOLIDAY_OP` | BANKHOLIDAY_OP | VARCHAR2(1) |  |  |
| `REQ_PERSON` | REQ_PERSON | VARCHAR2(9) |  |  |
| `IAL_SEV_VEND_OP_YN` | 일괄_용역_업체_운영_여부 | CHAR(1) |  |  |
| `IAL_SEV_VEND_CODE` | 일괄_용역_업체_코드 | VARCHAR2(3) |  |  |
| `SEV_MGT_BGN_DT` | 용역_관리_시작_일자 | CHAR(8) |  |  |
| `SEV_MGT_END_DT` | 용역_관리_종료_일자 | CHAR(8) |  |  |
| `CNR_PST_SPEC_CODE` | 코너_장소_특성_코드 | CHAR(2) |  |  |
| `CNR_PST_ETC_SPEC_DESC` | 코너_장소_기타_특성_설명 | VARCHAR2(200) |  |  |
| `IAL_SEVCH_RGLPRC` | 일괄_용역료_조정가 | NUMBER(10) |  |  |
| `SLA_VALU_TARGET_YN` | SLA_평가_대상_여부 | CHAR(1) |  |  |
| `CHK_BIZ_YN` | 수표_업무_여부 | CHAR(1) |  |  |
| `BLT_OLD_OFC_CODE` | 소속영업점코드(기존물리적영업점) | CHAR(6) |  |  |
| `INST_PST_OP_KIND` | 코너_운영_구분 | CHAR(2) |  |  |
| `AREA_CODE` | 지역코드 | VARCHAR2(2) |  |  |
| `CITY_CODE` | 시군코드 | VARCHAR2(3) |  |  |
| `CCTV_YN` | CCT_설치여부 | CHAR(1) |  |  |
| `NEAR_POLICE` | 인근_파출소 | VARCHAR2(50) |  |  |
| `NEAR_POLICE_TEL` | 인근_파출소_TEL | VARCHAR2(14) |  |  |
| `UNH_STORE_YN` | 무인점포_여부 | CHAR(1) |  |  |
| `SEV_AMT_TYPE` | 수표_업무_코드(TB_CO_CODE:CHK_BIZ) | VARCHAR2(1) |  |  |
| `CHK_BIZ_CODE` | 수표_업무_코드 | VARCHAR2(2) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_SCRT_INST_PST_HIST

**설치위치/업체관리ID매칭코드사용이력** · 기기관리 — 설치위치와 업체 관리ID 간 매칭코드의 사용 이력을 관리한다

원본 쪽: 36/39 (KakaoTalk_20261106_154124088_02.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `HIST_TIME` | 이력시간 | VARCHAR2(14) | Y | NOT NULL |
| (동일) | TB_SCRT_INST_PST의 OFC_CODE~CHK_BIZ_CODE 와 같은 컬럼·타입 (순서 동일, 이 테이블에서는 전부 PK 아님·NULL 허용. 속성명 설치일시→INS_DATE, 삭제일시→DEL_DATE) |  |  |  |
| `HIST_KIND` | 이력종류 | VARCHAR2(12) |  |  |
| `ETC_MEMO1` | 기타메모1 | VARCHAR2(50) |  |  |
| `ETC_MEMO2` | 기타메모2 | VARCHAR2(50) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_SCR_AUTH

**사용자별업무권한** · 기기관리 — 사용자별 업무시스템 권한을 관리한다

원본 쪽: 38/39 (KakaoTalk_20261106_154124088.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `DEPT_CODE` | 부서코드 | CHAR(6) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `PER_NO` | 개인번호 | VARCHAR2(9) | Y | NOT NULL |
| `AUTH` | 권한 | VARCHAR2(2) |  | NOT NULL |
| `INS_DATE` | 등록일시 | CHAR(14) |  | NOT NULL |
| `INS_ID` | 등록자 | CHAR(9) |  | NOT NULL |
| `APV_STS` | 승인상태 | CHAR(2) |  | NOT NULL |
| `MEMO` | 메모 | VARCHAR2(100) |  |  |
| `DUE_DATE` | 만료일시 | CHAR(14) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_SCR_AUTH_HIST

**사용자별업무권한** · 기기관리

원본 쪽: 38/39 (KakaoTalk_20261106_154124088.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `DEPT_CODE` | 부서코드 | CHAR(6) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `PER_NO` | 개인번호 | VARCHAR2(9) | Y | NOT NULL |
| `AUTH` | 권한 | VARCHAR2(2) |  | NOT NULL |
| `APV_STS` | 승인상태 | CHAR(2) |  | NOT NULL |
| `MEMO` | 메모 | VARCHAR2(100) |  |  |
| `DUE_DATE` | 만료일시 | CHAR(14) |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_SCR_AUTH_MENU

**권한별메뉴관리** · 기기관리 — 권한별 메뉴 접근 권한을 관리한다

원본 쪽: 38/39 (KakaoTalk_20261106_154124088.jpg), 39/39 (KakaoTalk_20261106_154124088_25.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `AUTH` | 권한코드 | VARCHAR2(2) | Y | NOT NULL |
| `MENU_ID` | 메뉴ID | VARCHAR2(10) | Y | NOT NULL |
| `QRY_ROL_YN` | 조회권한여부 | CHAR(1) |  | NOT NULL |
| `REG_ROL_YN` | 등록권한여부 | CHAR(1) |  | NOT NULL |
| `UPD_ROL_YN` | 수정권한여부 | CHAR(1) |  | NOT NULL |
| `DEL_ROL_YN` | 삭제권한여부 | CHAR(1) |  | NOT NULL |
| `EXE_ROL_YN` | 업무실행권한여부 | CHAR(1) |  | NOT NULL |
| `USE_YN` | 사용여부 | CHAR(1) |  | NOT NULL |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_SCR_MENU

**업무시스템메뉴** · 기기관리 — 업무시스템 메뉴를 관리한다

원본 쪽: 38/39 (KakaoTalk_20261106_154124088.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `MENU_ID` | 메뉴ID | VARCHAR2(10) | Y | NOT NULL |
| `PARENT_MENU_ID` | 상위메뉴ID | VARCHAR2(10) |  | NOT NULL |
| `MENU_NM` | 메뉴명 | VARCHAR2(100) |  | NOT NULL |
| `MENU_TYPE` | 메뉴타입(G:그룹, M:화면) | CHAR(1) |  | NOT NULL |
| `MENU_PATH` | 메뉴경로 | VARCHAR2(300) |  |  |
| `SORT_NO` | 메뉴순서 | NUMBER(5) |  | NOT NULL |
| `USE_YN` | 사용여부 | CHAR(1) |  | NOT NULL |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

### TB_STM_HOP_PSTT

**STM호퍼현황** · 기기관리 — STM 호퍼의 상태 및 현황 정보를 관리한다

원본 쪽: 36/39 (KakaoTalk_20261106_154124088_02.jpg), 37/39 (KakaoTalk_20261106_154124088_27.jpg)

| 컬럼명 | 속성명 | 데이터타입 | PK | NULL |
|---|---|---|---|---|
| `DEAL_DATE` | 거래날짜 | CHAR(8) | Y | NOT NULL |
| `OFC_CODE` | 사무소코드 | CHAR(6) | Y | NOT NULL |
| `MCN_NO` | 기번 | CHAR(3) | Y | NOT NULL |
| `DEAL_TIME` | 거래시간 | CHAR(6) | Y | NOT NULL |
| `SEQ_NO` | 순번 | VARCHAR2(18) | Y | NOT NULL |
| `DEAL_GBN` | 거래구분 | VARCHAR2(2) |  |  |
| `A4_LACK` | A4_LACK | VARCHAR2(1) |  |  |
| `PB_WDR_BOX` | PB_WDR_BOX | NUMBER(4) |  |  |
| `CD_RJT_BOX` | CD_RJT_BOX | NUMBER(4) |  |  |
| `CD_WDR_BOX` | CD_WDR_BOX | NUMBER(4) |  |  |
| `HOPn_INP_GBN / HOPn_INP_CODE / HOPn_RM_CNT` | 호퍼 1~11 각각 (n=1..11): INP_GBN VARCHAR2(4), INP_CODE VARCHAR2(20), RM_CNT NUMBER(4) — 33개 |  |  |  |
| (감사 4컬럼) | CRT_DTM, CRT_CMENO, LSCHG_DTM, LS_CMENO | CHAR(14)/VARCHAR2(9) |  |  |

## 3. 원본 사진 ↔ 쪽 대응

| 사진 | 문서 | 쪽 |
|---|---|---|
| `KakaoTalk_20261106_154124088.jpg` | 컬럼 정의 | 38/39 |
| `KakaoTalk_20261106_154124088_01.jpg` | 컬럼 정의 | 34/39 |
| `KakaoTalk_20261106_154124088_02.jpg` | 컬럼 정의 | 36/39 |
| `KakaoTalk_20261106_154124088_03.jpg` | 컬럼 정의 | 32/39 |
| `KakaoTalk_20261106_154124088_04.jpg` | 컬럼 정의 | 30/39 |
| `KakaoTalk_20261106_154124088_05.jpg` | 컬럼 정의 | 28/39 |
| `KakaoTalk_20261106_154124088_06.jpg` | 컬럼 정의 | 24/39 |
| `KakaoTalk_20261106_154124088_07.jpg` | 컬럼 정의 | 26/39 |
| `KakaoTalk_20261106_154124088_08.jpg` | 컬럼 정의 | 22/39 |
| `KakaoTalk_20261106_154124088_09.jpg` | 컬럼 정의 | 20/39 |
| `KakaoTalk_20261106_154124088_10.jpg` | 컬럼 정의 | 18/39 |
| `KakaoTalk_20261106_154124088_11.jpg` | 컬럼 정의 | 16/39 |
| `KakaoTalk_20261106_154124088_12.jpg` | 컬럼 정의 | 14/39 |
| `KakaoTalk_20261106_154124088_13.jpg` | 컬럼 정의 | 12/39 |
| `KakaoTalk_20261106_154124088_14.jpg` | 컬럼 정의 | 10/39 |
| `KakaoTalk_20261106_154124088_15.jpg` | 컬럼 정의 | 8/39 |
| `KakaoTalk_20261106_154124088_16.jpg` | 컬럼 정의 | 6/39 |
| `KakaoTalk_20261106_154124088_17.jpg` | 컬럼 정의 | 4/39 |
| `KakaoTalk_20261106_154124088_18.jpg` | 컬럼 정의 | 2/39 |
| `KakaoTalk_20261106_154124088_19.jpg` | 테이블 목록 | 6/6 |
| `KakaoTalk_20261106_154124088_20.jpg` | 테이블 목록 | 5/6 |
| `KakaoTalk_20261106_154124088_21.jpg` | 테이블 목록 | 4/6 |
| `KakaoTalk_20261106_154124088_22.jpg` | 테이블 목록 | 3/6 |
| `KakaoTalk_20261106_154124088_23.jpg` | 테이블 목록 | 2/6 |
| `KakaoTalk_20261106_154124088_24.jpg` | 테이블 목록 | 1/6 |
| `KakaoTalk_20261106_154124088_25.jpg` | 컬럼 정의 | 39/39 |
| `KakaoTalk_20261106_154124088_26.jpg` | 컬럼 정의 | 35/39 |
| `KakaoTalk_20261106_154124088_27.jpg` | 컬럼 정의 | 37/39 |
| `KakaoTalk_20261106_154124088_28.jpg` | 컬럼 정의 | 33/39 |
| `KakaoTalk_20261106_154124088_29.jpg` | 컬럼 정의 | 29/39 |
| `KakaoTalk_20261106_154235676.jpg` | 컬럼 정의 | 31/39 |
| `KakaoTalk_20261106_154235676_01.jpg` | 컬럼 정의 | 25/39 |
| `KakaoTalk_20261106_154235676_02.jpg` | 컬럼 정의 | 27/39 |
| `KakaoTalk_20261106_154235676_03.jpg` | 컬럼 정의 | 27/39 |
| `KakaoTalk_20261106_154235676_04.jpg` | 컬럼 정의 | 23/39 |
| `KakaoTalk_20261106_154235676_05.jpg` | 컬럼 정의 | 21/39 |
| `KakaoTalk_20261106_154235676_06.jpg` | 컬럼 정의 | 19/39 |
| `KakaoTalk_20261106_154235676_07.jpg` | 컬럼 정의 | 17/39 |
| `KakaoTalk_20261106_154235676_08.jpg` | 컬럼 정의 | 15/39 |
| `KakaoTalk_20261106_154235676_09.jpg` | 컬럼 정의 | 13/39 |
| `KakaoTalk_20261106_154235676_10.jpg` | 컬럼 정의 | 11/39 |
| `KakaoTalk_20261106_154235676_11.jpg` | 컬럼 정의 | 9/39 |
| `KakaoTalk_20261106_154235676_12.jpg` | 컬럼 정의 | 5/39 |
| `KakaoTalk_20261106_154235676_13.jpg` | 컬럼 정의 | 7/39 |
| `KakaoTalk_20261106_154235676_14.jpg` | 컬럼 정의 | 3/39 |
| `KakaoTalk_20261106_154235676_15.jpg` | 컬럼 정의 | 1/39 |
