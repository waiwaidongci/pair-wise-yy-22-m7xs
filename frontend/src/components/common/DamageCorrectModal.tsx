import { Form, Input, Modal, Select } from "antd";
import { DamageSeverity } from "../../constants/DamageSeverity";
import type { DamageCorrectPayload } from "../../api/DamageRecord";
import type { DamageRecord } from "../../types/DamageRecord";

interface Props {
  open: boolean;
  damage: DamageRecord;
  onCancel: () => void;
  onSubmit: (values: DamageCorrectPayload) => Promise<void>;
}

/**
 * 病害更正弹窗：沿用同一病害编号生成修订版；
 * 原病害及其后续方案/步骤/影像保留旧档并标记受影响。
 */
export function DamageCorrectModal({ open, damage, onCancel, onSubmit }: Props) {
  const [form] = Form.useForm();
  return (
    <Modal
      title={`病害更正 · ${damage.damage_no}（旧档保留）`}
      open={open}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then(async (values: DamageCorrectPayload) => {
            await onSubmit(values);
            form.resetFields();
          })
          .catch(() => undefined);
      }}
      okText="生成修订版"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          damage_type: damage.damage_type,
          position_desc: damage.position_desc,
          severity: damage.severity,
          image_url: damage.image_url,
          corrected_reason: ""
        }}
      >
        <Form.Item name="damage_type" label="病害类型（更正后）" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="position_desc" label="位置与形态描述（更正后）" rules={[{ required: true }]}>
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="severity" label="严重程度（更正后）" rules={[{ required: true }]}>
          <Select
            options={DamageSeverity.map((value) => ({ value, label: { LOW: "轻度", MEDIUM: "中度", HIGH: "重度", CRITICAL: "严重" }[value] }))}
          />
        </Form.Item>
        <Form.Item name="image_url" label="病害影像路径（更正后）">
          <Input />
        </Form.Item>
        <Form.Item name="corrected_reason" label="更正原因" rules={[{ required: true, message: "更正必须填写原因" }]}>
          <Input.TextArea rows={2} placeholder="如：复查发现背部同样存在起甲" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
