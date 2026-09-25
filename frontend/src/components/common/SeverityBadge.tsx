import { formatRisk } from "../../utils/formatters";
import type { DamageSeverity } from "../../constants/DamageSeverity";

/** 病害严重程度徽标（DamageSeverity：LOW/MEDIUM/HIGH/CRITICAL） */
export function SeverityBadge({ value }: { value: DamageSeverity | string }) {
  return (
    <span className={"badge badge-" + String(value).toLowerCase()} title="病害严重程度">
      {formatRisk(value)}
    </span>
  );
}
