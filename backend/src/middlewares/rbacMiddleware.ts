import type { RequestHandler } from "express";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { BusinessError } from "../utils/BusinessError";

/**
 * RBAC：按角色控制写操作入口（修复师/专家审批/档案员/访客）。
 * 访客只读；方案审批仅专家；归档仅档案员；病害登记、方案编制、步骤执行由修复师完成。
 */
export const rbacMiddleware =
  (roles: string[] = []): RequestHandler =>
  (req, _res, next) => {
    if (roles.length === 0 || roles.includes(req.user.role)) {
      next();
      return;
    }
    next(new BusinessError("RBAC_DENIED", `${ERROR_MESSAGES.RBAC_DENIED}（需要 ${roles.join("/")}）`, 403));
  };
