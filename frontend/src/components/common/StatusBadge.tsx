import { formatStatus } from "../../utils/formatters";

/** 通用状态徽标：状态文案走 constants/statusText，class 名走原始枚举值着色 */
export function StatusBadge({ value }: { value: string }) {
  return (
    <span className={"badge badge-" + String(value).toLowerCase().replace(/_/g, "-")}>
      {formatStatus(value)}
    </span>
  );
}
