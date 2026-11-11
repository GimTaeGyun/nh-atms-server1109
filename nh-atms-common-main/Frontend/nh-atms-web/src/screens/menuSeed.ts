import type { MenuNode, Yn } from '@/types/menu';
import { L1_BY_SLUG } from './l1';
import { screenPath } from './registry';
import type { ScreenKey } from './screenIds';

/**
 * 내장 메뉴 시드 — `GET /api/menu/my` 와 **같은 모양(계약 MenuNode)** 의 트리.
 * 견본 그룹의 ID·상위·순서·경로는 DB 시드 `db/seed/01_menu.sql` 과 똑같다(종합관리 그룹은 아래 mgmtGroup 주석 — 아직 DB 시드 없음)(SMP000 그룹 상위 '0' 순서 900, SMP001~SMP004 순서 1~4).
 * 한쪽을 바꾸면 다른 쪽도 같이 바꾼다(menuSeed.test 가 db/seed 값과 비교).
 *
 * 쓰는 곳
 *  ① 목 서버 `/api/menu/my` 응답(mocks/data/menu.ts) — `perms: 'all'`(5개 모두 Y, 버튼 모양 확인용)
 *  ② 개발·목 모드에서 실서버 응답에 화면(MENU_PATH)이 하나도 없을 때의 대체 메뉴(useNavStore `resolveMenus`)
 *     — 목 모드가 아니면 `perms: 'qry'`(조회만 Y, 나머지 N): 서버 권한을 모르면서 버튼을 열어 두지 않는다.
 *     운영 빌드는 대체 메뉴를 쓰지 않는다(env.menuSource = 'api').
 * 권한이 없는 모습은 공통 모듈 화면의 "권한 미리보기"로 본다(표시만 바꿈). 서버 검사는 언제나 DB 권한 기준.
 */
const SAMPLE: { key: ScreenKey; name: string }[] = [
  { key: 'sample.commonModules', name: '공통 모듈' },
  { key: 'sample.notice', name: '공지사항' },
  { key: 'sample.mcnInfo', name: '기기정보' },
  { key: 'sample.mcnModel', name: '기기모델코드' },
];

/** 그룹 메뉴 ID·최상위 상위값·순서 (db/seed/01_menu.sql) */
export const SEED_GROUP_ID = 'SMP000';
export const SEED_ROOT_PARENT = '0';
export const SEED_GROUP_SORT = 900;

export type SeedPerms = 'all' | 'qry';

const flags = (perms: SeedPerms) => {
  const rest: Yn = perms === 'all' ? 'Y' : 'N';
  return { useYn: 'Y', qryRolYn: 'Y', regRolYn: rest, updRolYn: rest, delRolYn: rest, exeRolYn: rest } as const;
};

/**
 * 종합관리 그룹 (2026-11-11 추가) — 종합관리 > 장애 > 장애현황.
 * 잠정: DB 시드(db/seed/01_menu.sql)에는 아직 없다(사용자 결정: DB 는 나중에). 그래서 메뉴 ID 'MGT…' 도 잠정이다.
 * DB 메뉴(TB_SCR_MENU)에 화면이 하나라도 있으면 이 내장 메뉴는 쓰이지 않는다(useNavStore resolveMenus)
 * → 실서버에서 보이려면 TB_SCR_MENU 에 같은 행(MENU_PATH '/mgmt/fault-status')과 권한 행이 있어야 한다.
 */
export const MGMT_GROUP_ID = 'MGT000';
export const MGMT_GROUP_SORT = 100;
const MGMT_FOLDERS: { id: string; name: string; leaves: { id: string; key: ScreenKey; name: string }[] }[] = [
  { id: 'MGT100', name: '장애', leaves: [{ id: 'MGT101', key: 'mgmt.faultStatus', name: '장애현황' }] },
];

const mgmtGroup = (perms: SeedPerms): MenuNode => ({
  menuId: MGMT_GROUP_ID,
  parentMenuId: SEED_ROOT_PARENT,
  menuNm: L1_BY_SLUG.mgmt.name,
  menuType: 'G',
  menuPath: null,
  sortNo: MGMT_GROUP_SORT,
  ...flags(perms),
  children: MGMT_FOLDERS.map((f, fi) => ({
    menuId: f.id,
    parentMenuId: MGMT_GROUP_ID,
    menuNm: f.name,
    menuType: 'G',
    menuPath: null,
    sortNo: fi + 1,
    ...flags(perms),
    children: f.leaves.map((l, li) => ({
      menuId: l.id,
      parentMenuId: f.id,
      menuNm: l.name,
      menuType: 'M',
      menuPath: screenPath(l.key),
      sortNo: li + 1,
      ...flags(perms),
      children: [],
    })),
  })),
});

export const buildMenuSeed = (perms: SeedPerms = 'qry'): MenuNode[] => [
  mgmtGroup(perms),
  {
    menuId: SEED_GROUP_ID,
    parentMenuId: SEED_ROOT_PARENT,
    menuNm: L1_BY_SLUG.sample.name,
    menuType: 'G',
    menuPath: null,
    sortNo: SEED_GROUP_SORT,
    ...flags(perms),
    children: SAMPLE.map((s, i) => ({
      menuId: `SMP${String(i + 1).padStart(3, '0')}`,
      parentMenuId: SEED_GROUP_ID,
      menuNm: s.name,
      menuType: 'M',
      menuPath: screenPath(s.key),
      sortNo: i + 1,
      ...flags(perms),
      children: [],
    })),
  },
];
