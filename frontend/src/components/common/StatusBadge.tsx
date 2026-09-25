import { STATUS_TEXT } from "../../constants/statusText";

type StatusGroup = keyof typeof STATUS_TEXT;

interface StatusBadgeProps {
  value: string;
  group?: StatusGroup;
}

export function StatusBadge({ value, group }: StatusBadgeProps) {
  const text = group ? STATUS_TEXT[group][value as keyof (typeof STATUS_TEXT)[StatusGroup]] ?? value : value;
  return <span className={"badge " + String(value).toLowerCase().replace(/_/g, "-")}>{text}</span>;
}
