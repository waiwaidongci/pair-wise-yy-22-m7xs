import type { Request, Response } from "express";
import { restorationPlanService } from "../services/RestorationPlanService";
import { dossierService } from "../services/DossierService";
import { asyncHandler } from "../utils/asyncHandler";
import { requireId } from "../utils/formatters";

export const restorationPlanController = {
  list: asyncHandler((req: Request, res: Response) => {
    const relicId = req.query.relic_id !== undefined ? requireId(req.query.relic_id, "文物 id") : undefined;
    res.json(restorationPlanService.list(relicId));
  }),

  /** 方案档案：方案 + 步骤 + 影像 + 流程动作开关 */
  detail: asyncHandler((req: Request, res: Response) => {
    res.json(dossierService.getPlanDossier(requireId(req.params.id, "方案 id")));
  }),

  /** 编制方案（沿用病害编号、记录编制人） */
  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await restorationPlanService.create(req.user, req.body));
  }),

  /** 修改方案内容（提交后修改会退回重新提交） */
  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(
      await restorationPlanService.update(req.user, requireId(req.params.id, "方案 id"), req.body)
    );
  }),

  /** 提交专家审批 */
  submit: asyncHandler(async (req: Request, res: Response) => {
    res.json(await restorationPlanService.submit(req.user, requireId(req.params.id, "方案 id")));
  }),

  /** 专家审批：两人同时审批，先到者生效 */
  review: asyncHandler(async (req: Request, res: Response) => {
    res.json(
      await restorationPlanService.review(req.user, requireId(req.params.id, "方案 id"), req.body)
    );
  }),

  /** 方案更正：旧档保留标受影响，生成修订方案重新审批 */
  correct: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(
      await restorationPlanService.correct(req.user, requireId(req.params.id, "方案 id"), req.body)
    );
  }),

  /** 全部步骤完成且前后影像齐全后归档 */
  archive: asyncHandler(async (req: Request, res: Response) => {
    res.json(await restorationPlanService.archive(req.user, requireId(req.params.id, "方案 id")));
  })
};
