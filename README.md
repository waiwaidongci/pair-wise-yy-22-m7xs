# 文物修复档案协作平台

面向博物馆修复团队的文物病害登记、修复方案编制与审批、修复步骤记录、修复前后影像归档平台。文物详情页是一份**可操作档案**：病害登记 → 编制方案 → 专家审批 → 拆解步骤 → 完成步骤 → 影像上传 → 归档全流程在线推进，旧档可追溯。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

前端：<http://localhost:20110>
后端健康检查：<http://localhost:21110/health>

无 Docker 时可本地启动：后端 `cd backend && npm install && npm run dev`（端口 3000），前端 `cd frontend && npm install && npm run dev`（端口 20110，`/api` 已代理到 3000）。

## 修复业务流程（文物详情页 `/relics/:id`）

1. **病害登记**（修复师）：生成病害编号 `BH-2026-00x`，记录类型、位置、分级、发现人。
2. **编制方案**（修复师）：在病害卡片上编制，方案编号 `FA-2026-00x-R1` **沿用病害编号**，记录编制人。同一病害**只允许一份未结束方案**（草稿/审批中）。
3. **提交与退回**：方案提交后进入"审批中"；专家审批前若编制人**修改了方案内容，方案自动退回草稿**，专家侧审批返回"内容被修改，已退回重新提交"。
4. **专家审批**：通过后才能拆解步骤；两人同时审批时，**先到者生效**，后到者收到 409「方案已被其他专家处理」。
5. **拆解与完成步骤**：仅已通过方案可拆步骤；完成步骤时固定记录**材料、操作人、完成时间**。两人同时提交同一步骤，后到者收到 409「该步骤已被其他操作人完成提交」。
6. **影像上传**：修复前影像在方案通过后即可上传；**修复后影像必须等全部步骤完成**；同一方案前/后影像各一份。
7. **归档**（档案员）：全部步骤完成且修复前、修复后影像齐全才能归档，归档后方案与影像封档。
8. **更正与受影响旧档**：病害或方案被更正后生成同编号的新版本（`R2`、`R3`…），原方案、步骤、影像**保留旧档不删除**并打上「受影响旧档」标记，旧档只读、不可继续流转。

> 并发控制：后端所有状态迁移在进程内串行锁（`utils/SerialLock`）内执行"重新读取 + 条件迁移"，保证先到者生效。

页面左下角可切换演示身份：**林砚之（修复师）/ 周慎（审批专家）/ 吴归（档案员）/ 访客**，身份通过 `x-user-id` 透传，按角色控制接口与按钮。

## 访问地址或 CLI 示例

- 前端：<http://localhost:20110>（hash 路由，文物详情如 `#/relics/1`）
- 后端：`curl -H "x-user-id: 2" http://localhost:21110/api/restoration-plan`
- 审批并发：对同一 SUBMITTED 方案并发 `POST /api/restoration-plan/:id/approve`，其中一个返回 409 `PLAN_ALREADY_PROCESSED`。

## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：`cd backend && npm install && npm run dev`（`tsx` 直跑，接口统一挂在 `/api`）

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Zustand + 原生 CSS 组件（不依赖第三方 UI 运行时） |
| 后端 | Express + TypeScript（分层 routes/controllers/services/repositories） |
| 数据库 | PostgreSQL 15（`database/init.sql` 建表；当前运行态使用进程内内存库 `repositories/db.ts` 便于本地演示与并发测试） |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, components/workflow, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `relic-restore`
- `FRONTEND_PORT`: 前端端口，默认 `20110`
- `BACKEND_PORT`: 后端端口，默认 `21110`
- `DB_PORT`: 数据库宿主机端口，默认 `54320`
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据
- `JWT_SECRET`: 演示用身份签名密钥

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: relic-restore`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-relic-restore}` 前缀。
- 数据库使用命名卷 `db_data`，避免绑定中文路径。
- 数据库 healthcheck + 后端 `depends_on: condition: service_healthy`；前端依赖后端健康。
- 端口占用时修改 `.env` 中端口后重启；重置数据执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- **RelicCondition**（STABLE/FRAGILE/DAMAGED/IN_RESTORATION/SEALED）：`backend/src/constants/RelicCondition.ts`、服务校验 `RelicItemService`；前端 `constants/RelicCondition.ts`、重复定义 `types/RelicCondition.ts`、聚合文案 `constants/statusText.ts`、展示 `components/common/StatusBadge.tsx`、`RelicInfoCard`、筛选器 `RelicsPage`、`DamagesPage/DashboardPage`。
- **PlanApprovalStatus**（DRAFT/SUBMITTED/APPROVED/REJECTED/ARCHIVED）：后端 `constants/PlanApprovalStatus.ts`、模型 `models/RestorationPlan.ts`、仓库开放态判定 `repositories/RestorationPlanRepository.findOpenByDamage`、服务状态机 `RestorationPlanService`；前端 `constants/PlanApprovalStatus.ts`、`types/PlanApprovalStatus.ts`、`statusText.ts`、`StatusBadge`、`ApprovalTimeline`、`PlanWorkflowCard`、筛选器 `PlansPage`。
- **DamageSeverity**（LOW/MEDIUM/HIGH/CRITICAL）：后端 `constants/DamageSeverity.ts`、服务校验 `DamageRecordService`；前端 `constants/DamageSeverity.ts`、`types/DamageSeverity.ts`、`SeverityBadge`、登记/更正表单、筛选器 `DamagesPage`、工作台 `DashboardPage`。
- **DamageStatus**（REGISTERED/IN_TREATMENT/CLOSED/SUPERSEDED，新增）：后端 `constants/DamageStatus.ts`、`models/DamageRecord.ts`、`DamageRecordService`；前端 `constants/DamageStatus.ts`、`DamageStatusText.ts`、`statusText.ts`、`StatusBadge`、`DamageRecordItem`。
- **StepStatus**（PENDING/COMPLETED，新增）：后端 `constants/StepStatus.ts`、`models/RestorationStep.ts`、`RestorationStepService`；前端 `constants/StepStatus.ts`、`StepStatusText.ts`、`StepList`、`StepsPanel`。
- **ImageType**（BEFORE/AFTER，新增）：后端 `constants/ImageType.ts`、`models/ImageVersion.ts`、`ImageVersionService`；前端 `constants/ImageType.ts`、`ImageTypeText.ts`、`ImageCompare`、`ImageUploadForm`。
- **UserRole**（RESTORER/EXPERT/ARCHIVIST/VISITOR，新增）：后端 `constants/UserRole.ts`、`demoUsers.ts`、`rbacMiddleware`、各 routes；前端 `constants/UserRole.ts`、`UserRoleText.ts`、`AuthStore`、`Rbac`、`UserSwitcher`。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误码/错误消息、DTO 构造器、状态文案、筛选器和展示组件被刻意拆散到多个目录；一次状态流转（如"提交后修改退回"）会同时触达常量、模型、仓库查询、服务状态机、控制器、错误码/错误消息、前端 hook、工作流组件与时间线展示。新增枚举值需同步常量、类型、状态文案聚合、Badge 配色、表单选项与列表筛选。

## License

MIT
