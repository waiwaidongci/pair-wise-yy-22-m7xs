export function EmptyState({ title = "暂无数据", hint }: { title?: string; hint?: string }) {
  return (
    <div className="empty">
      <p>{title}</p>
      {hint && <small className="muted">{hint}</small>}
    </div>
  );
}
