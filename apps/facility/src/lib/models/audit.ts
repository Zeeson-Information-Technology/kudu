export type AuditEvent = {
  _id: string;
  type: "audit";
  auditId: string;
  facilityId: string;
  actorId: string;
  actorName?: string;
  action: string;
  entityType: "patient" | "encounter" | "labOrder" | "prescription" | "facility" | "user" | "other";
  entityId: string;
  summary?: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: string;
};
