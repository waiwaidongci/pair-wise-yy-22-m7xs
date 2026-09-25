import { ERROR_CODES, type ErrorCode } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

/** 业务异常：service 与 controller 分别包装，最终由 errorHandlerMiddleware 统一应答 */
export class BusinessError extends Error {
  status: number;
  code: ErrorCode;

  constructor(code: ErrorCode, message?: string, status?: number) {
    super(message ?? ERROR_MESSAGES[code]);
    this.name = "BusinessError";
    this.code = code;
    const conflictCodes: readonly string[] = [
      ERROR_CODES.FLOW_CONFLICT,
      ERROR_CODES.OPEN_PLAN_EXISTS,
      ERROR_CODES.PLAN_CONTENT_CHANGED,
      ERROR_CODES.ALREADY_PROCESSED,
      ERROR_CODES.ARCHIVE_NOT_READY
    ];
    this.status =
      status ??
      (code === ERROR_CODES.NOT_FOUND
        ? 404
        : conflictCodes.includes(code)
        ? 409
        : code === ERROR_CODES.RBAC_DENIED
        ? 403
        : code === ERROR_CODES.AUTH_REQUIRED
        ? 401
        : 400);
  }

  static notFound(message?: string) {
    return new BusinessError(ERROR_CODES.NOT_FOUND, message, 404);
  }

  static flow(message?: string) {
    return new BusinessError(ERROR_CODES.FLOW_CONFLICT, message, 409);
  }

  static alreadyProcessed(message?: string) {
    return new BusinessError(ERROR_CODES.ALREADY_PROCESSED, message ?? ERROR_MESSAGES.ALREADY_PROCESSED, 409);
  }
}
