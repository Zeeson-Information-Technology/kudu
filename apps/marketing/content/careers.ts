export const careersContent = {
  title: "Join the Kudu Health Team",
  subtitle: "Help us build the future of healthcare in Nigeria",
  intro:
    "We're looking for passionate individuals who want to make a real impact in healthcare technology. Join us in our mission to provide reliable, offline-first healthcare solutions for primary health centers across Nigeria.",

  hero: {
    title: "Careers at Kudu Health",
    description: "Be part of a mission-driven team building healthcare technology that matters.",
    cta: "View Open Positions"
  },

  culture: {
    title: "Our Culture",
    description: "We believe in building technology that serves humanity, especially in underserved communities.",
    values: [
      {
        title: "Impact First",
        description: "Every decision we make prioritizes positive impact on healthcare delivery and patient outcomes."
      },
      {
        title: "Technical Excellence",
        description: "We build robust, reliable systems that work even in the most challenging environments."
      },
      {
        title: "Collaboration",
        description: "We work closely with healthcare providers, government agencies, and communities to understand real needs."
      },
      {
        title: "Innovation",
        description: "We embrace new technologies and approaches to solve complex healthcare challenges."
      }
    ]
  },

  benefits: {
    title: "Why Join Kudu Health?",
    items: [
      "Competitive salary and equity package",
      "Health insurance coverage",
      "Flexible working arrangements",
      "Professional development opportunities",
      "Work with cutting-edge healthcare technology",
      "Make a real difference in Nigerian healthcare",
      "Collaborative and supportive team environment",
      "Opportunity to work on globally relevant challenges"
    ]
  },

  positions: [] as {
    title: string;
    location: string;
    type: string;
    department: string;
    description: string;
    requirements: string[];
    benefits: string[];
  }[],

  applicationProcess: {
    title: "Our Application Process",
    steps: [
      {
        title: "Application Review",
        description: "We carefully review every application to understand your background and motivation."
      },
      {
        title: "Initial Interview",
        description: "A conversation with our recruitment team to learn more about you and share about Kudu Health."
      },
      {
        title: "Technical Assessment",
        description: "Depending on the role, you may complete a technical assessment or portfolio review."
      },
      {
        title: "Team Interviews",
        description: "Meet with team members you'll be working with to ensure cultural fit."
      },
      {
        title: "Reference Checks",
        description: "We conduct reference checks to validate your experience and performance."
      },
      {
        title: "Offer",
        description: "If we're the right fit for each other, we'll extend a formal offer."
      }
    ]
  },

  cta: {
    title: "Ready to Make an Impact?",
    description: "Don't see a position that matches your skills? We're always interested in hearing from talented individuals who share our mission.",
    primaryCta: "Apply Now",
    secondaryCta: "Send Us a Message"
  }
};
