# 文物修复档案协作平台

面向博物馆修复团队的文物病害记录、修复方案、修复步骤、影像版本与审批归档平台。文物详情是一份**可操作档案**，修复师可以按真实流程把一件文物从病害登记一路推进到修复归档。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

启动后：

- 前端：<http://localhost:20110>
- 后端健康检查：<http://localhost:21110/health>

> 演示环境内置 5 个账号，可在左下角切换角色：李慕白/王栖梧（修复师）、周慎之（专家审批）、陈兰（档案员）、访客。

## 核心业务流程

文物详情页（文物档案 → 点击任一文物）把五个实体串成一条可操作链路：

```text
病害登记 ──> 编制方案 ──> 提交审批 ──> 专家审批 ──> 拆步骤 ──> 步骤完成 ──> 修复前后影像 ──> 归档
 REGISTERED    DRAFT       SUBMITTED     APPROVED      PENDING     FINISHED     BEFORE/AFTER    ARCHIVED
```

关键业务规则（均在后端 service 强制，前端按钮显隐与提示同步）：

1. **病害登记后才能编制方案**：方案编号沿用病害编号（`BH-2026-001` → `FA-2026-001-01`），并记录编制人。
2. **同一病害只能有一份未结束方案**：草稿/待审批/已通过/已驳回状态的方案唯一，重复编制返回 `OPEN_PLAN_EXISTS`；已归档方案不占名额。
3. **专家审批前方案内容被修改 → 退回重新提交**：提交时固化内容指纹（SHA1），待审批状态下修改内容自动退回草稿；审批时再次校验指纹，防止并发窗口内被改后仍通过。
4. **方案通过后才能拆步骤**：步骤记录工序、材料；完成时回写材料、操作人和完成时间。
5. **全部步骤完成后才能上传修复后影像**；修复前影像在方案通过后即可上传。
6. **全部步骤完成且修复前、修复后影像齐全才能归档**：归档后方案与影像置为 `ARCHIVED`、病害关闭、文物恢复稳定。
7. **并发先到者生效**：写操作在后端串行事务中执行，记录带 `version` 乐观锁。两位专家同时审批、两位修复师同时完成同一步骤时，后到者收到 `409 ALREADY_PROCESSED`，前端提示“已被其他同事先行处理”并刷新为最新状态。
8. **更正保留旧档并标受影响**：病害更正沿用同一病害编号生成修订版，旧病害置 `CORRECTED`，其下游方案、步骤、影像全部标记 `affected`；方案更正同样生成修订版并标记原方案及其步骤/影像。受影响旧档保留可查、禁止继续操作，流程在最新修订版上进行。

## 主要接口（均在 `/api` 下）

| 实体 | 方法与路径 | 说明 |
|---|---|---|
| 文物 | `GET /relic-item` / `GET /relic-item/:id/dossier` | 列表 / 文物可操作档案（文物+病害+方案+步骤+影像+动作开关） |
| 病害 | `POST /damage-record` | 病害登记（修复师） |
| 病害 | `POST /damage-record/:id/correct` | 病害更正，旧档保留（修复师） |
| 方案 | `POST /restoration-plan` | 编制方案，编号沿用病害编号（修复师） |
| 方案 | `PATCH /restoration-plan/:id` | 修改内容，待审批时修改会退回草稿（修复师） |
| 方案 | `POST /restoration-plan/:id/submit` | 提交审批（修复师） |
| 方案 | `POST /restoration-plan/:id/review` | 专家审批，body 带 `expected_version`（专家） |
| 方案 | `POST /restoration-plan/:id/correct` | 方案更正生成修订版（修复师） |
| 方案 | `POST /restoration-plan/:id/archive` | 归档（档案员） |
| 步骤 | `POST /restoration-step/plan/:planId` | 拆步骤（方案通过后，修复师） |
| 步骤 | `POST /restoration-step/:id/finish` | 完成步骤，带 `expected_version`（修复师） |
| 影像 | `POST /image-version/plan/:planId` | 上传 BEFORE/AFTER 影像（修复师） |
| 日志 | `GET /relic-item/audit-logs` | 全部操作审计日志 |

## 本地开发方式

```bash
# 后端（端口 3000）
cd backend && npm install && npm run dev

# 前端（端口 20110，/api 代理到 http://localhost:3000）
cd frontend && npm install && npm run dev
```

后端当前使用进程内数据库（`backend/src/database/inMemoryDb.ts`，写操作串行事务 + 乐观锁）与 `src/seed.ts` 真实流程种子；`database/init.sql` 给出了切换到 PostgreSQL/Prisma 时的一致表结构（含“同一病害一份未结束方案”的部分唯一索引）。

## 访问地址或 CLI 示例

