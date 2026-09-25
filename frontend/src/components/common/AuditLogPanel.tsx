import { useEffect } from "react";
import { useAuditStore } from "../../stores/AuditLogStore";
import { EmptyState } from "./EmptyState";
import { formatDateTime } from "../../utils/formatters";

export function AuditLogPanel({ limit }: { limit?: number }) {
  const { rows, load } = useAuditStore();

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 8000);
    return () => clearInterval(timer);
  }, [load]);

  const shown = limit ? rows.slice(0, limit) : rows;

  return (
    <section className="panel">
      <h2 className="section-title">操作日志</h2>
      {shown.length === 0 ? (
        <EmptyState title="暂无操作记录" hint="登记、审批、完成步骤、归档等动作会在此留痕" />
      ) : (
        <ol className="audit-list">
          {shown.map((row) => (
            <li key={row.id}>
              <span className="dot" />
              <div>
                <p>
                  <strong>{row.actor}</strong> · {row.detail || row.action}
                </p>
                <small className="muted">
                  {row.target_type}#{row.target_id} · {formatDateTime(row.created_at)}
                </small>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
