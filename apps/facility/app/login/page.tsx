"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getDb } from "../../src/lib/offline/db";
import type { FacilityDoc, LocalUserDoc } from "../../src/lib/offline/schema";
import { createFacilityDocId } from "../../src/lib/offline/schema";
import { getSession, setSession } from "../../src/lib/session";

type FacilityRecord = FacilityDoc & { _rev?: string };
type LocalUserRecord = LocalUserDoc & { disabled?: boolean };

export default function LoginPage() {
  const router = useRouter();
  const [facility, setFacility] = useState<FacilityRecord | null>(null);
  const [facilities, setFacilities] = useState<FacilityRecord[]>([]);
  const [users, setUsers] = useState<LocalUserRecord[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getSession();
    if (session) {
      router.replace("/dashboard");
      return;
    }

    const load = async () => {
      const db = await getDb();
      if (!db) {
        setError("Offline database is not available in this environment.");
        return;
      }

      try {
        const facilityResult = await db.allDocs({
          include_docs: true,
          startkey: "facility:",
          endkey: "facility:\uffff"
        });
        const facilityDocs = facilityResult.rows
          .map((row) => row.doc as FacilityRecord | undefined)
          .filter((doc): doc is FacilityRecord => !!doc && doc.type === "facility")
          .sort((a, b) => a.name.localeCompare(b.name));

        setFacilities(facilityDocs);
        const primaryFacility = facilityDocs[0] ?? null;
        setFacility(primaryFacility);

        if (!primaryFacility) {
          setUsers([]);
          return;
        }

        const usersResult = await db.allDocs({
          include_docs: true,
          startkey: "localUser:",
          endkey: "localUser:\uffff"
        });

        const userDocs = usersResult.rows
          .map((row) => row.doc as LocalUserRecord | undefined)
          .filter(
            (doc): doc is LocalUserRecord =>
              !!doc &&
              doc.type === "localUser" &&
              doc.facilityId === primaryFacility.facilityId &&
              !doc.disabled
          )
          .sort((a, b) => a.displayName.localeCompare(b.displayName));

        setUsers(userDocs);
      } catch (loadError) {
        setError("Unable to load facility users.");
      }
    };

    load();
  }, [router]);

  const handleFacilityChange = async (facilityId: string) => {
    const nextFacility = facilities.find((doc) => doc.facilityId === facilityId) ?? null;
    setFacility(nextFacility);

    const db = await getDb();
    if (!db || !nextFacility) {
      setUsers([]);
      return;
    }

    const usersResult = await db.allDocs({
      include_docs: true,
      startkey: "localUser:",
      endkey: "localUser:\uffff"
    });

    const userDocs = usersResult.rows
      .map((row) => row.doc as LocalUserRecord | undefined)
      .filter(
        (doc): doc is LocalUserRecord =>
          !!doc &&
          doc.type === "localUser" &&
          doc.facilityId === nextFacility.facilityId &&
          !doc.disabled
      )
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    setUsers(userDocs);
  };

  const handleSelectUser = (user: LocalUserRecord) => {
    if (user.pinEnabled) {
      router.push(`/login/pin?userId=${user.userId}`);
      return;
    }

    setSession({
      facilityId: user.facilityId,
      role: user.role,
      displayName: user.displayName,
      userId: user.userId
    });
    router.push("/dashboard");
  };

  const facilityOptions = useMemo(() => facilities, [facilities]);

  return (
    <main className="auth-shell auth-shell--premium" role="main">
      <section className="auth-layout" aria-labelledby="login-title">
        <div className="auth-panel">
          <div className="auth-panel__brand-band">
            <div className="auth-panel__brand">
              <img
                src="/brand/logo-lockup.png"
                alt="Kudu Health"
                className="auth-logo auth-logo--panel"
              />
              <span className="auth-panel__badge">Facility App</span>
            </div>
          </div>
          <p className="auth-panel__subtitle">
            Offline-first primary care workflows with secure local records and auditable activity.
          </p>
          <div className="auth-meta">
            <span className="auth-pill">Offline-first</span>
            <span className="auth-pill">NHIA / NDPR aligned</span>
          </div>
          <div className="auth-panel__footer">
            <p className="form-helper">
              Designed for shared devices in low‑connectivity settings.
            </p>
          </div>
        </div>
        <div className="auth-card auth-card--wide">
          <h1 id="login-title">Select a user</h1>
          <p>
            This device may be shared. Choose who is using it now to start a secure, auditable
            session.
          </p>

        {facilityOptions.length > 1 ? (
          <div className="form-field">
            <label className="form-label" htmlFor="facility">
              Facility
            </label>
            <select
              className="form-select"
              id="facility"
              name="facility"
              value={facility?.facilityId ?? ""}
              onChange={(event) => handleFacilityChange(event.target.value)}
            >
              {facilityOptions.map((item) => (
                <option key={item.facilityId} value={item.facilityId}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        ) : facility ? (
          <div className="profile-grid" style={{ marginBottom: "1.5rem" }}>
            <div>
              <p className="profile-label">Facility</p>
              <p className="profile-value">{facility.name}</p>
            </div>
            <div>
              <p className="profile-label">Facility ID</p>
              <p className="profile-value">{facility.facilityId}</p>
            </div>
          </div>
        ) : null}

        {facility ? (
          <div className="staff-card">
            <div className="staff-card__header">
              <h2>Active staff</h2>
              <span className="tag">Shared device</span>
            </div>
            {users.length === 0 ? (
              <p className="form-helper">
                No users found. Add staff from the Facility Admin page.
              </p>
            ) : (
              <ul className="staff-list">
                {users.map((user) => (
                  <li key={user._id} className="staff-item">
                    <div>
                      <p className="profile-value">{user.displayName}</p>
                      <p className="form-helper">
                        {user.role}
                        {user.disabled ? " • Disabled" : ""}
                      </p>
                    </div>
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => handleSelectUser(user)}
                    >
                      {user.disabled ? "Disabled" : user.pinEnabled ? "Enter PIN" : "Select"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="form-helper">
            No facility found. Create a facility to begin onboarding.
          </p>
        )}

        {error ? (
          <p className="form-helper" role="status" style={{ marginTop: "1rem" }}>
            {error}
          </p>
        ) : null}

        {!facility ? (
          <div style={{ marginTop: "1.5rem" }}>
            <button
              className="button primary"
              type="button"
              onClick={() => router.push("/onboarding/create-facility")}
            >
              Create facility
            </button>
          </div>
        ) : null}

          <div className="auth-footer">
            <p className="form-helper">
              Need access? Ask a facility admin to share the join code.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
