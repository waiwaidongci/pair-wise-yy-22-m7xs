/** 病害记录生命周期状态 */
export const DamageStatus = ["REGISTERED", "TREATING", "CLOSED", "CORRECTED"] as const;
export type DamageStatus = (typeof DamageStatus)[number];
