export type LocalUser = {
  _id: string;
  type: "localUser";
  userId: string;
  facilityId: string;
  role: "admin" | "records" | "nurse" | "clinician" | "lab" | "pharmacy";
  displayName: string;
  pinEnabled?: boolean;
  pinHash?: string;
  pinSetAt?: string;
  createdAt: string;
  disabled?: boolean;
};
