import { Suspense } from "react";
import QueueListPage from "../../../../src/features/queues/QueueListPage";

export default function QueueListRoute() {
  return (
    <Suspense fallback={<div className="card">Loading queue list...</div>}>
      <QueueListPage />
    </Suspense>
  );
}
