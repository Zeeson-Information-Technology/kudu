export default function OnboardingPage() {
  return (
    <main aria-labelledby="onboarding-title" className="shell onboarding-shell">
      <section className="onboarding-hero">
        <div className="onboarding-hero__content">
          <img src="/brand/kudu-health-dark.svg" alt="Kudu Health" className="onboarding-logo" />
          <span className="tag">Kudu Facility</span>
          <h1 id="onboarding-title">Set up your facility workspace</h1>
          <p className="page-subtitle">
            Create a facility record or join an existing team to begin offline-first care workflows.
          </p>
          <div className="onboarding-hero__meta">
            <div className="onboarding-metric">
              <span>Offline-first</span>
              <strong>Ready</strong>
            </div>
            <div className="onboarding-metric">
              <span>Audit-ready</span>
              <strong>Enabled</strong>
            </div>
            <div className="onboarding-metric">
              <span>Secure sync</span>
              <strong>Optional</strong>
            </div>
          </div>
        </div>
        <div className="onboarding-hero__panel">
          <div className="onboarding-panel__card">
            <p className="onboarding-panel__title">Next step</p>
            <p className="onboarding-panel__text">
              Choose how your team will access this device today. You can switch facilities later
              for testing.
            </p>
            <div className="onboarding-panel__actions">
              <a className="button primary" href="/onboarding/create-facility">
                Create facility
              </a>
              <a className="button secondary" href="/onboarding/join">
                Join with code
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="onboarding-grid" aria-label="Onboarding choices">
        <a className="onboarding-card" href="/onboarding/create-facility">
          <div>
            <h3>Create a facility</h3>
            <p>Set up a new facility profile and issue join codes for staff.</p>
          </div>
          <span className="onboarding-card__cta">Start setup</span>
        </a>
        <a className="onboarding-card" href="/onboarding/join">
          <div>
            <h3>Join a facility</h3>
            <p>Enter the join code provided by your administrator to continue.</p>
          </div>
          <span className="onboarding-card__cta">Enter code</span>
        </a>
      </section>
    </main>
  );
}
