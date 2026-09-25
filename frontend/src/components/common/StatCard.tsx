export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>
        {value}
        {hint ? <em>{hint}</em> : null}
      </strong>
    </div>
  );
}
