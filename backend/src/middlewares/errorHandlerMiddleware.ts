import type { ErrorRequestHandler } from "express";
import { BusinessError } from "../utils/BusinessError";

/** 全局错误处理：service / controller 分别包装 BusinessError 后在此统一应答 */
export const errorHandlerMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof BusinessError) {
    res.status(err.status).json({ code: err.code, message: err.message });
    return;
  }
  console.error("[unhandled]", err);
  res.status(500).json({
    code: "INTERNAL_ERROR",
    message: err instanceof Error ? err.message : "服务器内部错误"
  });
};
