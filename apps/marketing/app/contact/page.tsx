import type { Metadata } from "next";
import { Section } from "../../components/section";
import { contactContent } from "../../content/contact";
import { site } from "../../content/site";
import ContactForm from "../../components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: contactContent.intro,
  alternates: {
    canonical: `${site.baseUrl}/contact`
  }
};

export default function ContactPage() {
  return (
    <>
      <section className="hero hero--centered">
        <div className="hero-main hero-animate">
          <h1 className="hero-title">{contactContent.title}</h1>
          <p className="hero-description">{contactContent.intro}</p>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title text-left">Send us a message</h2>
        </div>
        <div className="section-body">
          <div className="contact-layout">
            <div className="contact-form-container">
              <ContactForm />
            </div>
            <div className="contact-info">
              <div className="contact-info-card">
                <h3>{contactContent.expectationsTitle}</h3>
                <ul className="contact-list">
                  {contactContent.notes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
              <div className="contact-info-card">
                <h3>Alternative contact</h3>
                <p>If you prefer direct email:</p>
                <a href={`mailto:${contactContent.email}`} className="contact-link">
                  {contactContent.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
