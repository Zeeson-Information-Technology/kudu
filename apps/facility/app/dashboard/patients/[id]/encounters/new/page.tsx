import EncounterForm from "../../../../../../src/features/encounters/EncounterForm";

export default function NewEncounterPage({
  params
}: {
  params: { id: string };
}) {
  return (
    <main aria-labelledby="encounter-title">
      <div className="card">
        <span className="tag">Encounter</span>
        <h2 id="encounter-title">New encounter</h2>
        <p>
          Capture vitals, notes, and orders for this visit.
        </p>
      </div>
      <EncounterForm patientId={params.id} />
    </main>
  );
}
