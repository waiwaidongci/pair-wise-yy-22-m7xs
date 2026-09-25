export interface AuditLog {
  id: number;
  actor: string;
  actor_role: string;
  action: string;
  target_type: string;
  target_id: string;
  detail: string;
  created_at: string;
}
