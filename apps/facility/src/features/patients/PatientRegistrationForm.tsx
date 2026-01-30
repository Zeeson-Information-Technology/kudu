"use client";

import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import PrintCopyActions from "../../components/PrintCopyActions";
import Modal from "../../components/Modal";
import { createKuduReferenceId, createQueueId } from "../../lib/id";
import { getDb } from "../../lib/offline/db";
import { createPatientDocId, createQueueDocId } from "../../lib/offline/schema";
import type { PatientRegistrationDraft } from "../../lib/models/patient";
import { getSession } from "../../lib/session";

const emptyDraft: PatientRegistrationDraft = {
  firstName: "",
  lastName: "",
  sex: "",
  dateOfBirth: "",
  approxAge: "",
  phone: "",
  address: "",
  facilityNote: "",
  consentToCreateRecord: false,
  consentToShareWithinFacility: false
};

export default function PatientRegistrationForm() {
  const [formState, setFormState] = useState<PatientRegistrationDraft>(emptyDraft);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [consentError, setConsentError] = useState("");
  const [error, setError] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState("");
  const termsCheckboxRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    const nextValue = type === "checkbox" ? (event.target as HTMLInputElement).checked : value;

    setFormState((prev) => ({
      ...prev,
      [name]: nextValue
    }));
  };

  const handleDateOfBirthChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    let derivedAge = "";
    if (value) {
      const dob = new Date(value);
      if (!Number.isNaN(dob.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age -= 1;
        }
        derivedAge = Math.max(age, 0).toString();
      }
    }

    setFormState((prev) => ({
      ...prev,
      dateOfBirth: value,
      approxAge: derivedAge
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitRegistration();
  };

  const submitRegistration = async () => {
    setError("");
    setConsentError("");

    if (!formState.consentToCreateRecord || !formState.consentToShareWithinFacility) {
      setConsentError("Both consent items are required to proceed.");
      return;
    }

    if (!formState.dateOfBirth && !formState.approxAge) {
      setError("Provide a date of birth or an approximate age.");
      return;
    }

    if (!termsAccepted) {
      setShowTerms(true);
      return;
    }

    const session = getSession();
    if (!session) {
      setError("Facility session is required before registering patients.");
      return;
    }

    const reference = createKuduReferenceId();
    const patientId = reference;
    const now = new Date().toISOString();
    const db = await getDb();

    if (!db) {
      setError("Offline database is not available in this environment.");
      return;
    }

    const docId = createPatientDocId(patientId);
    const doc = {
      _id: docId,
      type: "patient",
      patientId,
      referenceId: reference,
      facilityId: session.facilityId,
      demographics: {
        firstName: formState.firstName,
        lastName: formState.lastName,
        sex: formState.sex,
        dateOfBirth: formState.dateOfBirth || undefined,
        approxAge: formState.approxAge ? Number.parseInt(formState.approxAge, 10) : undefined,
        phone: formState.phone || undefined,
        address: formState.address || undefined,
        facilityNote: formState.facilityNote || undefined
      },
      consent: {
        consentToCreateRecord: formState.consentToCreateRecord,
        consentToShareWithinFacility: formState.consentToShareWithinFacility
      },
      createdAt: now,
      updatedAt: now
    };

    try {
      const existing = await db.get(docId);
      await db.put({ ...existing, ...doc, _rev: existing._rev });
    } catch (dbError: any) {
      if (dbError?.status === 404) {
        await db.put(doc);
      } else {
        setError("Unable to save patient record to offline storage.");
        return;
      }
    }

    const queueDocId = createQueueDocId(patientId);
    const queueItem = {
      _id: queueDocId,
      type: "queueItem",
      queueId: createQueueId(),
      patientId,
      patientRefId: reference,
      facilityId: session.facilityId,
      createdAt: now,
      updatedAt: now,
      status: "registered",
      flags: {}
    };

    try {
      const existingQueue = await db.get(queueDocId);
      await db.put({ ...existingQueue, ...queueItem, _rev: existingQueue._rev });
    } catch (queueError: any) {
      if (queueError?.status === 404) {
        await db.put(queueItem);
      }
    }

    setReferenceId(reference);
    setHasSubmitted(true);
  };

  const handleReset = () => {
    setFormState(emptyDraft);
    setReferenceId("");
    setHasSubmitted(false);
    setConsentError("");
    setError("");
    setTermsAccepted(false);
  };

  const qrPayload = useMemo(
    () => (referenceId ? `kudu:patient:${referenceId}` : ""),
    [referenceId]
  );

  return (
    <div className="patient-registration">
      {hasSubmitted ? (
        <div aria-live="polite" className="print-area">
          <h3>Registration complete</h3>
          <p>Share this reference ID with the patient and record it on printed materials.</p>
          <div style={{ marginTop: "1rem" }}>
            <strong>Reference ID:</strong> {referenceId}
          </div>
          <div className="registration-success">
            <div>
              <QRCodeCanvas value={qrPayload} size={160} includeMargin />
              <div className="form-helper">Kudu reference QR</div>
            </div>
            <div>
              <h4>Next steps</h4>
              <ul>
                <li>Confirm consent capture with the patient.</li>
                <li>Queue clinical intake in the encounter workflow.</li>
                <li>Provide printed or SMS receipt (later phase).</li>
              </ul>
            </div>
          </div>
          <div style={{ marginTop: "1.5rem" }}>
            <PrintCopyActions value={referenceId} />
          </div>
          <div className="actions-row" style={{ marginTop: "1.5rem" }}>
            <Link
              href={`/dashboard/patients/${referenceId}?registered=1`}
              className="button primary no-print"
            >
              Open patient profile
            </Link>
            <button className="button secondary no-print" type="button" onClick={handleReset}>
              Register another patient
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} aria-describedby="consent-note">
          <div className="grid-2">
            <div className="form-field">
              <label className="form-label" htmlFor="firstName">
                First name
              </label>
              <input
                className="form-input"
                id="firstName"
                name="firstName"
                type="text"
                value={formState.firstName}
                onChange={handleChange}
                autoComplete="given-name"
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="lastName">
                Last name
              </label>
              <input
                className="form-input"
                id="lastName"
                name="lastName"
                type="text"
                value={formState.lastName}
                onChange={handleChange}
                autoComplete="family-name"
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="sex">
                Sex
              </label>
              <select
                className="form-select"
                id="sex"
                name="sex"
                value={formState.sex}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="dateOfBirth">
                Date of birth
              </label>
              <input
                className="form-input"
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formState.dateOfBirth}
                onChange={handleDateOfBirthChange}
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="approxAge">
                Approximate age
              </label>
              <input
                className="form-input"
                id="approxAge"
                name="approxAge"
                type="number"
                min={0}
                max={120}
                value={formState.approxAge}
                onChange={handleChange}
                readOnly={Boolean(formState.dateOfBirth)}
              />
              <div className="form-helper">
                Provide DOB or approximate age. DOB auto-calculates age.
              </div>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="phone">
                Phone (optional)
              </label>
              <div className="phone-input">
                <select
                  className="form-select"
                  id="phoneCountry"
                  name="phoneCountry"
                  value="+234"
                  aria-label="Country code"
                  disabled
                >
                  <option value="+234">+234 NG</option>
                </select>
                <input
                  className="form-input"
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formState.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  placeholder="8012345678"
                  required
                />
              </div>
              <div className="form-helper">
                Use a reachable phone number to enable quick search at return visits.
              </div>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="address">
                Address (optional)
              </label>
              <input
                className="form-input"
                id="address"
                name="address"
                type="text"
                value={formState.address}
                onChange={handleChange}
                autoComplete="street-address"
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="facilityNote">
                Facility note (optional)
              </label>
              <input
                className="form-input"
                id="facilityNote"
                name="facilityNote"
                type="text"
                value={formState.facilityNote}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
              <legend className="form-label">Consent</legend>
              <div className="consent-card">
                <div className="form-field">
                  <label className="form-label" htmlFor="consentToCreateRecord">
                    <input
                      id="consentToCreateRecord"
                      name="consentToCreateRecord"
                      type="checkbox"
                      checked={formState.consentToCreateRecord}
                      onChange={handleChange}
                    />
                    Consent to create record
                  </label>
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="consentToShareWithinFacility">
                    <input
                      id="consentToShareWithinFacility"
                      name="consentToShareWithinFacility"
                      type="checkbox"
                      checked={formState.consentToShareWithinFacility}
                      onChange={handleChange}
                    />
                    Consent to share within facility
                  </label>
                </div>
                {consentError ? (
                  <div className="form-error" role="alert">
                    {consentError}
                  </div>
                ) : null}
              </div>
              <p className="form-helper" id="consent-note">
                Care is not denied if national ID is unavailable.
              </p>
            </fieldset>
          </div>

          {error ? (
            <div role="alert" className="form-error" style={{ marginTop: "1rem" }}>
              {error}
            </div>
          ) : null}

          <div style={{ marginTop: "1.5rem" }}>
            <button className="button primary" type="submit" ref={submitButtonRef}>
              Create record
            </button>
          </div>
        </form>
      )}
      <Modal
        isOpen={showTerms}
        title="Terms of registration"
        onClose={() => {
          setShowTerms(false);
          setTermsError("");
        }}
        initialFocusRef={termsCheckboxRef}
        returnFocusRef={submitButtonRef}
        maxWidth="520px"
      >
        <div className="terms-modal">
          <div className="terms-modal__note" role="status">
            Please read this to the patient. If the patient is under 18, read to their parent or
            guardian.
          </div>
          <p className="terms-modal__body">
            We collect patient information to provide care and run facility services in line with
            Nigeria&apos;s National Health Insurance Authority (NHIA) guidelines and the Nigeria Data
            Protection Regulation (NDPR).
          </p>
          <p className="terms-modal__body">
            Data is stored securely on this device and may be synced to approved servers when
            connectivity is available to support care continuity, reporting, and auditability.
          </p>
          <div
            className={`form-field terms-modal__confirm${
              termsError ? " terms-modal__confirm--error" : ""
            }`}
          >
            <label className="form-label" htmlFor="termsAccepted">
              <input
                id="termsAccepted"
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => {
                  setTermsAccepted(event.target.checked);
                  setTermsError("");
                }}
                ref={termsCheckboxRef}
                aria-invalid={Boolean(termsError)}
              />
              I confirm the patient (or guardian) agrees to this use.
            </label>
            {termsError ? (
              <div className="form-error" role="alert">
                {termsError}
              </div>
            ) : null}
          </div>
          <div className="actions-row terms-modal__actions">
            <button
              className="button secondary"
              type="button"
              onClick={() => {
                setShowTerms(false);
                setTermsError("");
              }}
            >
              Cancel
            </button>
            <button
              className="button primary"
              type="button"
              onClick={() => {
                if (!termsAccepted) {
                  setTermsError("Please confirm consent before continuing.");
                  termsCheckboxRef.current?.focus();
                  return;
                }
                setShowTerms(false);
                submitRegistration();
              }}
            >
              Accept &amp; Continue
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
