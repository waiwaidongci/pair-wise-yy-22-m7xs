import { Router } from "express";
import { imageVersionController } from "../controllers/ImageVersionController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router({ mergeParams: true });

router.get("/", imageVersionController.list);
// 上传修复前/修复后影像：修复师
router.post("/plan/:planId", rbacMiddleware(["RESTORER"]), imageVersionController.upload);

export default router;
