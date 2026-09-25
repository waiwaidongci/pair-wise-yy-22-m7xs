import { Form, Input, Modal } from "antd";
import type { PlanCreatePayload, PlanUpdatePayload } from "../../api/RestorationPlan";

interface CreateProps {
  mode: "create";
  damageRecordId: number;
  damageNo: string;
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: PlanCreatePayload) => Promise<void>;
}

interface EditProps {
  mode: "edit" | "correct";
  planId: number;
  initial: PlanUpdatePayload;
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: (PlanUpdatePayload & { corrected_reason?: string }) | PlanCreatePayload) => Promise<void>;
}

/**
 * 方案编制 / 编辑 / 更正弹窗。
 * 编制时方案编号由后端沿用病害编号生成，并记录编制人。
 */
export function PlanFormModal(props: CreateProps | EditProps) {
  const [form] = Form.useForm();

  const isCreate = props.mode === "create";
  const isCorrect = props.mode === "correct";
  const title = isCreate
    ? `编制修复方案 · 沿用病害 ${(props as CreateProps).damageNo}`
    : isCorrect
    ? "方案更正（旧档保留，生成修订版重新审批）"
    : "修改方案内容（提交后修改将退回重新提交）";

  return (
    <Modal
      title={title}
      open={props.open}
      onCancel={props.onCancel}
      onOk={() => {
        form
          .validateFields()
          .then(async (values: PlanUpdatePayload & { corrected_reason?: string }) => {
            if (isCreate) {
              await props.onSubmit({ ...values, damage_record_id: (props as CreateProps).damageRecordId } as PlanCreatePayload);
            } else {
              await props.onSubmit(values);
            }
            form.resetFields();
          })
          .catch(() => undefined);
      }}
      okText={isCreate ? "编制方案" : isCorrect ? "生成修订版" : "保存修改"}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={isCreate ? { plan_title: "", method: "", risk_assessment: "" } : (props as EditProps).initial}
      >
        <Form.Item name="plan_title" label="方案标题" rules={[{ required: true, message: "请填写方案标题" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="method" label="修复方法与工序" rules={[{ required: true, message: "请填写修复方法" }]}>
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="risk_assessment" label="风险评估" rules={[{ required: true, message: "请填写风险评估" }]}>
          <Input.TextArea rows={2} />
        </Form.Item>
        {isCorrect ? (
          <Form.Item name="corrected_reason" label="更正原因" rules={[{ required: true, message: "更正必须填写原因" }]}>
            <Input.TextArea rows={2} placeholder="如：复查发现实际损伤范围更大" />
          </Form.Item>
        ) : null}
      </Form>
    </Modal>
  );
}
