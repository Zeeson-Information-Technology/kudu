"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createEncounterId, createQueueId } from "../../lib/id";
import { getDb } from "../../lib/offline/db";
import { createEncounterDocId, createQueueDocId } from "../../lib/offline/schema";
import type { Encounter, EncounterDraft } from "../../lib/models/encounter";
import { getSession } from "../../lib/session";
import { logAuditEvent } from "../../lib/offline/audit";
import { DictatedField } from "../../components/DictatedField";
import { useDictationManager } from "../../lib/dictation/useDictationManager";

const buildDefaultDateTime = () => {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
};

const emptyDraft: EncounterDraft = {
  encounterDateTime: buildDefaultDateTime(),
  department: "OPD",
  temperatureC: "",
  pulseBpm: "",
  respiratoryRate: "",
  systolicBp: "",
  diastolicBp: "",
  weightKg: "",
  heightCm: "",
  oxygenSaturationPct: "",
  chiefComplaint: "",
  clinicalNotes: "",
  assessment: "",
  plan: "",
  diagnosisCodes: "",
  labRequestNeeded: false,
  prescriptionNeeded: false,
  clinicianId: ""
};

type EncounterFormProps = {
  patientId: string;
  encounterId?: string;
  initialDraft?: EncounterDraft;
  initialDictation?: Encounter["dictation"];
  initialCreatedAt?: string;
  initialRev?: string;
};

const dictationFields = [
  "chiefComplaint",
  "notes",
  "assessment",
  "plan",
  "diagnosisCodes",
  "clinicianId"
] as const;
type DictationField = (typeof dictationFields)[number];

const dictationFieldByName: Record<string, DictationField> = {
  chiefComplaint: "chiefComplaint",
  clinicalNotes: "notes",
  assessment: "assessment",
  plan: "plan",
  diagnosisCodes: "diagnosisCodes",
  clinicianId: "clinicianId"
};

const normalizeNumber = (value: string) =>
  value.trim() === "" ? undefined : Number.parseFloat(value);

