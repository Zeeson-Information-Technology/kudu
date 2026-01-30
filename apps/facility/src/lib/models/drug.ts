export type Drug = {
  _id: string;
  type: "drug";
  drugId: string;
  facilityId?: string;
  name: string;
  form: string;
  strength: string;
  unitLabel: string;
  unitPriceNgn: number;
  state: "Kaduna";
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};
