export type LabOrderStatus = "requested" | "resulted";

export type LabOrder = {
  _id: string;
  type: "labOrder";
  orderId: string;
  patientId: string;
  encounterId: string;
  facilityId?: string;
  tests: string[];
  notes?: string;
  status: LabOrderStatus;
  requestedAt: string;
  resultedAt?: string;
  result?: {
    summary: string;
    values?: Record<string, string>;
  };
};
