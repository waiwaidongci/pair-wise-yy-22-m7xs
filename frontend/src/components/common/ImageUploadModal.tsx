import { Form, Input, Modal, Radio } from "antd";
import type { ImageUploadPayload } from "../../api/ImageVersion";

interface Props {
  open: boolean;
  planNo: string;
  /** 全部步骤完成后才允许选“修复后” */
  afterAllowed: boolean;
  defaultType?: "BEFORE" | "AFTER";
  onCancel: () => void;
  onSubmit: (values: ImageUploadPayload) => Promise<void>;
}

/** 上传修复前/修复后影像弹窗（演示环境以归档路径代替文件流） */
export function ImageUploadModal({ open, planNo, afterAllowed, defaultType, onCancel, onSubmit }: Props) {
  const [form] = Form.useForm();
  return (
    <Modal
      title={`上传修复影像 · ${planNo}`}
      open={open}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then(async (values) => {
            await onSubmit(values as ImageUploadPayload);
            form.resetFields();
          })
          .catch(() => undefined);
      }}
      okText="上传"
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ image_type: defaultType ?? "BEFORE", note: "" }}>
        <Form.Item name="image_type" label="影像类型" rules={[{ required: true }]}>
          <Radio.Group
            onChange={(event) => {
              if (event.target.value === "AFTER" && !afterAllowed) {
                form.setFieldValue("image_type", "BEFORE");
              }
            }}
          >
            <Radio.Button value="BEFORE">修复前</Radio.Button>
            <Radio.Button value="AFTER" disabled={!afterAllowed}>
              修复后{afterAllowed ? "" : "（需全部步骤完成）"}
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="file_path" label="影像归档路径" rules={[{ required: true, message: "请填写影像路径" }]}>
          <Input placeholder="/archive/ww-001/fa-…/before-v1.jpg" />
        </Form.Item>
        <Form.Item name="note" label="影像说明">
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
