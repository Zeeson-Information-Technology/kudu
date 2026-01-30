import type { Encounter } from "../models/encounter";
import type { Facility } from "../models/facility";
import type { LabOrder } from "../models/lab";
import type { LocalUser } from "../models/user";
import type { Prescription } from "../models/pharmacy";
import type { Patient } from "../models/patient";
import type { QueueItem } from "../models/queue";
import type { AuditEvent } from "../models/audit";
import type { Drug } from "../models/drug";

export type PatientDoc = {
  _id: string;
  type: "patient";
  patientId: string;
  referenceId: string;
  facilityId?: string;
  demographics: Pick<Patient, "firstName" | "lastName" | "sex" | "dateOfBirth" | "approxAge" | "phone" | "address" | "facilityNote">;
  consent: {
    consentToCreateRecord: boolean;
    consentToShareWithinFacility: boolean;
  };
  createdAt: string;
  updatedAt: string;
};

export type EncounterDoc = {
  _id: string;
  type: "encounter";
  encounterId: string;
  patientId: string;
  facilityId?: string;
  encounterDateTime: string;
  occurredAt?: string;
  department: Encounter["department"];
  vitals: Encounter["vitals"];
  notes: {
    chiefComplaint?: string;
    clinicalNotes?: string;
    assessment?: string;
    plan?: string;
  };
  dictation?: Encounter["dictation"];
  diagnosisCodes: string[];
  flags: {
    labRequestNeeded: boolean;
    prescriptionNeeded: boolean;
  };
  clinicianId?: string;
  createdAt: string;
  updatedAt: string;
};

export type LabOrderDoc = {
  _id: string;
  type: "labOrder";
  orderId: string;
  patientId: string;
  encounterId: string;
  facilityId?: string;
  tests: string[];
  notes?: string;
  status: LabOrder["status"];
  requestedAt: string;
  resultedAt?: string;
  result?: LabOrder["result"];
};

export type PrescriptionDoc = {
  _id: string;
  type: "prescription";
  prescriptionId: string;
  patientId: string;
  encounterId: string;
  facilityId?: string;
  items: Prescription["items"];
  notes?: string;
  status: Prescription["status"];
  prescribedAt: string;
  dispensedAt?: string;
  dispenseNote?: string;
};

export type QueueItemDoc = {
  _id: string;
  type: "queueItem";
  queueId: string;
  patientId: string;
  patientRefId: string;
  facilityId?: string;
  createdAt: string;
  updatedAt: string;
  status: QueueItem["status"];
  assignedRole?: QueueItem["assignedRole"];
  encounterId?: string;
  flags: QueueItem["flags"];
};

export type FacilityDoc = Facility;

export type LocalUserDoc = LocalUser;

export type AuditEventDoc = AuditEvent;
export type DrugDoc = Drug;

export const createPatientDocId = (patientId: string) => `patient:${patientId}`;
export const createEncounterDocId = (encounterId: string) => `encounter:${encounterId}`;
export const createLabOrderDocId = (orderId: string) => `labOrder:${orderId}`;
export const createPrescriptionDocId = (prescriptionId: string) =>
  `prescription:${prescriptionId}`;
export const createQueueDocId = (queueId: string) => `queue:${queueId}`;
export const createFacilityDocId = (facilityId: string) => `facility:${facilityId}`;
export const createLocalUserDocId = (userId: string) => `localUser:${userId}`;
export const createAuditDocId = (auditId: string) => `audit:${auditId}`;
export const createDrugDocId = (drugId: string) => `drug:${drugId}`;
