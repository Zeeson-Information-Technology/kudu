import { ReactNode } from "react";

type HeroTwoColumnProps = {
  title: string;
  intro: string;
  ctaLabel: string;
  ctaHref: string;
  illustration: ReactNode;
};

export function HeroTwoColumn({ title, intro, ctaLabel, ctaHref, illustration }: HeroTwoColumnProps) {
  return (
    <section className="hero">
      <div className="hero-grid">
        <div className="hero-main hero-animate">
          <h1 className="hero-title">{title}</h1>
          <p className="hero-description">{intro}</p>
          <div className="cta-buttons">
            <a className="button primary" href={ctaHref}>
              {ctaLabel}
            </a>
          </div>
        </div>
        <div className="hero-figure hero-animate hero-animate--delay" aria-hidden="true">
          {illustration}
        </div>
      </div>
    </section>
  );
}
