"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Modal from "../../components/Modal";
import PatientRegistrationForm from "./PatientRegistrationForm";
import { getDb } from "../../lib/offline/db";
import type { PatientDoc } from "../../lib/offline/schema";
import { getSession } from "../../lib/session";

export default function PatientsPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const newButtonRef = useRef<HTMLButtonElement>(null);
  const [patients, setPatients] = useState<PatientDoc[]>([]);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");

  const isOpen = searchParams.get("new") === "1";

  const formatAge = (patient: PatientDoc) => {
    if (patient.demographics.dateOfBirth) {
      const dob = new Date(patient.demographics.dateOfBirth);
      if (!Number.isNaN(dob.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age -= 1;
        }
        return `${Math.max(age, 0)} yrs`;
      }
    }

    if (patient.demographics.approxAge !== undefined) {
      return `${patient.demographics.approxAge} yrs`;
    }

    return "Not captured";
  };

  const openModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("new", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("new");
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname);
  };

  useEffect(() => {
    const loadPatients = async () => {
      const db = await getDb();
      if (!db) {
        return;
      }

      const session = getSession();
      if (!session) {
        setLoadError("Facility session is required.");
        return;
      }

      try {
        const result = await db.allDocs({
          include_docs: true,
          startkey: "patient:",
          endkey: "patient:\uffff"
        });
        const docs = result.rows
          .map((row) => row.doc as PatientDoc | undefined)
          .filter(
            (doc): doc is PatientDoc =>
              !!doc && doc.type === "patient" && doc.facilityId === session.facilityId
          );
        docs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        setPatients(docs);
      } catch (error) {
        setLoadError("Unable to load patient records from offline storage.");
      }
    };

    loadPatients();
  }, [isOpen]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredPatients = normalizedQuery
    ? patients.filter((patient) => {
        const name = `${patient.demographics.firstName} ${patient.demographics.lastName}`.toLowerCase();
        const referenceId = patient.referenceId.toLowerCase();
        const phone = (patient.demographics.phone ?? "").replace(/\s+/g, "").toLowerCase();
        const queryPhone = normalizedQuery.replace(/\s+/g, "");
        return (
          name.includes(normalizedQuery) ||
          referenceId.includes(normalizedQuery) ||
          (phone && phone.includes(queryPhone))
        );
      })
    : patients;

  return (
    <main aria-labelledby="patients-title">
      <div className="card patients-card">
        <div className="patients-header">
          <div>
            <span className="tag">Patients</span>
            <h2 id="patients-title">Patient registry</h2>
          </div>
          <div className="patients-actions">
            <label className="form-field patients-search" htmlFor="patient-search">
              <span className="sr-only">Search patients</span>
              <input
                className="form-input"
                id="patient-search"
                name="patient-search"
                type="search"
                placeholder="Search by name, reference ID, or phone"
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <button
              ref={newButtonRef}
              type="button"
              className="button primary"
              onClick={openModal}
              aria-haspopup="dialog"
            >
              New patient
            </button>
          </div>
        </div>
        <div className="registry-shell">
          <table className="registry-table">
            <thead>
              <tr>
                <th scope="col">Reference ID</th>
                <th scope="col">Name</th>
                <th scope="col">Sex</th>
                <th scope="col">DOB / Age</th>
                <th scope="col">Last updated</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <h3>{normalizedQuery ? "No matches found." : "No patients saved on this device yet."}</h3>
                      <p>
                        {normalizedQuery
                          ? "Try a different name, reference ID, or phone number."
                          : "Register a patient to create a local record that stays available offline."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient._id}>
                    <td>{patient.referenceId}</td>
                    <td>
                      {patient.demographics.firstName} {patient.demographics.lastName}
                    </td>
                    <td>{patient.demographics.sex}</td>
                    <td>{formatAge(patient)}</td>
                    <td>{new Date(patient.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => router.push(`/dashboard/patients/${patient.patientId}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {loadError ? (
            <div className="form-helper" role="status" style={{ padding: "0 1rem 1rem" }}>
              {loadError}
            </div>
          ) : null}
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        title="Register patient"
        onClose={closeModal}
        returnFocusRef={newButtonRef}
        size="wide"
      >
        <PatientRegistrationForm />
      </Modal>
    </main>
  );
}
