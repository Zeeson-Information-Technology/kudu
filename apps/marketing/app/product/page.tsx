import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "../../components/section";
import { HeroTwoColumn } from "../../components/HeroTwoColumn";
import { OfflinePlatformIllustration } from "../../components/OfflinePlatformIllustration";
import {
  productHero,
  productOverview,
  productOffline,
  productIntegration,
  productCta
} from "../../content/product";
import { site } from "../../content/site";

export const metadata: Metadata = {
  title: "Product",
  description: productHero.intro,
  alternates: {
    canonical: `${site.baseUrl}/product`
  }
};

export default function ProductPage() {
  return (
    <>
      <HeroTwoColumn
        title={productHero.title}
        intro={productHero.intro}
        ctaLabel="Contact Us"
        ctaHref="/contact"
        illustration={<OfflinePlatformIllustration />}
      />

      {/* What the platform includes */}
      <Section title={productOverview.title}>
        <div className="cards-grid product-features">
          <div className="card">
            <h3>Clinic workflows</h3>
            <ul className="list">
              {productOverview.clinicFeatures.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h3>Patient experience</h3>
            <ul className="list">
              {productOverview.patientFeatures.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* How it works offline */}
      <Section title={productOffline.title}>
        <div className="cards-grid">
          <div className="card">
            <p className="section-lead">{productOffline.content}</p>
          </div>
        </div>
      </Section>

      {/* Integration readiness */}
      <Section title={productIntegration.title}>
        <div className="cards-grid">
          <div className="card">
            <p className="section-lead">{productIntegration.content}</p>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section title={productCta.title}>
        <div className="hero-main hero-main--cta">
          <p className="hero-description">{productCta.description}</p>
          <div className="cta-buttons">
            <Link href={productCta.button.href} className="button primary">
              {productCta.button.label}
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
