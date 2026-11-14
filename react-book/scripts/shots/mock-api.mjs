#!/usr/bin/env node
/**
 * 책 스크린샷용 가짜 백엔드 (node:http 만 사용, 외부 패키지 없음).
 *
 *   node scripts/shots/mock-api.mjs            → http://localhost:8080 (PORT 환경변수로 변경)
 *   MOCK_DELAY_MS=400 node scripts/shots/mock-api.mjs   → 모든 응답을 0.4초 늦춘다(로딩 모습을 잡을 때)
 *
 * 프론트(nh-atms-common-main/Frontend/nh-atms-web)가 부르는 /api/** 를 전부 받는다.
 *  - 응답 모양 = docs/07_API_계약.md 의 봉투 { success, message, code, data } 와 domain/*.ts 필드 이름 그대로
 *  - 문구 = atms-common api-messages.tsv 그대로(아래 MESSAGES)
 *  - 로그인: 세션 쿠키(JSESSIONID). 로그인 전 /api/** → 401 ME_002 (프론트가 /login 으로 보낸다)
 *  - 자료는 전부 지어낸 것이다(사람 이름·개인번호·사무소·업체·기종). 실제 값은 하나도 없다.
 *
 * 로그인 계정(비밀번호는 빈 값만 아니면 아무거나):
 *   99000101 김하늘  권한 A  관리자 — 버튼 5종(조회·등록·수정·삭제·실행) 모두 가능
 *   99000202 이도윤  권한 T  조회·등록·수정 (삭제·실행 불가)
 *   99000303 박서진  권한 L  조회 전용 (쓰기 버튼이 전부 흐려진다)
 *   그 밖의 TB_INSA(아래 PERSONS) 개인번호 → 권한 행이 없는 일반 사용자로 조회 전용과 같다.
 *   목록에 없는 개인번호(예: 000000000) → 400 LGN_001
 *
 * 모르는 /api 주소가 오면 404 SYS_404 로 답하고 화면에 크게 찍는다(unknown 배열에도 쌓는다).
 */
import http from 'node:http';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

/* ================================================================== 문구(api-messages.tsv) */
export const MESSAGES = {
  '0000': '정상 처리되었습니다.',
  E404: '개인번호를 확인하세요.',
  NTC_001: '공지사항을 찾을 수 없습니다.',
  S001: '저장되었습니다.',
  S002: '등록되었습니다.',
  S003: '수정되었습니다.',
  S004: '삭제되었습니다.',
  S005: '{0}건 삭제되었습니다.',
  SYS_401: '사용자 확인이 필요합니다.',
  SYS_403: '접근 권한이 없습니다.',
  SYS_404: '요청한 주소를 찾을 수 없습니다.',
  SYS_405: '지원하지 않는 요청 방식입니다: {0}',
  SYS_500: '시스템 오류가 발생했습니다.',
  V001_20: '사무소코드는 필수입니다.',
  VAL_001: '입력값이 올바르지 않습니다: {0}',
  VAL_002: '필수 파라미터가 없습니다: {0}',
  VAL_003: '파라미터 형식이 올바르지 않습니다: {0}',
  VAL_004: '요청 내용을 읽을 수 없습니다. 입력값을 확인하세요.',
  ME_001: '로그인한 개인번호가 인사정보에 없습니다. 다시 로그인하세요.',
  ME_002: '로그인이 필요합니다. 로그인 화면에서 다시 로그인하세요.',
  LKP_001: '사무소 또는 검색어를 입력하세요.',
  LKP_002: '조회할 수 없는 항목입니다. ({0})',
  LKP_404: '사무소를 찾을 수 없습니다. ({0})',
  MCN_001: '기기정보를 찾을 수 없습니다. ({0}-{1})',
  MCN_002: '이미 등록된 기기입니다. ({0}-{1})',
  MDL_001: '모델코드를 찾을 수 없습니다. ({0})',
  MDL_002: '이미 등록된 모델코드입니다. ({0})',
  S012: '로그인되었습니다.',
  S013: '로그아웃되었습니다.',
  LGN_001: '개인번호 또는 비밀번호를 확인하세요.',
  CRYPTO_REQUIRED: '암호화되지 않은 값은 받을 수 없습니다.',
  CRYPTO_FORMAT: '암호화 값 형식이 올바르지 않습니다.',
  CRYPTO_KID: '암호화 키가 바뀌었습니다. 다시 시도하세요.',
  CRYPTO_DECRYPT: '암호화 값을 해독할 수 없습니다.',
  CRYPTO_EXPIRED: '요청 시각이 맞지 않습니다. 다시 시도하세요.',
  CRYPTO_REPLAY: '이미 사용된 요청입니다.',
};
const text = (code, ...args) => (MESSAGES[code] ?? code).replace(/\{(\d+)\}/g, (_, i) => String(args[Number(i)] ?? ''));

/** 오류 응답으로 바꿀 예외 */
class ApiError extends Error {
  constructor(status, code, ...args) {
    super(text(code, ...args));
    this.status = status;
    this.code = code;
  }
}
const bad = (code, ...args) => new ApiError(400, code, ...args);
const notFound = (code, ...args) => new ApiError(404, code, ...args);

