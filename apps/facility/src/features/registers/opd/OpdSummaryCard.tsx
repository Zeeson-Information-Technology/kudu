"use client";

import type { OpdSummary } from "./summary";

const formatIsoDate = (value: string) => value.slice(0, 10);

type OpdSummaryCardProps = {
  summary: OpdSummary;
  onPrint: () => void;
  onExportSummary: () => void;
};

export default function OpdSummaryCard({
  summary,
  onPrint,
  onExportSummary
}: OpdSummaryCardProps) {
  return (
    <div className="card opd-summary print-header" aria-live="polite">
      <div className="opd-summary__header">
        <div>
          <span className="tag">OPD Summary</span>
          <h3>Kudu Health - OPD Register</h3>
          <p className="form-helper">
            {formatIsoDate(summary.rangeStart)} to {formatIsoDate(summary.rangeEnd)}
          </p>
        </div>
        <div className="actions-row no-print">
          <button className="button secondary table-action" type="button" onClick={onPrint}>
            Print
          </button>
          <button
            className="button secondary table-action"
            type="button"
            onClick={onExportSummary}
          >
            Export summary CSV
          </button>
        </div>
      </div>
      <div className="opd-summary__grid">
        <div>
          <p className="profile-label">Total encounters</p>
          <p className="profile-value">{summary.totalEncounters}</p>
        </div>
        <div>
          <p className="profile-label">Unique patients</p>
          <p className="profile-value">{summary.uniquePatients}</p>
        </div>
        <div>
          <p className="profile-label">Top diagnoses</p>
          {summary.topDiagnoses.length === 0 ? (
            <p className="profile-value">No codes captured</p>
          ) : (
            <ul className="opd-summary__list">
              {summary.topDiagnoses.map((item) => (
                <li key={item.code}>
                  {item.code} * {item.count}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="profile-label">Generated</p>
          <p className="profile-value">{new Date(summary.generatedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
