export function EmptyState({ title = "暂无数据", hint }: { title?: string; hint?: string }) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      {hint ? <p style={{ margin: "6px 0 0", fontSize: 12 }}>{hint}</p> : null}
    </div>
  );
}
