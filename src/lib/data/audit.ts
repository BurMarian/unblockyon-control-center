import { supabase } from "@/integrations/supabase/client";

export interface AuditInput {
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

/** Writes an immutable audit record for the current actor. Never throws. */
export async function logAudit({ action, entity, entityId, metadata }: AuditInput): Promise<void> {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      actor_email: user.email ?? null,
      action,
      entity,
      entity_id: entityId ?? null,
      metadata: (metadata ?? {}) as never,
    });
  } catch (error) {
    console.error("[audit] failed to record action", error);
  }
}
