"use client";

import { getDb } from "./db";
import { createAuditEventId } from "../id";
import { getSession } from "../session";
import { createAuditDocId } from "./schema";
import type { AuditEventDoc } from "./schema";

type AuditPayload = {
  action: string;
  entityType: AuditEventDoc["entityType"];
  entityId: string;
  summary?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export const logAuditEvent = async (payload: AuditPayload) => {
  const session = getSession();
  if (!session) {
    return;
  }

  const db = await getDb();
  if (!db) {
    return;
  }

  const auditId = createAuditEventId();
  const now = new Date().toISOString();

  const doc: AuditEventDoc = {
    _id: createAuditDocId(auditId),
    type: "audit",
    auditId,
    facilityId: session.facilityId,
    actorId: session.userId,
    actorName: session.displayName,
    action: payload.action,
    entityType: payload.entityType,
    entityId: payload.entityId,
    summary: payload.summary,
    metadata: payload.metadata,
    createdAt: now
  };

  try {
    await db.put(doc);
  } catch (error) {
    // Best-effort only.
  }
};
