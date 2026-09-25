export const UserRole = ["RESTORER", "EXPERT", "ARCHIVIST", "VISITOR"] as const;
export type UserRole = (typeof UserRole)[number];
