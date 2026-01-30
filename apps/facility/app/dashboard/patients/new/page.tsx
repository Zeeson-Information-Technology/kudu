import { redirect } from "next/navigation";

export default function PatientsNewPage() {
  redirect("/dashboard/patients?new=1");
}
