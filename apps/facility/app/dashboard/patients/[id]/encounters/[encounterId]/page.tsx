"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getDb } from "../../../../../../src/lib/offline/db";
import Toast from "../../../../../../src/components/Toast";
import {
  createEncounterDocId,
  createPatientDocId
} from "../../../../../../src/lib/offline/schema";
import type { EncounterDoc, PatientDoc } from "../../../../../../src/lib/offline/schema";
import { getSession } from "../../../../../../src/lib/session";

type EncounterViewProps = {
  params: {
    id: string;
    encounterId: string;
  };
};

export default function EncounterViewPage({ params }: EncounterViewProps) {
  const [encounter, setEncounter] = useState<EncounterDoc | null>(null);
  const [patient, setPatient] = useState<PatientDoc | null>(null);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastShownRef = useRef(false);
  const searchParams = useSearchParams();
  const showUpdatedNotice = searchParams.get("updated") === "1";

  useEffect(() => {
    if (!showUpdatedNotice || toastShownRef.current) {
      return;
    }
    setToastMessage("Encounter updated successfully.");
    toastShownRef.current = true;
  }, [showUpdatedNotice]);

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
        const doc = (await db.get(createEncounterDocId(params.encounterId))) as EncounterDoc;
        if (doc.facilityId !== session.facilityId || doc.patientId !== params.id) {
          setError("Encounter not found for this patient.");
          return;
        }
        setEncounter(doc);
      } catch (loadError) {
        setError("Unable to load encounter.");
        return;
      }

      try {
        const patientDoc = (await db.get(createPatientDocId(params.id))) as PatientDoc;
        if (patientDoc.facilityId !== session.facilityId) {
          setError("Patient not found for this facility.");
          return;
        }
        setPatient(patientDoc);
      } catch (loadError) {
        // Patient details are optional for display.
      }
    };

    load();
  }, [params.encounterId, params.id]);

  if (!encounter) {
    return (
      <main aria-labelledby="encounter-title">
        <div className="card">
          <span className="tag">Encounter</span>
          <h2 id="encounter-title">Encounter details</h2>
          <p>{error || "Loading encounter..."}</p>
          <div style={{ marginTop: "1.5rem" }}>
            <Link href={`/dashboard/patients/${params.id}`} className="button secondary table-action">
              <span className="icon" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="16" height="16" role="presentation">
                  <path d="M9.5 3.5 5 8l4.5 4.5" />
                </svg>
              </span>
              Back to patient
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const patientName = patient
    ? `${patient.demographics.firstName} ${patient.demographics.lastName}`
    : "Unknown patient";

  const vitals = encounter.vitals ?? {};

  return (
    <main aria-labelledby="encounter-title">
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
        <span className="tag">Encounter</span>
        <h2 id="encounter-title">Encounter {encounter.encounterId}</h2>
        <p className="form-helper">
          Patient: {patientName} | Department: {encounter.department}
        </p>
        <p className="profile-value">{new Date(encounter.encounterDateTime).toLocaleString()}</p>
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
          <Link
            href={`/dashboard/patients/${params.id}/encounters/${encounter.encounterId}/edit`}
            className="button secondary table-action"
          >
            Edit encounter
          </Link>
          <Link
            href={`/dashboard/patients/${params.id}/encounters/${encounter.encounterId}/lab/new`}
            className="button secondary table-action"
          >
            Create lab order
          </Link>
          <Link
            href={`/dashboard/patients/${params.id}/encounters/${encounter.encounterId}/pharmacy/new`}
            className="button secondary table-action"
          >
            Create prescription
          </Link>
        </div>
      </div>
      <Toast
        message={toastMessage}
        tone="success"
        durationMs={4000}
        onClose={() => setToastMessage(null)}
      />

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <span className="tag">Clinical notes</span>
        <div className="profile-grid" style={{ marginTop: "1rem" }}>
          <div>
            <p className="profile-label">Chief complaint</p>
            <p className="profile-value">{encounter.notes?.chiefComplaint || "Not captured"}</p>
          </div>
          <div>
            <p className="profile-label">Diagnosis codes</p>
            <p className="profile-value">
              {encounter.diagnosisCodes.length > 0
                ? encounter.diagnosisCodes.join(", ")
                : "Not captured"}
            </p>
          </div>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <p className="profile-label">Clinical notes</p>
          <p className="profile-value">{encounter.notes?.clinicalNotes || "Not captured"}</p>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <p className="profile-label">Assessment</p>
          <p className="profile-value">{encounter.notes?.assessment || "Not captured"}</p>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <p className="profile-label">Plan</p>
          <p className="profile-value">{encounter.notes?.plan || "Not captured"}</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <span className="tag">Vitals</span>
        <div className="profile-grid" style={{ marginTop: "1rem" }}>
          <div>
            <p className="profile-label">Temperature (C)</p>
            <p className="profile-value">{vitals.temperatureC ?? "—"}</p>
          </div>
          <div>
            <p className="profile-label">Pulse (bpm)</p>
            <p className="profile-value">{vitals.pulseBpm ?? "—"}</p>
          </div>
          <div>
            <p className="profile-label">Respiratory rate</p>
            <p className="profile-value">{vitals.respiratoryRate ?? "—"}</p>
          </div>
          <div>
            <p className="profile-label">Systolic BP</p>
            <p className="profile-value">{vitals.systolicBp ?? "—"}</p>
          </div>
          <div>
            <p className="profile-label">Diastolic BP</p>
            <p className="profile-value">{vitals.diastolicBp ?? "—"}</p>
          </div>
          <div>
            <p className="profile-label">Weight (kg)</p>
            <p className="profile-value">{vitals.weightKg ?? "—"}</p>
          </div>
          <div>
            <p className="profile-label">Height (cm)</p>
            <p className="profile-value">{vitals.heightCm ?? "—"}</p>
          </div>
          <div>
            <p className="profile-label">Oxygen saturation (%)</p>
            <p className="profile-value">{vitals.oxygenSaturationPct ?? "—"}</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <span className="tag">Orders</span>
        <p className="form-helper" style={{ marginTop: "1rem" }}>
          Lab request needed: {encounter.flags.labRequestNeeded ? "Yes" : "No"} | Prescription
          needed: {encounter.flags.prescriptionNeeded ? "Yes" : "No"}
        </p>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <Link href={`/dashboard/patients/${params.id}`} className="button secondary table-action">
          <span className="icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="16" height="16" role="presentation">
              <path d="M9.5 3.5 5 8l4.5 4.5" />
            </svg>
          </span>
          Back to patient
        </Link>
      </div>
    </main>
  );
}
