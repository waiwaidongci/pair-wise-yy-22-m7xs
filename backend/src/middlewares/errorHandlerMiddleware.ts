import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/AppError";

/** service/controller 分别抛出 AppError，此处仅做最终兜底，绝不吞掉业务异常。 */
export const errorHandlerMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  let error: AppError;
  if (err instanceof AppError) {
    error = err;
  } else if (err?.type === "entity.parse.failed" || err instanceof SyntaxError) {
    error = new AppError("VALIDATION_FAILED", 400, "请求体不是合法的 JSON");
  } else {
    error = new AppError("INVALID_STATE", err?.status ?? 500, String(err?.message ?? err));
  }
  if (error.status >= 500) {
    console.error("[unhandled]", err);
  }
  res.status(error.status).json({ code: error.code, message: error.message });
};
