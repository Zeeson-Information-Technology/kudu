import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "../components/section";
import {
  homeHero,
  homeCapabilities,
  homeAudiences,
  homeIntegrationNote,
  homeOfferings,
  homeCta
} from "../content/home";
import { homePartners } from "../content/partners";
import { site } from "../content/site";
import { LogoWall } from "../components/logo-wall";

export const metadata: Metadata = {
  title: "Home",
  description: homeHero.description,
  alternates: {
    canonical: `${site.baseUrl}/`
  }
};

const capabilityIcons: Record<string, JSX.Element> = {
  signal: (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="capability-icon">
      <circle cx="24" cy="24" r="20" fill="none" stroke="#0f6d6a" strokeWidth="2.2" />
      <path d="M15 29c2.4-3 5.4-4.5 9-4.5s6.6 1.5 9 4.5" fill="none" stroke="#0f6d6a" strokeWidth="2.2" />
      <circle cx="24" cy="22" r="3" fill="#0f6d6a" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="capability-icon">
      <path
        d="M24 6 10 12v11c0 8.4 5.2 16 14 19 8.8-3 14-10.6 14-19V12L24 6Z"
        fill="none"
        stroke="#0f6d6a"
        strokeWidth="2.2"
      />
      <path d="m18 24 4 4 8-8" fill="none" stroke="#0f6d6a" strokeWidth="2.2" />
    </svg>
  ),
  audit: (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="capability-icon">
      <rect x="10" y="10" width="16" height="24" rx="3" fill="none" stroke="#0f6d6a" strokeWidth="2.2" />
      <path d="M26 18h8M26 24h6M26 30h4" fill="none" stroke="#0f6d6a" strokeWidth="2.2" />
      <circle cx="34" cy="28" r="6" fill="none" stroke="#0f6d6a" strokeWidth="2.2" />
      <path d="m37.5 31.5 3 3" fill="none" stroke="#0f6d6a" strokeWidth="2.2" />
    </svg>
  ),
  interop: (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="capability-icon">
      <rect x="8" y="14" width="12" height="20" rx="3" fill="none" stroke="#0f6d6a" strokeWidth="2.2" />
      <rect x="28" y="10" width="12" height="20" rx="3" fill="none" stroke="#0f6d6a" strokeWidth="2.2" />
      <path d="M20 24h8M32 18h-6M16 30h6" fill="none" stroke="#0f6d6a" strokeWidth="2.2" />
    </svg>
  ),
  storage: (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="capability-icon">
      <ellipse cx="24" cy="14" rx="12" ry="5" fill="none" stroke="#0f6d6a" strokeWidth="2.2" />
      <path d="M12 14v10c0 3 5.4 5 12 5s12-2 12-5V14" fill="none" stroke="#0f6d6a" strokeWidth="2.2" />
      <path d="M12 24v10c0 3 5.4 5 12 5s12-2 12-5V24" fill="none" stroke="#0f6d6a" strokeWidth="2.2" />
    </svg>
  ),
  ops: (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="capability-icon">
      <circle cx="16" cy="16" r="6" fill="none" stroke="#0f6d6a" strokeWidth="2.2" />
      <circle cx="32" cy="16" r="6" fill="none" stroke="#0f6d6a" strokeWidth="2.2" />
      <rect x="12" y="26" width="24" height="10" rx="3" fill="none" stroke="#0f6d6a" strokeWidth="2.2" />
      <path d="M16 32h16" stroke="#0f6d6a" strokeWidth="2.2" />
    </svg>
  )
};

