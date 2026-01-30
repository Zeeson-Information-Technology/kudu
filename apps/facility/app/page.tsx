import Link from "next/link";

export default function HomePage() {
  return (
    <main className="shell" role="main">
      <div style={{ paddingTop: "3rem" }}>
        <h1 className="page-title">Kudu Facility App</h1>
        <p className="page-subtitle">
          Staff-facing experience for offline-first primary care workflows.
        </p>
      </div>
      <div style={{ marginTop: "2rem" }} className="card">
        <p>
          This Phase 2 scaffold includes the authenticated shell, dashboard routes, and
          placeholder navigation.
        </p>
        <div style={{ marginTop: "1.5rem" }}>
          <Link href="/login" className="button primary">
            Continue to login
          </Link>
        </div>
      </div>
    </main>
  );
}
