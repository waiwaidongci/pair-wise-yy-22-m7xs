/** 受影响标记：原病害/方案更正后，保留的旧档统一展示 */
export function AffectedTag() {
  return <span className="affected-tag" title="上游档案已更正，本档为保留旧档">受影响（旧档）</span>;
}

export function AffectedBanner({ reason }: { reason: string | null }) {
  if (!reason) return null;
  return <div className="affected-banner">⚠ {reason}。本档保留备查，流程操作请在最新修订版上进行。</div>;
}
