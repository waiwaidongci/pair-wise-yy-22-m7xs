import { Router } from "express";
import { relicItemController } from "../controllers/RelicItemController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();
router.get("/", relicItemController.list);
router.get("/:id", relicItemController.detail);
router.post("/", rbacMiddleware(["RESTORER", "ARCHIVIST"]), relicItemController.create);
router.patch("/:id/condition", rbacMiddleware(["RESTORER", "ARCHIVIST"]), relicItemController.updateCondition);

export default router;
