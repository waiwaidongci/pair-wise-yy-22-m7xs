import type { UserRole } from "../constants/UserRole";

/** 演示环境内置账号，对应 JWT + RBAC 四类角色：修复师 / 专家审批 / 档案员 / 访客 */
export const DIRECTORY: Record<string, { id: number; name: string; role: UserRole }> = {
  "1": { id: 1, name: "李慕白", role: "RESTORER" },
  "2": { id: 2, name: "王栖梧", role: "RESTORER" },
  "3": { id: 3, name: "周慎之", role: "EXPERT" },
  "4": { id: 4, name: "陈兰", role: "ARCHIVIST" },
  "5": { id: 5, name: "访客", role: "VISITOR" }
};

export const ROLE_LABEL: Record<UserRole, string> = {
  RESTORER: "修复师",
  EXPERT: "专家审批",
  ARCHIVIST: "档案员",
  VISITOR: "访客"
};
