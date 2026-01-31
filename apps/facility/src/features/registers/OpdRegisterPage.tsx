"use client";

import { useEffect, useMemo, useState } from "react";
import { getDb } from "../../lib/offline/db";
import type { EncounterDoc, PatientDoc } from "../../lib/offline/schema";
import OpdSummaryCard from "./opd/OpdSummaryCard";
import { buildOpdSummary } from "./opd/summary";
import { getSession } from "../../lib/session";
import { RoleGate } from "../../components/RoleGate";

const buildTodayRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return {
    start,
    end
  };
};

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

const parseDateInput = (value: string) => {
  const [year, month, day] = value.split("-").map((part) => Number.parseInt(part, 10));
  if (!year || !month || !day) {
    return null;
  }
  return new Date(year, month - 1, day);
};

const escapeCsv = (value: string | number | undefined | null) => {
  if (value === undefined || value === null) {
    return "";
  }
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

type RegisterRow = {
  encounterId: string;
  encounterDateTime: string;
  referenceId: string;
  patientId: string;
  patientName: string;
  ageSex: string;
  diagnosis: string;
};

export default function OpdRegisterPage() {
  const { start, end } = buildTodayRange();
  const [startDate, setStartDate] = useState(formatDateInput(start));
  const [endDate, setEndDate] = useState(formatDateInput(end));
  const [clinician, setClinician] = useState("");
  const [rows, setRows] = useState<RegisterRow[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const load = async () => {
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
        const [encountersResult, patientsResult] = await Promise.all([
          db.allDocs({ include_docs: true, startkey: "encounter:", endkey: "encounter:\uffff" }),
          db.allDocs({ include_docs: true, startkey: "patient:", endkey: "patient:\uffff" })
        ]);

        const patients = new Map<string, PatientDoc>();
        for (const row of patientsResult.rows) {
          const doc = row.doc as PatientDoc | undefined;
          if (doc && doc.type === "patient" && doc.facilityId === session.facilityId) {
            patients.set(doc.patientId, doc);
          }
        }

        const encounterRows: RegisterRow[] = [];
        for (const row of encountersResult.rows) {
          const doc = row.doc as EncounterDoc | undefined;
          if (!doc || doc.type !== "encounter" || doc.facilityId !== session.facilityId) {
            continue;
          }

          const occurredAt = doc.occurredAt ?? doc.encounterDateTime;
          if (!occurredAt) {
            continue;
          }

          const encounterDate = new Date(occurredAt);
          if (Number.isNaN(encounterDate.getTime())) {
            continue;
          }

          const patient = patients.get(doc.patientId);
          const patientName = patient
            ? `${patient.demographics.firstName} ${patient.demographics.lastName}`
            : "Unknown";
          const ageSex = patient
            ? [
                patient.demographics.approxAge ? `${patient.demographics.approxAge} yrs` : "",
                patient.demographics.sex
              ]
                .filter(Boolean)
                .join(" / ") || "Not captured"
            : "Not captured";

          encounterRows.push({
            encounterId: doc.encounterId,
            encounterDateTime: occurredAt,
            referenceId: patient?.referenceId ?? doc.patientId,
            patientId: doc.patientId,
            patientName,
            ageSex,
            diagnosis: doc.diagnosisCodes?.join(", ") ?? ""
          });
        }

        encounterRows.sort(
          (a, b) => new Date(b.encounterDateTime).getTime() - new Date(a.encounterDateTime).getTime()
        );

        setRows(encounterRows);
      } catch (error) {
        setLoadError("Unable to load OPD register from offline storage.");
      }
    };

    load();
  }, []);

  const filteredRows = useMemo(() => {
    const start = parseDateInput(startDate);
    const end = parseDateInput(endDate);
    const startTime = start ? start.getTime() : Number.NEGATIVE_INFINITY;
    const endTime = end
      ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999).getTime()
      : Number.POSITIVE_INFINITY;

    return rows.filter((row) => {
      const time = new Date(row.encounterDateTime).getTime();
      if (Number.isNaN(time)) {
        return false;
      }
      if (time < startTime || time > endTime) {
        return false;
      }
      if (clinician.trim() !== "") {
        return true;
      }
      return true;
    });
  }, [rows, startDate, endDate, clinician]);

  const summary = useMemo(() => {
    const start = parseDateInput(startDate);
    const end = parseDateInput(endDate);
    const rangeStart = start ? start.toISOString() : new Date().toISOString();
    const rangeEnd = end ? end.toISOString() : new Date().toISOString();

    const filteredSummaryRows = filteredRows.map((row) => ({
      patientId: row.patientId,
      diagnosis: row.diagnosis ? row.diagnosis.split(",").map((code) => code.trim()) : []
    }));

    return buildOpdSummary(filteredSummaryRows, rangeStart, rangeEnd);
  }, [filteredRows, startDate, endDate]);

  const handleExport = () => {
    const header = [
      "Date/Time",
      "Patient Ref ID",
      "Patient Name",
      "Age/Sex",
      "Diagnosis",
      "Encounter ID"
    ];

    const csvRows = filteredRows.map((row) => [
      escapeCsv(new Date(row.encounterDateTime).toLocaleString()),
      escapeCsv(row.referenceId),
      escapeCsv(row.patientName),
      escapeCsv(row.ageSex),
      escapeCsv(row.diagnosis),
      escapeCsv(row.encounterId)
    ]);

    const csvContent = [header.map(escapeCsv).join(","), ...csvRows.map((row) => row.join(","))].join(
      "\n"
    );

    const filename = `opd-register-${startDate}_to_${endDate}.csv`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleExportSummary = () => {
    const lines = [
      ["metric", "value"],
      ["Total encounters", summary.totalEncounters],
      ["Unique patients", summary.uniquePatients],
      ...summary.topDiagnoses.map((item) => [`Diagnosis - ${item.code}`, item.count]),
      ["generatedAt", summary.generatedAt],
      ["rangeStart", summary.rangeStart.slice(0, 10)],
      ["rangeEnd", summary.rangeEnd.slice(0, 10)]
    ];

    const csv = lines.map((line) => line.map(escapeCsv).join(",")).join("\n");
    const filename = `opd-summary-${startDate}_to_${endDate}.csv`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <RoleGate
      allowedRoles={["admin", "records", "nurse", "clinician"]}
      title="Register access required"
      message="Only clinical or records roles can access the OPD register."
    >
    <main aria-labelledby="opd-title">
      <div className="card">
        <span className="tag">Registers</span>
        <h2 id="opd-title">OPD register</h2>
        <p>Offline-first outpatient register for facility reporting.</p>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <OpdSummaryCard
          summary={summary}
          onPrint={() => window.print()}
          onExportSummary={handleExportSummary}
        />
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div className="register-filters">
          <div className="form-field">
            <label className="form-label" htmlFor="startDate">
              Start date
            </label>
            <input
              className="form-input"
              id="startDate"
              name="startDate"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="endDate">
              End date
            </label>
            <input
              className="form-input"
              id="endDate"
              name="endDate"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="clinician">
              Clinician (optional)
            </label>
            <input
              className="form-input"
              id="clinician"
              name="clinician"
              type="text"
              value={clinician}
              onChange={(event) => setClinician(event.target.value)}
              placeholder="Filter later"
            />
          </div>
          <button className="button secondary table-action" type="button" onClick={handleExport}>
            Export CSV
          </button>
        </div>

        <div className="registry-shell" style={{ marginTop: "1.5rem" }}>
          <table className="registry-table">
            <thead>
              <tr>
                <th scope="col">Date/Time</th>
                <th scope="col">Patient Ref ID</th>
                <th scope="col">Patient Name</th>
                <th scope="col">Age/Sex</th>
                <th scope="col">Diagnosis</th>
                <th scope="col">Encounter ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <h3>No encounters for this date range.</h3>
                      <p>Complete a visit to populate the OPD register.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.encounterId}>
                    <td>{new Date(row.encounterDateTime).toLocaleString()}</td>
                    <td>{row.referenceId}</td>
                    <td>{row.patientName}</td>
                    <td>{row.ageSex}</td>
                    <td>{row.diagnosis || "Not captured"}</td>
                    <td>{row.encounterId}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {loadError ? (
          <p className="form-helper" role="status" style={{ marginTop: "1rem" }}>
            {loadError}
          </p>
        ) : null}
      </div>
    </main>
    </RoleGate>
  );
}
