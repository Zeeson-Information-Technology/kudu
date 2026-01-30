"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Modal from "../../../src/components/Modal";
import { RoleGate } from "../../../src/components/RoleGate";
import { createJoinCode } from "../../../src/lib/id";
import { getSession } from "../../../src/lib/session";
import { getDb, startSync, subscribeToSync, type SyncSnapshot } from "../../../src/lib/offline/db";
import type { FacilityDoc, LocalUserDoc } from "../../../src/lib/offline/schema";
import { createFacilityDocId } from "../../../src/lib/offline/schema";

type LocalUserRecord = LocalUserDoc & {
  _rev?: string;
  disabled?: boolean;
  updatedAt?: string;
};

type FacilityRecord = FacilityDoc & {
  _rev?: string;
};

type ConflictRegistryDoc = {
  _id: string;
  type: "meta";
  conflictIds: string[];
  updatedAt: string;
};

const roleOptions: LocalUserDoc["role"][] = [
  "admin",
  "records",
  "nurse",
  "clinician",
  "lab",
  "pharmacy"
];

const statusLabel = (user: LocalUserRecord) => (user.disabled ? "Disabled" : "Active");

export default function FacilityAdminPage() {
  const [facility, setFacility] = useState<FacilityRecord | null>(null);
  const [staff, setStaff] = useState<LocalUserRecord[]>([]);
  const [syncSnapshot, setSyncSnapshot] = useState<SyncSnapshot>({
    status: "idle",
    hasConflicts: false
  });
  const [loadError, setLoadError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [joinMessage, setJoinMessage] = useState("");
  const [conflictCount, setConflictCount] = useState<number>(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinTarget, setPinTarget] = useState<LocalUserRecord | null>(null);
  const [pinValue, setPinValue] = useState("");
  const [pinMessage, setPinMessage] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [saveState, setSaveState] = useState<Record<string, "idle" | "saving" | "saved" | "error">>(
    {}
  );

  useEffect(() => {
    const unsubscribe = subscribeToSync((snapshot) => setSyncSnapshot(snapshot));
    startSync();
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      const session = getSession();
      if (!session) {
        setLoadError("Facility session is required.");
        return;
      }

      const db = await getDb();
      if (!db) {
        setLoadError("Offline database is not available in this environment.");
        return;
      }

      try {
        const facilityDoc = (await db.get(createFacilityDocId(session.facilityId))) as FacilityRecord;
        setFacility(facilityDoc);

        try {
          const conflicts = (await db.get("meta:conflicts")) as ConflictRegistryDoc;
          setConflictCount(conflicts.conflictIds?.length ?? 0);
        } catch (error) {
          setConflictCount(0);
        }

        const staffResult = await db.allDocs({
          include_docs: true,
          startkey: "localUser:",
          endkey: "localUser:\uffff"
        });

        const staffDocs = staffResult.rows
          .map((row) => row.doc as LocalUserRecord | undefined)
          .filter(
            (doc): doc is LocalUserRecord =>
              !!doc && doc.type === "localUser" && doc.facilityId === session.facilityId
          )
          .sort((a, b) => a.displayName.localeCompare(b.displayName));

        setStaff(staffDocs);
      } catch (error) {
        setLoadError("Unable to load facility settings.");
      }
    };

    load();
  }, []);

  const handleCopyJoinCode = async () => {
    if (!facility?.joinCode) {
      return;
    }
    try {
      await navigator.clipboard.writeText(facility.joinCode);
      setCopyMessage("Join code copied.");
      setTimeout(() => setCopyMessage(""), 2000);
    } catch (error) {
      setCopyMessage("Unable to copy join code.");
      setTimeout(() => setCopyMessage(""), 2000);
    }
  };

  const handleRegenerate = async () => {
    if (!facility) {
      return;
    }
    setRegenerating(true);
    setCopyMessage("");
    setJoinMessage("");
    try {
      const db = await getDb();
      if (!db) {
        setCopyMessage("Offline database is not available in this environment.");
        return;
      }
      const updated = {
        ...facility,
        joinCode: createJoinCode(),
        joinCodeRotatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const result = await db.put({ ...updated, _rev: facility._rev });
      setFacility({ ...updated, _rev: result.rev });
      setJoinMessage("Join code regenerated successfully.");
      setConfirmOpen(false);
    } catch (error) {
      setCopyMessage("Unable to regenerate join code.");
    } finally {
      setRegenerating(false);
    }
  };

  const updateRole = (userId: string, role: LocalUserDoc["role"]) => {
    setStaff((prev) =>
      prev.map((user) => (user.userId === userId ? { ...user, role } : user))
    );
  };

  const toggleDisabled = (userId: string) => {
    setStaff((prev) =>
      prev.map((user) =>
        user.userId === userId ? { ...user, disabled: !user.disabled } : user
      )
    );
  };

  const saveUser = async (user: LocalUserRecord) => {
    setSaveState((prev) => ({ ...prev, [user.userId]: "saving" }));

    try {
      const db = await getDb();
      if (!db) {
        setSaveState((prev) => ({ ...prev, [user.userId]: "error" }));
        return;
      }

      const updated = {
        ...user,
        updatedAt: new Date().toISOString()
      };
      const result = await db.put({ ...updated, _rev: user._rev });
      setStaff((prev) =>
        prev.map((row) =>
          row.userId === user.userId ? { ...updated, _rev: result.rev } : row
        )
      );
      setSaveState((prev) => ({ ...prev, [user.userId]: "saved" }));
      setTimeout(() => {
        setSaveState((prev) => ({ ...prev, [user.userId]: "idle" }));
      }, 1500);
    } catch (error) {
      setSaveState((prev) => ({ ...prev, [user.userId]: "error" }));
    }
  };

  const openPinModal = (user: LocalUserRecord) => {
    setPinTarget(user);
    setPinValue("");
    setPinMessage("");
    setPinModalOpen(true);
  };

  const disablePin = async (user: LocalUserRecord) => {
    const db = await getDb();
    if (!db) {
      setPinMessage("Offline database is not available in this environment.");
      return;
    }

    try {
      const updated = {
        ...user,
        pinEnabled: false,
        updatedAt: new Date().toISOString()
      };
      const result = await db.put({ ...updated, _rev: user._rev });
      setStaff((prev) =>
        prev.map((row) =>
          row.userId === user.userId ? { ...updated, _rev: result.rev } : row
        )
      );
    } catch (error) {
      setPinMessage("Unable to disable PIN.");
    }
  };

  const savePin = async () => {
    if (!pinTarget) {
      return;
    }
    if (pinValue.trim().length < 4) {
      setPinMessage("PIN must be at least 4 digits.");
      return;
    }

    const db = await getDb();
    if (!db) {
      setPinMessage("Offline database is not available in this environment.");
      return;
    }

    try {
      const { hashPin } = await import("../../../src/lib/security/pin");
      const hash = await hashPin(pinValue.trim());
      const updated = {
        ...pinTarget,
        pinEnabled: true,
        pinHash: hash,
        pinSetAt: new Date().toISOString()
      };
      const result = await db.put({ ...updated, _rev: pinTarget._rev });
      setStaff((prev) =>
        prev.map((row) =>
          row.userId === pinTarget.userId ? { ...updated, _rev: result.rev } : row
        )
      );
      setPinMessage("PIN updated.");
      setTimeout(() => {
        setPinModalOpen(false);
      }, 800);
    } catch (error) {
      setPinMessage("Unable to update PIN.");
    }
  };

  const staffRows = useMemo(() => {
    if (staff.length === 0) {
      return (
        <tr>
          <td colSpan={5}>
            <div className="empty-state">
              <h3>No staff profiles found.</h3>
              <p>Invite staff to join using the facility join code.</p>
            </div>
          </td>
        </tr>
      );
    }

    return staff.map((user) => {
      const state = saveState[user.userId] ?? "idle";
      return (
        <tr key={user._id}>
        <td>{user.displayName}</td>
        <td>
          <select
            className="form-select"
            value={user.role}
            onChange={(event) => updateRole(user.userId, event.target.value as LocalUserDoc["role"])}
            aria-label={`Role for ${user.displayName}`}
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </td>
        <td>
          {user.pinEnabled ? (
            <span className="status-badge status-badge--active">Enabled</span>
          ) : (
            <span className="info-chip">
              <span className="status-badge status-badge--inactive">Not set</span>
              <span className="info-icon" aria-label="PIN info" role="img">
                i
                <span className="info-tooltip">PIN not set yet. User can log in without PIN.</span>
              </span>
            </span>
          )}
        </td>
        <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "--"}</td>
        <td>
          <span
            className={`status-badge ${
              user.disabled ? "status-badge--inactive" : "status-badge--active"
            }`}
          >
            {statusLabel(user)}
          </span>
        </td>
          <td>
            <div className="actions-row">
              <button className="button secondary" type="button" onClick={() => saveUser(user)}>
                {state === "saving" ? "Saving..." : "Save"}
              </button>
              <button className="button ghost" type="button" onClick={() => toggleDisabled(user.userId)}>
                {user.disabled ? "Enable" : "Disable"}
              </button>
              <button className="button ghost" type="button" onClick={() => openPinModal(user)}>
                {user.pinEnabled ? "Reset PIN" : "Set PIN"}
              </button>
              {user.pinEnabled ? (
                <button className="button ghost" type="button" onClick={() => disablePin(user)}>
                  Disable PIN
                </button>
              ) : null}
            </div>
          </td>
        </tr>
      );
    });
  }, [staff, saveState]);

  if (loadError) {
    return (
      <RoleGate
        allowedRoles={["admin"]}
        title="Admin access required"
        message="Only facility admins can manage facility settings."
      >
        <main aria-labelledby="facility-title">
          <div className="card">
            <h2 id="facility-title">Facility settings</h2>
            <p>{loadError}</p>
            <div style={{ marginTop: "1.5rem" }}>
              <Link href="/onboarding" className="button secondary">
                Go to onboarding
              </Link>
            </div>
          </div>
        </main>
      </RoleGate>
    );
  }

  return (
    <RoleGate
      allowedRoles={["admin"]}
      title="Admin access required"
      message="Only facility admins can manage facility settings."
    >
      <main aria-labelledby="facility-title">
        <div className="card">
        <span className="tag">Facility</span>
        <h2 id="facility-title">Facility settings</h2>
        <p>Manage local facility data and staff access for this device.</p>
      </div>

      <div className="dashboard-grid-2" style={{ marginTop: "1.5rem" }}>
        <div className="card">
          <h3>Facility profile</h3>
          <div className="profile-grid">
            <div>
              <p className="profile-label">Name</p>
              <p className="profile-value">{facility?.name ?? "—"}</p>
            </div>
            <div>
              <p className="profile-label">Facility ID</p>
              <p className="profile-value">{facility?.facilityId ?? "—"}</p>
            </div>
            <div>
              <p className="profile-label">Created</p>
              <p className="profile-value">
                {facility?.createdAt ? new Date(facility.createdAt).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Sync status</h3>
          <p className="form-helper">
            Status: <strong>{syncSnapshot.status}</strong>
          </p>
          <p className="form-helper">
            Last sync: {syncSnapshot.lastSyncAt ? new Date(syncSnapshot.lastSyncAt).toLocaleString() : "—"}
          </p>
          <p className="form-helper">
            Conflicts: {conflictCount > 0 ? conflictCount : "None"}
          </p>
        </div>
      </div>

      <div className="dashboard-grid-2" style={{ marginTop: "1.5rem" }}>
        <div className="card">
          <h3>Join code</h3>
          <p className="profile-value" style={{ fontSize: "1.4rem" }}>
            {facility?.joinCode ?? "—"}
          </p>
          {facility?.joinCodeRotatedAt ? (
            <p className="form-helper">
              Last rotated: {new Date(facility.joinCodeRotatedAt).toLocaleString()}
            </p>
          ) : null}
          <div className="actions-row" style={{ marginTop: "1rem" }}>
            <button className="button secondary" type="button" onClick={handleCopyJoinCode}>
              Copy
            </button>
            <button className="button ghost" type="button" onClick={() => setConfirmOpen(true)}>
              Regenerate
            </button>
          </div>
          {joinMessage ? (
            <p className="form-helper" role="status" style={{ marginTop: "0.75rem" }}>
              {joinMessage}
            </p>
          ) : null}
          {copyMessage ? (
            <p className="form-helper" role="status" style={{ marginTop: "0.75rem" }}>
              {copyMessage}
            </p>
          ) : null}
        </div>

        <div className="card">
          <h3>Notes</h3>
          <p className="form-helper">
            Regenerating the join code will invalidate the old code. Share the new code with staff.
          </p>
          <p className="form-helper">This page only updates local device data (offline-first).</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div className="actions-row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Staff list</h3>
          <Link className="button secondary" href="/onboarding/join">
            Add staff
          </Link>
        </div>
        <div className="registry-shell" style={{ marginTop: "1rem" }}>
          <table className="registry-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Role</th>
                <th scope="col">PIN</th>
                <th scope="col">Created</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>{staffRows}</tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={confirmOpen} title="Regenerate join code" onClose={() => setConfirmOpen(false)}>
        <p>
          This will invalidate the current join code. Staff will need the new code to join this
          facility. Continue?
        </p>
        <div className="actions-row" style={{ marginTop: "1.5rem" }}>
          <button className="button primary" type="button" onClick={handleRegenerate} disabled={regenerating}>
            {regenerating ? "Regenerating..." : "Yes, regenerate"}
          </button>
          <button className="button secondary" type="button" onClick={() => setConfirmOpen(false)}>
            Cancel
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={pinModalOpen}
        title={`Set PIN for ${pinTarget?.displayName ?? "staff"}`}
        onClose={() => setPinModalOpen(false)}
      >
        <div className="form-field">
          <label className="form-label" htmlFor="pinValue">
            PIN
          </label>
          <input
            className="form-input"
            id="pinValue"
            name="pinValue"
            type="password"
            inputMode="numeric"
            value={pinValue}
            onChange={(event) => setPinValue(event.target.value)}
            placeholder="Enter 4+ digits"
          />
        </div>
        {pinMessage ? (
          <p className="form-helper" role="status">
            {pinMessage}
          </p>
        ) : null}
        <div className="actions-row" style={{ marginTop: "1.5rem" }}>
          <button className="button primary" type="button" onClick={savePin}>
            Save PIN
          </button>
          <button className="button secondary" type="button" onClick={() => setPinModalOpen(false)}>
            Cancel
          </button>
        </div>
      </Modal>
      </main>
    </RoleGate>
  );
}

