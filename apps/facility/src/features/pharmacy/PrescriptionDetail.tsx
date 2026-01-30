"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDb } from "../../lib/offline/db";
import { createPrescriptionDocId, createQueueDocId } from "../../lib/offline/schema";
import { createQueueId } from "../../lib/id";
import { getSession } from "../../lib/session";
import type { PatientDoc, PrescriptionDoc } from "../../lib/offline/schema";
import { DictatedField } from "../../components/DictatedField";
import { RoleGate } from "../../components/RoleGate";
import { useDictationManager } from "../../lib/dictation/useDictationManager";

export default function PrescriptionDetail({ prescriptionId }: { prescriptionId: string }) {
  const [rx, setRx] = useState<PrescriptionDoc | null>(null);
  const [patient, setPatient] = useState<PatientDoc | null>(null);
  const [dispenseNote, setDispenseNote] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const showCreatedNotice = searchParams.get("created") === "1";
  const applyDictationValue = useCallback((field: "dispenseNote", value: string) => {
    if (field === "dispenseNote") {
      setDispenseNote(value);
    }
  }, []);
  const dictationManager = useDictationManager({
    fields: ["dispenseNote"],
    onValueChange: applyDictationValue
  });
  const buildDictationControls = () => ({
    supported: dictationManager.supported,
    isActive: dictationManager.isActive("dispenseNote"),
    state: dictationManager.state.dispenseNote,
    onToggle: () =>
      dictationManager.isActive("dispenseNote")
        ? dictationManager.stop()
        : dictationManager.start("dispenseNote"),
    onConfirm: () => dictationManager.confirm("dispenseNote")
  });

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
        const doc = (await db.get(createPrescriptionDocId(prescriptionId))) as PrescriptionDoc;
        if (doc.facilityId !== session.facilityId) {
          setError("Prescription not found for this facility.");
          return;
        }
        const patientDoc = (await db.get(`patient:${doc.patientId}`)) as PatientDoc;
        if (patientDoc.facilityId !== session.facilityId) {
          setError("Patient not found for this facility.");
          return;
        }
        setRx(doc);
        setDispenseNote(doc.dispenseNote ?? "");
        setPatient(patientDoc);
      } catch (loadError) {
        setError("Unable to load prescription.");
      }
    };

    load();
  }, [prescriptionId]);

  const handleDispense = async () => {
    if (!rx) {
      return;
    }

    const db = await getDb();
    if (!db) {
      setError("Offline database is not available in this environment.");
      return;
    }

    const updated = {
      ...rx,
      status: "dispensed" as const,
      dispensedAt: new Date().toISOString(),
      dispenseNote: dispenseNote || undefined
    };

    try {
      await db.put({ ...updated, _rev: (rx as any)._rev });
      const queueDocId = createQueueDocId(rx.patientId);
      const nowIso = new Date().toISOString();
      const session = getSession();
      let patientRefId = rx.patientId;
      try {
        const patientDoc = await db.get(`patient:${rx.patientId}`);
        patientRefId = (patientDoc as any).referenceId ?? rx.patientId;
      } catch (error) {
        // ignore
      }
      try {
        const existingQueue = await db.get(queueDocId);
        await db.put({
          ...existingQueue,
          flags: { ...(existingQueue as any).flags, pharmacyPending: false },
          updatedAt: nowIso,
          _rev: (existingQueue as any)._rev
        });
      } catch (queueError: any) {
        if (queueError?.status === 404) {
          await db.put({
            _id: queueDocId,
            type: "queueItem",
            queueId: createQueueId(),
            patientId: rx.patientId,
            patientRefId,
            facilityId: session?.facilityId,
            createdAt: nowIso,
            updatedAt: nowIso,
            status: "waiting",
            flags: { pharmacyPending: false }
          });
        }
      }
      router.push("/dashboard/pharmacy?dispensed=1");
    } catch (saveError) {
      setError("Unable to save dispensed status.");
    }
  };

  if (!rx) {
    return (
      <main aria-labelledby="rx-title">
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
          <h2 id="rx-title">Prescription</h2>
          <p>{error || "Loading prescription..."}</p>
        </div>
      </main>
    );
  }

  const patientName = patient
    ? `${patient.demographics.firstName} ${patient.demographics.lastName}`
    : "Unknown";

  return (
    <RoleGate
      allowedRoles={["admin", "pharmacy", "clinician"]}
      title="Pharmacy access required"
      message="Only pharmacy staff, clinicians, or admins can view prescriptions."
    >
    <main aria-labelledby="rx-title">
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
        <span className="tag">Prescription</span>
        <h2 id="rx-title">Prescription {rx.prescriptionId}</h2>
        <p>
          Patient: {patientName} | Encounter: {rx.encounterId}
        </p>
        <p className="form-helper">Status: {rx.status}</p>
      </div>
      {showCreatedNotice ? (
        <div className="notice-banner" role="status" style={{ marginTop: "1rem" }}>
          Prescription created. Dispense when ready.
        </div>
      ) : null}

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <span className="tag">Items</span>
        <ul className="timeline-list" style={{ marginTop: "1rem" }}>
          {rx.items.map((item, index) => (
            <li key={`${item.name}-${index}`} className="timeline-item">
              <div>
                <p className="profile-value">{item.name}</p>
                <p className="form-helper">
                  {[
                    item.unitLabel ? `Unit: ${item.unitLabel}` : undefined,
                    item.unitPriceNgn ? `NGN ${item.unitPriceNgn} per unit` : undefined
                  ]
                    .filter(Boolean)
                    .join(" | ") || "No pricing info"}
                </p>
                <p className="form-helper">
                  {[item.dose, item.frequency, item.duration, item.quantity]
                    .filter(Boolean)
                    .join(" | ") || "No details"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <span className="tag">Dispense</span>
        <div style={{ marginTop: "1rem" }}>
          <DictatedField
            id="dispenseNote"
            name="dispenseNote"
            label="Dispense note (optional)"
            type="textarea"
            rows={3}
            value={dispenseNote}
            onChange={(event) => {
              setDispenseNote(event.target.value);
              dictationManager.markEdited("dispenseNote");
            }}
            dictation={buildDictationControls()}
            showUnsupportedNote
          />
        </div>
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
          <button className="button primary" type="button" onClick={handleDispense}>
            Mark as dispensed
          </button>
          <button className="button secondary" type="button" onClick={() => router.back()}>
            Cancel
          </button>
        </div>
        {error ? (
          <div role="alert" style={{ marginTop: "1rem", color: "#b42318" }}>
            {error}
          </div>
        ) : null}
      </div>
    </main>
    </RoleGate>
  );
}