export default function EncounterForm({
  patientId,
  encounterId,
  initialDraft,
  initialDictation,
  initialCreatedAt,
  initialRev
}: EncounterFormProps) {
  const [formState, setFormState] = useState<EncounterDraft>(emptyDraft);
  const [error, setError] = useState("");
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);
  const applyDictationValue = useCallback((field: DictationField, value: string) => {
    const target = field === "notes" ? "clinicalNotes" : field;
    setFormState((prev) => ({
      ...prev,
      [target]: value
    }));
  }, []);

  const dictationManager = useDictationManager({
    fields: dictationFields,
    onValueChange: applyDictationValue
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;
    const nextValue = type === "checkbox" ? (event.target as HTMLInputElement).checked : value;

    setFormState((prev) => ({
      ...prev,
      [name]: nextValue
    }));

    if (type !== "checkbox") {
      const dictationField = dictationFieldByName[name];
      if (dictationField) {
        dictationManager.markEdited(dictationField);
      }
    }
  };

  const buildDictationEntry = (
    field: DictationField,
    edited: string,
    existing?: Encounter["dictation"] extends infer T
      ? T extends Record<string, any>
        ? T[DictationField]
        : undefined
      : undefined
  ) => {
    const state = dictationManager.state[field];
    const useState =
      state.requiresReview || state.raw || state.startedAt || state.endedAt || state.confirmedAt;

    if (!useState && !existing) {
      return undefined;
    }

    if (!useState && existing) {
      return {
        ...existing,
        edited: edited || undefined
      };
    }

    return {
      raw: state.raw || undefined,
      edited: edited || undefined,
      engine: "web_speech",
      startedAt: state.startedAt,
      endedAt: state.endedAt,
      confirmedAt: state.confirmedAt,
      requiresReview: state.requiresReview
    };
  };

  const buildDictationControls = (field: DictationField) => ({
    supported: dictationManager.supported,
    isActive: dictationManager.isActive(field),
    state: dictationManager.state[field],
    onToggle: () =>
      dictationManager.isActive(field) ? dictationManager.stop() : dictationManager.start(field),
    onConfirm: () => dictationManager.confirm(field)
  });

  useEffect(() => {
    if (initialized || !initialDraft) {
      return;
    }
    setFormState(initialDraft);
    setInitialized(true);
  }, [initialDraft, initialized]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const session = getSession();
    if (!session) {
      setError("Facility session is required before saving encounters.");
      return;
    }

    const resolvedEncounterId = encounterId ?? createEncounterId();
    const now = new Date().toISOString();
    const db = await getDb();

    if (!db) {
      setError("Offline database is not available in this environment.");
      return;
    }

    const vitals = {
      temperatureC: normalizeNumber(formState.temperatureC),
      pulseBpm: normalizeNumber(formState.pulseBpm),
      respiratoryRate: normalizeNumber(formState.respiratoryRate),
      systolicBp: normalizeNumber(formState.systolicBp),
      diastolicBp: normalizeNumber(formState.diastolicBp),
      weightKg: normalizeNumber(formState.weightKg),
      heightCm: normalizeNumber(formState.heightCm),
      oxygenSaturationPct: normalizeNumber(formState.oxygenSaturationPct)
    };

    const dictationPayload = {
      chiefComplaint: buildDictationEntry(
        "chiefComplaint",
        formState.chiefComplaint,
        initialDictation?.chiefComplaint
      ),
      notes: buildDictationEntry(
        "notes",
        formState.clinicalNotes,
        initialDictation?.notes
      ),
      assessment: buildDictationEntry(
        "assessment",
        formState.assessment,
        initialDictation?.assessment
      ),
      plan: buildDictationEntry("plan", formState.plan, initialDictation?.plan),
      diagnosisCodes: buildDictationEntry(
        "diagnosisCodes",
        formState.diagnosisCodes,
        initialDictation?.diagnosisCodes
      ),
      clinicianId: buildDictationEntry(
        "clinicianId",
        formState.clinicianId,
        initialDictation?.clinicianId
      )
    };

    const docId = createEncounterDocId(resolvedEncounterId);
    const doc = {
      _id: docId,
      type: "encounter",
      encounterId: resolvedEncounterId,
      patientId,
      facilityId: session.facilityId,
      encounterDateTime: formState.encounterDateTime,
      occurredAt: formState.encounterDateTime,
      department: formState.department,
        vitals,
        notes: {
          chiefComplaint: formState.chiefComplaint || undefined,
          clinicalNotes: formState.clinicalNotes || undefined,
          assessment: formState.assessment || undefined,
          plan: formState.plan || undefined
        },
        dictation: dictationPayload,
        diagnosisCodes: formState.diagnosisCodes
          .split(",")
          .map((code) => code.trim())
          .filter(Boolean),
        flags: {
          labRequestNeeded: formState.labRequestNeeded,
          prescriptionNeeded: formState.prescriptionNeeded
        },
        clinicianId: formState.clinicianId || undefined,
        createdAt: initialCreatedAt ?? now,
        updatedAt: now
      };

    try {
      const queueDocId = createQueueDocId(patientId);
      let patientRefId = patientId;
      try {
        const patientDoc = await db.get(`patient:${patientId}`);
        patientRefId = (patientDoc as any).referenceId ?? patientId;
      } catch (error) {
        // Keep fallback.
      }

      const baseQueueUpdate = {
        _id: queueDocId,
        type: "queueItem",
        queueId: createQueueId(),
        patientId,
        patientRefId,
        facilityId: session.facilityId,
        encounterId,
        flags: {}
      };

      const upsertQueue = async (status: "in_consult" | "waiting") => {
        try {
          const existingQueue = await db.get(queueDocId);
          await db.put({
            ...existingQueue,
            ...baseQueueUpdate,
            status,
            createdAt: (existingQueue as any).createdAt || now,
            updatedAt: now,
            _rev: (existingQueue as any)._rev
          });
        } catch (queueError: any) {
          if (queueError?.status === 404) {
            await db.put({ ...baseQueueUpdate, status, createdAt: now, updatedAt: now });
          }
        }
      };

      if (!encounterId) {
        await upsertQueue("in_consult");
        await db.put(doc);
        await logAuditEvent({
          action: "encounter.created",
          entityType: "encounter",
          entityId: resolvedEncounterId,
          summary: "Encounter created",
          metadata: {
            patientId,
            department: formState.department
          }
        });
        await upsertQueue("waiting");
        router.push(`/dashboard/patients/${patientId}?encounter=created`);
        return;
      }

      await db.put({ ...doc, _rev: initialRev });
      await logAuditEvent({
        action: "encounter.updated",
        entityType: "encounter",
        entityId: resolvedEncounterId,
        summary: "Encounter updated",
        metadata: {
          patientId,
          department: formState.department
        }
      });
      router.push(`/dashboard/patients/${patientId}/encounters/${resolvedEncounterId}?updated=1`);
    } catch (storageError) {
      setError("Unable to save encounter draft in offline storage.");
    }
  };

  const diagnosisHint = useMemo(
    () => "Separate multiple codes with commas (e.g., 1A00, 2B10)",
    []
  );

  const dictationWarning = dictationManager.warning;

  return (
    <form onSubmit={handleSubmit}>
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <span className="tag">Visit details</span>
        <div className="grid-2" style={{ marginTop: "1rem" }}>
          <div className="form-field">
            <label className="form-label" htmlFor="encounterDateTime">
              Encounter date/time
            </label>
            <input
              className="form-input"
              id="encounterDateTime"
              name="encounterDateTime"
              type="datetime-local"
              value={formState.encounterDateTime}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="department">
              Department
            </label>
            <select
              className="form-select"
              id="department"
              name="department"
              value={formState.department}
              onChange={handleChange}
            >
              <option value="OPD">OPD</option>
              <option value="ANC">ANC</option>
              <option value="Immunization">Immunization</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <span className="tag">Vitals</span>
        <div className="grid-2" style={{ marginTop: "1rem" }}>
          <div className="form-field">
            <label className="form-label" htmlFor="temperatureC">
              Temperature (C)
            </label>
            <input
              className="form-input"
              id="temperatureC"
              name="temperatureC"
              type="number"
              step="0.1"
              value={formState.temperatureC}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="pulseBpm">
              Pulse (bpm)
            </label>
            <input
              className="form-input"
              id="pulseBpm"
              name="pulseBpm"
              type="number"
              value={formState.pulseBpm}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="respiratoryRate">
              Respiratory rate
            </label>
            <input
              className="form-input"
              id="respiratoryRate"
              name="respiratoryRate"
              type="number"
              value={formState.respiratoryRate}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="systolicBp">
              Systolic BP
            </label>
            <input
              className="form-input"
              id="systolicBp"
              name="systolicBp"
              type="number"
              value={formState.systolicBp}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="diastolicBp">
              Diastolic BP
            </label>
            <input
              className="form-input"
              id="diastolicBp"
              name="diastolicBp"
              type="number"
              value={formState.diastolicBp}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="weightKg">
              Weight (kg)
            </label>
            <input
              className="form-input"
              id="weightKg"
              name="weightKg"
              type="number"
              step="0.1"
              value={formState.weightKg}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="heightCm">
              Height (cm)
            </label>
            <input
              className="form-input"
              id="heightCm"
              name="heightCm"
              type="number"
              step="0.1"
              value={formState.heightCm}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="oxygenSaturationPct">
              Oxygen saturation (%)
            </label>
            <input
              className="form-input"
              id="oxygenSaturationPct"
              name="oxygenSaturationPct"
              type="number"
              step="0.1"
              value={formState.oxygenSaturationPct}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <span className="tag">Clinical note</span>
        <div style={{ marginTop: "1rem" }}>
          {!dictationManager.supported ? (
            <p className="form-helper">Dictation not supported on this device.</p>
          ) : null}
          <DictatedField
            id="chiefComplaint"
            name="chiefComplaint"
            label="Chief complaint"
            value={formState.chiefComplaint}
            onChange={handleChange}
            dictation={buildDictationControls("chiefComplaint")}
          />
          <DictatedField
            id="clinicalNotes"
            name="clinicalNotes"
            label="Clinical notes"
            type="textarea"
            rows={4}
            value={formState.clinicalNotes}
            onChange={handleChange}
            dictation={buildDictationControls("notes")}
          />
        </div>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <span className="tag">Assessment</span>
        <div style={{ marginTop: "1rem" }}>
          <DictatedField
            id="assessment"
            name="assessment"
            label="Assessment"
            type="textarea"
            rows={4}
            value={formState.assessment}
            onChange={handleChange}
            dictation={buildDictationControls("assessment")}
          />
        </div>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <span className="tag">Plan</span>
        <div style={{ marginTop: "1rem" }}>
          <DictatedField
            id="plan"
            name="plan"
            label="Plan"
            type="textarea"
            rows={4}
            value={formState.plan}
            onChange={handleChange}
            dictation={buildDictationControls("plan")}
          />
        </div>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <span className="tag">Diagnosis</span>
        <div style={{ marginTop: "1rem" }}>
          <DictatedField
            id="diagnosisCodes"
            name="diagnosisCodes"
            label="ICD-11 / diagnosis codes (optional)"
            value={formState.diagnosisCodes}
            onChange={handleChange}
            helperText={diagnosisHint}
            describedById="diagnosis-helper"
            dictation={buildDictationControls("diagnosisCodes")}
          />
        </div>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <span className="tag">Orders</span>
        <div style={{ marginTop: "1rem" }}>
          <div className="form-field">
            <label className="form-label" htmlFor="labRequestNeeded">
              <input
                id="labRequestNeeded"
                name="labRequestNeeded"
                type="checkbox"
                checked={formState.labRequestNeeded}
                onChange={handleChange}
              />
              Lab request needed
            </label>
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="prescriptionNeeded">
              <input
                id="prescriptionNeeded"
                name="prescriptionNeeded"
                type="checkbox"
                checked={formState.prescriptionNeeded}
                onChange={handleChange}
              />
              Prescription needed
            </label>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <span className="tag">Clinician</span>
        <div style={{ marginTop: "1rem" }}>
          <DictatedField
            id="clinicianId"
            name="clinicianId"
            label="Clinician (optional)"
            value={formState.clinicianId}
            onChange={handleChange}
            dictation={buildDictationControls("clinicianId")}
          />
        </div>
      </div>

      {error ? (
        <div role="alert" className="form-error" style={{ marginTop: "1rem" }}>
          {error}
        </div>
      ) : null}

      {dictationWarning ? (
        <p className="form-helper" style={{ marginTop: "0.75rem" }}>
          Dictated text needs confirmation before final sign-off. You can still save for now.
        </p>
      ) : null}

      <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
        <button className="button primary patient-cta" type="submit">
          Save encounter
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
  );
}
