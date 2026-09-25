import type { Request, Response } from "express";
import { damageRecordService } from "../services/DamageRecordService";
import { asyncHandler } from "../utils/asyncHandler";
import { requireId } from "../utils/formatters";

export const damageRecordController = {
  list: asyncHandler((req: Request, res: Response) => {
    const relicId = req.query.relic_id !== undefined ? requireId(req.query.relic_id, "文物 id") : undefined;
    res.json(damageRecordService.list(relicId));
  }),

  detail: asyncHandler((req: Request, res: Response) => {
    res.json(damageRecordService.get(requireId(req.params.id, "病害记录 id")));
  }),

  /** 病害登记 */
  register: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await damageRecordService.register(req.user, req.body));
  }),

  /** 原病害更正：旧档保留，生成修订版，下游档案标受影响 */
  correct: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(
      await damageRecordService.correct(req.user, requireId(req.params.id, "病害记录 id"), req.body)
    );
  })
};
