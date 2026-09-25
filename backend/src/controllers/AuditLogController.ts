import type { Response } from "express";
import { auditLogService } from "../services/AuditLogService";
import { asyncHandler } from "../utils/asyncHandler";
import type { AuthedRequest } from "../middlewares/authMiddleware";

export const auditLogController = {
  list: asyncHandler((_req: AuthedRequest, res: Response) => {
    res.json(auditLogService.list());
  })
};
