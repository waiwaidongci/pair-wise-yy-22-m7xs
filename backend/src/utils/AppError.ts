import { ERROR_CODES, type ErrorCode } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export class AppError extends Error {
  status: number;
  code: ErrorCode;

  constructor(code: ErrorCode, status = 400, detail?: string) {
    super(detail ?? ERROR_MESSAGES[code]);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export const notFound = (code: ErrorCode) => new AppError(code, 404);
export const conflict = (code: ErrorCode, detail?: string) => new AppError(code, 409, detail);
export const validation = (detail: string) =>
  new AppError(ERROR_CODES.VALIDATION_FAILED as ErrorCode, 400, detail);
export const forbidden = () => new AppError("RBAC_DENIED", 403);
export const unauthorized = () => new AppError("AUTH_REQUIRED", 401);
