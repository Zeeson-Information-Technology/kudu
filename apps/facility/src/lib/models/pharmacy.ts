export type PrescriptionStatus = "prescribed" | "dispensed";

export type PrescriptionItem = {
  name: string;
  unitLabel?: string;
  unitPriceNgn?: number;
  dose?: string;
  frequency?: string;
  duration?: string;
  quantity?: string;
};

export type Prescription = {
  _id: string;
  type: "prescription";
  prescriptionId: string;
  patientId: string;
  encounterId: string;
  facilityId?: string;
  items: PrescriptionItem[];
  notes?: string;
  status: PrescriptionStatus;
  prescribedAt: string;
  dispensedAt?: string;
  dispenseNote?: string;
};
