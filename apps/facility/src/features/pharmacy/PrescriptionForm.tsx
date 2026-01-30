"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createPrescriptionId, createQueueId } from "../../lib/id";
import { getDb } from "../../lib/offline/db";
import { createPrescriptionDocId, createQueueDocId } from "../../lib/offline/schema";
import { getSession } from "../../lib/session";
import { DictatedField } from "../../components/DictatedField";
import { RoleGate } from "../../components/RoleGate";
import { useDictationManager } from "../../lib/dictation/useDictationManager";
import { nigeriaEssentialDrugs } from "../../lib/data/ng-drugs";
import type { DrugCatalogItem } from "../../lib/data/ng-drugs";
import type { DrugDoc } from "../../lib/offline/schema";

export type PrescriptionItemDraft = {
  name: string;
  unitLabel?: string;
  unitPriceNgn?: number;
  dose: string;
  frequency: string;
  duration: string;
  quantity: string;
};

type PrescriptionFormProps = {
  patientId: string;
  encounterId: string;
};

export default function PrescriptionForm({ patientId, encounterId }: PrescriptionFormProps) {
  const [items, setItems] = useState<PrescriptionItemDraft[]>([
    { name: "", dose: "", frequency: "", duration: "", quantity: "" }
  ]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [catalogDocs, setCatalogDocs] = useState<DrugDoc[]>([]);
  const drugCatalog = useMemo(() => {
    if (catalogDocs.length > 0) {
      return catalogDocs
        .filter((doc) => doc.status === "active")
        .map((doc) => ({
          name: doc.name,
          form: doc.form,
          strength: doc.strength,
          unitLabel: doc.unitLabel,
          unitPriceNgn: doc.unitPriceNgn,
          state: doc.state
        }));
    }
    return nigeriaEssentialDrugs;
  }, [catalogDocs]);
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

  const updateItem = (index: number, field: keyof PrescriptionItemDraft, value: string) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const applyDrugSelection = (index: number, value: string) => {
    const match = drugCatalog.find((drug) => {
      const label = `${drug.name} ${drug.form} ${drug.strength}`.toLowerCase();
      return (
        label === value.trim().toLowerCase() ||
        drug.name.toLowerCase() === value.trim().toLowerCase()
      );
    });
    const displayName = match ? `${match.name} ${match.form} ${match.strength}` : value;
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              name: displayName,
              unitLabel: match?.unitLabel,
              unitPriceNgn: match?.unitPriceNgn
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, { name: "", dose: "", frequency: "", duration: "", quantity: "" }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  useEffect(() => {
    const loadCatalog = async () => {
      const db = await getDb();
      if (!db) {
        return;
      }
      const session = getSession();
      if (!session) {
        return;
      }
      try {
        const result = await db.allDocs({
          include_docs: true,
          startkey: "drug:",
          endkey: "drug:\uffff"
        });
        const docs = result.rows
          .map((row) => row.doc as DrugDoc | undefined)
          .filter(
            (doc): doc is DrugDoc =>
              !!doc &&
              doc.type === "drug" &&
              (!doc.facilityId || doc.facilityId === session.facilityId)
          );
        setCatalogDocs(docs);
      } catch (loadError) {
        // fallback to seed list
      }
    };

    loadCatalog();
  }, []);

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
      setError("Facility session is required before creating prescriptions.");
      return;
    }

    const filteredItems = items
      .map((item) => ({
        name: item.name.trim(),
        unitLabel: item.unitLabel,
        unitPriceNgn: item.unitPriceNgn,
        dose: item.dose.trim() || undefined,
        frequency: item.frequency.trim() || undefined,
        duration: item.duration.trim() || undefined,
        quantity: item.quantity.trim() || undefined
      }))
      .filter((item) => item.name);

    if (filteredItems.length === 0) {
      setError("Add at least one medication item.");
      return;
    }

    const prescriptionId = createPrescriptionId();
    const now = new Date().toISOString();

    const doc = {
      _id: createPrescriptionDocId(prescriptionId),
      type: "prescription",
      prescriptionId,
      patientId,
      encounterId,
      facilityId: session.facilityId,
      items: filteredItems,
      notes: notes || undefined,
      status: "prescribed",
      prescribedAt: now
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
          flags: { ...(existingQueue as any).flags, pharmacyPending: true },
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
            flags: { pharmacyPending: true }
          });
        }
      }
      router.push(`/dashboard/pharmacy/prescriptions/${prescriptionId}?created=1`);
    } catch (saveError) {
      setError("Unable to save prescription to offline storage.");
    }
  };

  return (
    <RoleGate
      allowedRoles={["admin", "pharmacy", "clinician"]}
      title="Pharmacy access required"
      message="Only pharmacy staff, clinicians, or admins can create prescriptions."
    >
    <form onSubmit={handleSubmit}>
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <span className="tag">Prescription</span>
        <div className="form-field" style={{ marginTop: "1rem" }}>
          <label className="form-label">Medication items</label>
          <div className="prescription-items">
            {items.map((item, index) => (
              <div className="prescription-item" key={`item-${index}`}>
                <select
                  className="form-select"
                  value={item.name}
                  onChange={(event) => applyDrugSelection(index, event.target.value)}
                  aria-label="Select from formulary"
                >
                  <option value="">Select from formulary</option>
                  {drugCatalog.map((drug: DrugCatalogItem) => (
                    <option
                      key={`${drug.name}-${drug.strength}`}
                      value={`${drug.name} ${drug.form} ${drug.strength}`}
                    >
                      {drug.name} {drug.form} {drug.strength}
                    </option>
                  ))}
                </select>
                <input
                  className="form-input"
                  placeholder="Medication name"
                  value={item.name}
                  onChange={(event) => applyDrugSelection(index, event.target.value)}
                  list={`drug-options-${index}`}
                  required
                />
                <datalist id={`drug-options-${index}`}>
                  {drugCatalog.map((drug: DrugCatalogItem) => (
                    <option key={`${drug.name}-${drug.strength}`} value={`${drug.name} ${drug.form} ${drug.strength}`} />
                  ))}
                </datalist>
                <input
                  className="form-input"
                  placeholder="Unit"
                  value={item.unitLabel ?? ""}
                  readOnly
                  aria-label="Unit label"
                />
                <input
                  className="form-input"
                  placeholder="Unit price (NGN)"
                  value={item.unitPriceNgn ? `${item.unitPriceNgn}` : ""}
                  readOnly
                  aria-label="Unit price in Nigerian naira"
                />
                <input
                  className="form-input"
                  placeholder="Dose"
                  value={item.dose}
                  onChange={(event) => updateItem(index, "dose", event.target.value)}
                />
                <input
                  className="form-input"
                  placeholder="Frequency"
                  value={item.frequency}
                  onChange={(event) => updateItem(index, "frequency", event.target.value)}
                />
                <input
                  className="form-input"
                  placeholder="Duration"
                  value={item.duration}
                  onChange={(event) => updateItem(index, "duration", event.target.value)}
                />
                <input
                  className="form-input"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(event) => updateItem(index, "quantity", event.target.value)}
                />
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button className="button secondary" type="button" onClick={addItem}>
            Add item
          </button>
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
        <button className="button primary" type="submit">
          Create prescription
        </button>
        <button className="button secondary" type="button" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
    </RoleGate>
  );
}
