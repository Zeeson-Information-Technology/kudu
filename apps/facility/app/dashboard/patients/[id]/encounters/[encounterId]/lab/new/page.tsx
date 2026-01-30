import LabOrderForm from "../../../../../../../../src/features/lab/LabOrderForm";

export default function NewLabOrderPage({
  params
}: {
  params: { id: string; encounterId: string };
}) {
  return (
    <main aria-labelledby="lab-order-title">
      <div className="card">
        <span className="tag">Lab</span>
        <h2 id="lab-order-title">Create lab order</h2>
        <p>Capture requested tests for this encounter.</p>
      </div>
      <LabOrderForm patientId={params.id} encounterId={params.encounterId} />
    </main>
  );
}
