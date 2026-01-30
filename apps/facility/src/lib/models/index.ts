export type BaseModel = {
  id: string;
  facilityId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

export type Consent = BaseModel & {
  patientId: string;
  consentToCreateRecord: boolean;
  consentToShareWithinFacility: boolean;
  capturedAt: string;
  capturedBy: string;
  notes?: string;
};

export type Patient = BaseModel & {
  kuduReferenceId: string;
  firstName: string;
  lastName: string;
  sex: "female" | "male" | "intersex" | "prefer_not_to_say" | "unknown";
  dateOfBirth?: string;
  approxAge?: number;
  phone?: string;
  address?: string;
  consentIds: string[];
};

export type EncounterVitals = {
  recordedAt: string;
  heightCm?: number;
  weightKg?: number;
  systolicBp?: number;
  diastolicBp?: number;
  temperatureC?: number;
  pulseBpm?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
};

export type Encounter = BaseModel & {
  patientId: string;
  visitDate: string;
  vitals?: EncounterVitals;
  notes?: string;
  diagnosisCodes: string[];
};

export type AuditEvent = BaseModel & {
  actorId: string;
  action: string;
  entityType: "patient" | "consent" | "encounter" | "audit" | "other";
  entityId: string;
  summary?: string;
  metadata?: Record<string, string | number | boolean | null>;
};
