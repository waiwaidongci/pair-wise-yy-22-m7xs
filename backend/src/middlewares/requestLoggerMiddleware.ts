import type { RequestHandler } from "express";

/** 请求日志：记录方法、路径与当前操作人 */
export const requestLoggerMiddleware: RequestHandler = (req, _res, next) => {
  const actor = req.user?.name ?? "anonymous";
  console.info(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} by ${actor}`);
  next();
};
