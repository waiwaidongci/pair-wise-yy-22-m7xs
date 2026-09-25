import { Router } from "express";
import { restorationPlanController } from "../controllers/RestorationPlanController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();
router.get("/", restorationPlanController.list);
router.post("/", rbacMiddleware(["RESTORER"]), restorationPlanController.create);
router.patch("/:id", rbacMiddleware(["RESTORER"]), restorationPlanController.update);
router.post("/:id/submit", rbacMiddleware(["RESTORER"]), restorationPlanController.submit);
router.post("/:id/approve", rbacMiddleware(["EXPERT"]), restorationPlanController.approve);
router.post("/:id/reject", rbacMiddleware(["EXPERT"]), restorationPlanController.reject);
router.post("/:id/correct", rbacMiddleware(["RESTORER"]), restorationPlanController.correct);
router.post("/:id/archive", rbacMiddleware(["ARCHIVIST"]), restorationPlanController.archive);

export default router;
