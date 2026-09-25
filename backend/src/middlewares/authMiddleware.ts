import type { Request, RequestHandler } from "express";
import { findUserById } from "../constants/demoUsers";
import type { Actor } from "../models/Actor";
import { AppError } from "../utils/AppError";

export interface AuthedRequest extends Request {
  user: Actor;
}

/**
 * 本地演示鉴权：前端选择演示账号后以 x-user-id 透传；
 * 也兼容 Authorization: Bearer <userId>。健康检查无需身份。
 */
export const authMiddleware: RequestHandler = (req, _res, next) => {
  const headerId = req.header("x-user-id");
  const bearer = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  const rawId = headerId ?? (bearer && /^\d+$/.test(bearer) ? bearer : undefined);
  const userId = Number(rawId);
  const user = Number.isFinite(userId) ? findUserById(userId) : undefined;
  if (!user) {
    next(new AppError("AUTH_REQUIRED", 401));
    return;
  }
  (req as AuthedRequest).user = user;
  next();
};
