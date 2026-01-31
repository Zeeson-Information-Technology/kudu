"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getDb } from "../../../../src/lib/offline/db";
import Toast from "../../../../src/components/Toast";
import type {
  AuditEventDoc,
  EncounterDoc,
  LabOrderDoc,
  PatientDoc,
  PrescriptionDoc
} from "../../../../src/lib/offline/schema";
import { createPatientDocId } from "../../../../src/lib/offline/schema";
import { getSession } from "../../../../src/lib/session";

type PatientSnapshot = {
  id: string;
  firstName: string;
  lastName: string;
  sex: string;
  dateOfBirth?: string;
  approxAge?: string;
  consentToCreateRecord?: boolean;
  consentToShareWithinFacility?: boolean;
};

type EncounterSnapshot = {
  id: string;
  encounterDateTime: string;
  department: string;
  chiefComplaint?: string;
  prescriptionCount: number;
  labOrderCount: number;
  needsReview: boolean;
};

export default function PatientProfilePage({
  params
}: {
  params: { id: string };
}) {
  const [patient, setPatient] = useState<PatientSnapshot | null>(null);
  const [encounters, setEncounters] = useState<EncounterSnapshot[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrderDoc[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionDoc[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEventDoc[]>([]);
  const [loadError, setLoadError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastShownRef = useRef(false);
  const searchParams = useSearchParams();
  const showEncounterNotice = searchParams.get("encounter") === "created";
  const showRegistrationNotice = searchParams.get("registered") === "1";

  useEffect(() => {
    const loadPatient = async () => {
      const db = await getDb();
      if (!db) {
        setLoadError("Offline database is not available in this environment.");
        return;
      }

      const session = getSession();
      if (!session) {
        setLoadError("Facility session is required.");
        return;
      }

      try {
        const doc = (await db.get(createPatientDocId(params.id))) as PatientDoc;
        if (doc.facilityId !== session.facilityId) {
          setLoadError("Patient not found on this device.");
          return;
        }
        setPatient({
          id: doc.patientId,
          firstName: doc.demographics.firstName,
          lastName: doc.demographics.lastName,
          sex: doc.demographics.sex,
          dateOfBirth: doc.demographics.dateOfBirth,
          approxAge: doc.demographics.approxAge
            ? String(doc.demographics.approxAge)
            : undefined,
          consentToCreateRecord: doc.consent.consentToCreateRecord,
          consentToShareWithinFacility: doc.consent.consentToShareWithinFacility
        });
      } catch (error: any) {
        if (error?.status === 404) {
          setLoadError("Patient not found on this device.");
        } else {
          setLoadError("Unable to load patient profile from offline storage.");
        }
      }
    };

    loadPatient();
  }, [params.id]);

  useEffect(() => {
    const loadLabOrders = async () => {
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
          startkey: "labOrder:",
          endkey: "labOrder:\uffff"
        });
        const docs = result.rows
          .map((row) => row.doc as LabOrderDoc | undefined)
          .filter(
            (doc): doc is LabOrderDoc =>
              !!doc &&
              doc.type === "labOrder" &&
              doc.patientId === params.id &&
              doc.facilityId === session.facilityId
          );
        setLabOrders(docs);
      } catch (error) {
        setLabOrders([]);
      }
    };

    loadLabOrders();
  }, [params.id]);

  useEffect(() => {
    const loadPrescriptions = async () => {
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
          startkey: "prescription:",
          endkey: "prescription:\uffff"
        });
        const docs = result.rows
          .map((row) => row.doc as PrescriptionDoc | undefined)
          .filter(
            (doc): doc is PrescriptionDoc =>
              !!doc &&
              doc.type === "prescription" &&
              doc.patientId === params.id &&
              doc.facilityId === session.facilityId
          );
        setPrescriptions(docs);
      } catch (error) {
        setPrescriptions([]);
      }
    };

    loadPrescriptions();
  }, [params.id]);

  useEffect(() => {
    const loadEncounters = async () => {
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
          startkey: "encounter:",
          endkey: "encounter:\uffff"
        });
        const docs = result.rows
          .map((row) => row.doc as EncounterDoc | undefined)
          .filter(
            (doc): doc is EncounterDoc =>
              !!doc &&
              doc.type === "encounter" &&
              doc.patientId === params.id &&
              doc.facilityId === session.facilityId
          );
        docs.sort((a, b) => b.encounterDateTime.localeCompare(a.encounterDateTime));
        setEncounters(
          docs.map((doc) => ({
            id: doc.encounterId,
            encounterDateTime: doc.encounterDateTime,
            department: doc.department,
            chiefComplaint: doc.notes?.chiefComplaint,
            prescriptionCount: prescriptions.filter((rx) => rx.encounterId === doc.encounterId)
              .length,
            labOrderCount: labOrders.filter((order) => order.encounterId === doc.encounterId)
              .length,
            needsReview:
              doc.dictation?.notes?.requiresReview ||
              doc.dictation?.assessment?.requiresReview ||
              doc.dictation?.plan?.requiresReview ||
              false
          }))
        );
      } catch (error) {
        setEncounters([]);
      }
    };

    loadEncounters();
  }, [params.id, prescriptions, labOrders]);

  useEffect(() => {
    if (toastShownRef.current) {
      return;
    }
    if (showRegistrationNotice) {
      setToastMessage("Patient registered successfully.");
      toastShownRef.current = true;
    } else if (showEncounterNotice) {
      setToastMessage("Encounter saved for this patient.");
      toastShownRef.current = true;
    }
  }, [showRegistrationNotice, showEncounterNotice]);

  useEffect(() => {
    const loadAuditEvents = async () => {
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
          startkey: "audit:",
          endkey: "audit:\uffff"
        });
        const docs = result.rows
          .map((row) => row.doc as AuditEventDoc | undefined)
          .filter(
            (doc): doc is AuditEventDoc =>
              !!doc &&
              doc.type === "audit" &&
              doc.facilityId === session.facilityId &&
              (doc.entityId === params.id || doc.metadata?.patientId === params.id)
          )
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setAuditEvents(docs);
      } catch (error) {
        setAuditEvents([]);
      }
    };

    loadAuditEvents();
  }, [params.id]);

  const encounterRows = useMemo(() => {
    if (encounters.length === 0) {
      return (
        <div className="empty-state">
          <h3>No encounters yet.</h3>
          <p>Start a visit to capture vitals and clinical notes.</p>
        </div>
      );
    }

    return (
      <ul className="timeline-list">
        {encounters.map((encounter) => (
          <li key={encounter.id} className="timeline-item">
            <div>
              <p className="profile-value">
                {new Date(encounter.encounterDateTime).toLocaleString()}
              </p>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <p className="form-helper">{encounter.department}</p>
                {encounter.needsReview ? (
                  <span className="status-badge status-badge--needs-review">
                    Needs review
                  </span>
                ) : null}
              </div>
            </div>
            <div>
              <p className="profile-value">
                {encounter.chiefComplaint || "No chief complaint recorded"}
              </p>
              <div className="actions-row">
                <Link
                  href={`/dashboard/patients/${params.id}/encounters/${encounter.id}/lab/new`}
                  className="button secondary table-action"
                >
                  Create lab order
                </Link>
                <Link
                  href={`/dashboard/patients/${params.id}/encounters/${encounter.id}/pharmacy/new`}
                  className="button secondary table-action"
                >
                  Create prescription
                </Link>
                <Link
                  href={`/dashboard/patients/${params.id}/encounters/${encounter.id}`}
                  className="button secondary table-action"
                >
                  View
                </Link>
              </div>
              <p className="form-helper">
                Lab orders: {encounter.labOrderCount} | Prescriptions: {encounter.prescriptionCount}
              </p>
            </div>
          </li>
        ))}
      </ul>
    );
  }, [encounters]);

  const displayName = patient ? `${patient.firstName} ${patient.lastName}` : "Unknown patient";
  const displayDob = patient?.dateOfBirth || patient?.approxAge || "Not captured";
  const auditRows = auditEvents.length ? (
    <ul className="timeline-list">
      {auditEvents.map((event) => (
        <li key={event.auditId} className="timeline-item">
          <div>
            <p className="profile-value">{new Date(event.createdAt).toLocaleString()}</p>
            <p className="form-helper">{event.actorName || "System"}</p>
          </div>
          <div>
            <p className="profile-value">{event.summary || event.action}</p>
            <p className="form-helper">{event.entityType}</p>
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <div className="empty-state">
      <h3>No recent activity yet.</h3>
      <p>Audit activity appears here when encounters are saved for this patient.</p>
    </div>
  );

  if (!patient && loadError) {
    return (
      <main aria-labelledby="patient-title">
        <div className="card">
          <span className="tag">Patient Profile</span>
          <h2 id="patient-title">Patient not found</h2>
          <p>{loadError}</p>
          <div style={{ marginTop: "1.5rem" }}>
            <Link href="/dashboard/patients" className="button secondary table-action">
              <span className="icon" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="16" height="16" role="presentation">
                  <path d="M9.5 3.5 5 8l4.5 4.5" />
                </svg>
              </span>
              Back to patients
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main aria-labelledby="patient-title">
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
        <div className="actions-row" style={{ justifyContent: "space-between", alignItems: "start" }}>
          <div>
            <span className="tag">Patient Profile</span>
            <h2 id="patient-title" style={{ marginTop: "0.5rem" }}>
              {displayName}
            </h2>
          </div>
          <Link href="/dashboard/patients" className="button secondary table-action">
            <span className="icon" aria-hidden="true">
              <svg viewBox="0 0 16 16" width="16" height="16" role="presentation">
                <path d="M9.5 3.5 5 8l4.5 4.5" />
              </svg>
            </span>
            Back to patients
          </Link>
        </div>
        <Toast
          message={toastMessage}
          tone="success"
          durationMs={4000}
          onClose={() => setToastMessage(null)}
        />
        <div className="profile-grid">
          <div>
            <p className="profile-label">Reference ID</p>
            <p className="profile-value">{params.id}</p>
          </div>
          <div>
            <p className="profile-label">Sex</p>
            <p className="profile-value">{patient?.sex ?? "Not captured"}</p>
          </div>
          <div>
            <p className="profile-label">DOB / Age</p>
            <p className="profile-value">{displayDob}</p>
          </div>
          <div>
            <p className="profile-label">Consent</p>
            <p className="profile-value">
              Create record: {patient?.consentToCreateRecord ? "Yes" : "No"}
            </p>
            <p className="profile-value">
              Share within facility: {patient?.consentToShareWithinFacility ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div className="actions-row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Encounters</h3>
          <Link
            href={`/dashboard/patients/${params.id}/encounters/new`}
            className="button primary patient-cta"
          >
            Start new encounter
          </Link>
        </div>
        {encounterRows}
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <h3>Activity</h3>
        {auditRows}
      </div>
    </main>
  );
}
