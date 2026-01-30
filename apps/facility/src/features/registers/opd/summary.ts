export type OpdSummary = {
  totalEncounters: number;
  uniquePatients: number;
  topDiagnoses: { code: string; count: number }[];
  rangeStart: string;
  rangeEnd: string;
  generatedAt: string;
};

type SummaryRow = {
  patientId: string;
  diagnosis: string[];
};

export const buildOpdSummary = (
  rows: SummaryRow[],
  rangeStart: string,
  rangeEnd: string
): OpdSummary => {
  const diagnosisCounts = new Map<string, number>();
  const patientIds = new Set<string>();

  rows.forEach((row) => {
    patientIds.add(row.patientId);
    row.diagnosis.forEach((code) => {
      const clean = code.trim();
      if (!clean) {
        return;
      }
      diagnosisCounts.set(clean, (diagnosisCounts.get(clean) ?? 0) + 1);
    });
  });

  const topDiagnoses = Array.from(diagnosisCounts.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalEncounters: rows.length,
    uniquePatients: patientIds.size,
    topDiagnoses,
    rangeStart,
    rangeEnd,
    generatedAt: new Date().toISOString()
  };
};
