import { Button, Tooltip } from "antd";
import type { ButtonProps } from "antd";

/** 流程动作按钮：禁用时给出原因（如“受影响旧档不可操作”“审批通过后才能拆步骤”） */
export function FlowButton({
  disabledReason,
  children,
  ...props
}: ButtonProps & { disabledReason?: string | null }) {
  const button = (
    <Button size="small" disabled={props.disabled || Boolean(disabledReason)} {...props}>
      {children}
    </Button>
  );
  return disabledReason ? <Tooltip title={disabledReason}>{button}</Tooltip> : button;
}
