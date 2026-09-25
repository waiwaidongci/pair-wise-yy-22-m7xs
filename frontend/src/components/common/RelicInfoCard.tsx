import type { RelicItem } from "../../types/RelicItem";
import { StatusBadge } from "./StatusBadge";

interface RelicInfoCardProps {
  relic: RelicItem;
  compact?: boolean;
}

const FIELDS: { key: keyof RelicItem; label: string }[] = [
  { key: "relic_code", label: "文物编号" },
  { key: "era", label: "年代" },
  { key: "material", label: "材质" },
  { key: "collection_level", label: "藏品级别" },
  { key: "storage_location", label: "存放位置" }
];

export function RelicInfoCard({ relic, compact }: RelicInfoCardProps) {
  return (
    <div className="relic-card">
      <div className="relic-card-head">
        <div>
          <h2>{relic.name}</h2>
          <span className="muted">{relic.relic_code}</span>
        </div>
        <StatusBadge value={relic.current_condition} group="RelicCondition" />
      </div>
      {compact ? (
        <p className="muted relic-meta">
          {relic.era} · {relic.material} · {relic.collection_level}
        </p>
      ) : (
        <dl className="info-grid">
          {FIELDS.map((field) => (
            <div key={field.key} className="info-item">
              <dt>{field.label}</dt>
              <dd>{relic[field.key]}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
