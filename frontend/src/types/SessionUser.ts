export type UserRoleValue = "RESTORER" | "EXPERT" | "ARCHIVIST" | "VISITOR";

export interface SessionUser {
  id: number;
  name: string;
  role: UserRoleValue;
}
