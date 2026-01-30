import LabOrderDetail from "../../../../../src/features/lab/LabOrderDetail";

export default function LabOrderPage({
  params
}: {
  params: { orderId: string };
}) {
  return <LabOrderDetail orderId={params.orderId} />;
}
