"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getDb } from "../../lib/offline/db";
import type { QueueItemDoc } from "../../lib/offline/schema";
import { getSession } from "../../lib/session";

export default function QueueHubPage() {
  const [items, setItems] = useState<QueueItemDoc[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const db = await getDb();
      if (!db) {
        setError("Offline database is not available in this environment.");
        return;
      }
      const session = getSession();
      if (!session) {
        setError("Facility session is required.");
        return;
      }

      try {
        const result = await db.allDocs({
          include_docs: true,
          startkey: "queue:",
          endkey: "queue:\uffff"
        });
        const docs = result.rows
          .map((row) => row.doc as QueueItemDoc | undefined)
          .filter(
            (doc): doc is QueueItemDoc =>
              !!doc && doc.type === "queueItem" && doc.facilityId === session.facilityId
          );
        setItems(docs);
      } catch (loadError) {
        setError("Unable to load queue data.");
      }
    };

    load();
  }, []);

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  const summary = useMemo(() => {
    const registeredToday = items.filter(
      (item) => new Date(item.createdAt).getTime() >= startOfDay
    ).length;
    const inConsult = items.filter((item) => item.status === "in_consult").length;
    const labPending = items.filter((item) => item.flags?.labPending).length;
    const pharmacyPending = items.filter((item) => item.flags?.pharmacyPending).length;

    return {
      registeredToday,
      inConsult,
      labPending,
      pharmacyPending
    };
  }, [items, startOfDay]);

  return (
    <main aria-labelledby="queues-title">
      <div style={{ marginBottom: "1rem" }}>
        <Link href="/dashboard" className="button ghost">
          <span className="icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="16" height="16" role="presentation">
              <path d="M9.5 3.5 5 8l4.5 4.5" />
            </svg>
          </span>
          Back to dashboard
        </Link>
      </div>
      <div className="card">
        <span className="tag">Queues</span>
        <h2 id="queues-title">Queues overview</h2>
        <p>Monitor today&#39;s activity and route patients to the right service.</p>
      </div>

      <div className="queue-cards">
        <Link className="queue-card" href="/dashboard/queues/list?filter=registered">
          <p className="profile-label">Registered today</p>
          <p className="profile-value">{summary.registeredToday}</p>
        </Link>
        <Link className="queue-card" href="/dashboard/queues/list?filter=in_consult">
          <p className="profile-label">In consult</p>
          <p className="profile-value">{summary.inConsult}</p>
        </Link>
        <Link className="queue-card" href="/dashboard/queues/list?filter=lab_pending">
          <p className="profile-label">Lab pending</p>
          <p className="profile-value">{summary.labPending}</p>
        </Link>
        <Link className="queue-card" href="/dashboard/queues/list?filter=pharmacy_pending">
          <p className="profile-label">Pharmacy pending</p>
          <p className="profile-value">{summary.pharmacyPending}</p>
        </Link>
      </div>

      {error ? (
        <p className="form-helper" role="status" style={{ marginTop: "1rem" }}>
          {error}
        </p>
      ) : null}
    </main>
  );
}
