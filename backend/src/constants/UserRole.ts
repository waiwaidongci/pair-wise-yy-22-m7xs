/** RBAC 角色：修复师 / 专家审批 / 档案员 / 访客 */
export const UserRole = ["RESTORER", "EXPERT", "ARCHIVIST", "VISITOR"] as const;
export type UserRole = (typeof UserRole)[number];