/* ================================================================== 날짜(서울 시각) */
const KST = 9 * 3600 * 1000;
const DAY = 86400 * 1000;
const pad = (n, w = 2) => String(n).padStart(w, '0');
/** 서울 시각을 UTC 칸에 담은 Date (getUTC* 로 읽는다) */
const kst = (ms = Date.now()) => new Date(ms + KST);
const ymdOf = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
const hmsOf = (d) => `${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
const dtm14 = (d) => ymdOf(d) + hmsOf(d);
const isYmd = (v) => /^\d{8}$/.test(v) && !Number.isNaN(Date.parse(`${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}T00:00:00Z`));
const ymdToMs = (v) => Date.UTC(Number(v.slice(0, 4)), Number(v.slice(4, 6)) - 1, Number(v.slice(6, 8)));

/** 씨앗이 같으면 늘 같은 난수(자료가 실행마다 같게) */
const rngOf = (seed) => {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return { next, int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)), pick: (arr) => arr[Math.floor(next() * arr.length)] };
};

/* ================================================================== 지어낸 기준 자료 */
/** 시도(TB_CO_SIDO) — 행정구역 이름은 공개된 일반 지명 */
const SIDO = [
  ['11', '서울특별시'], ['26', '부산광역시'], ['27', '대구광역시'], ['28', '인천광역시'], ['29', '광주광역시'], ['30', '대전광역시'],
  ['31', '울산광역시'], ['36', '세종특별자치시'], ['41', '경기도'], ['43', '충청북도'], ['44', '충청남도'], ['46', '전라남도'],
  ['47', '경상북도'], ['48', '경상남도'], ['50', '제주특별자치도'],
].map(([sidoCode, sidoNm]) => ({ sidoCode, sidoNm }));
const SIGUN = [
  ['11', '110', '종로구'], ['11', '140', '중구'], ['11', '170', '용산구'], ['11', '440', '마포구'], ['11', '680', '강남구'],
  ['26', '110', '중구'], ['26', '350', '해운대구'], ['27', '110', '중구'], ['27', '260', '수성구'], ['28', '110', '중구'], ['28', '185', '연수구'],
  ['29', '110', '동구'], ['29', '140', '서구'], ['30', '110', '동구'], ['30', '200', '유성구'], ['31', '110', '중구'], ['31', '140', '남구'],
  ['36', '110', '세종시'], ['41', '110', '수원시'], ['41', '130', '성남시'], ['41', '280', '고양시'], ['43', '110', '청주시'], ['43', '130', '충주시'],
  ['44', '130', '천안시'], ['44', '200', '아산시'], ['46', '110', '목포시'], ['46', '130', '여수시'], ['47', '110', '포항시'], ['47', '130', '경주시'],
  ['48', '120', '창원시'], ['48', '170', '진주시'], ['50', '110', '제주시'], ['50', '130', '서귀포시'],
].map(([sidoCode, sigunCode, sigunNm]) => ({ sidoCode, sigunCode, sigunNm }));

/** 사무소(TB_OFC_REG_MGT) — 전부 지어낸 이름 */
const OFFICES = [
  ['100001', '가람지점', '11'], ['100002', '나래지점', '11'], ['100003', '다온지점', '41'], ['100004', '라온지점', '41'],
  ['100005', '마루지점', '28'], ['100006', '바다지점', '26'], ['100007', '새솔지점', '30'], ['100008', '아름지점', '27'],
  ['100009', '자람지점', '29'], ['100010', '차오름지점', '31'], ['100011', '한울지점', '43'], ['100012', '가온금융센터', '11'],
  ['100013', '누리출장소', '44'], ['100014', '도담지점', '36'], ['100100', '디지털운영부', '11'], ['100200', '자동화기기지원센터', '41'],
].map(([ofcCode, kanm, sidoCode]) => ({ ofcCode, kanm, sidoCode, sidoNm: SIDO.find((s) => s.sidoCode === sidoCode)?.sidoNm ?? null }));
const officeOf = (code) => OFFICES.find((o) => o.ofcCode === code);
const kanmOf = (code) => officeOf(code)?.kanm ?? null;

/** 인원(TB_INSA) — 이름·개인번호 모두 지어낸 값 */
const PERSONS = [
  ['99000101', '김하늘', '과장', '100001'], ['99000202', '이도윤', '대리', '100001'], ['99000303', '박서진', '주임', '100001'],
  ['99000404', '최가람', '지점장', '100001'], ['99000505', '정나래', '차장', '100001'], ['99000606', '강다온', '계장', '100001'],
  ['99000711', '조라온', '차장', '100002'], ['99000712', '윤마루', '대리', '100002'], ['99000713', '장바다', '주임', '100002'],
  ['99000721', '임새솔', '과장', '100003'], ['99000722', '한아름', '계장', '100003'],
  ['99000731', '오자람', '과장', '100004'], ['99000732', '서한결', '대리', '100004'],
  ['99000741', '신한울', '차장', '100005'], ['99000742', '권가온', '주임', '100005'],
  ['99000751', '황누리', '과장', '100006'], ['99000752', '안도담', '대리', '100006'],
  ['99000761', '송보람', '과장', '100007'], ['99000762', '류시온', '계장', '100007'],
  ['99000771', '홍이든', '차장', '100008'], ['99000772', '문예솔', '주임', '100008'],
  ['99000781', '양하람', '과장', '100009'], ['99000791', '손다솜', '과장', '100010'], ['99000801', '배나린', '대리', '100011'],
  ['99000811', '백도현', '센터장', '100012'], ['99000812', '허슬기', '과장', '100012'], ['99000813', '남별하', '대리', '100012'],
  ['99000821', '심온유', '소장', '100013'], ['99000831', '노해나', '과장', '100014'],
  ['99000901', '하윤슬', '부장', '100100'], ['99000902', '곽이레', '차장', '100100'], ['99000903', '탁서우', '과장', '100100'],
  ['99000911', '모은결', '센터장', '100200'], ['99000912', '변라희', '대리', '100200'],
].map(([perNo, name, jikeubName, samuso]) => ({ perNo, name, jikeubName, samuso, samusoName: kanmOf(samuso) }));
const personOf = (perNo) => PERSONS.find((p) => p.perNo === perNo);

/** 권한(TB_SCR_AUTH.AUTH) — A 관리자 / T 조회·등록·수정 / L 조회만. 행이 없으면 L 과 같게 */
const AUTH_OF = { 99000101: 'A', 99000202: 'T', 99000303: 'L' };
const PERMS = { A: ['qry', 'reg', 'upd', 'del', 'exe'], T: ['qry', 'reg', 'upd'], L: ['qry'] };
export const USERS = [
  { perNo: '99000101', name: '김하늘', auth: 'A', note: '관리자 — 버튼 5종 모두 가능' },
  { perNo: '99000202', name: '이도윤', auth: 'T', note: '조회·등록·수정 (삭제·실행 불가)' },
  { perNo: '99000303', name: '박서진', auth: 'L', note: '조회 전용' },
];

/** 기기사 — 이름이 "가짜"임이 드러나게 지었다 */
const VENDORS = [['10', '가상테크'], ['20', '모의전자'], ['30', '견본시스템']].map(([vendCode, vendNm]) => ({ vendCode, vendNm }));
const vendNmOf = (code) => VENDORS.find((v) => v.vendCode === code)?.vendNm ?? null;

/** 기종(TB_NMS_SRC) */
const SRCS = [
  ['A1', '가상 ATM-1000', '10', 'ATM'], ['A2', '가상 ATM-2000', '10', 'ATM'], ['B1', '모의 STM-S1', '20', 'STM'],
  ['B2', '모의 CD-C2', '20', 'CD'], ['C1', '견본 공과금수납기 K1', '30', '공과금'], ['C2', '견본 ATM-300', '30', 'ATM'],
].map(([src, srcNm, vendCode, komType]) => ({ src, srcNm, vendCode, komType }));
const srcOf = (code) => SRCS.find((s) => s.src === code);

/** 공통코드(TB_CO_CODE) — 견본 코드구분 SAMPLE 하나 */
const CODES = {
  SAMPLE: [['01', '일반'], ['02', '긴급'], ['03', '점검'], ['04', '교체'], ['05', '보류']].map(([code, codeNm], i) => ({
    codeType: 'SAMPLE', code, codeNm, desc1: null, desc2: null, desc3: null, sortOrd: i + 1, useYn: 'Y',
  })),
};

/** 코너(TB_SCRT_INST_PST) — 사무소마다 2~5곳 */
const CORNER_NAMES_MAIN = ['영업점 365코너', '가람역 출구 코너', '가람시장 입구 코너', '시청 민원실 코너', '가람대학교 학생회관 코너'];
const buildCorners = () => {
  const out = [];
  for (const o of OFFICES) {
    if (o.ofcCode === '100100' || o.ofcCode === '100200') continue; // 본부 부서는 코너 없음
    const base = o.kanm.replace(/(지점|금융센터|출장소)$/, '');
    const names = o.ofcCode === '100001' ? CORNER_NAMES_MAIN : [`${o.kanm} 365코너`, `${base}역 코너`, `${base} 주민센터 코너`].slice(0, o.ofcCode === '100013' ? 2 : 3);
    names.forEach((instPstNm, i) => out.push({ ofcCode: o.ofcCode, instPstCode: pad(i + 1, 3), instPstNm, useYn: 'Y' }));
  }
  return out;
};

/* ================================================================== 공지사항 원고(전부 지어낸 내용) */
/** [제목, 본문 한 줄] — 가람지점(로그인 사용자 사무소) 공지 */
const NOTICE_BRANCH = [
  ['365코너 자동화기기 정기 점검 안내', '점검 시간에는 1~4호기를 차례로 세우므로 고객 안내문을 미리 붙여 주세요.'],
  ['2호기(ATM) 교체 작업 일정 안내', '낡은 2호기를 새 기기로 바꿉니다. 작업 중에는 3호기 이용을 안내해 주세요.'],
  ['주말 현금 보충 담당자 지정 안내', '이번 달 주말 현금 보충 당번표를 붙임과 같이 정했습니다.'],
  ['가람역 출구 코너 운영시간 변경 안내', '역사 공사로 운영 종료 시각을 23시 30분에서 22시로 당깁니다.'],
  ['통장정리기 용지 걸림 조치 결과 공유', '용지 이송 롤러를 교체해 정상 동작을 확인했습니다.'],
  ['자동화기기 일일 점검표 작성 요령', '영업 시작 전 점검표 7개 항목을 빠짐없이 적고 서명해 주세요.'],
  ['야간 무인경비 연동 점검 실시 안내', '경비 업체와 함께 출입문·감지기 연동 상태를 확인합니다.'],
  ['시청 민원실 코너 기기 이전 설치 일정', '민원실 배치 변경에 따라 기기를 출입구 옆으로 옮겨 설치합니다.'],
  ['지폐 걸림 장애 발생 시 초동 조치 절차', '기기를 직접 열지 말고 장애현황 화면에서 상태를 확인한 뒤 접수해 주세요.'],
  ['월말 시재 마감 시간 준수 요청', '월말 영업일에는 17시까지 기기별 시재를 확정해 주세요.'],
  ['코너 청소 용역 일정 변경 안내', '청소 요일을 화·금에서 월·목으로 바꿉니다.'],
  ['카드 회수 건 처리 절차 재안내', '회수된 카드는 당일 대장에 적고 금고에 보관합니다.'],
  ['신권 교환 수요 대비 현금 준비 안내', '신권 수요가 늘어나는 기간이므로 기기별 보충 주기를 하루 앞당깁니다.'],
  ['자동화기기 화면 안내문 교체 완료', '이용 수수료 안내 문구를 새 문안으로 모두 바꿨습니다.'],
  ['장애 알림 문자 수신자 변경 신청 안내', '담당자가 바뀐 경우 이번 주 금요일까지 신청서를 내 주세요.'],
  ['폐쇄회로 카메라 녹화 상태 점검 결과', '5개 코너 모두 30일치 녹화가 정상 보관되고 있습니다.'],
  ['가람시장 입구 코너 임시 휴무 안내', '상가 전기 공사로 하루 동안 코너를 닫습니다.'],
  ['고액권 수납 한도 설정 변경 안내', '1회 입금 가능 장수를 조정합니다. 고객 문의 시 안내문을 참고해 주세요.'],
  ['기기 내 분실물 발견 시 보관 절차', '분실물은 발견 즉시 대장에 적고 창구 책임자에게 인계합니다.'],
  ['냉난방기 점검에 따른 코너 출입 통제 안내', '점검 1시간 동안 365코너 출입을 막습니다.'],
  ['영수증 용지 재고 조사 협조 요청', '코너별 남은 용지 상자 수를 적어 회신해 주세요.'],
  ['자동화기기 원격 재기동 요청 방법 안내', '장애현황 화면에서 기기를 고른 뒤 [일반리셋]을 누르면 됩니다.'],
  ['점검 스티커 부착 위치 통일 안내', '점검 스티커는 기기 오른쪽 옆면 위쪽에 붙입니다.'],
  ['명세표 인자 불량 기기 부품 교체 완료', '5호기 인자 헤드를 교체했고 시험 출력이 정상입니다.'],
  ['대학 축제 기간 코너 연장 운영 안내', '축제 3일 동안 학생회관 코너를 자정까지 엽니다.'],
  ['전자저널 조회 화면 사용법 교육 일정', '신규 전입 직원을 대상으로 30분 교육을 합니다.'],
  ['정전 대비 무정전 전원장치 점검 안내', '축전지 상태를 확인하고 필요하면 교체합니다.'],
  ['코너 출입문 자동 잠금 시간 조정', '운영 종료 5분 뒤에 잠기도록 설정을 바꿉니다.'],
  ['수표 입금 장애 재발 방지 조치 공유', '수표 판독부 청소 주기를 월 1회에서 2주 1회로 줄였습니다.'],
  ['장애 접수 창구 일원화 안내', '기기 장애는 앞으로 종합관리시스템 한 곳으로만 접수합니다.'],
  ['기기 사용 불가 안내판 비치 요령', '장애 기기 앞에는 안내판을 세우고 옆 기기 이용을 안내합니다.'],
  ['현금 수송 차량 도착 시간 변경 안내', '도착 시각이 오전 9시에서 8시 30분으로 당겨집니다.'],
  ['화면 터치 불량 기기 점검 요청 접수', '7호기 화면 아래쪽 터치가 둔하다는 신고가 있어 점검을 요청했습니다.'],
  ['분기 자동화기기 가동률 실적 공유', '지난 분기 가동률은 목표를 웃돌았습니다. 자세한 수치는 붙임을 보세요.'],
  ['신규 설치 기기(STM) 시범 운영 안내', '영업점 365코너에 STM 1대를 놓고 2주 동안 시범 운영합니다.'],
  ['점자 안내 스티커 보완 부착 완료', '떨어져 있던 3대의 점자 스티커를 다시 붙였습니다.'],
  ['기기별 시재 한도 재산정 결과 안내', '이용 실적에 맞춰 기기별 보충 한도를 다시 정했습니다.'],
  ['코너 안내 방송 문구 변경 안내', '운영 종료 10분 전 안내 방송 문구를 바꿉니다.'],
  ['휴일 당번자 비상 연락 체계 점검', '당번표에 적힌 연락 순서가 맞는지 확인해 주세요.'],
  ['기기 장애 통계 주간 보고', '지난주 장애는 모두 9건이며 지폐 걸림이 가장 많았습니다.'],
  ['위조지폐 감별 기능 점검 결과', '전 기기 감별 센서 시험을 통과했습니다.'],
  ['고객 대기 공간 정비 작업 안내', '365코너 안 의자와 안내대를 새로 놓습니다.'],
  ['통신 회선 이중화 작업에 따른 순단 안내', '작업 중 1~2분 정도 통신이 끊길 수 있습니다.'],
  ['자동화기기 열쇠 관리 대장 점검 안내', '열쇠 인수인계 기록이 빠진 날이 없는지 확인합니다.'],
  ['운영 종료 후 코너 소등 확인 요청', '마지막 퇴근자가 코너 조명과 냉난방기를 확인해 주세요.'],
  ['금융사기 예방 안내문 게시 협조', '기기 옆 게시대에 새 안내문을 붙여 주세요.'],
  ['기기 소모품 신청 마감일 안내', '다음 달 쓸 소모품은 25일까지 신청합니다.'],
  ['장애현황 화면 새로고침 주기 설정 안내', '조회조건의 새로고침을 30초로 두면 상황판처럼 쓸 수 있습니다.'],
  ['우천 시 코너 바닥 미끄럼 방지 조치', '비 오는 날에는 출입구에 깔개를 깔고 안내판을 세웁니다.'],
  ['기기 교체 후 폐기 장비 반출 일정', '교체한 옛 기기 2대를 주말에 반출합니다.'],
  ['코너 운영시간 연장 시범 실시 결과', '연장 시간대 이용 건수가 적어 원래 시간으로 되돌립니다.'],
  ['야간 장애 대응 근무 편성표 공유', '다음 달 야간 대응 근무자를 붙임과 같이 편성했습니다.'],
  ['연말 현금 수요 증가 대비 점검 계획', '연말 2주 동안 보충 횟수를 늘리고 기기 상태를 매일 확인합니다.'],
];
/** 전체 공지(사무소 없음) — 디지털운영부 작성 */
const NOTICE_ALL = [
  ['종합관리시스템 정기 점검에 따른 일시 중단 안내', '점검 시간 동안 화면 접속이 되지 않습니다. 급한 장애는 유선으로 접수해 주세요.'],
  ['공지사항 화면 사용 안내', '제목을 누르면 상세가 열리고, 줄을 체크하면 수정·삭제할 수 있습니다.'],
  ['기기정보 등록 시 코너 선택 유의 사항', '사무소를 먼저 고른 뒤 그 사무소의 코너를 골라야 합니다.'],
  ['기기모델코드 정비 작업 안내', '쓰지 않는 모델코드를 정리합니다. 필요한 코드는 미리 알려 주세요.'],
  ['화면 권한 신청 절차 안내', '권한이 필요한 화면은 소속 책임자 승인 뒤 신청합니다.'],
];
/** 다른 사무소 공지 */
const NOTICE_OTHERS = [
  ['100002', '나래역 코너 기기 증설 안내', '이용이 많은 나래역 코너에 기기 1대를 더 놓습니다.'],
  ['100003', '다온지점 365코너 바닥 공사 일정', '바닥재 교체로 이틀 동안 코너를 닫습니다.'],
  ['100006', '해안로 코너 염해 방지 점검 실시', '바닷바람에 약한 부품을 미리 살펴봅니다.'],
  ['100007', '새솔지점 통장정리기 교체 안내', '낡은 통장정리기를 새 기기로 바꿉니다.'],
  ['100012', '금융센터 로비 기기 재배치 안내', '로비 공사에 맞춰 기기 4대의 자리를 옮깁니다.'],
  ['100014', '도담지점 신규 코너 개설 안내', '도담 주민센터 안에 새 코너를 엽니다.'],
];
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

/* ================================================================== 자료 만들기 (reset 때마다 같은 값) */
const buildDb = () => {
  const now = kst();
  const today0 = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()); // 서울 기준 오늘 0시
  const rng = rngOf(20261114);
  const corners = buildCorners();

  /* ---- 공지: 가람지점 53건(최근 27일 안 45건 + 32~39일 전 8건), 전체 공지 5건, 다른 사무소 6건 = 64건 ---- */
  const drafts = [];
  const branch = NOTICE_BRANCH.map((x) => ({ x, k: rng.next() })).sort((a, b) => a.k - b.k).map((o) => o.x);
  const writers = PERSONS.filter((p) => p.samuso === '100001');
  branch.forEach(([subject, detail], i) => {
    const offset = i < 45 ? Math.floor((i * 27) / 45) : 32 + ((i - 45) % 8); // 0..26 또는 32..39 일 전
    drafts.push({ ofcCode: '100001', subject, detail, offset, writer: rng.pick(writers) });
  });
  const hq = PERSONS.filter((p) => p.samuso === '100100');
  NOTICE_ALL.forEach(([subject, detail], i) => drafts.push({ ofcCode: null, subject, detail, offset: [2, 6, 11, 19, 35][i], writer: hq[i % hq.length] }));
  NOTICE_OTHERS.forEach(([ofcCode, subject, detail], i) =>
    drafts.push({ ofcCode, subject, detail, offset: [1, 4, 9, 15, 22, 37][i], writer: PERSONS.find((p) => p.samuso === ofcCode) }));
  // 오래된 것부터 번호를 매긴다(NO = MAX+1 과 같은 결과). 같은 날은 들어온 순서
  drafts.sort((a, b) => b.offset - a.offset);
  const notices = drafts.map((d, i) => {
    const day = new Date(today0 - d.offset * DAY);
    // 작성 시각은 근무 시간대. 오늘 쓴 글이 "지금"보다 뒤 시각이 되지 않게 막는다
    const planned = day.getTime() + (9 + rng.int(0, 8)) * 3600 * 1000 + rng.int(0, 59) * 60 * 1000 + rng.int(0, 59) * 1000;
    const latest = now.getTime() - rng.int(3, 40) * 60 * 1000;
    const at = new Date(planned > latest ? Math.max(day.getTime(), latest) : planned);
    const when = new Date(day.getTime() + rng.int(2, 9) * DAY);
    const target = d.ofcCode ? `${kanmOf(d.ofcCode)} 전 직원` : '전 사무소 자동화기기 담당자';
    const whenText = `${when.getUTCFullYear()}-${pad(when.getUTCMonth() + 1)}-${pad(when.getUTCDate())}(${WEEKDAY[when.getUTCDay()]}) ${pad(rng.pick([7, 8, 9, 13, 18, 19]))}:${rng.pick(['00', '30'])}`;
    // 날짜가 있는 일(점검·교체·공사…)에만 '일시' 줄을 넣는다. 결과 공유·절차 안내에는 넣지 않는다
    const hasWhen = /일정|점검 안내|점검 실시|교체 작업|교체 안내|휴무|공사|통제|교육|순단|중단|개설|증설|재배치|정비 작업|연장 운영|시범 운영|반출|변경 안내|조정$/.test(d.subject);
    const items = [...(hasWhen ? [`일시: ${whenText}`] : []), `대상: ${target}`, `내용: ${d.detail}`];
    const body = [`${d.subject} 건으로 아래와 같이 알려 드립니다.`, '', ...items.map((t, k) => `${k + 1}. ${t}`), '', '궁금한 점은 작성자에게 문의해 주세요.'].join('\n');
    const stamp = dtm14(at);
    return {
      no: 201 + i,
      ofcCode: d.ofcCode,
      kanm: d.ofcCode ? kanmOf(d.ofcCode) : null,
      subject: d.subject,
      text: body,
      visit: rng.int(2, 30) + d.offset * rng.int(2, 5),
      name: d.writer.name,
      perNo: d.writer.perNo,
      wrtDate: ymdOf(day),
      crtDtm: stamp,
      crtCmeno: d.writer.perNo,
      lschgDtm: stamp,
      lsCmeno: d.writer.perNo,
    };
  });

  /* ---- 기기정보(TB_MCN_INFO): 가람지점 24대(그중 2대 사용안함), 나머지 사무소 3~8대 ---- */
  const machines = [];
  const baseStamp = dtm14(new Date(today0 - 120 * DAY + 10 * 3600 * 1000));
  for (const o of OFFICES) {
    const cs = corners.filter((c) => c.ofcCode === o.ofcCode);
    if (!cs.length) continue;
    const count = o.ofcCode === '100001' ? 24 : 3 + (Number(o.ofcCode) % 6);
    for (let i = 0; i < count; i++) {
      const corner = o.ofcCode === '100001' ? cs[i < 8 ? 0 : 1 + ((i - 8) % 4)] : cs[i % cs.length];
      const s = SRCS[(i * 7 + Number(o.ofcCode)) % SRCS.length];
      const changed = new Date(today0 - rng.int(1, 90) * DAY + rng.int(9, 17) * 3600 * 1000 + rng.int(0, 3599) * 1000);
      const who = rng.pick(PERSONS.filter((p) => p.samuso === o.ofcCode)) ?? PERSONS[0];
      machines.push({
        ofcCode: o.ofcCode,
        mcnNo: pad(i + 1, 3),
        instPstCode: corner.instPstCode,
        src: s.src,
        komType: s.komType,
        vendCode: s.vendCode,
        opType: corner.instPstCode === '001' ? '1' : '2',
        inoutType: corner.instPstCode === '001' ? '1' : '2',
        useYn: o.ofcCode === '100001' && (i === 13 || i === 21) ? 'N' : 'Y',
        cnrPstSpecCode: ['01', '02', '03'][Number(corner.instPstCode) % 3],
        crtDtm: baseStamp,
        crtCmeno: who.perNo,
        lschgDtm: dtm14(changed),
        lsCmeno: who.perNo,
      });
    }
  }

  /* ---- 기기모델코드(TB_CO_MODEL) ---- */
  const modelStamp = (n) => dtm14(new Date(today0 - n * DAY + 14 * 3600 * 1000 + n * 137 * 1000));
  const models = [
    ['10', '01', 'A1', '가상 ATM-1000'], ['10', '01', 'A2', '가상 ATM-2000'], ['10', '01', 'A3', '가상 ATM-2000 Plus'],
    ['10', '02', 'C1', '가상 CD-100'], ['10', '03', 'S1', '가상 STM-500'], ['10', '03', 'S2', '가상 STM-700'],
    ['20', '01', 'A1', '모의 ATM-K1'], ['20', '01', 'A2', '모의 ATM-K2'], ['20', '02', 'C1', '모의 CD-C2'],
    ['20', '03', 'S1', '모의 STM-S1'], ['20', '04', 'U1', '모의 공과금수납기 U1'],
    ['30', '01', 'A1', '견본 ATM-300'], ['30', '01', 'B1', '견본 ATM-300R'], ['30', '04', 'U1', '견본 공과금수납기 K1'], ['30', '04', 'U2', '견본 공과금수납기 K2'],
  ].map(([vendCode, mcnType, modelCode, modelNm], i) => ({
    vendCode, mcnType, modelCode, modelNm, crtDtm: modelStamp(200 + i), crtCmeno: '99000902', lschgDtm: modelStamp(10 + i * 4), lsCmeno: i % 3 ? '99000902' : '99000903',
  }));

  return { notices, corners, machines, models, today0 };
};

/* ================================================================== 서버 */
/**
 * 가짜 백엔드를 만든다. `await mock.listen()` 뒤에 mock.url 로 부른다.
 * @param {{ port?: number, quiet?: boolean, delayMs?: number }} [opts]
 */
export function createMockServer(opts = {}) {
  const quiet = opts.quiet ?? false;
  const delayMs = opts.delayMs ?? Number(process.env.MOCK_DELAY_MS ?? 0);
  let db = buildDb();
  /** 세션ID → 개인번호 */
  const sessions = new Map();
  /** 모르는 주소로 온 요청 { method, path } — 0건이어야 한다 */
  const unknown = [];
  /** 받은 요청 기록 { method, path, status, code, screen, user } */
  const requests = [];
  const usedNonces = new Set();

  // 민감필드 암호화 키 — 띄울 때마다 새로 만든다(백엔드 local 프로파일의 generate-if-missing 과 같다)
  const KID = 'local';
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  /* ---------- 공통 도우미 ---------- */
  const ok = (data, msgCode, ...args) => ({ status: 200, body: { success: true, message: msgCode ? text(msgCode, ...args) : null, code: '0000', data } });
  const audit = (user) => ({ dtm: dtm14(kst()), who: user.perNo });
  const normOfc = (v) => {
    if (v === undefined || v === null || String(v).trim() === '') return null;
    const d = String(v).replace(/\D/g, '');
    if (!d || d.length > 6) throw bad('VAL_003', 'ofcCode');
    return d.padStart(6, '0');
  };
  /** 바이트 길이(잠정 Q-07): ASCII 1, 그 밖 2 */
  const byteLen = (s) => Array.from(String(s)).reduce((n, ch) => n + (ch.charCodeAt(0) < 128 ? 1 : 2), 0);
  const paging = (q) => {
    const page = Math.max(1, Number(q.get('page') ?? 1) || 1);
    const size = Math.min(1000, Math.max(1, Number(q.get('size') ?? 20) || 20));
    return { page, size };
  };
  const pageOf = (rows, { page, size }) => ({
    content: rows.slice((page - 1) * size, page * size),
    totalCount: rows.length,
    page,
    size,
    totalPages: Math.ceil(rows.length / size),
  });
  const has = (v, kw) => String(v ?? '').toLowerCase().includes(String(kw).toLowerCase());
  const trim = (v) => (v === undefined || v === null ? '' : String(v).trim());

  /* ---------- 나 · 메뉴 ---------- */
  const meOf = (perNo) => {
    const p = personOf(perNo);
    if (!p) return null;
    const auth = AUTH_OF[perNo] ?? null;
    return { perNo: p.perNo, name: p.name, samuso: p.samuso, samusoName: p.samusoName, deptCode: p.samuso, ofcCode: p.samuso, kanm: p.samusoName, auth, adminYn: auth === 'A' ? 'Y' : 'N' };
  };
  const permsOf = (user) => PERMS[user.auth ?? 'L'] ?? PERMS.L;
  /** 내장 메뉴 시드(src/screens/menuSeed.ts)와 같은 트리. 권한 5개는 사용자 권한대로 */
  const menuOf = (user) => {
    const p = permsOf(user);
    const yn = (k) => (p.includes(k) ? 'Y' : 'N');
    const flags = { useYn: 'Y', qryRolYn: yn('qry'), regRolYn: yn('reg'), updRolYn: yn('upd'), delRolYn: yn('del'), exeRolYn: yn('exe') };
    const node = (menuId, parentMenuId, menuNm, menuType, menuPath, sortNo, children = []) => ({ menuId, parentMenuId, menuNm, menuType, menuPath, sortNo, ...flags, children });
    return [
      node('MGT000', '0', '종합관리', 'G', null, 100, [node('MGT100', 'MGT000', '장애', 'G', null, 1, [node('MGT101', 'MGT100', '장애현황', 'M', '/mgmt/fault-status', 1)])]),
      node('SMP000', '0', '견본', 'G', null, 900, [
        node('SMP001', 'SMP000', '공통 모듈', 'M', '/sample/common-modules', 1),
        node('SMP002', 'SMP000', '공지사항', 'M', '/sample/notice', 2),
        node('SMP003', 'SMP000', '기기정보', 'M', '/sample/mcn-info', 3),
        node('SMP004', 'SMP000', '기기모델코드', 'M', '/sample/mcn-model', 4),
      ]),
    ];
  };

  /* ---------- 암호화(계약 §7): ENC1.<kid>.<RSA-OAEP(SHA-256) AES키>.<IV>.<AES-256-GCM 암호문+태그> ---------- */
  const decryptField = (value) => {
    if (typeof value !== 'string' || !value.startsWith('ENC1.')) return value; // crypto.field.required=false → 평문도 받는다
    const parts = value.split('.');
    if (parts.length !== 5) throw bad('CRYPTO_FORMAT');
    if (parts[1] !== KID) throw bad('CRYPTO_KID');
    let plain;
    try {
      const aesKey = crypto.privateDecrypt({ key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, Buffer.from(parts[2], 'base64'));
      const iv = Buffer.from(parts[3], 'base64');
      const enc = Buffer.from(parts[4], 'base64');
      const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
      decipher.setAuthTag(enc.subarray(enc.length - 16));
      plain = JSON.parse(Buffer.concat([decipher.update(enc.subarray(0, enc.length - 16)), decipher.final()]).toString('utf8'));
    } catch {
      throw bad('CRYPTO_DECRYPT');
    }
    if (Math.abs(Math.floor(Date.now() / 1000) - Number(plain.ts)) > 120) throw bad('CRYPTO_EXPIRED');
    if (usedNonces.has(plain.n)) throw bad('CRYPTO_REPLAY');
    usedNonces.add(plain.n);
    return plain.v;
  };

  /* ---------- 표시용 조립 ---------- */
  const mcnView = (m) => {
    const corner = db.corners.find((c) => c.ofcCode === m.ofcCode && c.instPstCode === m.instPstCode);
    return {
      ofcCode: m.ofcCode, kanm: kanmOf(m.ofcCode), mcnNo: m.mcnNo, instPstCode: m.instPstCode ?? null, instPstNm: corner?.instPstNm ?? null,
      src: m.src ?? null, srcNm: srcOf(m.src)?.srcNm ?? null, komType: m.komType ?? null, vendCode: m.vendCode ?? null, vendNm: vendNmOf(m.vendCode),
      opType: m.opType ?? null, inoutType: m.inoutType ?? null, useYn: m.useYn, cnrPstSpecCode: m.cnrPstSpecCode ?? null,
      crtDtm: m.crtDtm, crtCmeno: m.crtCmeno, lschgDtm: m.lschgDtm, lsCmeno: m.lsCmeno,
    };
  };
  const findMcn = (ofcCode, mcnNo) => db.machines.find((m) => m.ofcCode === ofcCode && m.mcnNo === mcnNo);
  const modelView = (m) => ({ vendCode: m.vendCode, vendNm: vendNmOf(m.vendCode), mcnType: m.mcnType, modelCode: m.modelCode, modelNm: m.modelNm ?? null, crtDtm: m.crtDtm, crtCmeno: m.crtCmeno, lschgDtm: m.lschgDtm, lsCmeno: m.lsCmeno });
  const modelKey = (m) => `${trim(m.vendCode)}-${trim(m.mcnType)}-${trim(m.modelCode)}`;
  const distinct = (rows, key) => Array.from(new Set(rows.map((r) => r[key]).filter((v) => v !== null && v !== undefined && v !== ''))).sort().map((value) => ({ value }));
  const DISTINCT = {
    'mcn-kom-type': () => distinct(db.machines, 'komType'),
    'mcn-op-type': () => distinct(db.machines, 'opType'),
    'mcn-inout-type': () => distinct(db.machines, 'inoutType'),
    'mcn-cnr-pst-spec': () => distinct(db.machines, 'cnrPstSpecCode'),
    'mcn-vend-code': () => distinct(db.machines, 'vendCode'),
    'model-mcn-type': () => distinct(db.models, 'mcnType'),
  };

  /** 공지 본문 검사·정리(NoticeService.toNotice 와 같은 순서) */
  const noticeBody = (b) => {
    if (!b || typeof b !== 'object') throw bad('VAL_004');
    const subject = trim(b.subject);
    const body = b.text === undefined || b.text === null ? '' : String(b.text);
    if (!subject) throw bad('VAL_001', 'subject');
    if (!body.trim()) throw bad('VAL_001', 'text');
    if (byteLen(subject) > 200) throw bad('VAL_001', 'subject');
    if (byteLen(body) > 4000) throw bad('VAL_001', 'text');
    return { subject, text: body, ofcCode: normOfc(b.ofcCode) };
  };
  const noticeOf = (no) => {
    const n = db.notices.find((x) => x.no === Number(no));
    if (!n) throw notFound('NTC_001');
    return n;
  };

  /* ---------- 장애현황(잠정 — 백엔드·계약 없음, 프론트 domain/fault.ts 모양만 맞춤) ---------- */
  const FAULTS = {
    '01': [['E101', '지폐 부족'], ['E102', '명세표 용지 부족']],
    '02': [['E201', '카드부 장애'], ['E202', '지폐 걸림']],
    '03': [['E301', '통신 응답 없음']],
  };
  const faultOf = (m, i) => {
    const pattern = ['00', '00', '00', '02', '00', '00', '01', '00', '00', '00', '03', '00', '00', '00', '00', '01', '00', '09', '00', '02', '00', '00'];
    const status = pattern[i % pattern.length];
    const err = FAULTS[status]?.[i % (FAULTS[status]?.length ?? 1)];
    const v = mcnView(m);
    return {
      ofcCode: m.ofcCode, mcnNo: m.mcnNo, srcNm: v.srcNm, instPstCode: v.instPstCode, instPstNm: v.instPstNm, status,
      errCd: err?.[0] ?? null, errName: err?.[1] ?? null,
      cash: status === '09' ? 0 : 8_000_000 + ((i * 7_350_000) % 41_000_000),
      checkCash: status === '09' ? 0 : ((i * 3) % 7) * 500_000,
      // 프론트 fmtHoursRange 가 값을 그대로 이어 붙이므로 'HH:mm' 으로 준다(domain 주석은 HHmm)
      serviceStart: v.instPstCode === '001' ? '07:00' : '08:00',
      serviceEnd: v.instPstCode === '001' ? '23:30' : '22:00',
    };
  };

  /* ================================================================ 주소 표 */
  /** [메서드, 주소 틀, 처리 함수, 권한 { screen, need }] */
  const routes = [];
  const add = (method, pattern, handler, auth) => {
    const names = [];
    const re = new RegExp(`^${pattern.replace(/:([a-zA-Z]+)/g, (_, n) => { names.push(n); return '([^/]+)'; })}$`);
    routes.push({ method, pattern, re, names, handler, auth });
  };

  /* ---- 로그인(/api/auth/** 는 세션 없이 부른다) ---- */
  add('GET', '/api/auth/public-key', () => ok({ enabled: true, serverTime: Math.floor(Date.now() / 1000), kid: KID, alg: 'RSA-OAEP-256/A256GCM', publicKey }));
  add('POST', '/api/auth/login', ({ body, ctx }) => {
    const perNo = trim(body?.perNo);
    if (!perNo) throw bad('VAL_001', 'perNo');
    if (!trim(body?.password)) throw bad('VAL_001', 'password');
    const password = decryptField(body.password);
    const p = personOf(perNo);
    // 비밀번호는 빈 값만 아니면 받는다(가짜 서버). 개인번호가 TB_INSA 에 없으면 실패
    if (!p || !password) throw bad('LGN_001');
    if (ctx.sid) sessions.delete(ctx.sid); // 옛 세션을 버리고 새 세션(세션 고정 방지)
    const sid = crypto.randomBytes(16).toString('hex').toUpperCase();
    sessions.set(sid, perNo);
    ctx.setCookie = `JSESSIONID=${sid}; Path=/; HttpOnly; SameSite=Lax`;
    ctx.userPerNo = perNo;
    return ok({ perNo: p.perNo, name: p.name }, 'S012');
  });
  add('POST', '/api/auth/logout', ({ ctx }) => {
    if (ctx.sid) sessions.delete(ctx.sid);
    ctx.setCookie = 'JSESSIONID=; Path=/; HttpOnly; Max-Age=0';
    return ok(null, 'S013');
  });

  /* ---- 나 · 메뉴 ---- */
  add('GET', '/api/me', ({ user }) => ok(user));
  add('GET', '/api/menu/my', ({ user }) => ok(menuOf(user)));

  /* ---- 공통 조회 ---- */
  add('GET', '/api/lookup/offices', ({ q }) => {
    const kw = trim(q.get('q'));
    return ok(OFFICES.filter((o) => !kw || has(o.ofcCode, kw) || has(o.kanm, kw)));
  });
  add('GET', '/api/lookup/offices/:ofcCode', ({ params }) => {
    const o = officeOf(params.ofcCode);
    if (!o) throw notFound('LKP_404', params.ofcCode);
    return ok(o);
  });
  add('GET', '/api/lookup/persons', ({ q }) => {
    const ofcCode = trim(q.get('ofcCode'));
    const kw = trim(q.get('q'));
    if (!ofcCode && !kw) throw bad('LKP_001');
    return ok(PERSONS.filter((p) => (!ofcCode || p.samuso === ofcCode) && (!kw || has(p.name, kw) || has(p.perNo, kw))).slice(0, 200));
  });
  add('GET', '/api/lookup/persons/:perNo', ({ params }) => {
    const p = personOf(params.perNo);
    if (!p) throw notFound('E404');
    return ok(p);
  });
  add('GET', '/api/lookup/vendors', () => ok(VENDORS));
  add('GET', '/api/lookup/models', ({ q }) => {
    const vendCode = trim(q.get('vendCode'));
    const mcnType = trim(q.get('mcnType'));
    return ok(db.models.filter((m) => (!vendCode || m.vendCode === vendCode) && (!mcnType || m.mcnType === mcnType)).map((m) => ({ vendCode: m.vendCode, mcnType: m.mcnType, modelCode: m.modelCode, modelNm: m.modelNm })));
  });
  add('GET', '/api/lookup/srcs', ({ q }) => {
    const vendCode = trim(q.get('vendCode'));
    return ok(SRCS.filter((s) => !vendCode || s.vendCode === vendCode));
  });
  add('GET', '/api/lookup/machines', ({ q }) => {
    const ofcCode = trim(q.get('ofcCode'));
    if (!ofcCode) throw bad('V001_20');
    const vendCode = trim(q.get('vendCode'));
    const kw = trim(q.get('q'));
    return ok(
      db.machines
        .filter((m) => m.ofcCode === ofcCode && (!vendCode || m.vendCode === vendCode) && (!kw || has(m.mcnNo, kw)))
        .map(mcnView)
        .map((m) => ({ ofcCode: m.ofcCode, mcnNo: m.mcnNo, instPstCode: m.instPstCode, instPstNm: m.instPstNm, src: m.src, srcNm: m.srcNm, komType: m.komType, vendCode: m.vendCode, useYn: m.useYn })),
    );
  });
  add('GET', '/api/lookup/corners', ({ q }) => {
    const ofcCode = trim(q.get('ofcCode'));
    if (!ofcCode) throw bad('V001_20');
    return ok(db.corners.filter((c) => c.ofcCode === ofcCode));
  });
  add('GET', '/api/lookup/codes/:codeType', ({ params }) => ok((CODES[params.codeType] ?? []).filter((c) => c.useYn === 'Y')));
  add('GET', '/api/lookup/distinct/:target', ({ params }) => {
    const fn = DISTINCT[params.target];
    if (!fn) throw bad('LKP_002', params.target);
    return ok(fn());
  });
  add('GET', '/api/lookup/sido', () => ok(SIDO));
  add('GET', '/api/lookup/sigun', ({ q }) => {
    const sidoCode = trim(q.get('sidoCode'));
    if (!sidoCode) throw bad('VAL_002', 'sidoCode');
    return ok(SIGUN.filter((s) => s.sidoCode === sidoCode));
  });
  add('GET', '/api/lookup/holidays', ({ q }) => {
    const from = trim(q.get('from'));
    const to = trim(q.get('to'));
    if (!from) throw bad('VAL_002', 'from');
    if (!to) throw bad('VAL_002', 'to');
    if (!isYmd(from)) throw bad('VAL_003', 'from');
    if (!isYmd(to)) throw bad('VAL_003', 'to');
    const a = ymdToMs(from);
    const b = ymdToMs(to);
    if (b < a || (b - a) / DAY + 1 > 366) throw bad('VAL_001', 'from~to');
    const FIXED = new Set(['0101', '0301', '0505', '0606', '0815', '1003', '1009', '1225']); // 날짜가 고정된 공휴일만
    const out = [];
    for (let t = a; t <= b; t += DAY) {
      const d = new Date(t);
      const dow = d.getUTCDay();
      if (dow === 0 || dow === 6 || FIXED.has(ymdOf(d).slice(4))) out.push({ hdayDt: ymdOf(d), dayType: dow + 1, hdayYn: 'Y', closeYn: 'Y' });
    }
    return ok(out);
  });

  /* ---- 견본: 공지사항 ---- */
  const NOTICE = 'sample.notice';
  add('GET', '/api/notice', ({ q }) => {
    const from = trim(q.get('fromDate')) || null;
    const to = trim(q.get('toDate')) || null;
    if (from && !isYmd(from)) throw bad('VAL_003', 'fromDate');
    if (to && !isYmd(to)) throw bad('VAL_003', 'toDate');
    if (from && to) {
      const days = (ymdToMs(to) - ymdToMs(from)) / DAY + 1;
      if (days < 1 || days > 366) throw bad('VAL_001', 'fromDate~toDate');
    }
    const ofcCode = normOfc(q.get('ofcCode'));
    const perNo = trim(q.get('perNo')) || null;
    let field = (trim(q.get('field')) || '').toUpperCase() || null;
    if (field && !['ALL', 'SUBJECT', 'TEXT', 'NAME'].includes(field)) throw bad('VAL_003', 'field');
    const keyword = trim(q.get('keyword')) || null;
    if (!field || field === 'ALL' || !keyword) field = null;
    const col = { SUBJECT: 'subject', TEXT: 'text', NAME: 'name' }[field ?? ''];
    const rows = db.notices
      .filter((n) => (!from || n.wrtDate >= from) && (!to || n.wrtDate <= to) && (!ofcCode || n.ofcCode === ofcCode) && (!perNo || n.perNo === perNo) && (!col || String(n[col] ?? '').includes(keyword)))
      .sort((a, b) => b.no - a.no)
      .map((n) => ({ ...n, text: null })); // 목록에는 본문이 없다
    return ok(pageOf(rows, paging(q)));
  }, { screen: NOTICE, need: 'qry' });
  add('GET', '/api/notice/:no', ({ params, q }) => {
    const n = noticeOf(params.no);
    if (trim(q.get('hit')).toUpperCase() === 'Y') n.visit = (n.visit ?? 0) + 1;
    return ok({ ...n });
  }, { screen: NOTICE, need: 'qry' });
  add('POST', '/api/notice', ({ body, user }) => {
    const v = noticeBody(body);
    const a = audit(user);
    const n = {
      no: db.notices.reduce((mx, x) => Math.max(mx, x.no), 0) + 1,
      ofcCode: v.ofcCode, kanm: v.ofcCode ? kanmOf(v.ofcCode) : null, subject: v.subject, text: v.text, visit: 0,
      name: user.name, perNo: user.perNo, wrtDate: ymdOf(kst()), crtDtm: a.dtm, crtCmeno: a.who, lschgDtm: a.dtm, lsCmeno: a.who,
    };
    db.notices.push(n);
    return ok({ ...n }, 'S002');
  }, { screen: NOTICE, need: 'reg' });
  add('PUT', '/api/notice/:no', ({ params, body, user }) => {
    const v = noticeBody(body);
    const n = noticeOf(params.no);
    const a = audit(user);
    Object.assign(n, { subject: v.subject, text: v.text, ofcCode: v.ofcCode, kanm: v.ofcCode ? kanmOf(v.ofcCode) : null, lschgDtm: a.dtm, lsCmeno: a.who });
    return ok({ ...n }, 'S003');
  }, { screen: NOTICE, need: 'upd' });
  add('POST', '/api/notice/delete', ({ body }) => {
    const raw = body?.nos;
    if (!Array.isArray(raw) || raw.length === 0 || raw.some((x) => x === null || x === undefined)) throw bad('VAL_001', 'nos');
    const nos = Array.from(new Set(raw.map(Number)));
    if (nos.length > 100) throw bad('VAL_001', 'nos');
    const before = db.notices.length;
    db.notices = db.notices.filter((n) => !nos.includes(n.no));
    const count = before - db.notices.length;
    if (count === 0) throw notFound('NTC_001');
    return ok({ count }, 'S005', count);
  }, { screen: NOTICE, need: 'del' });

  /* ---- 견본: 기기정보 ---- */
  const MCN = 'sample.mcnInfo';
  const mcnBody = (b, keyFromPath) => {
    if (!b || typeof b !== 'object') throw bad('VAL_004');
    const ofcCode = keyFromPath?.ofcCode ?? trim(b.ofcCode);
    const mcnNo = keyFromPath?.mcnNo ?? trim(b.mcnNo);
    if (!/^\d{6}$/.test(ofcCode)) throw bad('VAL_001', 'ofcCode');
    if (!/^\d{3}$/.test(mcnNo)) throw bad('VAL_001', 'mcnNo');
    if (b.useYn !== 'Y' && b.useYn !== 'N') throw bad('VAL_001', 'useYn');
    const opt = (k, max) => {
      const v = trim(b[k]);
      if (v.length > max) throw bad('VAL_001', k);
      return v || null;
    };
    return { ofcCode, mcnNo, instPstCode: opt('instPstCode', 3), src: opt('src', 2), komType: opt('komType', 5), vendCode: opt('vendCode', 2), opType: opt('opType', 1), inoutType: opt('inoutType', 1), useYn: b.useYn, cnrPstSpecCode: opt('cnrPstSpecCode', 2) };
  };
  add('GET', '/api/mcn-info', ({ q }) => {
    const ofcCode = normOfc(q.get('ofcCode'));
    if (!ofcCode) throw bad('V001_20');
    const f = { mcnNo: trim(q.get('mcnNo')), vendCode: trim(q.get('vendCode')), komType: trim(q.get('komType')), opType: trim(q.get('opType')), inoutType: trim(q.get('inoutType')), useYn: trim(q.get('useYn')) };
    const rows = db.machines
      .filter((m) => m.ofcCode === ofcCode && Object.entries(f).every(([k, v]) => !v || m[k] === v))
      .sort((a, b) => (a.ofcCode + a.mcnNo).localeCompare(b.ofcCode + b.mcnNo))
      .map(mcnView);
    return ok(pageOf(rows, paging(q)));
  }, { screen: MCN, need: 'qry' });
  add('GET', '/api/mcn-info/:ofcCode/:mcnNo', ({ params }) => {
    const m = findMcn(params.ofcCode, params.mcnNo);
    if (!m) throw notFound('MCN_001', params.ofcCode, params.mcnNo);
    return ok(mcnView(m));
  }, { screen: MCN, need: 'qry' });
  add('POST', '/api/mcn-info', ({ body, user }) => {
    const v = mcnBody(body);
    if (findMcn(v.ofcCode, v.mcnNo)) throw bad('MCN_002', v.ofcCode, v.mcnNo);
    const a = audit(user);
    const m = { ...v, crtDtm: a.dtm, crtCmeno: a.who, lschgDtm: a.dtm, lsCmeno: a.who };
    db.machines.push(m);
    return ok(mcnView(m), 'S002');
  }, { screen: MCN, need: 'reg' });
  add('PUT', '/api/mcn-info/:ofcCode/:mcnNo', ({ params, body, user }) => {
    const m = findMcn(params.ofcCode, params.mcnNo);
    if (!m) throw notFound('MCN_001', params.ofcCode, params.mcnNo);
    const v = mcnBody(body, params);
    const a = audit(user);
    Object.assign(m, v, { lschgDtm: a.dtm, lsCmeno: a.who });
    return ok(mcnView(m), 'S003');
  }, { screen: MCN, need: 'upd' });
  add('DELETE', '/api/mcn-info/:ofcCode/:mcnNo', ({ params, user }) => {
    const m = findMcn(params.ofcCode, params.mcnNo);
    if (!m) throw notFound('MCN_001', params.ofcCode, params.mcnNo);
    const a = audit(user);
    Object.assign(m, { useYn: 'N', lschgDtm: a.dtm, lsCmeno: a.who }); // 논리 삭제
    return ok(null, 'S004');
  }, { screen: MCN, need: 'del' });

  /* ---- 견본: 기기모델코드 ---- */
  const MODEL = 'sample.mcnModel';
  add('GET', '/api/mcn-model', ({ q }) => {
    const vendCode = trim(q.get('vendCode'));
    const mcnType = trim(q.get('mcnType'));
    const kw = trim(q.get('q'));
    const rows = db.models
      .filter((m) => (!vendCode || m.vendCode === vendCode) && (!mcnType || m.mcnType === mcnType) && (!kw || has(m.modelCode, kw) || has(m.modelNm, kw)))
      .sort((a, b) => modelKey(a).localeCompare(modelKey(b)))
      .map(modelView);
    return ok(rows);
  }, { screen: MODEL, need: 'qry' });
  add('POST', '/api/mcn-model/batch', ({ body, user }) => {
    if (!body || typeof body !== 'object') throw bad('VAL_004');
    const added = Array.isArray(body.added) ? body.added : [];
    const updated = Array.isArray(body.updated) ? body.updated : [];
    const deleted = Array.isArray(body.deleted) ? body.deleted : [];
    // 들어온 종류만 권한을 본다(계약 §5)
    const p = permsOf(user);
    if ((added.length && !p.includes('reg')) || (updated.length && !p.includes('upd')) || (deleted.length && !p.includes('del'))) throw new ApiError(403, 'SYS_403');
    for (const r of [...added, ...updated, ...deleted]) {
      for (const k of ['vendCode', 'mcnType', 'modelCode']) if (!trim(r?.[k]) || trim(r[k]).length > 2) throw bad('VAL_001', k);
    }
    for (const r of [...added, ...updated]) if (r.modelNm && byteLen(r.modelNm) > 80) throw bad('VAL_001', 'modelNm');
    const next = db.models.slice();
    const a = audit(user);
    const idx = (r) => next.findIndex((m) => modelKey(m) === modelKey(r));
    for (const r of deleted) { // 삭제 → 수정 → 추가, 한 묶음
      const i = idx(r);
      if (i < 0) throw notFound('MDL_001', modelKey(r));
      next.splice(i, 1);
    }
    for (const r of updated) {
      const i = idx(r);
      if (i < 0) throw notFound('MDL_001', modelKey(r));
      next[i] = { ...next[i], modelNm: trim(r.modelNm) || null, lschgDtm: a.dtm, lsCmeno: a.who };
    }
    for (const r of added) {
      if (idx(r) >= 0) throw bad('MDL_002', modelKey(r));
      next.push({ vendCode: trim(r.vendCode), mcnType: trim(r.mcnType), modelCode: trim(r.modelCode), modelNm: trim(r.modelNm) || null, crtDtm: a.dtm, crtCmeno: a.who, lschgDtm: a.dtm, lsCmeno: a.who });
    }
    db.models = next;
    return ok({ added: added.length, updated: updated.length, deleted: deleted.length }, 'S001');
  }, { screen: MODEL, need: 'qry' });

  /* ---- 장애현황(잠정) ---- */
  const FAULT = 'mgmt.faultStatus';
  add('GET', '/api/fault/status', ({ q }) => {
    const ofcCode = normOfc(q.get('ofcCode'));
    if (!ofcCode) throw bad('V001_20');
    const mcnNo = trim(q.get('mcnNo'));
    const view = (trim(q.get('view')) || 'ALL').toUpperCase();
    const all = db.machines.filter((m) => m.ofcCode === ofcCode && m.useYn === 'Y').sort((a, b) => (a.instPstCode ?? '').localeCompare(b.instPstCode ?? '') || a.mcnNo.localeCompare(b.mcnNo)).map(faultOf);
    const count = (s) => all.filter((m) => m.status === s).length;
    const kpi = { total: all.length, normal: count('00'), notOpen: count('09'), devFault: count('02'), opFault: count('01'), commLost: count('03') };
    const mcns = all.filter((m) => (!mcnNo || m.mcnNo === mcnNo) && (view === 'ALL' || (view === 'FAULT' ? m.status !== '00' : m.status === '00')));
    const n = kst();
    const asOf = `${n.getUTCFullYear()}-${pad(n.getUTCMonth() + 1)}-${pad(n.getUTCDate())} ${pad(n.getUTCHours())}:${pad(n.getUTCMinutes())}:${pad(n.getUTCSeconds())}`;
    return ok({ asOf, ofcCode, kanm: kanmOf(ofcCode), kpi, mcns });
  }, { screen: FAULT, need: 'qry' });
  // 명령 성공 문구는 계약·TSV 에 없어서 보내지 않는다(message null)
  add('POST', '/api/fault/command', ({ body }) => {
    if (!body || !Array.isArray(body.mcnNos) || body.mcnNos.length === 0) throw bad('VAL_001', 'mcnNos');
    if (!['RESET', 'RESET_TEST', 'SHUTDOWN_TEST', 'FDS_DELETE'].includes(body.cmd)) throw bad('VAL_001', 'cmd');
    return ok({ accepted: body.mcnNos.length });
  }, { screen: FAULT, need: 'exe' });

  /* ================================================================ 요청 처리 */
  const readBody = (req) =>
    new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      req.on('error', reject);
    });
  const cookieOf = (req, name) => {
    const m = new RegExp(`(?:^|;\\s*)${name}=([^;]*)`).exec(req.headers.cookie ?? '');
    return m ? decodeURIComponent(m[1]) : null;
  };
  const log = (...a) => {
    if (!quiet) console.log(...a);
  };

  const handle = async (req, res) => {
    const started = Date.now();
    const url = new URL(req.url ?? '/', 'http://localhost');
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const method = (req.method ?? 'GET').toUpperCase();
    const ctx = { sid: cookieOf(req, 'JSESSIONID'), setCookie: null, userPerNo: null };
    let screen = '';
    try {
      screen = req.headers['x-screen-key'] ? String(req.headers['x-screen-key']) : '';
    } catch {
      screen = '';
    }
    let out;
    try {
      // 가짜 서버 관리용(프론트는 부르지 않는다)
      if (path === '/__mock/unknown') out = { status: 200, body: unknown };
      else if (path === '/__mock/requests') out = { status: 200, body: requests };
      else if (path === '/__mock/reset' && method === 'POST') {
        db = buildDb();
        out = { status: 200, body: { reset: true } };
      } else if (!path.startsWith('/api/')) out = { status: 404, body: { success: false, message: text('SYS_404'), code: 'SYS_404', data: null } };
      else {
        const sameMethod = routes.filter((r) => r.method === method);
        // 고정 주소(/api/notice/delete)가 변수 주소(/api/notice/:no)보다 먼저 맞도록 변수 없는 틀부터 본다
        const hit = [...sameMethod].sort((a, b) => a.names.length - b.names.length).find((r) => r.re.test(path));
        if (!hit) {
          unknown.push({ method, path, query: url.search });
          console.error(`\n[mock-api] !!!!!!!! 모르는 주소 !!!!!!!!  ${method} ${path}${url.search}  → 404 SYS_404 (mock-api.mjs 에 추가하세요)\n`);
          throw new ApiError(routes.some((r) => r.re.test(path)) ? 405 : 404, routes.some((r) => r.re.test(path)) ? 'SYS_405' : 'SYS_404', method);
        }
        const isAuthPath = path.startsWith('/api/auth/');
        let user = null;
        if (!isAuthPath) {
          const perNo = ctx.sid ? sessions.get(ctx.sid) : null;
          if (!perNo) throw new ApiError(401, 'ME_002'); // 세션 없음 → 화면은 로그인 화면으로
          user = meOf(perNo);
          if (!user) throw new ApiError(401, 'ME_001');
          ctx.userPerNo = perNo;
          if (hit.auth && !permsOf(user).includes(hit.auth.need)) throw new ApiError(403, 'SYS_403');
        }
        let body;
        if (method === 'POST' || method === 'PUT') {
          const raw = await readBody(req);
          if (raw.trim()) {
            try {
              body = JSON.parse(raw);
            } catch {
              throw bad('VAL_004');
            }
          }
        }
        const m = hit.re.exec(path);
        const params = Object.fromEntries(hit.names.map((n, i) => [n, decodeURIComponent(m[i + 1])]));
        out = hit.handler({ q: url.searchParams, params, body, user, ctx });
      }
    } catch (e) {
      if (e instanceof ApiError) out = { status: e.status, body: { success: false, message: e.message, code: e.code, data: null } };
      else {
        console.error('[mock-api] 처리 중 오류', e);
        out = { status: 500, body: { success: false, message: text('SYS_500'), code: 'SYS_500', data: null } };
      }
    }
    const send = () => {
      const json = JSON.stringify(out.body);
      const headers = { 'Content-Type': 'application/json;charset=UTF-8', 'Cache-Control': 'no-store' };
      if (ctx.setCookie) headers['Set-Cookie'] = ctx.setCookie;
      res.writeHead(out.status, headers);
      res.end(json);
      const code = out.body && typeof out.body === 'object' && 'code' in out.body ? out.body.code : '';
      if (path.startsWith('/api/')) requests.push({ method, path, query: url.search, status: out.status, code, screen, user: ctx.userPerNo });
      log(`[mock-api] ${method.padEnd(6)} ${path}${url.search}  → ${out.status} ${code}${screen ? `  (화면 ${screen})` : ''}${ctx.userPerNo ? `  사용자 ${ctx.userPerNo}` : ''}  ${Date.now() - started}ms`);
    };
    if (delayMs > 0 && path.startsWith('/api/')) setTimeout(send, delayMs);
    else send();
  };

  const server = http.createServer((req, res) => void handle(req, res));
  const mock = {
    server,
    port: opts.port ?? Number(process.env.PORT ?? 8080),
    url: '',
    unknown,
    requests,
    users: USERS,
    /** 자료를 처음 상태로(세션·암호화 키는 그대로) */
    reset() {
      db = buildDb();
    },
    /** 요청 기록·모르는 주소 기록 비우기 */
    clearLogs() {
      unknown.length = 0;
      requests.length = 0;
    },
    listen() {
      return new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(mock.port, () => {
          mock.port = server.address().port;
          mock.url = `http://127.0.0.1:${mock.port}`;
          resolve(mock);
        });
      });
    },
    close() {
      return new Promise((resolve) => {
        server.closeAllConnections?.();
        server.close(() => resolve());
      });
    },
  };
  return mock;
}

/* ================================================================== 혼자 실행 */
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const mock = createMockServer();
  mock.listen().then(
    () => {
      console.log(`[mock-api] 가짜 백엔드가 떴습니다 → ${mock.url}  (프론트 개발 서버의 /api 프록시 대상, 기본 8080)`);
      console.log('[mock-api] 로그인 계정(비밀번호는 아무 글자나):');
      for (const u of USERS) console.log(`             ${u.perNo}  ${u.name}  권한 ${u.auth}  ${u.note}`);
      console.log('[mock-api] 끝내려면 Ctrl+C');
    },
    (e) => {
      console.error(`[mock-api] 시작 실패: ${e.message}`);
      process.exit(1);
    },
  );
  const stop = () => mock.close().then(() => process.exit(0));
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}
