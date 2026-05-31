/**
 * Map giữa enum DB (UPPER_SNAKE) và string slug (kebab-case) cho frontend.
 * FE dùng 'admin', 'phong-dao-tao', ... DB lưu ADMIN, PHONG_DAO_TAO, ...
 */
const DB_TO_SLUG = {
  ADMIN: 'admin',
  PHONG_DAO_TAO: 'phong-dao-tao',
  PHONG_TAI_CHINH: 'phong-tai-chinh',
  GIANG_VIEN: 'giang-vien',
  CO_VAN: 'co-van',
  SINH_VIEN: 'sinh-vien',
};

const SLUG_TO_DB = Object.fromEntries(
  Object.entries(DB_TO_SLUG).map(([k, v]) => [v, k]),
);

export function dbRoleToSlug(dbRole) {
  return DB_TO_SLUG[dbRole] ?? dbRole;
}

export function slugToDbRole(slug) {
  return SLUG_TO_DB[slug] ?? null;
}

export const ALL_ROLES_DB = Object.keys(DB_TO_SLUG);
export const ALL_ROLES_SLUG = Object.values(DB_TO_SLUG);
