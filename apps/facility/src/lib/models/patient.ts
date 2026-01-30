export type PatientSex = "male" | "female" | "other" | "prefer_not_to_say";

export type Patient = {
  id: string;
  facilityId: string;
  kuduReferenceId: string;
  firstName: string;
  lastName: string;
  sex: PatientSex;
  dateOfBirth?: string;
  approxAge?: number;
  phone?: string;
  address?: string;
  facilityNote?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

export type PatientConsent = {
  id: string;
  facilityId: string;
  patientId: string;
  consentToCreateRecord: boolean;
  consentToShareWithinFacility: boolean;
  capturedAt: string;
  capturedBy: string;
};

export type PatientRegistrationDraft = {
  firstName: string;
  lastName: string;
  sex: PatientSex | "";
  dateOfBirth: string;
  approxAge: string;
  phone: string;
  address: string;
  facilityNote: string;
  consentToCreateRecord: boolean;
  consentToShareWithinFacility: boolean;
};
