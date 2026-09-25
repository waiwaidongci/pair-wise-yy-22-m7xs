import type { Response } from "express";
import { restorationPlanService } from "../services/RestorationPlanService";
import { asyncHandler } from "../utils/asyncHandler";
import type { AuthedRequest } from "../middlewares/authMiddleware";

export const restorationPlanController = {
  list: asyncHandler(async (_req: AuthedRequest, res: Response) => {
    res.json(restorationPlanService.list());
  }),
  create: asyncHandler(async (req: AuthedRequest, res: Response) => {
    res.status(201).json(await restorationPlanService.create(req.user, req.body));
  }),
  update: asyncHandler(async (req: AuthedRequest, res: Response) => {
    res.json(await restorationPlanService.updateContent(req.user, Number(req.params.id), req.body));
  }),
  submit: asyncHandler(async (req: AuthedRequest, res: Response) => {
    res.json(await restorationPlanService.submit(req.user, Number(req.params.id)));
  }),
  approve: asyncHandler(async (req: AuthedRequest, res: Response) => {
    res.json(await restorationPlanService.decide(req.user, Number(req.params.id), true, req.body ?? {}));
  }),
  reject: asyncHandler(async (req: AuthedRequest, res: Response) => {
    res.json(await restorationPlanService.decide(req.user, Number(req.params.id), false, req.body ?? {}));
  }),
  correct: asyncHandler(async (req: AuthedRequest, res: Response) => {
    res.status(201).json(await restorationPlanService.correct(req.user, Number(req.params.id), req.body));
  }),
  archive: asyncHandler(async (req: AuthedRequest, res: Response) => {
    res.json(await restorationPlanService.archive(req.user, Number(req.params.id)));
  })
};
