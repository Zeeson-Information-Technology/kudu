"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDb } from "../../lib/offline/db";
import { createLabOrderDocId, createQueueDocId } from "../../lib/offline/schema";
import { createQueueId } from "../../lib/id";
import { getSession } from "../../lib/session";
import type { LabOrderDoc, PatientDoc } from "../../lib/offline/schema";
import { DictatedField } from "../../components/DictatedField";
import { RoleGate } from "../../components/RoleGate";
import { useDictationManager } from "../../lib/dictation/useDictationManager";
import Toast from "../../components/Toast";

type ResultRow = {
  key: string;
  value: string;
};

type LabOrderDetailProps = {
  orderId: string;
};

export default function LabOrderDetail({ orderId }: LabOrderDetailProps) {
  const [order, setOrder] = useState<LabOrderDoc | null>(null);
  const [patient, setPatient] = useState<PatientDoc | null>(null);
  const [resultSummary, setResultSummary] = useState("");
  const [rows, setRows] = useState<ResultRow[]>([{ key: "", value: "" }]);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastShownRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const showCreatedNotice = searchParams.get("created") === "1";
  const applyDictationValue = useCallback((field: "summary", value: string) => {
    if (field === "summary") {
      setResultSummary(value);
    }
  }, []);
  const dictationManager = useDictationManager({
    fields: ["summary"],
    onValueChange: applyDictationValue
  });
  const buildDictationControls = () => ({
    supported: dictationManager.supported,
    isActive: dictationManager.isActive("summary"),
    state: dictationManager.state.summary,
    onToggle: () =>
      dictationManager.isActive("summary")
        ? dictationManager.stop()
        : dictationManager.start("summary"),
    onConfirm: () => dictationManager.confirm("summary")
  });

  useEffect(() => {
    if (!showCreatedNotice || toastShownRef.current) {
      return;
    }
    setToastMessage("Lab order created. Add results when available.");
    toastShownRef.current = true;
  }, [showCreatedNotice]);

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
        const doc = (await db.get(createLabOrderDocId(orderId))) as LabOrderDoc;
        if (doc.facilityId !== session.facilityId) {
          setError("Lab order not found for this facility.");
          return;
        }
        const patientDoc = (await db.get(`patient:${doc.patientId}`)) as PatientDoc;
        if (patientDoc.facilityId !== session.facilityId) {
          setError("Patient not found for this facility.");
          return;
        }
        setOrder(doc);
        setResultSummary(doc.result?.summary ?? "");
        if (doc.result?.values) {
          const entries = Object.entries(doc.result.values).map(([key, value]) => ({ key, value }));
          setRows(entries.length > 0 ? entries : [{ key: "", value: "" }]);
        }
        setPatient(patientDoc);
      } catch (loadError) {
        setError("Unable to load lab order.");
      }
    };

    load();
  }, [orderId]);

  const addRow = () => {
    setRows((prev) => [...prev, { key: "", value: "" }]);
  };

  const updateRow = (index: number, field: "key" | "value", value: string) => {
    setRows((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row))
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!order) {
      return;
    }

    const db = await getDb();
    if (!db) {
      setError("Offline database is not available in this environment.");
      return;
    }

    const values: Record<string, string> = {};
    rows.forEach((row) => {
      if (row.key.trim()) {
        values[row.key.trim()] = row.value.trim();
      }
    });

    const updated = {
      ...order,
      status: "resulted" as const,
      resultedAt: new Date().toISOString(),
      result: {
        summary: resultSummary,
        values: Object.keys(values).length > 0 ? values : undefined
      }
    };

    try {
      await db.put({ ...updated, _rev: (order as any)._rev });
      const queueDocId = createQueueDocId(order.patientId);
      const nowIso = new Date().toISOString();
      const session = getSession();
      let patientRefId = order.patientId;
      try {
        const patientDoc = await db.get(`patient:${order.patientId}`);
        patientRefId = (patientDoc as any).referenceId ?? order.patientId;
      } catch (error) {
        // ignore
      }
      try {
        const existingQueue = await db.get(queueDocId);
        await db.put({
          ...existingQueue,
          flags: { ...(existingQueue as any).flags, labPending: false },
          updatedAt: nowIso,
          _rev: (existingQueue as any)._rev
        });
      } catch (queueError: any) {
        if (queueError?.status === 404) {
          await db.put({
            _id: queueDocId,
            type: "queueItem",
            queueId: createQueueId(),
            patientId: order.patientId,
            patientRefId,
            facilityId: session?.facilityId,
            createdAt: nowIso,
            updatedAt: nowIso,
            status: "waiting",
            flags: { labPending: false }
          });
        }
      }
      router.push("/dashboard/lab?resulted=1");
    } catch (saveError) {
      setError("Unable to save lab results.");
    }
  };

  if (!order) {
    return (
      <main aria-labelledby="lab-order-title">
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
          <h2 id="lab-order-title">Lab order</h2>
          <p>{error || "Loading lab order..."}</p>
        </div>
      </main>
    );
  }

  const patientName = patient
    ? `${patient.demographics.firstName} ${patient.demographics.lastName}`
    : "Unknown";

  return (
    <RoleGate
      allowedRoles={["admin", "lab", "clinician"]}
      title="Lab access required"
      message="Only lab staff, clinicians, or admins can view lab orders."
    >
    <main aria-labelledby="lab-order-title">
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
        <span className="tag">Lab order</span>
        <h2 id="lab-order-title">Order {order.orderId}</h2>
        <p>
          Patient: {patientName} | Encounter: {order.encounterId}
        </p>
        <p className="form-helper">Status: {order.status}</p>
      </div>
      <Toast
        message={toastMessage}
        tone="success"
        durationMs={4000}
        onClose={() => setToastMessage(null)}
      />

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <span className="tag">Results</span>
          <div style={{ marginTop: "1rem" }}>
            <DictatedField
              id="resultSummary"
              name="resultSummary"
              label="Result summary"
              type="textarea"
              rows={4}
              value={resultSummary}
              onChange={(event) => {
                setResultSummary(event.target.value);
                dictationManager.markEdited("summary");
              }}
              dictation={buildDictationControls()}
              showUnsupportedNote
            />
          </div>
          <div className="form-field">
            <label className="form-label">Key / value results</label>
            <div className="result-rows">
              {rows.map((row, index) => (
                <div className="result-row" key={`${row.key}-${index}`}>
                  <input
                    className="form-input"
                    type="text"
                    value={row.key}
                    placeholder="Metric"
                    onChange={(event) => updateRow(index, "key", event.target.value)}
                  />
                  <input
                    className="form-input"
                    type="text"
                    value={row.value}
                    placeholder="Value"
                    onChange={(event) => updateRow(index, "value", event.target.value)}
                  />
                </div>
              ))}
            </div>
            <button className="button secondary table-action" type="button" onClick={addRow}>
              Add row
            </button>
          </div>
        </div>

        {error ? (
          <div role="alert" style={{ marginTop: "1rem", color: "#b42318" }}>
            {error}
          </div>
        ) : null}

        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
          <button className="button primary patient-cta" type="submit">
            Save results
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
    </main>
    </RoleGate>
  );
}
