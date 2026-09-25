import { Form, Input, Modal } from "antd";
import type { StepCreatePayload } from "../../api/RestorationStep";

interface CreateProps {
  mode: "create";
  open: boolean;
  planNo: string;
  onCancel: () => void;
  onSubmit: (values: StepCreatePayload) => Promise<void>;
}

interface FinishProps {
  mode: "finish";
  open: boolean;
  stepOrder: number;
  initialMaterial: string;
  onCancel: () => void;
  onSubmit: (values: { material_used: string }) => Promise<void>;
}

/** 拆步骤 / 完成步骤弹窗：步骤必须记录材料，完成时记录操作人与完成时间（后端补） */
export function StepFormModal(props: CreateProps | FinishProps) {
  const [form] = Form.useForm();
  const isCreate = props.mode === "create";

  return (
    <Modal
      title={isCreate ? `拆解修复步骤 · ${(props as CreateProps).planNo}` : `完成第 ${(props as FinishProps).stepOrder} 步`}
      open={props.open}
      onCancel={props.onCancel}
      onOk={() => {
        form
          .validateFields()
          .then(async (values) => {
            await props.onSubmit(values as never);
            form.resetFields();
          })
          .catch(() => undefined);
      }}
      okText={isCreate ? "添加步骤" : "确认完成"}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={
          isCreate
            ? { technique: "", material_used: "" }
            : { technique: "", material_used: (props as FinishProps).initialMaterial }
        }
      >
        {isCreate ? (
          <Form.Item name="technique" label="工序 / 技法" rules={[{ required: true, message: "请填写工序" }]}>
            <Input placeholder="如：机械清理粉状锈 / 起甲彩绘注射回贴" />
          </Form.Item>
        ) : null}
        <Form.Item name="material_used" label="使用材料" rules={[{ required: true, message: "请记录所用材料" }]}>
          <Input.TextArea rows={2} placeholder="如：3% B72 丙酮溶液、注射器、棉签" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
