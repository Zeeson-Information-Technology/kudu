export type Facility = {
  _id: string;
  type: "facility";
  facilityId: string;
  name: string;
  state:
    | "Abia"
    | "Adamawa"
    | "Akwa Ibom"
    | "Anambra"
    | "Bauchi"
    | "Bayelsa"
    | "Benue"
    | "Borno"
    | "Cross River"
    | "Delta"
    | "Ebonyi"
    | "Edo"
    | "Ekiti"
    | "Enugu"
    | "Gombe"
    | "Imo"
    | "Jigawa"
    | "Kaduna"
    | "Kano"
    | "Katsina"
    | "Kebbi"
    | "Kogi"
    | "Kwara"
    | "Lagos"
    | "Nasarawa"
    | "Niger"
    | "Ogun"
    | "Ondo"
    | "Osun"
    | "Oyo"
    | "Plateau"
    | "Rivers"
    | "Sokoto"
    | "Taraba"
    | "Yobe"
    | "Zamfara"
    | "FCT";
  lga: string;
  code?: string;
  joinCode: string;
  joinCodeRotatedAt?: string;
  createdAt: string;
  updatedAt: string;
};
