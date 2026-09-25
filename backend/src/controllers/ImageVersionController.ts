import type { Response } from "express";
import { imageVersionService } from "../services/ImageVersionService";
import { asyncHandler } from "../utils/asyncHandler";
import type { AuthedRequest } from "../middlewares/authMiddleware";

export const imageVersionController = {
  list: asyncHandler(async (_req: AuthedRequest, res: Response) => {
    res.json(imageVersionService.list());
  }),
  upload: asyncHandler(async (req: AuthedRequest, res: Response) => {
    res
      .status(201)
      .json(await imageVersionService.upload(req.user, Number(req.params.planId), req.body));
  })
};
