export type QueueStatus = "registered" | "waiting" | "in_consult" | "completed";
export type QueueRole = "clinician" | "lab" | "pharmacy";

export type QueueItem = {
  _id: string;
  type: "queueItem";
  queueId: string;
  patientId: string;
  patientRefId: string;
  facilityId?: string;
  createdAt: string;
  updatedAt: string;
  status: QueueStatus;
  assignedRole?: QueueRole;
  encounterId?: string;
  flags: {
    labPending?: boolean;
    pharmacyPending?: boolean;
  };
};
