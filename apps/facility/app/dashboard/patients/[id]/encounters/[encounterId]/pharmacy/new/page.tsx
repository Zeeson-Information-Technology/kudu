import PrescriptionForm from "../../../../../../../../src/features/pharmacy/PrescriptionForm";

export default function NewPrescriptionPage({
  params
}: {
  params: { id: string; encounterId: string };
}) {
  return (
    <main aria-labelledby="rx-title">
      <div className="card">
        <span className="tag">Pharmacy</span>
        <h2 id="rx-title">Create prescription</h2>
        <p>Capture medications for this encounter.</p>
      </div>
      <PrescriptionForm patientId={params.id} encounterId={params.encounterId} />
    </main>
  );
}
