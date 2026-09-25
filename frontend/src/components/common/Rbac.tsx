import type { ReactNode } from "react";
import type { UserRole } from "../../constants/UserRole";
import { useAuthStore } from "../../stores/AuthStore";

interface RbacProps {
  roles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

/** 按角色控制按钮显隐：修复师/审批专家/档案员/访客各司其职。 */
export function Rbac({ roles, children, fallback = null }: RbacProps) {
  const role = useAuthStore((state) => state.user.role);
  return <>{roles.includes(role) ? children : fallback}</>;
}
