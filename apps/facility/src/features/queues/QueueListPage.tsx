"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getDb } from "../../lib/offline/db";
import type { PatientDoc, QueueItemDoc } from "../../lib/offline/schema";
import { getSession } from "../../lib/session";

export default function QueueListPage() {
  const [items, setItems] = useState<QueueItemDoc[]>([]);
  const [patients, setPatients] = useState<Map<string, PatientDoc>>(new Map());
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") ?? "registered";

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
        const [queueResult, patientResult] = await Promise.all([
          db.allDocs({ include_docs: true, startkey: "queue:", endkey: "queue:\uffff" }),
          db.allDocs({ include_docs: true, startkey: "patient:", endkey: "patient:\uffff" })
        ]);

        const patientMap = new Map<string, PatientDoc>();
        for (const row of patientResult.rows) {
          const doc = row.doc as PatientDoc | undefined;
          if (doc && doc.type === "patient" && doc.facilityId === session.facilityId) {
            patientMap.set(doc.patientId, doc);
          }
        }

        const queueItems = queueResult.rows
          .map((row) => row.doc as QueueItemDoc | undefined)
          .filter(
            (doc): doc is QueueItemDoc =>
              !!doc && doc.type === "queueItem" && doc.facilityId === session.facilityId
          )
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

        setPatients(patientMap);
        setItems(queueItems);
      } catch (loadError) {
        setError("Unable to load queue list.");
      }
    };

    load();
  }, []);

  const filteredItems = useMemo(() => {
    if (filter === "lab_pending") {
      return items.filter((item) => item.flags?.labPending);
    }
    if (filter === "pharmacy_pending") {
      return items.filter((item) => item.flags?.pharmacyPending);
    }
    return items.filter((item) => item.status === filter);
  }, [items, filter]);

  return (
    <main aria-labelledby="queue-list-title">
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
        <h2 id="queue-list-title">Queue list</h2>
        <p>Filtered view for {filter.replace("_", " ")}.</p>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div className="registry-shell">
          <table className="registry-table">
            <thead>
              <tr>
                <th scope="col">Patient Ref</th>
                <th scope="col">Patient name</th>
                <th scope="col">Status</th>
                <th scope="col">Lab pending</th>
                <th scope="col">Pharmacy pending</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <h3>No queue items for this filter.</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const patient = patients.get(item.patientId);
                  return (
                    <tr key={item._id}>
                      <td>{item.patientRefId}</td>
                      <td>
                        {patient
                          ? `${patient.demographics.firstName} ${patient.demographics.lastName}`
                          : "Unknown"}
                      </td>
                      <td>{item.status}</td>
                      <td>{item.flags?.labPending ? "Yes" : "No"}</td>
                      <td>{item.flags?.pharmacyPending ? "Yes" : "No"}</td>
                      <td>
                        <div className="actions-row">
                          <Link
                            className="button secondary table-action"
                            href={`/dashboard/patients/${item.patientId}`}
                          >
                            Open patient
                          </Link>
                          {!item.encounterId ? (
                            <Link
                              className="button secondary table-action"
                              href={`/dashboard/patients/${item.patientId}/encounters/new`}
                            >
                              Start new encounter
                            </Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {error ? (
          <p className="form-helper" role="status" style={{ marginTop: "1rem" }}>
            {error}
          </p>
        ) : null}
      </div>
    </main>
  );
}
