import type { RequestHandler } from "express";

/**
 * 审计日志中间件：写请求统一留痕（业务结果日志由各 service 通过 auditService 记录）。
 * GET /api/audit-log 可查询全量操作日志。
 */
export const auditLogMiddleware: RequestHandler = (req, _res, next) => {
  if (!req.method.startsWith("GET") && !req.path.startsWith("/health")) {
    console.info(
      `[audit] ${req.user?.name ?? "unknown"}(${req.user?.role ?? "-"}) ${req.method} ${req.originalUrl}`
    );
  }
  next();
};
