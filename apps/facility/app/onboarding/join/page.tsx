"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createUserId } from "../../../src/lib/id";
import { getDb, startSync } from "../../../src/lib/offline/db";
import { createLocalUserDocId } from "../../../src/lib/offline/schema";
import { setSession } from "../../../src/lib/session";
import type { FacilityDoc } from "../../../src/lib/offline/schema";

const roles = ["records", "nurse", "clinician", "lab", "pharmacy"] as const;

export default function JoinFacilityPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]>("records");
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    startSync();
  }, []);

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const findFacilityByCode = async (code: string) => {
    const db = await getDb();
    if (!db) {
      return null;
    }

    const facilitiesResult = await db.allDocs({
      include_docs: true,
      startkey: "facility:",
      endkey: "facility:\uffff"
    });

    return facilitiesResult.rows
      .map((row) => row.doc as FacilityDoc | undefined)
      .find(
        (doc) =>
          doc &&
          doc.type === "facility" &&
          doc.joinCode.toUpperCase() === code.trim().toUpperCase()
      );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSyncing(true);

    const db = await getDb();
    if (!db) {
      setError("Offline database is not available in this environment.");
      setSyncing(false);
      return;
    }

    try {
      startSync();
      let facility: FacilityDoc | null = null;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        facility = (await findFacilityByCode(joinCode)) ?? null;
        if (facility) {
          break;
        }
        await wait(800);
      }

      if (!facility) {
        setError("Join code not found.");
        setSyncing(false);
        return;
      }

      const userId = createUserId();
      const userDoc = {
        _id: createLocalUserDocId(userId),
        type: "localUser",
        userId,
        facilityId: facility.facilityId,
        role,
        displayName,
        pinEnabled: false,
        createdAt: new Date().toISOString()
      };

      await db.put(userDoc);
      setSession({
        facilityId: facility.facilityId,
        role,
        displayName,
        userId
      });
      router.push("/dashboard");
    } catch (loadError) {
      setError("Unable to join facility.");
      setSyncing(false);
    }
  };

  return (
    <main className="auth-shell auth-shell--premium" aria-labelledby="join-facility-title">
      <section className="auth-layout">
        <div className="auth-panel">
          <div className="auth-panel__brand-band">
            <div className="auth-panel__brand">
              <img
                src="/brand/logo-lockup.png"
                alt="Kudu Health"
                className="auth-logo auth-logo--panel"
              />
              <span className="auth-panel__badge">Facility Staff</span>
            </div>
          </div>
          <p className="auth-panel__subtitle">
            Join your facility with a secure code from the administrator. Your access is scoped to
            this facility and works offline-first.
          </p>
          <div className="auth-meta">
            <span className="auth-pill">Secure join code</span>
            <span className="auth-pill">Shared devices</span>
          </div>
          <div className="auth-panel__footer">
            <p className="form-helper">
              If you do not have a code, ask your facility admin to share one.
            </p>
          </div>
        </div>
        <div className="auth-card auth-card--wide">
          <div style={{ marginBottom: "1rem" }}>
            <a href="/login" className="button ghost">
              <span className="icon" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="16" height="16" role="presentation">
                  <path d="M9.5 3.5 5 8l4.5 4.5" />
                </svg>
              </span>
              Back to login
            </a>
          </div>
          <h1 id="join-facility-title">Join a facility</h1>
          <p className="page-subtitle">Enter the join code provided by your administrator.</p>
          <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem" }}>
            <div className="card">
              <div className="form-field">
                <label className="form-label" htmlFor="joinCode">
                  Join code
                </label>
                <input
                  className="form-input"
                  id="joinCode"
                  name="joinCode"
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="displayName">
                  Your name
                </label>
                <input
                  className="form-input"
                  id="displayName"
                  name="displayName"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="role">
                  Role
                </label>
                <select
                  className="form-select"
                  id="role"
                  name="role"
                  value={role}
                  onChange={(event) => setRole(event.target.value as (typeof roles)[number])}
                >
                  {roles.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {error ? (
              <p className="form-helper" role="status" style={{ marginTop: "1rem" }}>
                {error}
              </p>
            ) : null}
            {syncing ? (
              <p className="form-helper" role="status" style={{ marginTop: "0.5rem" }}>
                Syncing facility list...
              </p>
            ) : null}
            <div style={{ marginTop: "1.5rem" }}>
              <button className="button primary" type="submit">
                Join facility
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
