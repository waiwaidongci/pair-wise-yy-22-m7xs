import type { RelicItem } from "../../types/RelicItem";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "../../utils/formatters";

/** 文物基础信息卡：档案页、详情抽屉共用 */
export function RelicInfoCard({ relic }: { relic: RelicItem }) {
  return (
    <div className="shared-widget">
      <div className="flow-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>{relic.relic_code}</div>
          <h3 style={{ fontSize: 18 }}>{relic.name}</h3>
        </div>
        <StatusBadge value={relic.current_condition} />
      </div>
      <dl className="kv">
        <dt>年代</dt><dd>{relic.era}</dd>
        <dt>材质</dt><dd>{relic.material}</dd>
        <dt>藏品级别</dt><dd>{relic.collection_level}</dd>
        <dt>存放位置</dt><dd>{relic.storage_location}</dd>
        <dt>信息更新</dt><dd>{formatDate(relic.updated_at)}</dd>
      </dl>
    </div>
  );
}
