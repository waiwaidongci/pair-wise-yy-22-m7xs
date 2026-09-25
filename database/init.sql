-- 文物修复档案协作平台 · PostgreSQL 15 初始化结构
-- 注：当前后端演示实现使用进程内数据库（backend/src/database/inMemoryDb.ts）+ src/seed.ts 种子，
-- 本文件为切换到 Prisma/TypeORM 持久化时的目标表结构，字段与后端 models 保持一致。

CREATE TABLE IF NOT EXISTS relic_item (
  id SERIAL PRIMARY KEY,
  relic_code TEXT NOT NULL,
  name TEXT NOT NULL,
  era TEXT,
  material TEXT,
  collection_level TEXT,
  storage_location TEXT,
  current_condition TEXT NOT NULL DEFAULT 'STABLE',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS damage_record (
  id SERIAL PRIMARY KEY,
  damage_no TEXT NOT NULL,                 -- 病害编号，修订沿用同一编号
  revision INTEGER NOT NULL DEFAULT 1,     -- 修订版本号
  revised_from_id INTEGER REFERENCES damage_record(id),
  relic_id INTEGER NOT NULL REFERENCES relic_item(id),
  damage_type TEXT NOT NULL,
  position_desc TEXT,
  severity TEXT NOT NULL,                  -- DamageSeverity: LOW/MEDIUM/HIGH/CRITICAL
  discovered_by TEXT,
  discovered_at TIMESTAMPTZ,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'REGISTERED', -- DamageStatus: REGISTERED/TREATING/CLOSED/CORRECTED
  corrected_reason TEXT,
  affected BOOLEAN NOT NULL DEFAULT FALSE,
  affected_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_damage_relic ON damage_record(relic_id);
CREATE INDEX IF NOT EXISTS idx_damage_no ON damage_record(damage_no);

CREATE TABLE IF NOT EXISTS restoration_plan (
  id SERIAL PRIMARY KEY,
  plan_no TEXT NOT NULL,                   -- 沿用病害编号：BH-... -> FA-...-01
  plan_revision INTEGER NOT NULL DEFAULT 1,
  relic_id INTEGER NOT NULL REFERENCES relic_item(id),
  damage_record_id INTEGER NOT NULL REFERENCES damage_record(id),
  damage_no TEXT NOT NULL,
  plan_title TEXT NOT NULL,
  method TEXT,
  risk_assessment TEXT,
  approval_status TEXT NOT NULL DEFAULT 'DRAFT', -- PlanApprovalStatus
  owner_id INTEGER,
  author TEXT,
  submitted_content_hash TEXT,             -- 提交时内容指纹，改动后审批退回
  submitted_at TIMESTAMPTZ,
  reviewer TEXT,
  reviewed_at TIMESTAMPTZ,
  review_comment TEXT,
  archived_at TIMESTAMPTZ,
  affected BOOLEAN NOT NULL DEFAULT FALSE,
  affected_reason TEXT,
  revised_from_id INTEGER REFERENCES restoration_plan(id),
  version INTEGER NOT NULL DEFAULT 0,      -- 乐观锁：并发审批先到者生效
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_plan_damage ON restoration_plan(damage_record_id);
-- 同一病害只能有一份未结束方案（DRAFT/SUBMITTED/APPROVED/REJECTED），已归档(ARCHIVED)不占名额：
CREATE UNIQUE INDEX IF NOT EXISTS uq_open_plan_partial
  ON restoration_plan(damage_no)
  WHERE approval_status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

CREATE TABLE IF NOT EXISTS restoration_step (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES restoration_plan(id),
  step_order INTEGER NOT NULL,
  technique TEXT NOT NULL,
  material_used TEXT NOT NULL,             -- 材料记录
  operator_id INTEGER,
  operator TEXT,                           -- 操作人
  step_status TEXT NOT NULL DEFAULT 'PENDING', -- StepStatus: PENDING/FINISHED
  finished_at TIMESTAMPTZ,                 -- 完成时间
  affected BOOLEAN NOT NULL DEFAULT FALSE,
  affected_reason TEXT,
  version INTEGER NOT NULL DEFAULT 0,      -- 乐观锁：并发完成步骤先到者生效
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (plan_id, step_order)
);

CREATE TABLE IF NOT EXISTS image_version (
  id SERIAL PRIMARY KEY,
  relic_id INTEGER NOT NULL REFERENCES relic_item(id),
  plan_id INTEGER NOT NULL REFERENCES restoration_plan(id),
  plan_no TEXT,
  version_no INTEGER NOT NULL,
  image_type TEXT NOT NULL,                -- ImageType: BEFORE/AFTER
  file_path TEXT NOT NULL,
  capture_at TIMESTAMPTZ,
  note TEXT,
  uploaded_by TEXT,
  archived TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE/ARCHIVED
  archived_at TIMESTAMPTZ,
  affected BOOLEAN NOT NULL DEFAULT FALSE,
  affected_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (plan_id, version_no)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  actor TEXT NOT NULL,
  actor_role TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_log(target_type, target_id);
