"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EncounterForm from "../../../../../../../src/features/encounters/EncounterForm";
import { getDb } from "../../../../../../../src/lib/offline/db";
import { createEncounterDocId } from "../../../../../../../src/lib/offline/schema";
import type { EncounterDoc } from "../../../../../../../src/lib/offline/schema";
import type { EncounterDraft } from "../../../../../../../src/lib/models/encounter";
import { getSession } from "../../../../../../../src/lib/session";

type EditEncounterPageProps = {
  params: {
    id: string;
    encounterId: string;
  };
};

const toDraft = (doc: EncounterDoc): EncounterDraft => ({
  encounterDateTime: doc.encounterDateTime,
  department: doc.department,
  temperatureC: doc.vitals?.temperatureC?.toString() ?? "",
  pulseBpm: doc.vitals?.pulseBpm?.toString() ?? "",
  respiratoryRate: doc.vitals?.respiratoryRate?.toString() ?? "",
  systolicBp: doc.vitals?.systolicBp?.toString() ?? "",
  diastolicBp: doc.vitals?.diastolicBp?.toString() ?? "",
  weightKg: doc.vitals?.weightKg?.toString() ?? "",
  heightCm: doc.vitals?.heightCm?.toString() ?? "",
  oxygenSaturationPct: doc.vitals?.oxygenSaturationPct?.toString() ?? "",
  chiefComplaint: doc.notes?.chiefComplaint ?? "",
  clinicalNotes: doc.notes?.clinicalNotes ?? "",
  assessment: doc.notes?.assessment ?? "",
  plan: doc.notes?.plan ?? "",
  diagnosisCodes: doc.diagnosisCodes?.join(", ") ?? "",
  labRequestNeeded: doc.flags.labRequestNeeded,
  prescriptionNeeded: doc.flags.prescriptionNeeded,
  clinicianId: doc.clinicianId ?? ""
});

export default function EditEncounterPage({ params }: EditEncounterPageProps) {
  const [draft, setDraft] = useState<EncounterDraft | null>(null);
  const [dictation, setDictation] = useState<EncounterDoc["dictation"]>();
  const [createdAt, setCreatedAt] = useState<string | undefined>(undefined);
  const [rev, setRev] = useState<string | undefined>(undefined);
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
        const doc = (await db.get(createEncounterDocId(params.encounterId))) as EncounterDoc & {
          _rev?: string;
        };
        if (doc.facilityId !== session.facilityId || doc.patientId !== params.id) {
          setError("Encounter not found for this patient.");
          return;
        }
        setDraft(toDraft(doc));
        setDictation(doc.dictation);
        setCreatedAt(doc.createdAt);
        setRev((doc as any)._rev);
      } catch (loadError) {
        setError("Unable to load encounter.");
      }
    };

    load();
  }, [params.encounterId, params.id]);

  if (!draft) {
    return (
      <main aria-labelledby="encounter-edit-title">
        <div className="card">
          <span className="tag">Encounter</span>
          <h2 id="encounter-edit-title">Edit encounter</h2>
          <p>{error || "Loading encounter..."}</p>
          <div style={{ marginTop: "1.5rem" }}>
            <Link href={`/dashboard/patients/${params.id}`} className="button secondary table-action">
              Back to patient
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main aria-labelledby="encounter-edit-title">
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
        <h2 id="encounter-edit-title">Edit encounter</h2>
        <p>Update clinical notes and vitals for this visit.</p>
      </div>
      <EncounterForm
        patientId={params.id}
        encounterId={params.encounterId}
        initialDraft={draft}
        initialDictation={dictation}
        initialCreatedAt={createdAt}
        initialRev={rev}
      />
    </main>
  );
}
