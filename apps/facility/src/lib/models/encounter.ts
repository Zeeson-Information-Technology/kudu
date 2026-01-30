export type EncounterDepartment = "OPD" | "ANC" | "Immunization" | "General";

export type EncounterVitals = {
  temperatureC?: number;
  pulseBpm?: number;
  respiratoryRate?: number;
  systolicBp?: number;
  diastolicBp?: number;
  weightKg?: number;
  heightCm?: number;
  oxygenSaturationPct?: number;
};

export type Encounter = {
  id: string;
  patientId: string;
  facilityId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  encounterDateTime: string;
  occurredAt?: string;
  department: EncounterDepartment;
  vitals?: EncounterVitals;
  chiefComplaint?: string;
  clinicalNotes?: string;
  assessment?: string;
  plan?: string;
  diagnosisCodes: string[];
  clinicianId?: string;
  labRequestNeeded: boolean;
  prescriptionNeeded: boolean;
  dictation?: {
    chiefComplaint?: {
      raw?: string;
      edited?: string;
      engine?: string;
      startedAt?: string;
      endedAt?: string;
      confirmedAt?: string;
      requiresReview: boolean;
    };
    notes?: {
      raw?: string;
      edited?: string;
      engine?: string;
      startedAt?: string;
      endedAt?: string;
      confirmedAt?: string;
      requiresReview: boolean;
    };
    assessment?: {
      raw?: string;
      edited?: string;
      engine?: string;
      startedAt?: string;
      endedAt?: string;
      confirmedAt?: string;
      requiresReview: boolean;
    };
    plan?: {
      raw?: string;
      edited?: string;
      engine?: string;
      startedAt?: string;
      endedAt?: string;
      confirmedAt?: string;
      requiresReview: boolean;
    };
    diagnosisCodes?: {
      raw?: string;
      edited?: string;
      engine?: string;
      startedAt?: string;
      endedAt?: string;
      confirmedAt?: string;
      requiresReview: boolean;
    };
    clinicianId?: {
      raw?: string;
      edited?: string;
      engine?: string;
      startedAt?: string;
      endedAt?: string;
      confirmedAt?: string;
      requiresReview: boolean;
    };
  };
};

export type EncounterDraft = {
  encounterDateTime: string;
  department: EncounterDepartment;
  temperatureC: string;
  pulseBpm: string;
  respiratoryRate: string;
  systolicBp: string;
  diastolicBp: string;
  weightKg: string;
  heightCm: string;
  oxygenSaturationPct: string;
  chiefComplaint: string;
  clinicalNotes: string;
  assessment: string;
  plan: string;
  diagnosisCodes: string;
  labRequestNeeded: boolean;
  prescriptionNeeded: boolean;
  clinicianId: string;
};
