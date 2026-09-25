import express from "express";
import cors from "cors";
import { config } from "./config/env";
import { authMiddleware } from "./middlewares/authMiddleware";
import { auditLogMiddleware } from "./middlewares/auditLogMiddleware";
import { requestLoggerMiddleware } from "./middlewares/requestLoggerMiddleware";
import { errorHandlerMiddleware } from "./middlewares/errorHandlerMiddleware";
import relicItemRoutes from "./routes/RelicItemRoutes";
import damageRecordRoutes from "./routes/DamageRecordRoutes";
import restorationPlanRoutes from "./routes/RestorationPlanRoutes";
import restorationStepRoutes from "./routes/RestorationStepRoutes";
import imageVersionRoutes from "./routes/ImageVersionRoutes";
import { db } from "./database/inMemoryDb";
import { seed } from "./seed";

// 装载本地种子数据（生产环境替换为 Prisma/PostgreSQL 实现）
db.load(seed);

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLoggerMiddleware);
app.use(authMiddleware);
app.use(auditLogMiddleware);
app.get("/health", (_req, res) => res.json({ status: "ok", service: "relic-restore" }));
app.use("/api/relic-item", relicItemRoutes);
app.use("/api/damage-record", damageRecordRoutes);
app.use("/api/restoration-plan", restorationPlanRoutes);
app.use("/api/restoration-step", restorationStepRoutes);
app.use("/api/image-version", imageVersionRoutes);
app.use(errorHandlerMiddleware);

app.listen(config.port, () => console.log("relic-restore backend listening on", config.port));
