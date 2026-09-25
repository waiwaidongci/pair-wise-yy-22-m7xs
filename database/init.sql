CREATE TABLE IF NOT EXISTS relic_item (
  id INTEGER PRIMARY KEY,
  relic_code TEXT NOT NULL,
  name TEXT NOT NULL,
  era TEXT,
  material TEXT,
  collection_level TEXT,
  storage_location TEXT,
  current_condition TEXT DEFAULT 'STABLE'
);

CREATE TABLE IF NOT EXISTS damage_record (
  id INTEGER PRIMARY KEY,
  damage_no TEXT NOT NULL,              -- 病害编号，更正时沿用同一编号
  revision_no INTEGER NOT NULL DEFAULT 1,
  relic_id INTEGER NOT NULL,
  damage_type TEXT NOT NULL,
  position_desc TEXT,
  severity TEXT,
  discovered_by TEXT,
  discovered_at TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'REGISTERED',     -- REGISTERED/IN_TREATMENT/CLOSED/SUPERSEDED
  superseded_by_id INTEGER,
  affected BOOLEAN DEFAULT FALSE,
  created_at TEXT,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_damage_relic ON damage_record(relic_id);
CREATE INDEX IF NOT EXISTS idx_damage_no ON damage_record(damage_no);

CREATE TABLE IF NOT EXISTS restoration_plan (
  id INTEGER PRIMARY KEY,
  plan_no TEXT NOT NULL,                -- 方案编号，沿病害编号派生
  relic_id INTEGER NOT NULL,
  damage_record_id INTEGER NOT NULL,
  damage_no TEXT NOT NULL,
  plan_title TEXT NOT NULL,
  method TEXT,
  risk_assessment TEXT,
  approval_status TEXT DEFAULT 'DRAFT', -- DRAFT/SUBMITTED/APPROVED/REJECTED/ARCHIVED
  owner_id INTEGER,
  owner_name TEXT,
  revision_no INTEGER NOT NULL DEFAULT 1,
  superseded_by_id INTEGER,
  submitted_at TEXT,
  content_version INTEGER DEFAULT 1,
  submitted_content_version INTEGER,
  approved_by INTEGER,
  approved_by_name TEXT,
  approved_at TEXT,
  reject_reason TEXT,
  archived_at TEXT,
  affected BOOLEAN DEFAULT FALSE,
  created_at TEXT,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_plan_damage ON restoration_plan(damage_record_id);

CREATE TABLE IF NOT EXISTS restoration_step (
  id INTEGER PRIMARY KEY,
  plan_id INTEGER NOT NULL,
  step_order INTEGER NOT NULL,
  technique TEXT NOT NULL,
  material_used TEXT,
  operator_id INTEGER,
  operator_name TEXT,
  step_status TEXT DEFAULT 'PENDING',   -- PENDING/COMPLETED
  finished_at TEXT,
  affected BOOLEAN DEFAULT FALSE,
  created_at TEXT,
  updated_at TEXT,
  UNIQUE (plan_id, step_order)
);
CREATE INDEX IF NOT EXISTS idx_step_plan ON restoration_step(plan_id);

CREATE TABLE IF NOT EXISTS image_version (
  id INTEGER PRIMARY KEY,
  relic_id INTEGER NOT NULL,
  plan_id INTEGER NOT NULL,
  version_no TEXT NOT NULL,
  image_type TEXT NOT NULL,             -- BEFORE/AFTER
  file_path TEXT NOT NULL,
  capture_at TEXT,
  note TEXT,
  uploaded_by INTEGER,
  uploaded_by_name TEXT,
  archived BOOLEAN DEFAULT FALSE,
  affected BOOLEAN DEFAULT FALSE,
  created_at TEXT,
  UNIQUE (plan_id, image_type)
);
CREATE INDEX IF NOT EXISTS idx_image_plan ON image_version(plan_id);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  detail TEXT,
  created_at TEXT
);
