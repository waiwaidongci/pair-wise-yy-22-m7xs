import { Router } from "express";
import { restorationPlanController } from "../controllers/RestorationPlanController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();

router.get("/", restorationPlanController.list);
router.get("/:id", restorationPlanController.detail);
// 编制/修改/更正：修复师
router.post("/", rbacMiddleware(["RESTORER"]), restorationPlanController.create);
router.patch("/:id", rbacMiddleware(["RESTORER"]), restorationPlanController.update);
router.post("/:id/correct", rbacMiddleware(["RESTORER"]), restorationPlanController.correct);
// 提交审批：修复师
router.post("/:id/submit", rbacMiddleware(["RESTORER"]), restorationPlanController.submit);
// 专家审批：仅专家
router.post("/:id/review", rbacMiddleware(["EXPERT"]), restorationPlanController.review);
// 归档：档案员
router.post("/:id/archive", rbacMiddleware(["ARCHIVIST"]), restorationPlanController.archive);

export default router;
