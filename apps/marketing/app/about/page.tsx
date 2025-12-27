import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "../../components/section";
import {
  aboutHero,
  aboutStory,
  aboutProblem,
  aboutMission,
  aboutValues,
  aboutTeam,
  aboutImpact,
  aboutApproach,
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
      <section className="hero hero--centered">
        <div className="hero-main hero-animate">
          <h1 className="hero-title">{aboutHero.title}</h1>
          <p className="hero-description">{aboutHero.intro}</p>
        </div>
      </section>

      {/* Our Story */}
      <Section title={aboutStory.title}>
        <p className="section-lead">{aboutStory.content}</p>
      </Section>

      {/* The Problem */}
      <Section title={aboutProblem.title}>
        <div className="cards-grid">
          <div className="card card--problem">
            <p>{aboutProblem.description}</p>
          </div>
          {aboutProblem.stats.map((stat, index) => (
            <div key={index} className="card card--stats">
              <div className="stat-content">{stat}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Mission */}
      <Section title={aboutMission.title}>
        <div className="cards-grid">
          <div className="card card--mission">
            <p>{aboutMission.statement}</p>
          </div>
        </div>
      </Section>

      {/* Values */}
      <Section title={aboutValues.title}>
        <div className="cards-grid">
          {aboutValues.items.map((item) => (
            <div key={item.title} className="card card--values">
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </div>
          ))}
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

      {/* Impact */}
      <Section title={aboutImpact.title}>
        <p className="section-lead">{aboutImpact.description}</p>
        <div className="cards-grid">
          {aboutImpact.metrics.map((metric) => (
            <div key={metric.label} className="card card--impact">
              <div className="metric-number">{metric.number}</div>
              <div className="metric-label">{metric.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* How We Build */}
      <Section title={aboutApproach.title}>
        <div className="cards-grid">
          {aboutApproach.items.map((item) => (
            <div key={item.title} className="card card--approach">
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section title={aboutCta.title}>
        <div className="hero-main hero-main--cta">
          <p className="hero-description">{aboutCta.description}</p>
          <div className="cta-buttons">
            <Link href={aboutCta.button.href} className="button primary">
              {aboutCta.button.label}
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
