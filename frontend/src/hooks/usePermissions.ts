import { useSessionStore } from "../stores/SessionStore";
import type { UserRoleValue } from "../types/SessionUser";

/** 按钮显隐与 RBAC 对应：修复师编制/执行、专家审批、档案员归档、访客只读 */
export function usePermissions() {
  const role = useSessionStore((state) => state.user.role);
  const isRole = (...roles: UserRoleValue[]) => roles.includes(role);
  return {
    role,
    isRestorer: isRole("RESTORER"),
    isExpert: isRole("EXPERT"),
    isArchivist: isRole("ARCHIVIST"),
    isVisitor: isRole("VISITOR"),
    canWrite: isRole("RESTORER", "EXPERT", "ARCHIVIST")
  };
}
