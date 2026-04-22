type AuditAction = "createLink" | "deleteLink" | "redirect" | "ensureProfile";

type AuditResult =
  | "success"
  | "denied"
  | "error"
  | "rate_limited"
  | "url_blocked"
  | "not_found"
  | "expired"
  | "click_deduped";

interface AuditEntry {
  action: AuditAction;
  uid?: string;
  result: AuditResult;
  metadata?: Record<string, unknown>;
}

/*
 * Emite um log estruturado para o Cloud Logging do Firebase.
 * Filtrável via: jsonPayload.audit = true AND jsonPayload.action = "createLink"
 */
export function auditLog(entry: AuditEntry): void {
  console.log(
    JSON.stringify({
      audit: true,
      ...entry,
      timestamp: new Date().toISOString(),
    })
  );
}
