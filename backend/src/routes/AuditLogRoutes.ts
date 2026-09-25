import { Router } from "express";
import { auditLogController } from "../controllers/AuditLogController";

const router = Router();
router.get("/", auditLogController.list);

export default router;
