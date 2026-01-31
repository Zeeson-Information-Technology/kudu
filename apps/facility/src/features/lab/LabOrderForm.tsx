"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { createLabOrderId, createQueueId } from "../../lib/id";
import { getDb } from "../../lib/offline/db";
import { createLabOrderDocId, createQueueDocId } from "../../lib/offline/schema";
import { getSession } from "../../lib/session";
import { DictatedField } from "../../components/DictatedField";
import { RoleGate } from "../../components/RoleGate";
import { useDictationManager } from "../../lib/dictation/useDictationManager";

type LabOrderFormProps = {
  patientId: string;
  encounterId: string;
};

export default function LabOrderForm({ patientId, encounterId }: LabOrderFormProps) {
  const [tests, setTests] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const applyDictationValue = useCallback((field: "notes", value: string) => {
    if (field === "notes") {
      setNotes(value);
    }
  }, []);
  const dictationManager = useDictationManager({
    fields: ["notes"],
    onValueChange: applyDictationValue
  });
  const buildDictationControls = () => ({
    supported: dictationManager.supported,
    isActive: dictationManager.isActive("notes"),
    state: dictationManager.state.notes,
    onToggle: () =>
      dictationManager.isActive("notes") ? dictationManager.stop() : dictationManager.start("notes"),
    onConfirm: () => dictationManager.confirm("notes")
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const db = await getDb();
    if (!db) {
      setError("Offline database is not available in this environment.");
      return;
    }

    const session = getSession();
    if (!session) {
      setError("Facility session is required before creating lab orders.");
      return;
    }

    const orderId = createLabOrderId();
    const now = new Date().toISOString();
    const doc = {
      _id: createLabOrderDocId(orderId),
      type: "labOrder",
      orderId,
      patientId,
      encounterId,
      facilityId: session.facilityId,
      tests: tests
        .split(",")
        .map((test) => test.trim())
        .filter(Boolean),
      notes: notes || undefined,
      status: "requested",
      requestedAt: now
    };

    try {
      await db.put(doc);
      const queueDocId = createQueueDocId(patientId);
      const nowIso = new Date().toISOString();
      let patientRefId = patientId;
      try {
        const patientDoc = await db.get(`patient:${patientId}`);
        patientRefId = (patientDoc as any).referenceId ?? patientId;
      } catch (error) {
        // ignore
      }
      try {
        const existingQueue = await db.get(queueDocId);
        await db.put({
          ...existingQueue,
          flags: { ...(existingQueue as any).flags, labPending: true },
          updatedAt: nowIso,
          _rev: (existingQueue as any)._rev
        });
      } catch (queueError: any) {
        if (queueError?.status === 404) {
          await db.put({
            _id: queueDocId,
            type: "queueItem",
            queueId: createQueueId(),
            patientId,
            patientRefId,
            facilityId: session.facilityId,
            createdAt: nowIso,
            updatedAt: nowIso,
            status: "waiting",
            flags: { labPending: true }
          });
        }
      }
      router.push(`/dashboard/lab/orders/${orderId}?created=1`);
    } catch (dbError) {
      setError("Unable to save lab order to offline storage.");
    }
  };

  return (
    <RoleGate
      allowedRoles={["admin", "lab", "clinician"]}
      title="Lab access required"
      message="Only lab staff, clinicians, or admins can create lab orders."
    >
    <form onSubmit={handleSubmit}>
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <span className="tag">Lab order</span>
        <div className="form-field" style={{ marginTop: "1rem" }}>
          <label className="form-label" htmlFor="tests">
            Tests (comma-separated)
          </label>
          <input
            className="form-input"
            id="tests"
            name="tests"
            type="text"
            value={tests}
            onChange={(event) => setTests(event.target.value)}
            placeholder="Malaria RDT, FBC"
            required
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <DictatedField
            id="notes"
            name="notes"
            label="Notes (optional)"
            type="textarea"
            rows={3}
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
              dictationManager.markEdited("notes");
            }}
            dictation={buildDictationControls()}
            showUnsupportedNote
          />
        </div>
      </div>

      {error ? (
        <div role="alert" style={{ marginTop: "1rem", color: "#b42318" }}>
          {error}
        </div>
      ) : null}

      <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
        <button className="button primary patient-cta" type="submit">
          Create lab order
        </button>
        <button
          className="button secondary table-action"
          type="button"
          onClick={() => router.back()}
        >
          Cancel
        </button>
      </div>
    </form>
    </RoleGate>
  );
}
