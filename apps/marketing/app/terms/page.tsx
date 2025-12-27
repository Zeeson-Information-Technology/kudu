import type { Metadata } from "next";
import { termsOfUse } from "../../content/policies";
import { site } from "../../content/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: termsOfUse.intro,
  alternates: {
    canonical: `${site.baseUrl}/terms`
  }
};

export default function TermsPage() {
  return (
    <>
      <section className="hero hero--centered">
        <div className="hero-main">
          <h1 className="hero-title">{termsOfUse.title}</h1>
          <p className="hero-description">{termsOfUse.intro}</p>
        </div>
      </section>

      <article className="policy-article">
        <div className="policy-content">
          <div className="policy-meta">
            <p><strong>Effective Date:</strong> December 27, 2025</p>
            <p><strong>Last Updated:</strong> December 27, 2025</p>
          </div>

          {termsOfUse.sections.map((section, index) => (
            <section key={section.heading} className="policy-section">
              <h2 className="policy-heading">{index + 1}. {section.heading}</h2>
              <div className="policy-body">
                {section.body.split('\n\n').map((paragraph, pIndex) => (
                  <p key={pIndex}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <div className="policy-footer">
            <p>If you have any questions about these Terms of Use, please contact us at <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.</p>
          </div>
        </div>
      </article>
    </>
  );
}
