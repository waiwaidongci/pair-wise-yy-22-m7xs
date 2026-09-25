import { Router } from "express";
import { damageRecordController } from "../controllers/DamageRecordController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();
router.get("/", damageRecordController.list);
router.post("/", rbacMiddleware(["RESTORER"]), damageRecordController.register);
router.post("/:id/close", rbacMiddleware(["RESTORER"]), damageRecordController.close);
router.post("/:id/correct", rbacMiddleware(["RESTORER"]), damageRecordController.correct);

export default router;
