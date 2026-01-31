"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createFacilityId, createJoinCode, createUserId } from "../../../src/lib/id";
import { getDb } from "../../../src/lib/offline/db";
import { createFacilityDocId, createLocalUserDocId } from "../../../src/lib/offline/schema";
import { setSession } from "../../../src/lib/session";
import { lgasByState, states, type StateName } from "../../../src/lib/geo/nigeria-lgas";

const STATE_COUNT_KEY = "kudu.facility.stateCounts";

export default function CreateFacilityPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [state, setState] = useState<StateName>("Kaduna");
  const [lga, setLga] = useState("");
  const [code, setCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [stateCounts, setStateCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem(STATE_COUNT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, number>;
        setStateCounts(parsed);
        const sorted = Object.entries(parsed).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0) {
          setState(sorted[0][0] as StateName);
        }
      }
    } catch (loadError) {
      // Ignore invalid data.
    }
  }, []);

  useEffect(() => {
    setLga("");
  }, [state]);

  const orderedStates = useMemo(() => {
    const hasCounts = Object.values(stateCounts).some((count) => count > 0);
    if (!hasCounts) {
      return ["Kaduna", ...states.filter((item) => item !== "Kaduna")];
    }

    return [...states].sort((a, b) => {
      const diff = (stateCounts[b] ?? 0) - (stateCounts[a] ?? 0);
      if (diff !== 0) {
        return diff;
      }
      return a.localeCompare(b);
    });
  }, [stateCounts]);

  const lgaOptions = lgasByState[state] ?? [];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const db = await getDb();
    if (!db) {
      setError("Offline database is not available in this environment.");
      return;
    }

    const facilityId = createFacilityId();
    const userId = createUserId();
    const newJoinCode = createJoinCode();
    const now = new Date().toISOString();

    const facilityDoc = {
      _id: createFacilityDocId(facilityId),
      type: "facility",
      facilityId,
      name,
      state,
      lga,
      code: code || undefined,
      joinCode: newJoinCode,
      createdAt: now,
      updatedAt: now
    };

    const userDoc = {
      _id: createLocalUserDocId(userId),
      type: "localUser",
      userId,
      facilityId,
      role: "admin" as const,
      displayName,
      pinEnabled: false,
      createdAt: now
    };

    try {
      await db.put(facilityDoc);
      await db.put(userDoc);
      setSession({
        facilityId,
        role: "admin",
        displayName,
        userId
      });
      if (typeof window !== "undefined") {
        const nextCounts = {
          ...stateCounts,
          [state]: (stateCounts[state] ?? 0) + 1
        };
        window.localStorage.setItem(STATE_COUNT_KEY, JSON.stringify(nextCounts));
        setStateCounts(nextCounts);
      }
      setJoinCode(newJoinCode);
    } catch (saveError) {
      setError("Unable to save facility setup locally.");
    }
  };

  const handleCopy = async () => {
    if (!joinCode) {
      return;
    }
    try {
      await navigator.clipboard.writeText(joinCode);
    } catch (copyError) {
      setError("Unable to copy join code.");
    }
  };

  if (joinCode) {
    return (
      <main className="auth-shell auth-shell--premium" aria-labelledby="facility-created">
        <section className="auth-layout">
          <div className="auth-panel">
            <div className="auth-panel__brand-band">
              <div className="auth-panel__brand">
                <img
                  src="/brand/logo-lockup.png"
                  alt="Kudu Health"
                  className="auth-logo auth-logo--panel"
                />
                <span className="auth-panel__badge">Facility Admin</span>
              </div>
            </div>
            <p className="auth-panel__subtitle">
              Your facility has been created. Share the join code with team members so they can
              access this site securely.
            </p>
            <div className="auth-meta">
              <span className="auth-pill">Offline-first</span>
              <span className="auth-pill">Shared devices</span>
            </div>
            <div className="auth-panel__footer">
              <p className="form-helper">You can always regenerate the code from Facility Admin.</p>
            </div>
          </div>
          <div className="auth-card auth-card--wide">
            <div style={{ marginBottom: "1rem" }}>
              <Link href="/login" className="button ghost">
                <span className="icon" aria-hidden="true">
                  <svg viewBox="0 0 16 16" width="16" height="16" role="presentation">
                    <path d="M9.5 3.5 5 8l4.5 4.5" />
                  </svg>
                </span>
                Back to login
              </Link>
            </div>
            <h1 id="facility-created">Facility created</h1>
            <p className="page-subtitle">Share this join code with your team.</p>
            <div className="card" style={{ marginTop: "1.5rem" }}>
              <h2>Join code</h2>
              <p className="profile-value" style={{ fontSize: "1.4rem" }}>
                {joinCode}
              </p>
              <div className="actions-row" style={{ marginTop: "1rem" }}>
                <button className="button secondary table-action" type="button" onClick={handleCopy}>
                  Copy
                </button>
                <button
                  className="button primary patient-cta"
                  type="button"
                  onClick={() => router.push("/dashboard")}
                >
                  Continue to dashboard
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-shell auth-shell--premium" aria-labelledby="create-facility-title">
      <section className="auth-layout">
        <div className="auth-panel">
          <div className="auth-panel__brand-band">
            <div className="auth-panel__brand">
              <img
                src="/brand/logo-lockup.png"
                alt="Kudu Health"
                className="auth-logo auth-logo--panel"
              />
              <span className="auth-panel__badge">Facility Admin</span>
            </div>
          </div>
          <p className="auth-panel__subtitle">
            Create a facility profile so staff can join using a secure code. All data remains
            offline-first and auditable.
          </p>
          <div className="auth-meta">
            <span className="auth-pill">Offline-first</span>
            <span className="auth-pill">Shared devices</span>
          </div>
          <div className="auth-panel__footer">
            <p className="form-helper">
              You can update staff roles and join codes later in Facility Admin.
            </p>
          </div>
        </div>
        <div className="auth-card auth-card--wide">
          <div style={{ marginBottom: "1rem" }}>
            <Link href="/login" className="button ghost">
              <span className="icon" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="16" height="16" role="presentation">
                  <path d="M9.5 3.5 5 8l4.5 4.5" />
                </svg>
              </span>
              Back to login
            </Link>
          </div>
          <h1 id="create-facility-title">Create a facility</h1>
          <p className="page-subtitle">Set up a facility profile for onboarding.</p>
          <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem" }}>
            <div className="card">
              <div className="form-field">
                <label className="form-label" htmlFor="name">
                  Facility name
                </label>
                <input
                  className="form-input"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="state">
                  State
                </label>
                <select
                  className="form-select"
                  id="state"
                  name="state"
                  value={state}
                  onChange={(event) => setState(event.target.value as StateName)}
                >
                  {orderedStates.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="lga">
                  LGA
                </label>
                <select
                  className="form-select"
                  id="lga"
                  name="lga"
                  value={lga}
                  onChange={(event) => setLga(event.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select LGA
                  </option>
                  {lgaOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="code">
                  Facility code (optional)
                </label>
                <input
                  className="form-input"
                  id="code"
                  name="code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="displayName">
                  Admin name
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
            </div>
            {error ? (
              <p className="form-helper" role="status" style={{ marginTop: "1rem" }}>
                {error}
              </p>
            ) : null}
            <div style={{ marginTop: "1.5rem" }}>
              <button className="button primary patient-cta" type="submit">
                Create facility
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
