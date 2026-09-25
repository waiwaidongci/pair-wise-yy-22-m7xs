import { DamageSeverityText } from "../../constants/DamageSeverity";

export function SeverityBadge({ value }: { value: string }) {
  return <span className={"badge severity " + String(value).toLowerCase()}>{DamageSeverityText[value as keyof typeof DamageSeverityText] ?? value}</span>;
}
