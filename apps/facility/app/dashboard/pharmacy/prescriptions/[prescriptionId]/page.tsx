import PrescriptionDetail from "../../../../../src/features/pharmacy/PrescriptionDetail";

export default function PrescriptionPage({
  params
}: {
  params: { prescriptionId: string };
}) {
  return <PrescriptionDetail prescriptionId={params.prescriptionId} />;
}
