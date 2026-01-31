"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDb } from "../../lib/offline/db";
import { verifyPin } from "../../lib/security/pin";
import { setSession } from "../../lib/session";
import type { FacilityDoc, LocalUserDoc } from "../../lib/offline/schema";
import { createFacilityDocId } from "../../lib/offline/schema";

type LocalUserRecord = LocalUserDoc & { pinEnabled?: boolean };

type PinLoginClientProps = {
  userId?: string | null;
};

export default function PinLoginClient({ userId }: PinLoginClientProps) {
  const router = useRouter();
  const [user, setUser] = useState<LocalUserRecord | null>(null);
  const [facility, setFacility] = useState<FacilityDoc | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!userId) {
        setError("Missing user selection.");
        return;
      }

      const db = await getDb();
      if (!db) {
        setError("Offline database is not available in this environment.");
        return;
      }

      try {
        const userDoc = (await db.get(`localUser:${userId}`)) as LocalUserRecord;
        setUser(userDoc);
        if (!userDoc.pinEnabled) {
          setSession({
            facilityId: userDoc.facilityId,
            role: userDoc.role,
            displayName: userDoc.displayName,
            userId: userDoc.userId
          });
          router.push("/dashboard");
          return;
        }
        const facilityDoc = (await db.get(createFacilityDocId(userDoc.facilityId))) as FacilityDoc;
        setFacility(facilityDoc);
      } catch (loadError) {
        setError("Unable to load user profile.");
      }
    };

    load();
  }, [router, userId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!user) {
      return;
    }

    const ok = await verifyPin(pin, user.pinHash);
    if (!ok) {
      setError("Incorrect PIN.");
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

  return (
    <main className="auth-shell" role="main">
      <section className="auth-card" aria-labelledby="pin-title">
        <h1 id="pin-title">Enter PIN</h1>
        <p>
          {user?.displayName ?? "User"} · {facility?.name ?? "Facility"}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="pin">
              PIN
            </label>
            <input
              className="form-input"
              id="pin"
              name="pin"
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              required
            />
          </div>
          {error ? (
            <div className="form-error" role="alert">
              {error}
            </div>
          ) : null}
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
            <button className="button primary patient-cta" type="submit">
              Continue
            </button>
            <button
              className="button secondary table-action"
              type="button"
              onClick={() => router.push("/login")}
            >
              Back
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
