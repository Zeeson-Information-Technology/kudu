"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getDb, startSync } from "../../src/lib/offline/db";
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
  const [step, setStep] = useState<"facility" | "user">("facility");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("");

  useEffect(() => {
    const session = getSession();
    if (session) {
      router.replace("/dashboard");
      return;
    }

    let changes: any;
    let loadingTimer: ReturnType<typeof setTimeout> | null = null;
    setIsLoading(true);

    const loadFacilities = async (dbOverride?: Awaited<ReturnType<typeof getDb>>) => {
      const db = dbOverride ?? (await getDb());
      if (!db) {
        setError("Offline database is not available in this environment.");
        setIsLoading(false);
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
        const nextSelected =
          facilityDocs.find((doc) => doc.facilityId === selectedFacilityId) ??
          facilityDocs[0] ??
          null;
        setFacility(nextSelected);
        setSelectedFacilityId(nextSelected?.facilityId ?? "");

        if (!nextSelected) {
          setUsers([]);
          setStep("facility");
          setIsLoading(false);
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
              doc.facilityId === nextSelected.facilityId &&
              !doc.disabled
          )
          .sort((a, b) => a.displayName.localeCompare(b.displayName));

        setUsers(userDocs);
        if (facilityDocs.length === 1) {
          setStep("user");
        }
      } catch (loadError) {
        setError("Unable to load facility users.");
      } finally {
        setIsLoading(false);
        if (loadingTimer) {
          clearTimeout(loadingTimer);
          loadingTimer = null;
        }
      }
    };

    const load = async () => {
      loadingTimer = setTimeout(() => {
        setIsLoading(false);
        setError("Sync is taking longer than expected. You can still create a facility.");
      }, 8000);

      const db = await getDb();
      if (!db) {
        setError("Offline database is not available in this environment.");
        setIsLoading(false);
        return;
      }

      await loadFacilities(db);

      try {
        startSync().catch(() => {
          setError("Sync is unavailable. Showing local facilities only.");
        });
      } catch (syncError) {
        setError("Sync is unavailable. Showing local facilities only.");
      }

      try {
        changes = db.changes({ since: "now", live: true });
        changes.on("change", () => {
          loadFacilities(db);
        });
      } catch (changeError) {
        // Ignore changes feed errors.
      }
    };

    load();

    return () => {
      if (changes && typeof changes.cancel === "function") {
        changes.cancel();
      }
      if (loadingTimer) {
        clearTimeout(loadingTimer);
      }
    };
  }, [router]);

  const handleFacilityChange = async (facilityId: string) => {
    const nextFacility = facilities.find((doc) => doc.facilityId === facilityId) ?? null;
    setFacility(nextFacility);
    setSelectedFacilityId(facilityId);

    const db = await getDb();
    if (!db || !nextFacility) {
      setUsers([]);
      setStep("facility");
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
    setStep("user");
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
          <h1 id="login-title">{step === "facility" ? "Choose a facility" : "Select a user"}</h1>
          <p>
            {step === "facility"
              ? "Select the facility this device is working with."
              : "This device may be shared. Choose who is using it now to start a secure, auditable session."}
          </p>

        {isLoading ? (
          <div className="auth-loading" style={{ marginTop: "1.5rem" }}>
            <div className="auth-loader">
              <img src="/brand/loader-mark.svg" alt="" aria-hidden="true" />
            </div>
            <div>
              <h3>Loading facilities...</h3>
              <p className="form-helper">Syncing offline data with the facility database.</p>
            </div>
          </div>
        ) : null}

        {!isLoading && facilityOptions.length > 0 ? (
          <div className="form-field" style={{ marginTop: "1.5rem" }}>
            <label className="form-label" htmlFor="facility">
              Facility
            </label>
            <select
              className="form-select"
              id="facility"
              name="facility"
              value={selectedFacilityId || facility?.facilityId || ""}
              onChange={(event) => handleFacilityChange(event.target.value)}
            >
              {facilityOptions.map((item) => (
                <option key={item.facilityId} value={item.facilityId}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {!isLoading && facilityOptions.length > 0 && step === "facility" ? (
          <div style={{ marginTop: "1.5rem" }}>
            <button
              className="button primary"
              type="button"
              onClick={() => setStep("user")}
            >
              Continue
            </button>
          </div>
        ) : null}

        {!isLoading && facility ? (
          <div className="staff-card">
            <div className="staff-card__header">
              <h2>Active staff</h2>
              <span className="tag">Shared device</span>
            </div>
            {users.length === 0 ? (
              <p className="form-helper">
                No users found. Staff can join this facility with a join code.
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
            <div style={{ marginTop: "1rem" }}>
              <Link className="button secondary" href="/onboarding/join">
                Join this facility
              </Link>
              {step === "user" ? (
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => setStep("facility")}
                  style={{ marginLeft: "0.75rem" }}
                >
                  Change facility
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {!isLoading && facilityOptions.length === 0 ? (
          <p className="form-helper">
            No facility found. Create a facility to begin onboarding.
          </p>
        ) : null}

        {error ? (
          <p className="form-helper" role="status" style={{ marginTop: "1rem" }}>
            {error}
          </p>
        ) : null}

        {!isLoading && facilityOptions.length === 0 ? (
          <div style={{ marginTop: "1.5rem" }}>
            <Link className="button primary" href="/onboarding/create-facility">
              Create facility
            </Link>
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
