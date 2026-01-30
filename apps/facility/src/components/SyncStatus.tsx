"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSyncStatus } from "../lib/offline/sync";

export default function SyncStatus() {
  const { status, lastSyncAt, error, hasConflicts } = useSyncStatus();

  const label = useMemo(() => {
    if (status === "local-only") {
      return "Local only";
    }
    if (status === "active") {
      return "Syncing";
    }
    if (status === "paused") {
      return "Offline";
    }
    if (status === "error") {
      return "Sync error";
    }
    if (status === "uptodate") {
      return "Synced";
    }
    return "Sync";
  }, [status]);

  const subtext = useMemo(() => {
    if (status === "uptodate" && lastSyncAt) {
      return `Last sync ${new Date(lastSyncAt).toLocaleTimeString()}`;
    }
    if (status === "error" && error) {
      return error;
    }
    if (status === "local-only") {
      return "Remote sync not configured";
    }
    return "";
  }, [status, lastSyncAt, error]);

  return (
    <div className="sync-status" aria-live="polite">
      <span className={`sync-pill sync-pill--${status}`}>{label}</span>
      {hasConflicts ? (
        <Link className="sync-warning" href="/dashboard/sync/conflicts">
          Review needed
        </Link>
      ) : null}
      {subtext ? (
        <span className="sync-subtext" role="status">
          {subtext}
        </span>
      ) : null}
    </div>
  );
}
