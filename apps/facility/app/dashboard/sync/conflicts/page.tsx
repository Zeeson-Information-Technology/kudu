"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDb } from "../../../../src/lib/offline/db";

type ConflictRegistryDoc = {
  _id: string;
  type: "meta";
  conflictIds: string[];
  updatedAt: string;
};

type ConflictRow = {
  id: string;
  type: string;
  updatedAt?: string;
  payload?: unknown;
};

export default function ConflictsPage() {
  const [rows, setRows] = useState<ConflictRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadConflicts = async () => {
      const db = await getDb();
      if (!db) {
        setError("Offline database is not available in this environment.");
        return;
      }

      try {
        const meta = (await db.get("meta:conflicts")) as ConflictRegistryDoc;
        if (!meta.conflictIds || meta.conflictIds.length === 0) {
          setRows([]);
          return;
        }

        const items = await Promise.all(
          meta.conflictIds.map(async (id) => {
            try {
              const doc = await db.get(id, { conflicts: true });
              return {
                id,
                type: (doc as any).type ?? "unknown",
                updatedAt: (doc as any).updatedAt,
                payload: doc
              } as ConflictRow;
            } catch (loadError) {
              return { id, type: "unknown" } as ConflictRow;
            }
          })
        );

        setRows(items);
      } catch (loadError: any) {
        if (loadError?.status !== 404) {
          setError("Unable to load conflict registry.");
        }
        setRows([]);
      }
    };

    loadConflicts();
  }, []);

  const handleCopy = async (row: ConflictRow) => {
    if (!row.payload) {
      return;
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(row.payload, null, 2));
    } catch (copyError) {
      setError("Unable to copy conflict JSON.");
    }
  };

  return (
    <main aria-labelledby="conflicts-title">
      <div className="card">
        <span className="tag">Sync</span>
        <h2 id="conflicts-title">Sync conflicts</h2>
        <p>
          Conflicts can happen when the same record is edited on multiple devices offline. Kudu
          preserves all versions. Review is required before final resolution.
        </p>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        {rows.length === 0 ? (
          <div className="empty-state">
            <h3>No conflicts detected.</h3>
          </div>
        ) : (
          <div className="registry-shell">
            <table className="registry-table">
              <thead>
                <tr>
                  <th scope="col">Doc ID</th>
                  <th scope="col">Type</th>
                  <th scope="col">Updated</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.type}</td>
                    <td>{row.updatedAt ? new Date(row.updatedAt).toLocaleString() : "Unknown"}</td>
                    <td>
                      <div className="actions-row">
                        <button
                          type="button"
                          className="button secondary table-action"
                          onClick={() => handleCopy(row)}
                        >
                          Copy JSON
                        </button>
                        {row.id.startsWith("patient:") ? (
                          <Link
                            className="button secondary table-action"
                            href={`/dashboard/patients/${row.id.replace("patient:", "")}`}
                          >
                            Open patient
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {error ? (
          <p className="form-helper" role="status" style={{ marginTop: "1rem" }}>
            {error}
          </p>
        ) : null}
      </div>
    </main>
  );
}
