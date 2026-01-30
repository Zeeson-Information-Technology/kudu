"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "../../src/components/MetricCard";
import { ActivityCard } from "../../src/components/ActivityCard";
import { HealthStatus } from "../../src/components/HealthStatus";
import { StatsGrid } from "../../src/components/StatsGrid";
import { getDb } from "../../src/lib/offline/db";
import { getSession } from "../../src/lib/session";
import type {
  EncounterDoc,
  AuditEventDoc,
  FacilityDoc,
  LabOrderDoc,
  LocalUserDoc,
  PatientDoc,
  PrescriptionDoc,
  QueueItemDoc
} from "../../src/lib/offline/schema";
import { createFacilityDocId } from "../../src/lib/offline/schema";
import type { SessionData } from "../../src/lib/session";
import { useSyncStatus } from "../../src/lib/offline/sync";

const formatRelativeTime = (value: string) => {
  const now = Date.now();
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) {
    return value;
  }
  const diffMinutes = Math.max(0, Math.floor((now - time) / 60000));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export default function DashboardPage() {
  const [joinCode, setJoinCode] = useState<string>("");
  const [copyMessage, setCopyMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [staff, setStaff] = useState<LocalUserDoc[]>([]);
  const [facilityName, setFacilityName] = useState("");
  const [facilityLocation, setFacilityLocation] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [roleLabel, setRoleLabel] = useState("");
  const [sessionRole, setSessionRole] = useState<SessionData["role"] | null>(null);
  const syncSnapshot = useSyncStatus();
  const [heroStats, setHeroStats] = useState({
    patientsToday: 0,
    encountersToday: 0,
    queueWaiting: 0,
    labPending: 0
  });
  const [activityItems, setActivityItems] = useState<
    {
      id: string;
      label: string;
      time: string;
      type: "patient" | "encounter" | "lab" | "sync" | "alert";
      href?: string;
    }[]
  >([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalPatients: 0,
    encountersThisMonth: 0,
    prescriptionsPending: 0,
    averageQueueWaitMinutes: 0
  });

  useEffect(() => {
    const loadFacility = async () => {
      const session = getSession();
      if (!session) {
        return;
      }
      const prettyRole = session.role
        ? `${session.role.charAt(0).toUpperCase()}${session.role.slice(1)}`
        : "";
      setFacilityName("Loading");
      setDisplayName(session.displayName);
      setRoleLabel(prettyRole);
      setSessionRole(session.role);
      const isUserAdmin = session.role === "admin";
      setIsAdmin(isUserAdmin);

      const db = await getDb();
      if (!db) {
        return;
      }

      try {
        const facilityDoc = (await db.get(
          createFacilityDocId(session.facilityId)
        )) as FacilityDoc;
        setFacilityName(facilityDoc.name || session.facilityId);
        setFacilityLocation(
          [facilityDoc.state, facilityDoc.lga].filter(Boolean).join(" • ")
        );
        if (isUserAdmin) {
          setJoinCode(facilityDoc.joinCode);
          const staffResult = await db.allDocs({
            include_docs: true,
            startkey: "localUser:",
            endkey: "localUser:\uffff"
          });
          const staffDocs = staffResult.rows
            .map((row) => row.doc as LocalUserDoc | undefined)
            .filter(
              (doc): doc is LocalUserDoc =>
                !!doc && doc.type === "localUser" && doc.facilityId === session.facilityId
            )
            .sort((a, b) => a.displayName.localeCompare(b.displayName))
            .slice(0, 5);
          setStaff(staffDocs);
        } else {
          setJoinCode("");
          setStaff([]);
        }
      } catch (error) {
        setJoinCode("");
        setStaff([]);
        setFacilityName(session.facilityId);
        setFacilityLocation("");
      }
    };

    loadFacility();
  }, []);

  useEffect(() => {
    const loadHeroStats = async () => {
      const session = getSession();
      if (!session) {
        return;
      }
      const db = await getDb();
      if (!db) {
        return;
      }

      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const isToday = (value?: string) => {
        if (!value) {
          return false;
        }
        const date = new Date(value);
        return date >= startOfDay && date <= endOfDay;
      };

      try {
        const [patientsResult, encountersResult, queueResult, labResult, rxResult] =
          await Promise.all([
          db.allDocs({ include_docs: true, startkey: "patient:", endkey: "patient:\uffff" }),
          db.allDocs({ include_docs: true, startkey: "encounter:", endkey: "encounter:\uffff" }),
          db.allDocs({ include_docs: true, startkey: "queue:", endkey: "queue:\uffff" }),
          db.allDocs({ include_docs: true, startkey: "labOrder:", endkey: "labOrder:\uffff" }),
          db.allDocs({ include_docs: true, startkey: "prescription:", endkey: "prescription:\uffff" })
        ]);

        const totalPatients = patientsResult.rows
          .map((row) => row.doc as PatientDoc | undefined)
          .filter(
            (doc): doc is PatientDoc =>
              !!doc &&
              doc.type === "patient" &&
              doc.facilityId === session.facilityId
          ).length;
        const patientsToday = patientsResult.rows
          .map((row) => row.doc as PatientDoc | undefined)
          .filter(
            (doc): doc is PatientDoc =>
              !!doc &&
              doc.type === "patient" &&
              doc.facilityId === session.facilityId &&
              isToday(doc.createdAt)
          ).length;

        const encounterDocs = encountersResult.rows
          .map((row) => row.doc as EncounterDoc | undefined)
          .filter(
            (doc): doc is EncounterDoc =>
              !!doc &&
              doc.type === "encounter" &&
              doc.facilityId === session.facilityId
          );
        const encountersToday = encounterDocs.filter((doc) =>
          isToday(doc.occurredAt || doc.encounterDateTime || doc.createdAt)
        ).length;
        const encountersThisMonth = encounterDocs.filter((doc) => {
          const date = new Date(doc.occurredAt || doc.encounterDateTime || doc.createdAt);
          return date >= startOfMonth && date <= endOfMonth;
        }).length;

        const queueDocs = queueResult.rows
          .map((row) => row.doc as QueueItemDoc | undefined)
          .filter(
            (doc): doc is QueueItemDoc =>
              !!doc &&
              doc.type === "queueItem" &&
              doc.facilityId === session.facilityId
          );
        const waitingQueueDocs = queueDocs.filter(
          (doc) =>
            isToday(doc.createdAt) &&
            (doc.status === "waiting" || doc.status === "registered")
        );
        const queueWaiting = waitingQueueDocs.length;
        const averageQueueWaitMinutes =
          waitingQueueDocs.length === 0
            ? 0
            : Math.round(
                waitingQueueDocs.reduce((total, doc) => {
                  const createdAt = new Date(doc.createdAt);
                  const diffMinutes = Math.max(0, (now.getTime() - createdAt.getTime()) / 60000);
                  return total + diffMinutes;
                }, 0) / waitingQueueDocs.length
              );

        const labPending = labResult.rows
          .map((row) => row.doc as LabOrderDoc | undefined)
          .filter(
            (doc): doc is LabOrderDoc =>
              !!doc &&
              doc.type === "labOrder" &&
              doc.facilityId === session.facilityId &&
              doc.status !== "resulted"
          ).length;
        const prescriptionsPending = rxResult.rows
          .map((row) => row.doc as PrescriptionDoc | undefined)
          .filter(
            (doc): doc is PrescriptionDoc =>
              !!doc &&
              doc.type === "prescription" &&
              doc.facilityId === session.facilityId &&
              doc.status !== "dispensed"
          ).length;

        setHeroStats({
          patientsToday,
          encountersToday,
          queueWaiting,
          labPending
        });
        setDashboardStats({
          totalPatients,
          encountersThisMonth,
          prescriptionsPending,
          averageQueueWaitMinutes
        });
      } catch (error) {
        setHeroStats({
          patientsToday: 0,
          encountersToday: 0,
          queueWaiting: 0,
          labPending: 0
        });
        setDashboardStats({
          totalPatients: 0,
          encountersThisMonth: 0,
          prescriptionsPending: 0,
          averageQueueWaitMinutes: 0
        });
      }
    };

    loadHeroStats();
  }, []);

  useEffect(() => {
    const loadActivity = async () => {
      const session = getSession();
      if (!session) {
        return;
      }
      const db = await getDb();
      if (!db) {
        return;
      }

      try {
        const result = await db.allDocs({
          include_docs: true,
          startkey: "audit:",
          endkey: "audit:\uffff"
        });
        const docs = result.rows
          .map((row) => row.doc as AuditEventDoc | undefined)
          .filter(
            (doc): doc is AuditEventDoc =>
              !!doc && doc.type === "audit" && doc.facilityId === session.facilityId
          )
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .slice(0, 6);

        const mapped = docs.map((event) => {
          const label =
            event.summary ||
            `${event.entityType} ${event.action.replace("encounter.", "").replace(".", " ")}`;
          const type: "patient" | "encounter" | "lab" | "sync" =
            event.entityType === "patient"
              ? "patient"
              : event.entityType === "labOrder"
                ? "lab"
                : event.entityType === "encounter"
                  ? "encounter"
                  : "sync";
          const href =
            event.entityType === "patient"
              ? `/dashboard/patients/${event.entityId}`
              : event.entityType === "encounter"
                ? event.metadata?.patientId
                  ? `/dashboard/patients/${event.metadata.patientId}/encounters/${event.entityId}`
                  : undefined
                : event.entityType === "labOrder"
                  ? `/dashboard/lab/orders/${event.entityId}`
                  : undefined;
          return {
            id: event.auditId,
            label,
            time: formatRelativeTime(event.createdAt),
            type,
            href
          };
        });

        setActivityItems(mapped);
      } catch (error) {
        setActivityItems([]);
      }
    };

    loadActivity();
  }, []);

  const handleCopy = async () => {
    if (!joinCode) {
      return;
    }
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopyMessage("Join code copied.");
      setTimeout(() => setCopyMessage(""), 2000);
    } catch (error) {
      setCopyMessage("Unable to copy join code.");
      setTimeout(() => setCopyMessage(""), 2000);
    }
  };

  const heroHighlights = [
    { label: "Patients today", value: String(heroStats.patientsToday), tone: "positive" },
    { label: "Active encounters", value: String(heroStats.encountersToday), tone: "attention" },
    { label: "Queue waiting", value: String(heroStats.queueWaiting), tone: "neutral" },
    { label: "Lab pending", value: String(heroStats.labPending), tone: "attention" }
  ];

  const syncStatusLabel = (() => {
    switch (syncSnapshot.status) {
      case "local-only":
        return "Local only";
      case "active":
        return "Syncing";
      case "paused":
        return "Offline";
      case "uptodate":
        return "Synced";
      case "error":
        return "Error";
      default:
        return "Idle";
    }
  })();

  const syncStatusLevel: "healthy" | "warning" | "critical" =
    syncSnapshot.status === "error"
      ? "critical"
      : syncSnapshot.status === "paused" || syncSnapshot.status === "active"
        ? "warning"
        : "healthy";

  const dashboardMetrics = [
    {
      label: "Patients Today",
      value: heroStats.patientsToday,
      status: "healthy" as const,
      description: "New registrations today"
    },
    {
      label: "Encounters Today",
      value: heroStats.encountersToday,
      status: heroStats.encountersToday > 0 ? ("warning" as const) : ("healthy" as const),
      description: "Visits captured today"
    },
    {
      label: "Queue Wait Time",
      value: dashboardStats.averageQueueWaitMinutes,
      unit: "min",
      status: dashboardStats.averageQueueWaitMinutes > 20 ? ("warning" as const) : ("healthy" as const),
      description: "Avg. wait for registered patients"
    },
    {
      label: "Sync Status",
      value: syncStatusLabel,
      status: syncStatusLevel,
      description: syncSnapshot.lastSyncAt
        ? `Last sync ${new Date(syncSnapshot.lastSyncAt).toLocaleTimeString()}`
        : "Sync status from device"
    }
  ];

  const statsGrid = [
    {
      id: "patients-total",
      title: "Registered Patients",
      value: dashboardStats.totalPatients,
      metadata: "Active local records"
    },
    {
      id: "encounters-month",
      title: "Encounters This Month",
      value: dashboardStats.encountersThisMonth,
      metadata: "Facility visits"
    },
    ...(sessionRole === "admin" || sessionRole === "lab"
      ? [
          {
            id: "lab-pending",
            title: "Lab Orders Pending",
            value: heroStats.labPending,
            metadata: "Awaiting results"
          }
        ]
      : []),
    ...(sessionRole === "admin" || sessionRole === "pharmacy"
      ? [
          {
            id: "rx-pending",
            title: "Prescriptions Pending",
            value: dashboardStats.prescriptionsPending,
            metadata: "Awaiting dispense"
          }
        ]
      : [])
  ];

  const canRegisterPatients = sessionRole
    ? ["admin", "records", "nurse", "clinician"].includes(sessionRole)
    : false;
  const canViewLab = sessionRole ? ["admin", "lab", "clinician"].includes(sessionRole) : false;
  const canViewPharmacy = sessionRole
    ? ["admin", "pharmacy", "clinician"].includes(sessionRole)
    : false;
  const showSystemHealth = sessionRole === "admin";

  return (
    <main className="dashboard-page" aria-labelledby="dashboard-title">
      <section className="dashboard-hero">
        <div className="dashboard-hero__main">
          <p className="dashboard-hero__eyebrow">Facility Dashboard</p>
          <h1 id="dashboard-title" className="dashboard-hero__title">
            Facility Operations Dashboard
          </h1>
          <p className="dashboard-hero__subtitle">
            Real-time insights into clinic activities and system health
          </p>
          <div className="dashboard-hero__highlights">
            {heroHighlights.map((item) => (
              <div key={item.label} className={`dashboard-hero__pill ${item.tone}`}>
                <span className="dashboard-hero__pill-value">{item.value}</span>
                <span className="dashboard-hero__pill-label">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="dashboard-hero__summary">
            <div className="dashboard-hero__card">
              <p className="profile-label">Facility</p>
              <p className="profile-value">{facilityName || "Loading"}</p>
            </div>
            <div className="dashboard-hero__card">
              <p className="profile-label">Location</p>
              <p className="profile-value">{facilityLocation || "Not set"}</p>
            </div>
            <div className="dashboard-hero__card">
              <p className="profile-label">Active user</p>
              <p className="profile-value">
                {displayName || "Loading"} {roleLabel ? `(${roleLabel})` : ""}
              </p>
            </div>
            <div className="dashboard-hero__card">
              <p className="profile-label">Today</p>
              <p className="profile-value">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="dashboard-hero__actions">
            {canRegisterPatients ? (
              <a href="/dashboard/patients?new=1" className="button primary">
                Register patient
              </a>
            ) : null}
            <a href="/dashboard/encounters" className="button secondary">
              View encounters
            </a>
            <a href="/dashboard/queues" className="button secondary">
              View queues
            </a>
          </div>
        </div>
        <div className="dashboard-hero__aside">
          {isAdmin ? (
            <div className="dashboard-header__join">
              <span className="profile-label">Join code</span>
              <span className="profile-value">{joinCode || "Unavailable"}</span>
              <div className="actions-row">
                <button className="button secondary small" type="button" onClick={handleCopy}>
                  Copy
                </button>
                <a className="button ghost small" href="/dashboard/facility">
                  Manage
                </a>
              </div>
              {copyMessage ? (
                <span className="form-helper" role="status">
                  {copyMessage}
                </span>
              ) : null}
            </div>
          ) : (
            <div className="dashboard-hero__note">
              <p className="profile-label">Join code</p>
              <p className="form-helper">Admin access required to manage join codes.</p>
            </div>
          )}
        </div>
      </section>

      {/* Health Status Banner */}
      <div className="dashboard-section">
        <HealthStatus
          status="operational"
          uptime="99.9% (Last 30 days)"
          lastSync="Just now"
          actions={<button className="button secondary small">Force Sync</button>}
        />
      </div>

      {/* Key Metrics */}
      <div className="dashboard-section">
        <h2 className="section-heading">Today's Metrics</h2>
        <div className="metrics-grid">
          {dashboardMetrics.map((metric, idx) => (
            <MetricCard key={idx} {...metric} />
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-section">
        <StatsGrid stats={statsGrid} columns={4} />
      </div>

      {/* Activity and Queue Section */}
      <div className="dashboard-section">
        <div className="dashboard-grid-2">
          <ActivityCard
            title="Recent Activity"
            items={
              activityItems.length
                ? activityItems
                : [
                    {
                      id: "empty",
                      label: "No recent activity yet.",
                      time: "",
                      type: "sync" as const
                    }
                  ]
            }
            viewAllHref="/dashboard/encounters"
          />
          <div className="card">
            <h3 className="card__title">Facility staff</h3>
            {isAdmin ? (
              <div className="staff-card">
                {staff.length === 0 ? (
                  <p className="form-helper">No staff members yet. Share the join code to add staff.</p>
                ) : (
                  <ul className="staff-list">
                    {staff.map((member) => (
                      <li key={member._id} className="staff-item">
                        <div>
                          <p className="profile-value">{member.displayName}</p>
                          <p className="form-helper">{member.role}</p>
                        </div>
                        <span className="status-badge status-badge--captured">Active</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="actions-row" style={{ marginTop: "0.75rem" }}>
                  <a className="button secondary small" href="/dashboard/facility">
                    Manage staff
                  </a>
                </div>
              </div>
            ) : (
              <p className="form-helper">Admin access required to view staff list.</p>
            )}
          </div>
        </div>
      </div>

      {/* Compliance & Data Integrity */}
      {showSystemHealth ? (
        <div className="dashboard-section">
          <h2 className="section-heading">System Health</h2>
          <div className="dashboard-grid-2">
            <div className="card">
              <h3 className="card__title">Compliance Status</h3>
              <div className="compliance-list">
              <div className="compliance-item">
                  <span className="compliance-check">{"\u2713"}</span>
                  <span>Consent forms captured</span>
                  <span className="compliance-percent">98%</span>
                </div>
                <div className="compliance-item">
                  <span className="compliance-check">{"\u2713"}</span>
                  <span>Audit logs verified</span>
                  <span className="compliance-percent">100%</span>
                </div>
                <div className="compliance-item">
                  <span className="compliance-check">{"\u2713"}</span>
                  <span>Data integrity checks</span>
                  <span className="compliance-percent">99.9%</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="card__title">Storage & Sync</h3>
              <div className="storage-info">
                <div className="storage-bar">
                  <div className="storage-bar__fill" style={{ width: "67%" }}></div>
                </div>
                <p className="storage-text">6.7 GB of 10 GB used (67%)</p>
                <p className="storage-subtext">Last backup: 2 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2 className="section-heading">Quick Actions</h2>
        <div className="quick-actions">
          {canRegisterPatients ? (
            <a href="/dashboard/patients/new" className="button primary">
              Register New Patient
            </a>
          ) : null}
          <a href="/dashboard/encounters" className="button secondary">
            View Encounters
          </a>
          {canViewLab ? (
            <a href="/dashboard/lab" className="button secondary">
              Lab Orders
            </a>
          ) : null}
          {canViewPharmacy ? (
            <a href="/dashboard/pharmacy" className="button secondary">
              Pharmacy
            </a>
          ) : null}
          {isAdmin ? (
            <a href="/dashboard/admin" className="button secondary">
              Settings
            </a>
          ) : null}
        </div>
      </div>
    </main>
  );
}





