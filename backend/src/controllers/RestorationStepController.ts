import type { Request, Response } from "express";
import { restorationStepService } from "../services/RestorationStepService";
import { asyncHandler } from "../utils/asyncHandler";
import { requireId } from "../utils/formatters";

export const restorationStepController = {
  list: asyncHandler((req: Request, res: Response) => {
    const planId = req.query.plan_id !== undefined ? requireId(req.query.plan_id, "方案 id") : undefined;
    res.json(restorationStepService.list(planId));
  }),

  detail: asyncHandler((req: Request, res: Response) => {
    res.json(restorationStepService.get(requireId(req.params.id, "步骤 id")));
  }),

  /** 拆步骤（方案通过后）：记录工序与材料 */
  create: asyncHandler(async (req: Request, res: Response) => {
    res
      .status(201)
      .json(
        await restorationStepService.create(req.user, req.params.planId, req.body)
      );
  }),

  /** 完成步骤：回写材料、操作人、完成时间；并发提交先到者生效 */
  finish: asyncHandler(async (req: Request, res: Response) => {
    res.json(
      await restorationStepService.finish(req.user, requireId(req.params.id, "步骤 id"), req.body)
    );
  })
};
