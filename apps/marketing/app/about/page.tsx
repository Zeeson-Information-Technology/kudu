import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "../../components/section";
import styles from "./about.module.css";
import {
  aboutHero,
  aboutOverview,
  aboutWhatWeDo,
  aboutDesigned,
  aboutStandards,
  aboutStory,
  aboutChallenge,
  aboutMission,
  aboutVision,
  aboutTeam,
  aboutCta
} from "../../content/about";
import { site } from "../../content/site";

export const metadata: Metadata = {
  title: "About",
  description: aboutHero.intro,
  alternates: {
    canonical: `${site.baseUrl}/about`
  }
};

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className={`hero ${styles.aboutHero}`}>
        <div className={`hero-main hero-animate ${styles.aboutHeroMain}`}>
          <h1 className="hero-title">{aboutHero.title}</h1>
          <p className="hero-description">{aboutHero.intro}</p>
        </div>
      </section>
      {/* Overview */}
      <Section title={aboutOverview.title}>
        <p className="section-lead">{aboutOverview.content}</p>
      </Section>

      {/* What We Do */}
      <Section title={aboutWhatWeDo.title}>
        <div className="section-lead">
          <p>{aboutWhatWeDo.summary}</p>
        </div>
        <div className="cards-grid">
          {aboutWhatWeDo.bullets.map((b) => (
            <div key={b} className="card card--bullet">
              <p>{b}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Designed for Scale */}
      <Section title={aboutDesigned.title}>
        <p className="section-lead">{aboutDesigned.content}</p>
      </Section>

      {/* Standards & Trust */}
      <Section title={aboutStandards.title}>
        <p className="section-lead">{aboutStandards.content}</p>
      </Section>

      {/* Our Story */}
      <Section title={aboutStory.title}>
        <p className="section-lead">{aboutStory.content}</p>
      </Section>

      {/* The Challenge */}
      <Section title={aboutChallenge.title}>
        <div className="cards-grid">
          <div className="card card--problem">
            <p>{aboutChallenge.content}</p>
          </div>
        </div>
      </Section>

      {/* Mission & Vision */}
      <Section title={aboutMission.title}>
        <div className="cards-grid">
          <div className="card card--mission">
            <h3>{aboutMission.title}</h3>
            <p>{aboutMission.statement}</p>
          </div>
          <div className="card card--vision">
            <h3>{aboutVision.title}</h3>
            <p>{aboutVision.statement}</p>
          </div>
        </div>
      </Section>

      {/* Team */}
      <Section title={aboutTeam.title}>
        <p className="section-lead">{aboutTeam.intro}</p>
        <div className="cards-grid">
          {aboutTeam.members.map((member) => (
            <div key={member.name} className="card card--team">
              <h3>{member.name}</h3>
              <p className="card-role">{member.role}</p>
              <p>{member.bio}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section title={aboutCta.title}>
        <div className={styles.aboutCta}>
          <div className={`hero-main hero-main--cta ${styles.aboutCtaMain}`}>
            <p className="hero-description">{aboutCta.description}</p>
            <div className={`cta-buttons ${styles.aboutCtaButtons}`}>
              <Link href={aboutCta.button.href} className="button primary">
                {aboutCta.button.label}
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
