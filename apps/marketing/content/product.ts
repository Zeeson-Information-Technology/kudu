export const productHero = {
  title: "Kudu Health Platform",
  intro:
    "An offline-first digital health system for primary care facilities, designed to maintain continuity of care during connectivity outages while preparing for national integration."
};

export const productOverview = {
  title: "What the platform includes",
  clinicFeatures: [
    "Patient registration and identification with local ID generation",
    "Clinical consultations with structured documentation",
    "Vital signs recording and trend tracking",
    "Laboratory test ordering and results management",
    "Medication dispensing with inventory control",
    "Facility-level reporting and performance metrics"
  ],
  patientFeatures: [
    "Personal health record access with consent controls",
    "Appointment scheduling and automated reminders",
    "Care history with chronological treatment timeline",
    "Referral tracking with status updates",
    "Health education materials and resources",
    "Emergency contact and family information management"
  ]
};

export const productOffline = {
  title: "How it works offline",
  content:
    "The platform operates primarily on local devices and networks within each health facility, storing all patient data and clinical records onsite. Core clinical workflows function completely independently of internet connectivity, ensuring care delivery continues uninterrupted during outages. When connectivity is restored, data automatically synchronizes with central systems through secure, conflict-aware reconciliation that preserves data integrity and maintains audit trails."
};

export const productIntegration = {
  title: "Integration readiness",
  content:
    "Kudu Health is designed with Nigeria's National Digital Health Architecture (NDHA) standards in mind, using standardized data models and interoperable interfaces. The platform maintains local-first operation while preparing clear pathways for phased national integration. Current deployments operate independently with integration-ready architecture, supporting future connectivity to national health information systems without requiring changes to core clinical workflows or data structures."
};

export const productCta = {
  title: "Learn more about implementation",
  description:
    "Discuss deployment options, compliance requirements, and integration planning for your health facilities.",
  button: { label: "Contact the team", href: "/contact" }
};