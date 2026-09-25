export function AffectedTag({ affected }: { affected: boolean }) {
  if (!affected) return null;
  return <span className="badge affected" title="上游病害或方案已更正，本档为保留的旧档">受影响旧档</span>;
}
