import { Router } from "express";
import { restorationStepController } from "../controllers/RestorationStepController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();
router.get("/", restorationStepController.list);
router.post("/plan/:planId", rbacMiddleware(["RESTORER"]), restorationStepController.create);
router.post("/:id/complete", rbacMiddleware(["RESTORER"]), restorationStepController.complete);

export default router;