```bash
# 文物可操作档案
curl -s http://localhost:21110/api/relic-item/3/dossier | jq .

# 修复师编制方案（沿用病害编号）
curl -s -X POST http://localhost:21110/api/restoration-plan \
  -H 'Content-Type: application/json' -H 'x-user-id: 1' \
  -d '{"damage_record_id":1,"plan_title":"粉状锈去除方案","method":"机械除锈+BTA缓蚀","risk_assessment":"低风险"}'

# 两位专家并发审批（带相同 expected_version，后到者收到 409 ALREADY_PROCESSED）
curl -X POST http://localhost:21110/api/restoration-plan/4/review \
  -H 'Content-Type: application/json' -H 'x-user-id: 3' \
  -d '{"approved":true,"expected_version":1,"comment":"同意"}'
```

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Ant Design + Zustand |
| 后端 | Express + TypeScript（分层按 NestJS 风格：routes/controllers/services/repositories） |
| 数据库 | PostgreSQL 15（`database/init.sql`；演示实现为进程内数据库 + 种子） |
| 认证 | JWT（Bearer）/ 演示用 `x-user-id`，RBAC：修复师 / 专家审批 / 档案员 / 访客 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, components/workflow, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, database, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `relic-restore`
- `FRONTEND_PORT`: 前端端口，默认 `20110`
- `BACKEND_PORT`: 后端端口，默认 `21110`
- `DB_PORT`: 数据库宿主机端口，默认 `54320`
- `DB_USER/DB_PASSWORD/DB_NAME`: 数据库凭据
- `JWT_SECRET`: JWT 签名密钥，默认 `local-dev-secret`

配置分散经过 `.env.example`、`.env`、`docker-compose.yml`、`backend/src/config/env.ts`、前端 `src/api/client.ts`（统一 `/api` 与 `x-user-id` 请求头）。

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: relic-restore`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-relic-restore}` 前缀。
- 数据库使用命名卷 `db_data`，避免绑定中文路径。
- db 配置 healthcheck，backend `depends_on: condition: service_healthy`；frontend 依赖 backend 健康。
- 常见问题：端口占用时修改 `.env` 中端口后重启；重置数据执行 `docker compose down -v`（演示内存数据随 backend 容器重启即重置）。

## 枚举/常量出现位置清单

- **RelicCondition**（STABLE/FRAGILE/DAMAGED/IN_RESTORATION/SEALED）
  - 后端：`constants/RelicCondition.ts`、`models/RelicItem.ts`、`types/RelicItemPayload.ts`、`services/RelicItemService.ts`、`services/RestorationPlanService.ts`（修复中/恢复稳定联动）、`seed.ts`、`database/init.sql`
  - 前端：`constants/RelicCondition.ts`、`types/RelicCondition.ts`、`constants/statusText.ts`、`utils/formatters.ts`、`components/common/StatusBadge.tsx`、`components/common/RelicInfoCard.tsx`、`constructors/RelicItemConstructor.ts`
- **PlanApprovalStatus**（DRAFT/SUBMITTED/APPROVED/REJECTED/ARCHIVED）
  - 后端：`constants/PlanApprovalStatus.ts`（含 `OPEN_PLAN_STATUSES` 未结束判定）、`models/RestorationPlan.ts`、`services/RestorationPlanService.ts`、`services/DossierService.ts`（动作开关）、`controllers/RestorationPlanController.ts`、`seed.ts`、`init.sql`
  - 前端：`constants/PlanApprovalStatus.ts`、`types/PlanApprovalStatus.ts`、`constants/statusText.ts`、`pages/PlansPage.tsx`、`components/common/ApprovalTimeline.tsx`、`components/workflow/PlanFlowCard.tsx`、`hooks/usePlanApproval.ts`
- **DamageSeverity**（LOW/MEDIUM/HIGH/CRITICAL）
  - 后端：`constants/DamageSeverity.ts`、`models/DamageRecord.ts`、`services/DamageRecordService.ts`、`seed.ts`、`init.sql`
  - 前端：`constants/DamageSeverity.ts`、`types/DamageSeverity.ts`、`constants/statusText.ts`、`pages/DamagesPage.tsx`（筛选器）、`pages/DashboardPage.tsx`、`components/common/SeverityBadge.tsx`、`utils/formatters.ts`（formatRisk）、各登记表单弹窗
- 新增枚举：`DamageStatus`（REGISTERED/TREATING/CLOSED/CORRECTED）、`StepStatus`（PENDING/FINISHED）、`ImageType`（BEFORE/AFTER）、`UserRole`，前后端均在 `constants/` 与 `types/` 双处定义并经 `statusText`/徽标/筛选器/服务引用。
- 错误码：前后端 `constants/errorCodes.ts` + `constants/errorMessages.ts`，新增了 `NOT_FOUND/FLOW_CONFLICT/OPEN_PLAN_EXISTS/PLAN_CONTENT_CHANGED/ALREADY_PROCESSED/ARCHIVE_NOT_READY`，由 `utils/BusinessError.ts`（后端）和 `api/client.ts`、`utils/notifyAction.ts`（前端）消费。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；一次流程改动需要同步类型、常量、构造器、服务、控制器、路由 RBAC、store、API、页面与共享组件。例如“方案被改要退回重新提交”一条规则，同时落在内容指纹工具、方案 service、错误码/错误消息（前后端）、日志模板、按钮禁用逻辑与时间线展示上。

## License

MIT
