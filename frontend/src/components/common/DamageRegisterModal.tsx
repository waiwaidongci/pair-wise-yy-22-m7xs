import { Form, Input, Select, Modal } from "antd";
import { DamageSeverity } from "../../constants/DamageSeverity";
import type { DamageRegisterPayload } from "../../api/DamageRecord";

interface Props {
  open: boolean;
  relicId: number;
  onCancel: () => void;
  onSubmit: (values: DamageRegisterPayload) => Promise<void>;
}

/** 病害登记表单弹窗 */
export function DamageRegisterModal({ open, relicId, onCancel, onSubmit }: Props) {
  const [form] = Form.useForm();

  return (
    <Modal
      title={`病害登记 · 文物 #${relicId}`}
      open={open}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then(async (values: Omit<DamageRegisterPayload, "relic_id">) => {
            await onSubmit({ ...values, relic_id: relicId });
            form.resetFields();
          })
          .catch(() => undefined);
      }}
      okText="登记"
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ severity: "MEDIUM" }}>
        <Form.Item name="damage_type" label="病害类型" rules={[{ required: true, message: "请填写病害类型" }]}>
          <Input placeholder="如：点状锈蚀 / 冲缝 / 彩绘层起甲" />
        </Form.Item>
        <Form.Item name="position_desc" label="位置与形态描述" rules={[{ required: true, message: "请描述病害位置" }]}>
          <Input.TextArea rows={3} placeholder="如：鼎腹外侧近口沿三处粉状锈" />
        </Form.Item>
        <Form.Item name="severity" label="严重程度" rules={[{ required: true }]}>
          <Select
            options={DamageSeverity.map((value) => ({ value, label: { LOW: "轻度", MEDIUM: "中度", HIGH: "重度", CRITICAL: "严重" }[value] }))}
          />
        </Form.Item>
        <Form.Item name="image_url" label="病害影像路径（选填）">
          <Input placeholder="/archive/…/damage.jpg" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
