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
    <main className="shell" aria-labelledby="join-facility-title">
      <div style={{ paddingTop: "2rem" }}>
        <h1 id="join-facility-title">Join a facility</h1>
        <p className="page-subtitle">Enter the join code provided by your administrator.</p>
      </div>
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
    </main>
  );
}
