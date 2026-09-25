export const UserRole = ["RESTORER", "EXPERT", "ARCHIVIST", "VISITOR"] as const;
export type UserRole = (typeof UserRole)[number];

export const UserRoleText: Record<UserRole, string> = {
  RESTORER: "修复师",
  EXPERT: "专家审批",
  ARCHIVIST: "档案员",
  VISITOR: "访客"
};

export const DIRECTORY_USERS: { id: number; name: string; role: UserRole }[] = [
  { id: 1, name: "李慕白", role: "RESTORER" },
  { id: 2, name: "王栖梧", role: "RESTORER" },
  { id: 3, name: "周慎之", role: "EXPERT" },
  { id: 4, name: "陈兰", role: "ARCHIVIST" },
  { id: 5, name: "访客", role: "VISITOR" }
];
