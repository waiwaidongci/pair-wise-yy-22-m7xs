import { Form, Input, Modal, Radio } from "antd";

interface Props {
  open: boolean;
  planNo: string;
  onCancel: () => void;
  onSubmit: (values: { approved: boolean; comment?: string }) => Promise<void>;
}

/** 专家审批弹窗：通过 / 驳回 + 意见 */
export function PlanReviewModal({ open, planNo, onCancel, onSubmit }: Props) {
  const [form] = Form.useForm();
  return (
    <Modal
      title={`专家审批 · ${planNo}`}
      open={open}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then(async (values) => {
            await onSubmit(values);
            form.resetFields();
          })
          .catch(() => undefined);
      }}
      okText="提交审批意见"
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ approved: true, comment: "" }}>
        <Form.Item name="approved" label="审批结论" rules={[{ required: true }]}>
          <Radio.Group>
            <Radio.Button value={true}>通过</Radio.Button>
            <Radio.Button value={false}>驳回</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="comment" label="审批意见">
          <Input.TextArea rows={3} placeholder="若方案在提交后被修改过，系统将自动退回草稿，要求重新提交。" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
