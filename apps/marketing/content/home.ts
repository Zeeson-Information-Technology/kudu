export const homeHero = {
  title: "Offline-first primary healthcare platform",
  description:
    "Kudu Health is a digital health system for primary care delivery that keeps registration, consultations, and clinical records available when connectivity is weak, with consent, auditability, and continuity built in.",
  primaryCta: { label: "Contact the team", href: "/contact" },
  secondaryCta: { label: "Learn about the system", href: "/about" }
};

/* --------------------
   Capabilities
--------------------- */

export const homeCapabilities = {
  title: "System capabilities",
  lead:
    "Engineered to keep core clinic workflows reliable offline, govern access, and stay ready for national integration.",
  items: [
    {
      title: "Offline clinical workflows",
      body:
        "Patient registration, vitals, consultations, lab orders, and dispensing run locally first and reconcile automatically when connectivity returns.",
      icon: "signal"
    },
    {
      title: "Consent-led records",
      body:
        "Patient consent, role-based access, and facility boundaries are enforced at the record layer, not bolted on later.",
      icon: "shield"
    },
    {
      title: "Audit-ready data",
      body:
        "Append-only audit trails capture clinical and administrative actions end-to-end to support oversight and accountability.",
      icon: "audit"
    },
    {
      title: "Integration-ready design",
      body:
        "Local-first data storage with standards-aware models and open interfaces keeps facilities prepared for national integration.",
      icon: "interop"
    },
    {
      title: "Resilient data storage",
      body:
        "Local-first storage with conflict awareness safeguards continuity during poor connectivity and syncs safely when available.",
      icon: "storage"
    },
    {
      title: "Operational readiness",
      body:
        "Minimal-ops deployment with sensible defaults for clinics, supporting device diversity and predictable updates.",
      icon: "ops"
    }
  ]
};

/* --------------------
   Assurances
--------------------- */

export const homeAssurances = {
  title: "Design assurances",
  lead:
    "The system is built to meet public-sector expectations around reliability, privacy, and governance from day one.",
  bullets: [
    "Offline-first operation with conflict-aware synchronization to preserve continuity of care.",
    "Consent-driven access controls and patient-permissioned data handling.",
    "Auditability by default through append-only event logging.",
    "Designed to align with national data protection and health interoperability standards."
  ]
};

/* --------------------
   Audiences
--------------------- */

export const homeAudiences = {
  title: "Who it is for",
  lead:
    "Kudu Health is designed to serve frontline care delivery while meeting the needs of health authorities and partners.",
  groups: [
    {
      label: "Primary health centres",
      description:
        "Facilities that need dependable clinical software which continues to function during connectivity outages.",
      icon: "clinic"
    },
    {
      label: "Health authorities",
      description:
        "Government and program teams assessing systems for compliance, auditability, and readiness for national data exchange.",
      icon: "authority"
    },
    {
      label: "Implementation partners",
      description:
        "Organizations deploying digital health solutions in public-sector and low-resource environments.",
      icon: "partner"
    }
  ]
};

/* --------------------
   Integration posture
--------------------- */

export const homeIntegrationNote = {
  title: "Integration approach",
  lead: "Local-first today with clear, phased pathways to national interoperability.",
  body:
    "Kudu Health operates locally first and synchronizes when connectivity is available. Care delivery is never blocked by internet availability or national ID lookup. Integration with national systems is planned and phased without denying care during outages."
};

/* --------------------
   Call to action
--------------------- */

export const homeCta = {
  title: "Discuss Kudu Health",
  description:
    "Engage with the team to review requirements, compliance considerations, and deployment options for your context.",
  button: { label: "Contact the team", href: "/contact" }
};

/* --------------------
   What We Offer
--------------------- */

export const homeOfferings = {
  title: "What we offer",
  items: [
    {
      title: "Kudu Health Platform",
      description: "Offline-first clinic workflows with patient health records, designed for low-connectivity environments and NDHA alignment."
    },
    {
      title: "Implementation & Enablement",
      description: "Onboarding support, clinician training, and pilot deployment assistance for smooth adoption in primary care facilities."
    },
    {
      title: "Integration Readiness",
      description: "Standards-aware design prepared for national interoperability, with clear pathways for phased integration with health information systems."
    },
    {
      title: "Facility Reporting",
      description: "Comprehensive registers and export capabilities for facility-level data management and reporting requirements."
    }
  ]
};
