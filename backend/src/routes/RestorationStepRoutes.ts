import { Router } from "express";
import { restorationStepController } from "../controllers/RestorationStepController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router({ mergeParams: true });

router.get("/", restorationStepController.list);
router.get("/:id", restorationStepController.detail);
// 拆步骤：方案通过后由修复师操作
router.post("/plan/:planId", rbacMiddleware(["RESTORER"]), restorationStepController.create);
// 完成步骤（回写材料/操作人/完成时间）：修复师，并发先到者生效
router.post("/:id/finish", rbacMiddleware(["RESTORER"]), restorationStepController.finish);

export default router;
