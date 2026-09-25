import type { Response } from "express";
import { relicItemService } from "../services/RelicItemService";
import { asyncHandler } from "../utils/asyncHandler";
import type { AuthedRequest } from "../middlewares/authMiddleware";

export const relicItemController = {
  list: asyncHandler(async (_req: AuthedRequest, res: Response) => {
    res.json(relicItemService.list());
  }),
  detail: asyncHandler(async (req: AuthedRequest, res: Response) => {
    res.json(relicItemService.detail(Number(req.params.id)));
  }),
  create: asyncHandler(async (req: AuthedRequest, res: Response) => {
    res.status(201).json(await relicItemService.create(req.user, req.body));
  }),
  updateCondition: asyncHandler(async (req: AuthedRequest, res: Response) => {
    res.json(await relicItemService.updateCondition(req.user, Number(req.params.id), String(req.body.current_condition)));
  })
};
