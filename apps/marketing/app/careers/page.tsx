import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "../../components/section";
import { careersContent } from "../../content/careers";
import { site } from "../../content/site";

export const metadata: Metadata = {
  title: "Careers",
  description: careersContent.intro,
  alternates: {
    canonical: `${site.baseUrl}/careers`
  }
};

export default function CareersPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero hero--centered">
        <div className="hero-main">
          <h1 className="hero-title">{careersContent.hero.title}</h1>
          <p className="hero-description">{careersContent.hero.description}</p>
          <div className="cta-buttons">
            <a href="#positions" className="button primary">
              {careersContent.hero.cta}
            </a>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <Section title={careersContent.title} kicker="Join Our Team">
        <p className="section-lead">{careersContent.intro}</p>
      </Section>

      {/* Culture Section */}
      <Section title={careersContent.culture.title}>
        <p className="section-lead">{careersContent.culture.description}</p>
        <div className="culture-grid">
          {careersContent.culture.values.map((value, index) => (
            <div key={index} className="culture-card">
              <h3 className="culture-title">{value.title}</h3>
              <p className="culture-description">{value.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Benefits Section */}
      <Section title={careersContent.benefits.title}>
        <div className="benefits-grid">
          {careersContent.benefits.items.map((benefit, index) => (
            <div key={index} className="benefit-item">
              <span className="benefit-check">✓</span>
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Open Positions */}
      <Section title="Open Positions" id="positions">
        {careersContent.positions.length > 0 ? (
          <div className="positions-grid">
            {careersContent.positions.map((position, index) => (
              <div key={index} className="position-card">
                <div className="position-header">
                  <h3 className="position-title">{position.title}</h3>
                  <div className="position-meta">
                    <span className="position-location">{position.location}</span>
                    <span className="position-type">{position.type}</span>
                    <span className="position-dept">{position.department}</span>
                  </div>
                </div>
                <p className="position-description">{position.description}</p>
                <div className="position-requirements">
                  <h4>Requirements:</h4>
                  <ul>
                    {position.requirements.map((req, reqIndex) => (
                      <li key={reqIndex}>{req}</li>
                    ))}
                  </ul>
                </div>
                <div className="position-benefits">
                  <h4>Benefits:</h4>
                  <ul>
                    {position.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex}>{benefit}</li>
                    ))}
                  </ul>
                </div>
                <Link href="/contact" className="button primary position-apply">
                  Apply for this position
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-positions">
            <div className="no-positions-content">
              <h3>No Current Openings</h3>
              <p>
                We do not have any open positions at the moment, but we are always interested in
                hearing from talented individuals who share our mission to improve healthcare in Nigeria.
              </p>
              <p>
                If you are passionate about healthcare technology and want to be considered for
                future opportunities, we would love to hear from you.
              </p>
              <div className="cta-buttons">
                <Link href="/contact" className="button primary">
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* Application Process */}
      <Section title={careersContent.applicationProcess.title}>
        <div className="process-steps">
          {careersContent.applicationProcess.steps.map((step, index) => (
            <div key={index} className="process-step">
              <div className="step-number">{index + 1}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section title={careersContent.cta.title}>
        <p className="section-lead">{careersContent.cta.description}</p>
        <div className="cta-buttons">
          <Link href="/contact" className="button primary">
            {careersContent.cta.primaryCta}
          </Link>
          <Link href="/contact" className="button secondary">
            {careersContent.cta.secondaryCta}
          </Link>
        </div>
      </Section>
    </>
  );
}
