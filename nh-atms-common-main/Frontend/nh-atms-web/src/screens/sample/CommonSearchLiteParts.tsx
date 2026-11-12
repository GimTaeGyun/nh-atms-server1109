/**
 * 공통 조회 화면(lite) 견본(`sample.commonSearchLite`) 부품 — 조회조건 · 조건→파라미터 · 컬럼, 딱 3가지.
 * 데이터는 기기정보 API(`GET /api/mcn-info`, API 계약 §4)를 그대로 빌려 쓴다 → 백엔드·DB 변경 없음.
 * 새 "조회만 하는 화면"은 이 파일과 CommonSearchLitePage.tsx 두 개를 복사해 이름·API·컬럼만 바꾼다.
 */
import { useMemo } from 'react';
import { useAuthStore, selectOfficeCd } from '@/stores/useAuthStore';
import type { SearchField } from '@/components/search/SearchForm';
import { officeField } from '@/components/search/fields';
import { vendorField, ynField } from '@/components/search/lookupFields';
import { allToUndef } from '@/components/search/params';
import { centerCol, col, indexCol, textCol, ynCol, type Col } from '@/components/grid/columns';
import { fmtOffice } from '@/utils/format';
import type { McnInfo, McnInfoSearch } from '@/domain/mcnInfo';

/* ---------- 1. 조회조건 ---------- */
/** 사무소(필수, 기본 = 내 사무소) · 기기사 · 사용여부(기본 Y) */
export const useLiteFields = (): SearchField[] => {
  const myOfc = useAuthStore(selectOfficeCd);
  return useMemo(() => [officeField({ defaultValue: myOfc || undefined }), vendorField(), ynField()], [myOfc]);
};

/* ---------- 2. 조건값 → API 파라미터 ---------- */
/** '전체'·빈 값은 빼고 보낸다 */
export const toLiteParams = (v: Record<string, unknown>): Omit<McnInfoSearch, 'page' | 'size'> => ({
  ofcCode: String(v.ofcCode ?? ''),
  vendCode: allToUndef(v.vendCode),
  useYn: allToUndef(v.useYn) as McnInfoSearch['useYn'],
});

/* ---------- 3. 컬럼 ---------- */
/** 목록 컬럼 — 순번은 페이지를 넘겨도 이어지게 page·size 를 받는다 */
export const liteColumns = (page: number, size: number): Col<McnInfo>[] => [
  indexCol<McnInfo>(page, size),
  col<McnInfo>('사무소', 'ofcCode', 180, { render: (_v, r) => fmtOffice(r.ofcCode, r.kanm) }),
  centerCol<McnInfo>('기번', 'mcnNo', 70),
  textCol<McnInfo>('코너', 'instPstNm', 160),
  textCol<McnInfo>('기종', 'srcNm', 140),
  textCol<McnInfo>('기기사', 'vendNm', 120),
  ynCol<McnInfo>('사용여부', 'useYn', 80),
];
