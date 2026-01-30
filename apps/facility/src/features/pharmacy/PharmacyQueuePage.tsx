"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getDb } from "../../lib/offline/db";
import { RoleGate } from "../../components/RoleGate";
import type { PatientDoc, PrescriptionDoc } from "../../lib/offline/schema";
import { getSession } from "../../lib/session";

export default function PharmacyQueuePage() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionDoc[]>([]);
  const [patients, setPatients] = useState<Map<string, PatientDoc>>(new Map());
  const [filter, setFilter] = useState<"prescribed" | "dispensed">("prescribed");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const showDispensedNotice = searchParams.get("dispensed") === "1";

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
        const [rxResult, patientResult] = await Promise.all([
          db.allDocs({ include_docs: true, startkey: "prescription:", endkey: "prescription:\uffff" }),
          db.allDocs({ include_docs: true, startkey: "patient:", endkey: "patient:\uffff" })
        ]);

        const patientMap = new Map<string, PatientDoc>();
        for (const row of patientResult.rows) {
          const doc = row.doc as PatientDoc | undefined;
          if (doc && doc.type === "patient" && doc.facilityId === session.facilityId) {
            patientMap.set(doc.patientId, doc);
          }
        }

        const rxDocs = rxResult.rows
          .map((row) => row.doc as PrescriptionDoc | undefined)
          .filter(
            (doc): doc is PrescriptionDoc =>
              !!doc && doc.type === "prescription" && doc.facilityId === session.facilityId
          )
          .sort((a, b) => b.prescribedAt.localeCompare(a.prescribedAt));

        setPatients(patientMap);
        setPrescriptions(rxDocs);
      } catch (loadError) {
        setError("Unable to load pharmacy queue.");
      }
    };

    load();
  }, []);

  const visibleRx = prescriptions.filter((rx) => rx.status === filter);

  return (
    <RoleGate
      allowedRoles={["admin", "pharmacy", "clinician"]}
      title="Pharmacy access required"
      message="Only pharmacy staff, clinicians, or admins can access the pharmacy queue."
    >
    <main aria-labelledby="pharmacy-title">
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
        <span className="tag">Pharmacy</span>
        <h2 id="pharmacy-title">Pharmacy queue</h2>
        <p>Track prescriptions and mark them as dispensed.</p>
        <div style={{ marginTop: "1rem" }}>
          <Link href="/dashboard/pharmacy/catalog" className="button secondary">
            Manage drug catalog
          </Link>
        </div>
      </div>
      {showDispensedNotice ? (
        <div className="notice-banner" role="status" style={{ marginTop: "1rem" }}>
          Prescription marked as dispensed.
        </div>
      ) : null}

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div className="actions-row">
          <button
            className={`button ${filter === "prescribed" ? "primary" : "secondary"}`}
            type="button"
            onClick={() => setFilter("prescribed")}
          >
            Prescribed
          </button>
          <button
            className={`button ${filter === "dispensed" ? "primary" : "secondary"}`}
            type="button"
            onClick={() => setFilter("dispensed")}
          >
            Dispensed
          </button>
        </div>

        <div className="registry-shell" style={{ marginTop: "1.5rem" }}>
          <table className="registry-table">
            <thead>
              <tr>
                <th scope="col">Prescribed</th>
                <th scope="col">Patient Ref</th>
                <th scope="col">Patient name</th>
                <th scope="col">Items</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleRx.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <h3>No prescriptions in this queue.</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleRx.map((rx) => {
                  const patient = patients.get(rx.patientId);
                  return (
                    <tr key={rx._id}>
                      <td>{new Date(rx.prescribedAt).toLocaleString()}</td>
                      <td>{patient?.referenceId ?? rx.patientId}</td>
                      <td>
                        {patient
                          ? `${patient.demographics.firstName} ${patient.demographics.lastName}`
                          : "Unknown"}
                      </td>
                      <td>{rx.items.length}</td>
                      <td>{rx.status}</td>
                      <td>
                        <Link className="button secondary" href={`/dashboard/pharmacy/prescriptions/${rx.prescriptionId}`}>
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
