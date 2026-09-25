import type { Response } from "express";
import { damageRecordService } from "../services/DamageRecordService";
import { asyncHandler } from "../utils/asyncHandler";
import type { AuthedRequest } from "../middlewares/authMiddleware";

export const damageRecordController = {
  list: asyncHandler(async (_req: AuthedRequest, res: Response) => {
    res.json(damageRecordService.list());
  }),
  register: asyncHandler(async (req: AuthedRequest, res: Response) => {
    res.status(201).json(await damageRecordService.register(req.user, req.body));
  }),
  close: asyncHandler(async (req: AuthedRequest, res: Response) => {
    res.json(await damageRecordService.close(req.user, Number(req.params.id)));
  }),
  correct: asyncHandler(async (req: AuthedRequest, res: Response) => {
    res.status(201).json(await damageRecordService.correct(req.user, Number(req.params.id), req.body));
  })
};
