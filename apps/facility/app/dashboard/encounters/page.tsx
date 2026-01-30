"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getDb } from "../../../src/lib/offline/db";
import type {
  EncounterDoc,
  LabOrderDoc,
  PatientDoc,
  PrescriptionDoc
} from "../../../src/lib/offline/schema";
import { getSession } from "../../../src/lib/session";

type EncounterRow = {
  encounterId: string;
  patientId: string;
  patientName: string;
  createdAt: string;
  status: "Captured" | "Orders pending";
  needsReview?: boolean;
};

const formatName = (patient?: PatientDoc) =>
  patient ? `${patient.demographics.firstName} ${patient.demographics.lastName}` : "Unknown";

export default function EncountersPage() {
  const [rows, setRows] = useState<EncounterRow[]>([]);
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
        const [encountersResult, patientsResult, labResult, rxResult] = await Promise.all([
          db.allDocs({ include_docs: true, startkey: "encounter:", endkey: "encounter:\uffff" }),
          db.allDocs({ include_docs: true, startkey: "patient:", endkey: "patient:\uffff" }),
          db.allDocs({ include_docs: true, startkey: "labOrder:", endkey: "labOrder:\uffff" }),
          db.allDocs({ include_docs: true, startkey: "prescription:", endkey: "prescription:\uffff" })
        ]);

        const patientMap = new Map<string, PatientDoc>();
        for (const row of patientsResult.rows) {
          const doc = row.doc as PatientDoc | undefined;
          if (doc && doc.type === "patient" && doc.facilityId === session.facilityId) {
            patientMap.set(doc.patientId, doc);
          }
        }

        const labOrders = labResult.rows
          .map((row) => row.doc as LabOrderDoc | undefined)
          .filter(
            (doc): doc is LabOrderDoc =>
              !!doc && doc.type === "labOrder" && doc.facilityId === session.facilityId
          );

        const prescriptions = rxResult.rows
          .map((row) => row.doc as PrescriptionDoc | undefined)
          .filter(
            (doc): doc is PrescriptionDoc =>
              !!doc && doc.type === "prescription" && doc.facilityId === session.facilityId
          );

        const encounterRows = encountersResult.rows
          .map((row) => row.doc as EncounterDoc | undefined)
          .filter(
            (doc): doc is EncounterDoc =>
              !!doc && doc.type === "encounter" && doc.facilityId === session.facilityId
          )
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map((doc) => {
            const hasDictationReview =
              doc.dictation?.notes?.requiresReview ||
              doc.dictation?.assessment?.requiresReview ||
              doc.dictation?.plan?.requiresReview;

            const encounterLabOrders = labOrders.filter((order) => order.encounterId === doc.encounterId);
            const encounterPrescriptions = prescriptions.filter(
              (rx) => rx.encounterId === doc.encounterId
            );

            const hasPendingLab = encounterLabOrders.some((order) => order.status !== "resulted");
            const hasPendingRx = encounterPrescriptions.some((rx) => rx.status !== "dispensed");

            return {
              encounterId: doc.encounterId,
              patientId: doc.patientId,
              patientName: formatName(patientMap.get(doc.patientId)),
              createdAt: doc.createdAt,
              status: (hasPendingLab || hasPendingRx
                ? "Orders pending"
                : "Captured") as EncounterRow["status"],
              needsReview: hasDictationReview
            };
          });

        setRows(encounterRows);
      } catch (loadError) {
        setError("Unable to load encounters.");
      }
    };

    load();
  }, []);

  const tableRows = useMemo(() => {
    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan={5}>
            <div className="empty-state">
              <h3>No encounters captured yet.</h3>
              <p>Start a visit from a patient profile to capture vitals and notes.</p>
            </div>
          </td>
        </tr>
      );
    }

    return rows.map((row) => (
      <tr key={row.encounterId}>
        <td>{new Date(row.createdAt).toLocaleString()}</td>
        <td>{row.patientName}</td>
        <td>{row.encounterId}</td>
                <td>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span
                      className={`status-badge status-badge--${row.status
                        .replace(" ", "-")
                        .toLowerCase()}`}
                    >
                      {row.status}
                    </span>
                    {row.needsReview ? (
                      <span className="status-badge status-badge--needs-review">
                        Needs review
                      </span>
                    ) : null}
                  </div>
                </td>
        <td>
          <Link className="button secondary" href={`/dashboard/patients/${row.patientId}`}>
            View patient
          </Link>
        </td>
      </tr>
    ));
  }, [rows]);

  return (
    <main aria-labelledby="encounters-title">
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
        <span className="tag">Encounters</span>
        <h2 id="encounters-title">Recent encounters</h2>
        <p className="page-subtitle">
          Encounters are created from a patient profile. Use the list below to review recent visits.
        </p>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div className="actions-row" style={{ justifyContent: "space-between" }}>
          <div>
            <h3 style={{ margin: 0 }}>Encounter list</h3>
            <p className="form-helper">Select a patient to start an encounter.</p>
          </div>
          <Link className="button primary" href="/dashboard/patients">
            Start new encounter
          </Link>
        </div>

        <div className="registry-shell" style={{ marginTop: "1.5rem" }}>
          <table className="registry-table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Patient</th>
                <th scope="col">Encounter ID</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        </div>

        {error ? (
          <div className="form-helper" role="status" style={{ marginTop: "1rem" }}>
            {error}
          </div>
        ) : null}
      </div>
    </main>
  );
}
