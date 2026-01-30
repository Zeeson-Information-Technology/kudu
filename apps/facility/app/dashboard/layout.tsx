"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { dashboardNav } from "../../src/lib/nav";
import RoleSwitcher from "../../src/components/RoleSwitcher";
import SyncStatus from "../../src/components/SyncStatus";
import { clearSession, getSession } from "../../src/lib/session";
import type { SessionData } from "../../src/lib/session";
import type { Role } from "../../src/lib/types";
import { getDb } from "../../src/lib/offline/db";
import type { FacilityDoc } from "../../src/lib/offline/schema";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sessionRole, setSessionRole] = useState<SessionData["role"] | null>(null);
  const [facilityName, setFacilityName] = useState<string>("");
  const [facilityLocation, setFacilityLocation] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [sessionReady, setSessionReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    setSessionRole(session.role);
    setDisplayName(session.displayName);
    setSessionReady(true);

    const loadFacility = async () => {
      const db = await getDb();
      if (!db) {
        return;
      }
      try {
        const doc = (await db.get(`facility:${session.facilityId}`)) as FacilityDoc;
        setFacilityName(doc.name);
        setFacilityLocation([doc.state, doc.lga].filter(Boolean).join(" • "));
      } catch (error) {
        setFacilityName("Unknown facility");
        setFacilityLocation("");
      }
    };

    loadFacility();
  }, [router]);

  useEffect(() => {
    if (!sidebarOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  const roleMap: Record<SessionData["role"], Role> = {
    admin: "Admin",
    records: "Records",
    nurse: "Nurse",
    clinician: "Clinician",
    lab: "Lab",
    pharmacy: "Pharmacy"
  };
  const effectiveRole: Role = sessionRole ? roleMap[sessionRole] : "Clinician";
  const displayRole = sessionReady && sessionRole ? roleMap[sessionRole] : "Loading";
  const displayUser =
    sessionReady && displayName ? `${displayName} (${displayRole})` : "Loading user";
  const visibleNav =
    sessionReady && sessionRole
      ? dashboardNav.filter((item) => item.roles.includes(effectiveRole))
      : [];
  const navSections = visibleNav.reduce<Record<string, typeof visibleNav>>((acc, item) => {
    const key = item.section ?? "Main";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className={`dashboard-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="sidebar-brand">
          <img src="/brand/logo-mark.png" alt="Kudu Health" className="sidebar-logo" />
          <h2>Kudu Facility</h2>
        </div>
        <nav>
          {sessionReady
            ? Object.entries(navSections).map(([section, items]) => (
                <div key={section} className="nav-section">
                  {section !== "Main" ? <div className="nav-section__title">{section}</div> : null}
                  <ul className="nav-list">
                    {items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="nav-link"
                          aria-current={pathname === item.href ? "page" : undefined}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            : null}
        </nav>
        <div className="sidebar-footer">Offline-first | Audit-ready</div>
      </aside>
      <button
        type="button"
        className="sidebar-overlay"
        aria-hidden={!sidebarOpen}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="dashboard-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="sidebar-toggle"
              aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((open) => !open)}
            >
              <span className="sidebar-toggle__icon" aria-hidden="true">
                ☰
              </span>
              <img
                src="/brand/logo-mark.png"
                alt=""
                aria-hidden="true"
                className="sidebar-toggle__logo"
              />
            </button>
            <h1>Facility Dashboard</h1>
          </div>
          <div className="topbar-actions">
            <div className="facility-chip">
              Facility: {facilityName || "Loading"}
              {facilityLocation ? ` • ${facilityLocation}` : ""}
              {" | "}
              {displayUser}
            </div>
            <Link
              href="/login"
              className="button ghost"
              onClick={() => clearSession()}
            >
              End session
            </Link>
            {process.env.NEXT_PUBLIC_DEV_TOOLS === "true" ? (
              <Link
                href="/onboarding"
                className="button ghost"
                onClick={() => clearSession()}
              >
                Switch facility (DEV)
              </Link>
            ) : null}
            <SyncStatus />
            {process.env.NEXT_PUBLIC_DEV_TOOLS === "true" ? <RoleSwitcher /> : null}
          </div>
        </header>
        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  );
}
