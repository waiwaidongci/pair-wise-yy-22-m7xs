import type { RequestHandler } from "express";
import type { UserRole } from "../constants/UserRole";
import { AppError } from "../utils/AppError";
import type { AuthedRequest } from "./authMiddleware";

export const rbacMiddleware =
  (roles: UserRole[] = []): RequestHandler =>
  (req, _res, next) => {
    const user = (req as AuthedRequest).user;
    if (roles.length > 0 && !roles.includes(user.role)) {
      next(new AppError("RBAC_DENIED", 403));
      return;
    }
    next();
  };
