import { Router } from "express";
import { damageRecordController } from "../controllers/DamageRecordController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();

router.get("/", damageRecordController.list);
router.get("/:id", damageRecordController.detail);
// 病害登记由修复师完成；更正须修复师发起
router.post("/", rbacMiddleware(["RESTORER"]), damageRecordController.register);
router.post("/:id/correct", rbacMiddleware(["RESTORER"]), damageRecordController.correct);

export default router;
