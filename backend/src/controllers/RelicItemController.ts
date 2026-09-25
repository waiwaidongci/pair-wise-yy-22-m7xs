import type { Request, Response } from "express";
import { relicItemService } from "../services/RelicItemService";
import { dossierService } from "../services/DossierService";
import { auditService } from "../services/AuditService";
import { asyncHandler } from "../utils/asyncHandler";
import { requireId } from "../utils/formatters";

export const relicItemController = {
  list: asyncHandler((_req: Request, res: Response) => {
    res.json(relicItemService.list());
  }),

  detail: asyncHandler((req: Request, res: Response) => {
    res.json(relicItemService.get(requireId(req.params.id, "文物 id")));
  }),

  /** 文物可操作档案：文物 + 病害 + 方案（含步骤/影像/动作开关） */
  dossier: asyncHandler((req: Request, res: Response) => {
    res.json(dossierService.getRelicDossier(requireId(req.params.id, "文物 id")));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await relicItemService.create(req.user, req.body));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await relicItemService.update(req.user, requireId(req.params.id, "文物 id"), req.body));
  }),

  auditLogs: asyncHandler((_req: Request, res: Response) => {
    res.json(auditService.list());
  })
};
