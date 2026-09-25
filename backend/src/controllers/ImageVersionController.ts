import type { Request, Response } from "express";
import { imageVersionService } from "../services/ImageVersionService";
import { asyncHandler } from "../utils/asyncHandler";
import { requireId } from "../utils/formatters";

export const imageVersionController = {
  list: asyncHandler((req: Request, res: Response) => {
    res.json(
      imageVersionService.list({
        relicId: req.query.relic_id !== undefined ? requireId(req.query.relic_id, "文物 id") : undefined,
        planId: req.query.plan_id !== undefined ? requireId(req.query.plan_id, "方案 id") : undefined
      })
    );
  }),

  /** 上传修复前/修复后影像（修复后影像要求全部步骤完成） */
  upload: asyncHandler(async (req: Request, res: Response) => {
    res
      .status(201)
      .json(await imageVersionService.upload(req.user, req.params.planId, req.body));
  })
};
