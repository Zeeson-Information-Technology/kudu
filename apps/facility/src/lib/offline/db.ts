import type PouchDB from "pouchdb";

export type SyncStatus = "idle" | "local-only" | "active" | "paused" | "uptodate" | "error";

export type SyncSnapshot = {
  status: SyncStatus;
  lastSyncAt?: string;
  error?: string;
  hasConflicts: boolean;
};

type SyncListener = (snapshot: SyncSnapshot) => void;

let dbInstance: PouchDB.Database | null = null;
let remoteInstance: PouchDB.Database | null = null;
let syncHandler: PouchDB.Replication.Sync<{}> | null = null;
let lastSyncAt: string | undefined;
let hasConflicts = false;
const listeners = new Set<SyncListener>();
const conflictMetaId = "meta:conflicts";

type ConflictRegistryDoc = {
  _id: string;
  type: "meta";
  conflictIds: string[];
  updatedAt: string;
};

const notify = (partial: Partial<SyncSnapshot>) => {
  const snapshot: SyncSnapshot = {
    status: partial.status ?? "idle",
    lastSyncAt: partial.lastSyncAt ?? lastSyncAt,
    error: partial.error,
    hasConflicts: partial.hasConflicts ?? hasConflicts
  };
  listeners.forEach((listener) => listener(snapshot));
};

export const subscribeToSync = (listener: SyncListener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getDb = async () => {
  if (typeof window === "undefined") {
    return null;
  }

  if (dbInstance) {
    return dbInstance;
  }

  const { default: PouchDB } = await import("pouchdb");
  dbInstance = new PouchDB("kudu_facility_local");
  return dbInstance;
};

export const getRemoteDb = async () => {
  if (typeof window === "undefined") {
    return null;
  }

  const remoteUrl = process.env.NEXT_PUBLIC_COUCHDB_URL;
  if (!remoteUrl) {
    return null;
  }

  if (remoteInstance) {
    return remoteInstance;
  }

  const { default: PouchDB } = await import("pouchdb");
  remoteInstance = new PouchDB(remoteUrl);
  return remoteInstance;
};

export const startSync = async () => {
  if (syncHandler) {
    return syncHandler;
  }

  const localDb = await getDb();
  const remoteDb = await getRemoteDb();

  if (!localDb || !remoteDb) {
    notify({ status: "local-only" });
    return null;
  }

  syncHandler = localDb.sync(remoteDb, { live: true, retry: true });

  syncHandler.on("active", () => {
    notify({ status: "active" });
  });

  syncHandler.on("paused", () => {
    notify({ status: navigator.onLine ? "uptodate" : "paused" });
  });

  syncHandler.on("complete", () => {
    lastSyncAt = new Date().toISOString();
    notify({ status: "uptodate", lastSyncAt });
  });

  const updateConflictRegistry = async (docIds: string[]) => {
    if (docIds.length === 0) {
      return;
    }

    try {
      const existing = (await localDb.get(conflictMetaId)) as ConflictRegistryDoc;
      const nextIds = Array.from(new Set([...existing.conflictIds, ...docIds]));
      await localDb.put({
        ...existing,
        conflictIds: nextIds,
        updatedAt: new Date().toISOString()
      });
    } catch (error: any) {
      if (error?.status === 404) {
        await localDb.put({
          _id: conflictMetaId,
          type: "meta",
          conflictIds: Array.from(new Set(docIds)),
          updatedAt: new Date().toISOString()
        } as ConflictRegistryDoc);
      }
    }
  };

  const markNeedsReview = async (docId: string, revision: string, payload: any) => {
    if (payload?.needsReview) {
      return;
    }

    try {
      await localDb.put({ ...payload, _id: docId, _rev: revision, needsReview: true });
    } catch (error) {
      // Best-effort marker only.
    }
  };

  syncHandler.on("change", async (info: any) => {
    lastSyncAt = new Date().toISOString();
    notify({ status: "active", lastSyncAt });

    const docs = [...(info?.change?.docs ?? [])];
    const conflictDocs = docs.filter(
      (doc: any) => Array.isArray(doc._conflicts) && doc._conflicts.length > 0
    );
    if (conflictDocs.length > 0) {
      hasConflicts = true;
      notify({ hasConflicts });
      await updateConflictRegistry(conflictDocs.map((doc: any) => doc._id));
      await Promise.all(
        conflictDocs.map((doc: any) => markNeedsReview(doc._id, doc._rev, doc))
      );
    }
  });

  syncHandler.on("error", (error) => {
    const message = (error as { message?: string } | undefined)?.message ?? "Sync error";
    notify({ status: "error", error: message });
  });

  return syncHandler;
};
