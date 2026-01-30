import { Suspense } from "react";
import PatientsPage from "../../../src/features/patients/PatientsPage";

export default function Patients() {
  return (
    <Suspense fallback={<div className="card">Loading patient registry...</div>}>
      <PatientsPage />
    </Suspense>
  );
}
