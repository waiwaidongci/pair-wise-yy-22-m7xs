export const DamageStatus = ["REGISTERED", "IN_TREATMENT", "CLOSED", "SUPERSEDED"] as const;
export type DamageStatus = (typeof DamageStatus)[number];
