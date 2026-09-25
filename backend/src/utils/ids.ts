export const nowIso = () => new Date().toISOString();

let seq = 1000;

export const nextId = (rows: { id: number }[]): number =>
  rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

export const nextSeq = (): number => seq++;

const pad = (value: number, length = 3) => String(value).padStart(length, "0");

export const buildDamageNo = (seqNo: number) => `BH-2026-${pad(seqNo)}`;

export const buildPlanNo = (damageNo: string, revisionNo: number) =>
  `FA-${damageNo.slice(3)}-R${revisionNo}`;

export const buildImageVersionNo = (planNo: string, imageType: string, count: number) =>
  `${planNo}-${imageType === "BEFORE" ? "Q" : "H"}${pad(count)}`;
