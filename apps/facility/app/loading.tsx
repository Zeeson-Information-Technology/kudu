export default function RootLoading() {
  return (
    <main className="page-loader" role="status" aria-live="polite">
      <div className="page-loader__card">
        <img src="/brand/loader-mark.svg" alt="" aria-hidden="true" />
        <div>
          <p className="page-loader__title">Loading Kudu Facility</p>
          <p className="page-loader__subtitle">Preparing offline data and secure session.</p>
        </div>
      </div>
    </main>
  );
}
