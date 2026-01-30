"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getDb } from "../../lib/offline/db";
import { RoleGate } from "../../components/RoleGate";
import type { LabOrderDoc, PatientDoc } from "../../lib/offline/schema";
import { getSession } from "../../lib/session";

export default function LabQueuePage() {
  const [orders, setOrders] = useState<LabOrderDoc[]>([]);
  const [patients, setPatients] = useState<Map<string, PatientDoc>>(new Map());
  const [filter, setFilter] = useState<"requested" | "resulted">("requested");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const showResultedNotice = searchParams.get("resulted") === "1";

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
        const [ordersResult, patientsResult] = await Promise.all([
          db.allDocs({ include_docs: true, startkey: "labOrder:", endkey: "labOrder:\uffff" }),
          db.allDocs({ include_docs: true, startkey: "patient:", endkey: "patient:\uffff" })
        ]);

        const patientMap = new Map<string, PatientDoc>();
        for (const row of patientsResult.rows) {
          const doc = row.doc as PatientDoc | undefined;
          if (doc && doc.type === "patient" && doc.facilityId === session.facilityId) {
            patientMap.set(doc.patientId, doc);
          }
        }

        const labOrders = ordersResult.rows
          .map((row) => row.doc as LabOrderDoc | undefined)
          .filter(
            (doc): doc is LabOrderDoc =>
              !!doc && doc.type === "labOrder" && doc.facilityId === session.facilityId
          )
          .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));

        setPatients(patientMap);
        setOrders(labOrders);
      } catch (loadError) {
        setError("Unable to load lab queue.");
      }
    };

    load();
  }, []);

  const visibleOrders = orders.filter((order) => order.status === filter);

  return (
    <RoleGate
      allowedRoles={["admin", "lab", "clinician"]}
      title="Lab access required"
      message="Only lab staff, clinicians, or admins can access the lab queue."
    >
    <main aria-labelledby="lab-title">
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
        <span className="tag">Lab</span>
        <h2 id="lab-title">Lab queue</h2>
        <p>Track requested tests and record results when complete.</p>
      </div>
      {showResultedNotice ? (
        <div className="notice-banner" role="status" style={{ marginTop: "1rem" }}>
          Lab results saved successfully.
        </div>
      ) : null}

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div className="actions-row">
          <button
            className={`button ${filter === "requested" ? "primary" : "secondary"}`}
            type="button"
            onClick={() => setFilter("requested")}
          >
            Requested
          </button>
          <button
            className={`button ${filter === "resulted" ? "primary" : "secondary"}`}
            type="button"
            onClick={() => setFilter("resulted")}
          >
            Resulted
          </button>
        </div>

        <div className="registry-shell" style={{ marginTop: "1.5rem" }}>
          <table className="registry-table">
            <thead>
              <tr>
                <th scope="col">Requested</th>
                <th scope="col">Patient Ref</th>
                <th scope="col">Patient name</th>
                <th scope="col">Tests</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <h3>No lab orders in this queue.</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleOrders.map((order) => {
                  const patient = patients.get(order.patientId);
                  return (
                    <tr key={order._id}>
                      <td>{new Date(order.requestedAt).toLocaleString()}</td>
                      <td>{patient?.referenceId ?? order.patientId}</td>
                      <td>
                        {patient
                          ? `${patient.demographics.firstName} ${patient.demographics.lastName}`
                          : "Unknown"}
                      </td>
                      <td>{order.tests.join(", ")}</td>
                      <td>{order.status}</td>
                      <td>
                        <Link className="button secondary" href={`/dashboard/lab/orders/${order.orderId}`}>
                          View
                        </Link>
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
    </RoleGate>
  );
}
