import type { Role } from "./types";

export type NavItem = {
  label: string;
  href: string;
  roles: Role[];
  section?: string;
};

export const dashboardNav: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    roles: ["Clinician", "Nurse", "Records", "Lab", "Pharmacy", "Admin"]
  },
  {
    label: "Patients",
    href: "/dashboard/patients",
    roles: ["Clinician", "Nurse", "Records", "Admin"]
  },
  {
    label: "Encounters",
    href: "/dashboard/encounters",
    roles: ["Clinician", "Nurse", "Admin"]
  },
  {
    label: "Lab",
    href: "/dashboard/lab",
    roles: ["Lab", "Clinician", "Admin"]
  },
  {
    label: "Pharmacy",
    href: "/dashboard/pharmacy",
    roles: ["Pharmacy", "Clinician", "Admin"]
  },
  {
    label: "Drug Catalog",
    href: "/dashboard/pharmacy/catalog",
    roles: ["Pharmacy", "Admin"],
    section: "Pharmacy"
  },
  {
    label: "Queues",
    href: "/dashboard/queues",
    roles: ["Clinician", "Nurse", "Records", "Lab", "Pharmacy", "Admin"]
  },
  {
    label: "OPD Register",
    href: "/dashboard/registers/opd",
    roles: ["Clinician", "Nurse", "Records", "Admin"],
    section: "Registers"
  },
  {
    label: "Facility",
    href: "/dashboard/facility",
    roles: ["Admin"],
    section: "Admin"
  },
  {
    label: "Admin",
    href: "/dashboard/admin",
    roles: ["Admin"]
  }
];
