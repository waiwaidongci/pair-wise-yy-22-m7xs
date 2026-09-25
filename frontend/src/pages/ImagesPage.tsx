import { useEffect, useMemo, useState } from "react";
import { Select, Spin } from "antd";
import { useImageVersionStore } from "../stores/ImageVersionStore";
import { useRelicItemStore } from "../stores/RelicItemStore";
import { ImageCompare } from "../components/common/ImageCompare";
import { StatusBadge } from "../components/common/StatusBadge";
import { AffectedTag } from "../components/common/AffectedTag";
import { EmptyState } from "../components/common/EmptyState";
import { formatDate, formatImageType } from "../utils/formatters";

interface Props {
  onOpenRelic: (id: number) => void;
}

/** 影像版本页：按文物分组的修复前后对比与归档状态 */
export function ImagesPage({ onOpenRelic }: Props) {
  const { rows, loading, load } = useImageVersionStore();
  const relicStore = useRelicItemStore();
  const [relicFilter, setRelicFilter] = useState<number | undefined>();

  useEffect(() => {
    void load();
    void relicStore.load();
  }, [load, relicStore]);

  const groups = useMemo(() => {
    const map = new Map<number, typeof rows>();
    for (const image of rows) {
      if (relicFilter !== undefined && image.relic_id !== relicFilter) continue;
      const list = map.get(image.relic_id) ?? [];
      list.push(image);
      map.set(image.relic_id, list);
    }
    return [...map.entries()];
  }, [rows, relicFilter]);

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">image archive</p>
          <h1>影像版本</h1>
        </div>
        <div className="toolbar">
          <Select
            placeholder="按文物筛选"
            allowClear
            style={{ width: 220 }}
            value={relicFilter}
            onChange={setRelicFilter}
            options={relicStore.rows.map((relic) => ({ value: relic.id, label: `${relic.relic_code} ${relic.name}` }))}
          />
        </div>
      </section>

      {loading ? <Spin /> : null}
      {!loading && groups.length === 0 ? (
        <EmptyState title="暂无影像" hint="方案通过后上传修复前影像；全部步骤完成后上传修复后影像，齐全后归档。" />
      ) : null}

      {groups.map(([relicId, images]) => {
        const relic = relicStore.rows.find((item) => item.id === relicId);
        return (
          <section className="panel wide" key={relicId}>
            <div className="flow-head" style={{ marginBottom: 12 }}>
              <h2 style={{ margin: 0 }}>
                <span className="back-link" onClick={() => onOpenRelic(relicId)}>
                  {relic ? `${relic.relic_code} ${relic.name}` : `文物 #${relicId}`}
                </span>
              </h2>
              <div className="meta-line">
                {images.map((image) => (
                  <span key={image.id} className="flow-actions">
                    {formatImageType(image.image_type)} V{image.version_no}
                    <StatusBadge value={image.archived} />
                    {image.affected ? <AffectedTag /> : null}
                  </span>
                ))}
              </div>
            </div>
            <p className="meta-line" style={{ marginBottom: 10 }}>
              最新上传：{formatDate(images[images.length - 1]?.created_at)} · {images[images.length - 1]?.uploaded_by}
            </p>
            <ImageCompare images={images} />
          </section>
        );
      })}
    </main>
  );
}
