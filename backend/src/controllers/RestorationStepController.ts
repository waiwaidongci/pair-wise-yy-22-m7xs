import type { Response } from "express";
import { restorationStepService } from "../services/RestorationStepService";
import { asyncHandler } from "../utils/asyncHandler";
import type { AuthedRequest } from "../middlewares/authMiddleware";

export const restorationStepController = {
  list: asyncHandler(async (_req: AuthedRequest, res: Response) => {
    res.json(restorationStepService.list());
  }),
  create: asyncHandler(async (req: AuthedRequest, res: Response) => {
    res
      .status(201)
      .json(await restorationStepService.create(req.user, Number(req.params.planId), String(req.body.technique)));
  }),
  complete: asyncHandler(async (req: AuthedRequest, res: Response) => {
    res.json(await restorationStepService.complete(req.user, Number(req.params.id), req.body ?? {}));
  })
};