const audienceIcons: Record<string, JSX.Element> = {
  clinic: (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="capability-icon">
      <rect x="10" y="18" width="28" height="18" rx="3" fill="none" stroke="#0f6d6a" strokeWidth="2.2" />
      <path d="M24 12v6M18 24h12" stroke="#0f6d6a" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M10 30h28" stroke="#0f6d6a" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  authority: (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="capability-icon">
      <path d="M12 34h24M16 26v8M24 22v12M32 26v8" stroke="#0f6d6a" strokeWidth="2.2" />
      <circle cx="24" cy="14" r="6" fill="none" stroke="#0f6d6a" strokeWidth="2.2" />
    </svg>
  ),
  partner: (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="capability-icon">
      <circle cx="16" cy="18" r="6" fill="none" stroke="#0f6d6a" strokeWidth="2.2" />
      <circle cx="32" cy="18" r="6" fill="none" stroke="#0f6d6a" strokeWidth="2.2" />
      <path d="M10 32c1.2-3.2 4.8-5 10-5s8.8 1.8 10 5" fill="none" stroke="#0f6d6a" strokeWidth="2.2" />
      <path d="M26 32c1.2-2.6 4-4 8-4" fill="none" stroke="#0f6d6a" strokeWidth="2.2" />
    </svg>
  )
};

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-main hero-animate">
            {/* Optional eyebrow if your content supports it */}
            {"eyebrow" in homeHero && (homeHero as any).eyebrow ? (
              <div className="hero-eyebrow">{(homeHero as any).eyebrow}</div>
            ) : null}

            <h1 className="hero-title">{homeHero.title}</h1>
            <p className="hero-description">{homeHero.description}</p>

            <div className="cta-buttons">
              <Link href={homeHero.primaryCta.href} className="button primary">
                {homeHero.primaryCta.label}
              </Link>
              <Link href={homeHero.secondaryCta.href} className="button secondary">
                {homeHero.secondaryCta.label}
              </Link>
            </div>
          </div>

          <div className="hero-figure hero-animate hero-animate--delay" aria-hidden="true">
            <img
              src="/figures/kudu-figure.svg"
              alt=""
              className="hero-figure__image"
              loading="eager"
            />
          </div>
        </div>
      </section>

      <Section title={homeCapabilities.title} kicker={site.tagline}>
        <div className="section-center">
          <p className="section-lead">{homeCapabilities.lead}</p>
        </div>
        <div className="cards-grid">
          {homeCapabilities.items.map((item) => (
            <div key={item.title} className="card capability-card">
              <div className="capability-card__icon" aria-hidden="true">
                {capabilityIcons[item.icon || "signal"]}
              </div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title={homeAudiences.title}>
        <div className="section-center">
          <p className="section-lead">{homeAudiences.lead}</p>
        </div>
        <div className="cards-grid">
          {homeAudiences.groups.map((group) => (
            <div key={group.label} className="card capability-card">
              <div className="capability-card__icon" aria-hidden="true">
                {audienceIcons[group.icon || "clinic"]}
              </div>
              <h3>{group.label}</h3>
              <p>{group.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title={homeIntegrationNote.title}>
        <div className="integration-grid">
          <div>
            <p className="section-lead">{homeIntegrationNote.lead}</p>
            <p className="hero-description">{homeIntegrationNote.body}</p>
          </div>
          <div className="integration-figure" aria-hidden="true">
           <svg
  viewBox="0 0 360 300"
  role="presentation"
  className="integration-figure__svg"
>
  <defs>
    <linearGradient id="khLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#0f6d6a" stopOpacity="0.18" />
      <stop offset="50%" stopColor="#0f6d6a" stopOpacity="0.7" />
      <stop offset="100%" stopColor="#0f6d6a" stopOpacity="0.18" />
    </linearGradient>

    <style>{`
      .kh-stroke { stroke: #0f6d6a; }
      .kh-muted { stroke: rgba(13,27,42,0.36); }
      .kh-dash { stroke-dasharray: 6 8; }
      .kh-pulse {
        transform-origin: 180px 150px;
        animation: khPulse 4.6s ease-in-out infinite;
      }
      .kh-sweep {
        animation: khSweep 5.8s ease-in-out infinite;
      }
      @media (prefers-reduced-motion: reduce) {
        .kh-pulse, .kh-sweep { animation: none !important; }
      }
      @keyframes khPulse {
        0%, 100% { opacity: 0.18; transform: scale(0.98); }
        45% { opacity: 0.55; transform: scale(1.04); }
      }
      @keyframes khSweep {
        0% { opacity: 0; transform: translateX(-26px); }
        25% { opacity: 0.55; }
        60% { opacity: 0.25; }
        100% { opacity: 0; transform: translateX(26px); }
      }
    `}</style>
  </defs>

  {/* Center sync / connectivity zone */}
  <circle
    cx="180"
    cy="150"
    r="52"
    fill="none"
    stroke="rgba(15,109,106,0.28)"
    strokeWidth="2"
  />
  <circle
    cx="180"
    cy="150"
    r="68"
    fill="none"
    stroke="rgba(15,109,106,0.18)"
    strokeWidth="2"
    className="kh-pulse"
  />

  {/* Left: Facility (local-first) */}
  <rect
    x="36"
    y="110"
    width="120"
    height="80"
    rx="16"
    fill="none"
    stroke="rgba(15,109,106,0.65)"
    strokeWidth="2"
  />
  {/* Clinic glyph */}
  <rect
    x="52"
    y="126"
    width="36"
    height="36"
    rx="10"
    fill="none"
    stroke="rgba(15,109,106,0.55)"
    strokeWidth="2"
  />
  <path d="M70 134v20M60 144h20" className="kh-stroke" strokeWidth="3" strokeLinecap="round" />
  <path d="M96 140h44" className="kh-muted" strokeWidth="3" strokeLinecap="round" />
  <path d="M96 156h30" className="kh-muted" strokeWidth="3" strokeLinecap="round" />

  {/* Right: National systems (planned / phased) */}
  <rect
    x="204"
    y="92"
    width="132"
    height="116"
    rx="18"
    fill="none"
    stroke="rgba(15,109,106,0.45)"
    strokeWidth="2"
  />
  {/* System layers */}
  <rect x="220" y="108" width="100" height="18" rx="9" fill="none" stroke="rgba(15,109,106,0.35)" strokeWidth="2" />
  <rect x="220" y="136" width="100" height="18" rx="9" fill="none" stroke="rgba(15,109,106,0.28)" strokeWidth="2" />
  <rect x="220" y="164" width="80" height="14" rx="7" fill="none" stroke="rgba(13,27,42,0.22)" strokeWidth="2" />

  {/* Paths */}
  {/* Solid: care always works locally */}
  <path
    d="M156 150h-20c-12 0-24 0-36 0"
    fill="none"
    stroke="rgba(15,109,106,0.75)"
    strokeWidth="3"
    strokeLinecap="round"
  />
  <circle cx="156" cy="150" r="5" fill="#0f6d6a" />

  {/* Dotted: phased sync to national systems */}
  <path
    d="M204 150h22c12 0 24 0 36 0"
    fill="none"
    stroke="rgba(15,109,106,0.6)"
    strokeWidth="3"
    strokeLinecap="round"
    className="kh-dash"
  />
  <circle cx="204" cy="150" r="5" fill="#0f6d6a" opacity="0.85" />

  {/* Sync sweep */}
  <path
    d="M152 150h56"
    fill="none"
    stroke="url(#khLine)"
    strokeWidth="6"
    strokeLinecap="round"
    className="kh-sweep"
  />
</svg>

          </div>
        </div>
      </Section>

      <Section title={homeOfferings.title}>
        <div className="cards-grid">
          {homeOfferings.items.map((item) => (
            <div key={item.title} className="card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title={homePartners.title}>
        <div className="section-center">
          <p className="section-lead">{homePartners.lead}</p>
          <LogoWall logos={homePartners.logos} />
        </div>
      </Section>

      <Section title={homeCta.title}>
        <div className="section-center">
          <div className="hero-main hero-main--cta">
            <p className="hero-description">{homeCta.description}</p>
            <div className="cta-buttons hero-ctas--centered">
              <Link href={homeCta.button.href} className="button primary">
                {homeCta.button.label}
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
