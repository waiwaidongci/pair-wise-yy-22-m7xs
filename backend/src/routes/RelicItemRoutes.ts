import { Router } from "express";
import { relicItemController } from "../controllers/RelicItemController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();

router.get("/", relicItemController.list);
router.get("/audit-logs", relicItemController.auditLogs);
router.get("/:id/dossier", relicItemController.dossier);
router.get("/:id", relicItemController.detail);
router.post("/", rbacMiddleware(["RESTORER", "ARCHIVIST"]), relicItemController.create);
router.patch("/:id", rbacMiddleware(["RESTORER", "ARCHIVIST"]), relicItemController.update);

export default router;
