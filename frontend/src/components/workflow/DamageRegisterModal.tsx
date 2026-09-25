import { useState } from "react";
import type { RelicItem } from "../../types/RelicItem";
import { Field } from "../common/Field";
import { ActionButton } from "../common/ActionButton";
import { Modal } from "../common/Modal";
import { DamageSeverity } from "../../constants/DamageSeverity";
import { DamageSeverityText } from "../../constants/DamageSeverity";
import { registerDamage } from "../../api/DamageRecord";
import { ApiError } from "../../api/client";
import { toast } from "../../utils/toast";

interface DamageRegisterModalProps {
  open: boolean;
  relics: RelicItem[];
  defaultRelicId?: number;
  onClose: () => void;
  onChanged: () => Promise<void>;
}

const emptyForm = { relic_id: 0, damage_type: "", position_desc: "", severity: "MEDIUM", discovered_by: "", image_url: "" };

export function DamageRegisterModal({ open, relics, defaultRelicId, onClose, onChanged }: DamageRegisterModalProps) {
  const [form, setForm] = useState({ ...emptyForm, relic_id: defaultRelicId ?? 0 });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.relic_id || !form.damage_type.trim() || !form.position_desc.trim()) {
      toast.error("请选择文物并填写病害类型与位置");
      return;
    }
    setSaving(true);
    try {
      await registerDamage({
        relic_id: form.relic_id,
        damage_type: form.damage_type.trim(),
        position_desc: form.position_desc.trim(),
        severity: form.severity,
        discovered_by: form.discovered_by.trim() || undefined,
        image_url: form.image_url.trim() || undefined
      });
      toast.success("病害已登记，可据此编制修复方案");
      setForm({ ...emptyForm, relic_id: defaultRelicId ?? 0 });
      await onChanged();
      onClose();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "病害登记失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title="病害登记"
      onClose={onClose}
      footer={
        <>
          <ActionButton onClick={onClose}>取消</ActionButton>
          <ActionButton tone="primary" disabled={saving} onClick={() => void submit()}>登记</ActionButton>
        </>
      }
    >
      <div className="form-stack">
        <Field label="所属文物" required>
          <select value={form.relic_id} onChange={(event) => setForm({ ...form, relic_id: Number(event.target.value) })}>
            <option value={0} disabled>请选择文物</option>
            {relics.map((relic) => (
              <option key={relic.id} value={relic.id}>{relic.relic_code} · {relic.name}</option>
            ))}
          </select>
        </Field>
        <Field label="病害类型" required>
          <input value={form.damage_type} placeholder="如：冲线、漆皮起翘、绢本酥朽" onChange={(event) => setForm({ ...form, damage_type: event.target.value })} />
        </Field>
        <Field label="位置描述" required>
          <textarea rows={2} value={form.position_desc} onChange={(event) => setForm({ ...form, position_desc: event.target.value })} />
        </Field>
        <Field label="严重程度" required>
          <select value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value })}>
            {DamageSeverity.map((value) => (
              <option key={value} value={value}>{DamageSeverityText[value]}</option>
            ))}
          </select>
        </Field>
        <Field label="发现人">
          <input value={form.discovered_by} placeholder="默认使用当前登录修复师" onChange={(event) => setForm({ ...form, discovered_by: event.target.value })} />
        </Field>
      </div>
    </Modal>
  );
}
