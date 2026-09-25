import { Router } from "express";
import { imageVersionController } from "../controllers/ImageVersionController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();
router.get("/", imageVersionController.list);
router.post("/plan/:planId", rbacMiddleware(["ARCHIVIST", "RESTORER"]), imageVersionController.upload);

export default router;
