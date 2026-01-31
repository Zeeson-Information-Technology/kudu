"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getDb } from "../../../../src/lib/offline/db";
import { createDrugDocId } from "../../../../src/lib/offline/schema";
import type { DrugDoc } from "../../../../src/lib/offline/schema";
import { createDrugId } from "../../../../src/lib/id";
import { getSession } from "../../../../src/lib/session";
import { nigeriaEssentialDrugs } from "../../../../src/lib/data/ng-drugs";
import { RoleGate } from "../../../../src/components/RoleGate";

type DrugRow = DrugDoc & { _rev?: string };

const toNumber = (value: string) => (value.trim() ? Number.parseFloat(value) : 0);

export default function DrugCatalogPage() {
  const [rows, setRows] = useState<DrugRow[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const [newDrug, setNewDrug] = useState({
    name: "",
    form: "",
    strength: "",
    unitLabel: "",
    unitPriceNgn: ""
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const seedDefaults = async () => {
    setError("");
    const db = await getDb();
    if (!db) {
      setError("Offline database is not available in this environment.");
      return;
    }
    const session = getSession();
    if (!session) {
      setError("Facility session is required.");
      return;
    }

    const now = new Date().toISOString();
    const existingKey = new Set(
      rows.map((row) => `${row.name}|${row.form}|${row.strength}`)
    );
    const newDocs: DrugRow[] = [];

    for (const drug of nigeriaEssentialDrugs) {
      const key = `${drug.name}|${drug.form}|${drug.strength}`;
      if (existingKey.has(key)) {
        continue;
      }
      const drugId = createDrugId();
      newDocs.push({
        _id: createDrugDocId(drugId),
        type: "drug",
        drugId,
        facilityId: session.facilityId,
        name: drug.name,
        form: drug.form,
        strength: drug.strength,
        unitLabel: drug.unitLabel,
        unitPriceNgn: drug.unitPriceNgn,
        state: "Kaduna",
        status: "active",
        createdAt: now,
        updatedAt: now
      });
    }

    if (newDocs.length === 0) {
      setImportStatus("Default list already included.");
      return;
    }

    for (const doc of newDocs) {
      await db.put(doc);
    }
    setRows((prev) => [...newDocs, ...prev]);
    setImportStatus(`Default list added: ${newDocs.length} drugs.`);
  };

  useEffect(() => {
    const load = async () => {
      const db = await getDb();
      if (!db) {
        setError("Offline database is not available in this environment.");
        return;
      }
      const session = getSession();
      if (!session) {
        setError("Facility session is required.");
        return;
      }

      try {
        const result = await db.allDocs({
          include_docs: true,
          startkey: "drug:",
          endkey: "drug:\uffff"
        });
        const docs = result.rows
          .map((row) => row.doc as DrugRow | undefined)
          .filter(
            (doc): doc is DrugRow =>
              !!doc &&
              doc.type === "drug" &&
              (!doc.facilityId || doc.facilityId === session.facilityId)
          );

        if (docs.length === 0) {
          const now = new Date().toISOString();
          const seedDocs: DrugRow[] = nigeriaEssentialDrugs.map((drug) => {
            const drugId = createDrugId();
            return {
              _id: createDrugDocId(drugId),
              type: "drug" as const,
              drugId,
              facilityId: session.facilityId,
              name: drug.name,
              form: drug.form,
              strength: drug.strength,
              unitLabel: drug.unitLabel,
              unitPriceNgn: drug.unitPriceNgn,
              state: "Kaduna" as const,
              status: "active" as const,
              createdAt: now,
              updatedAt: now
            };
          });
          for (const doc of seedDocs) {
            await db.put(doc);
          }
          setRows(seedDocs);
          return;
        }

        const missingFacility = docs.filter((doc) => !doc.facilityId);
        if (missingFacility.length > 0) {
          const now = new Date().toISOString();
          for (const doc of missingFacility) {
            await db.put({
              ...doc,
              facilityId: session.facilityId,
              updatedAt: now,
              _rev: (doc as any)._rev
            });
          }
        }

        setRows(docs);
      } catch (loadError) {
        setError("Unable to load drug catalog.");
      }
    };

    load();
  }, []);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return rows;
    }
    return rows.filter((row) =>
      `${row.name} ${row.form} ${row.strength}`.toLowerCase().includes(query)
    );
  }, [rows, search]);

  const updateRow = (drugId: string, patch: Partial<DrugRow>) => {
    setRows((prev) => prev.map((row) => (row.drugId === drugId ? { ...row, ...patch } : row)));
  };

  const saveRow = async (drugId: string) => {
    const db = await getDb();
    if (!db) {
      return;
    }
    const session = getSession();
    if (!session) {
      return;
    }

    const row = rows.find((item) => item.drugId === drugId);
    if (!row) {
      return;
    }
    const now = new Date().toISOString();

    try {
      await db.put({
        ...row,
        unitPriceNgn: Number.isNaN(row.unitPriceNgn) ? 0 : row.unitPriceNgn,
        updatedAt: now,
        facilityId: session.facilityId
      });
      setRows((prev) =>
        prev.map((item) => (item.drugId === drugId ? { ...item, updatedAt: now } : item))
      );
    } catch (saveError) {
      setError("Unable to save drug updates.");
    }
  };

  const addDrug = async () => {
    setError("");
    const db = await getDb();
    if (!db) {
      setError("Offline database is not available in this environment.");
      return;
    }
    const session = getSession();
    if (!session) {
      setError("Facility session is required.");
      return;
    }

    if (!newDrug.name || !newDrug.form || !newDrug.strength || !newDrug.unitLabel) {
      setError("Complete all required drug fields.");
      return;
    }

    const now = new Date().toISOString();
    const drugId = createDrugId();
    const doc: DrugRow = {
      _id: createDrugDocId(drugId),
      type: "drug",
      drugId,
      facilityId: session.facilityId,
      name: newDrug.name.trim(),
      form: newDrug.form.trim(),
      strength: newDrug.strength.trim(),
      unitLabel: newDrug.unitLabel.trim(),
      unitPriceNgn: toNumber(newDrug.unitPriceNgn),
      state: "Kaduna" as const,
      status: "active" as const,
      createdAt: now,
      updatedAt: now
    };

    try {
      await db.put(doc);
      setRows((prev) => [doc, ...prev]);
      setNewDrug({ name: "", form: "", strength: "", unitLabel: "", unitPriceNgn: "" });
    } catch (saveError) {
      setError("Unable to add drug.");
    }
  };

  const parseCsvRow = (line: string) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === "\"") {
        if (inQuotes && line[i + 1] === "\"") {
          current += "\"";
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const handleCsvImport = async (file: File) => {
    setError("");
    setImportStatus("");
    const db = await getDb();
    if (!db) {
      setError("Offline database is not available in this environment.");
      return;
    }
    const session = getSession();
    if (!session) {
      setError("Facility session is required.");
      return;
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length < 2) {
      setError("CSV file must include a header and at least one row.");
      return;
    }

    const header = parseCsvRow(lines[0]).map((col) => col.toLowerCase());
    const columnMap = {
      name: header.indexOf("name"),
      form: header.indexOf("form"),
      strength: header.indexOf("strength"),
      unitLabel: header.indexOf("unit_label"),
      unitPriceNgn: header.indexOf("unit_price_ngn"),
      status: header.indexOf("status")
    };

    if (columnMap.name < 0 || columnMap.form < 0 || columnMap.strength < 0 || columnMap.unitLabel < 0) {
      setError("CSV must include: name, form, strength, unit_label, unit_price_ngn.");
      return;
    }

    const existingMap = new Map(rows.map((row) => [`${row.name}|${row.form}|${row.strength}`, row]));
    const now = new Date().toISOString();
    let createdCount = 0;
    let updatedCount = 0;

    for (const line of lines.slice(1)) {
      const values = parseCsvRow(line);
      const name = values[columnMap.name]?.trim();
      const form = values[columnMap.form]?.trim();
      const strength = values[columnMap.strength]?.trim();
      const unitLabel = values[columnMap.unitLabel]?.trim();
      const unitPriceNgn = toNumber(values[columnMap.unitPriceNgn] ?? "");
      const status = values[columnMap.status]?.trim() || "active";
      const normalizedStatus: DrugRow["status"] =
        status === "inactive" ? "inactive" : "active";

      if (!name || !form || !strength || !unitLabel) {
        continue;
      }

      const key = `${name}|${form}|${strength}`;
      const existing = existingMap.get(key);
      if (existing) {
        const updated = {
          ...existing,
          unitLabel,
          unitPriceNgn,
          status: normalizedStatus,
          updatedAt: now,
          facilityId: session.facilityId
        };
        await db.put({ ...updated, _rev: (existing as any)._rev });
        existingMap.set(key, updated);
        updatedCount += 1;
      } else {
        const drugId = createDrugId();
        const doc: DrugRow = {
          _id: createDrugDocId(drugId),
          type: "drug",
          drugId,
          facilityId: session.facilityId,
          name,
          form,
          strength,
          unitLabel,
          unitPriceNgn,
          state: "Kaduna",
          status: normalizedStatus,
          createdAt: now,
          updatedAt: now
        };
        await db.put(doc);
        existingMap.set(key, doc);
        createdCount += 1;
      }
    }

    setRows(Array.from(existingMap.values()));
    setImportStatus(`Imported: ${createdCount} added, ${updatedCount} updated.`);
  };

  return (
    <RoleGate
      allowedRoles={["admin", "pharmacy"]}
      title="Catalog access required"
      message="Only pharmacy staff or admins can manage the drug catalog."
      backHref="/dashboard/pharmacy"
    >
    <main aria-labelledby="catalog-title">
      <div style={{ marginBottom: "1rem" }}>
        <Link href="/dashboard/pharmacy" className="button ghost">
          <span className="icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="16" height="16" role="presentation">
              <path d="M9.5 3.5 5 8l4.5 4.5" />
            </svg>
          </span>
          Back to pharmacy
        </Link>
      </div>

      <div className="card">
        <span className="tag">Pharmacy</span>
        <h2 id="catalog-title">Drug catalog (Kaduna)</h2>
        <p className="page-subtitle">
          Update unit prices weekly. These values are stored locally and used in prescriptions.
        </p>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div className="actions-row" style={{ justifyContent: "space-between" }}>
          <div>
            <span className="tag">Add drug</span>
            <h3 style={{ marginTop: "0.35rem" }}>Create a new drug entry</h3>
            <p className="form-helper">
              Keep the catalog clean by adding only approved generics.
            </p>
          </div>
          <button
            className={`button ${showAddForm ? "secondary" : "primary"} catalog-cta`}
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
          >
            {showAddForm ? "Close" : "Add drug"}
          </button>
        </div>
        {showAddForm ? (
          <>
            <div className="grid-2" style={{ marginTop: "1rem" }}>
              <div className="form-field">
                <label className="form-label" htmlFor="drugName">
                  Generic name
                </label>
                <input
                  className="form-input"
                  id="drugName"
                  value={newDrug.name}
                  onChange={(event) =>
                    setNewDrug((prev) => ({ ...prev, name: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="drugForm">
                  Form
                </label>
                <input
                  className="form-input"
                  id="drugForm"
                  value={newDrug.form}
                  onChange={(event) =>
                    setNewDrug((prev) => ({ ...prev, form: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="drugStrength">
                  Strength
                </label>
                <input
                  className="form-input"
                  id="drugStrength"
                  value={newDrug.strength}
                  onChange={(event) =>
                    setNewDrug((prev) => ({ ...prev, strength: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="drugUnit">
                  Unit label
                </label>
                <input
                  className="form-input"
                  id="drugUnit"
                  value={newDrug.unitLabel}
                  onChange={(event) =>
                    setNewDrug((prev) => ({ ...prev, unitLabel: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="drugPrice">
                  Unit price (NGN)
                </label>
                <input
                  className="form-input"
                  id="drugPrice"
                  value={newDrug.unitPriceNgn}
                  onChange={(event) =>
                    setNewDrug((prev) => ({ ...prev, unitPriceNgn: event.target.value }))
                  }
                  inputMode="decimal"
                />
              </div>
            </div>
            <div style={{ marginTop: "1.25rem" }}>
              <button
                className="button primary save-button"
                type="button"
                onClick={addDrug}
                style={{ width: "100%", justifyContent: "center" }}
              >
                Save drug
              </button>
            </div>
            {error ? (
              <p className="form-helper" role="status" style={{ marginTop: "1rem" }}>
                {error}
              </p>
            ) : null}
          </>
        ) : null}
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div className="catalog-toolbar">
          <div>
            <span className="tag">Catalog</span>
            <h3 style={{ marginTop: "0.35rem" }}>Drug list</h3>
            <p className="form-helper">
              Keep unit prices current for Kaduna facilities.
            </p>
          </div>
          <div className="catalog-toolbar__search">
            <label className="form-label" htmlFor="catalogSearch">
              Search
            </label>
            <input
              className="form-input"
              id="catalogSearch"
              placeholder="Search by name, form, or strength"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search drugs"
            />
          </div>
        </div>
        <div className="catalog-import">
          <div>
            <label className="form-label" htmlFor="catalogCsv">
              Bulk import (CSV)
            </label>
            <p className="form-helper">
              Headers: name, form, strength, unit_label, unit_price_ngn, status
            </p>
          </div>
          <div className="catalog-import__action">
            <input
              id="catalogCsv"
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  handleCsvImport(file);
                  event.target.value = "";
                }
              }}
            />
          </div>
        </div>
        {importStatus ? (
          <p className="form-helper" role="status" style={{ marginTop: "0.75rem" }}>
            {importStatus}
          </p>
        ) : null}
        <div className="registry-shell" style={{ marginTop: "1rem" }}>
          <table className="registry-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Form</th>
                <th scope="col">Strength</th>
                <th scope="col">Unit</th>
                <th scope="col">Unit price (NGN)</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <h3>{search ? "No drugs match your search." : "No drugs in the catalog yet."}</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row._id}>
                    <td>
                      <input
                        className="form-input"
                        value={row.name}
                        onChange={(event) =>
                          updateRow(row.drugId, { name: event.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="form-input"
                        value={row.form}
                        onChange={(event) =>
                          updateRow(row.drugId, { form: event.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="form-input"
                        value={row.strength}
                        onChange={(event) =>
                          updateRow(row.drugId, { strength: event.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="form-input"
                        value={row.unitLabel}
                        onChange={(event) =>
                          updateRow(row.drugId, { unitLabel: event.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="form-input"
                        value={row.unitPriceNgn?.toString() ?? ""}
                        onChange={(event) =>
                          updateRow(row.drugId, { unitPriceNgn: toNumber(event.target.value) })
                        }
                      />
                    </td>
                    <td>
                      <select
                        className="form-select"
                        value={row.status}
                        onChange={(event) =>
                          updateRow(row.drugId, {
                            status: event.target.value as DrugRow["status"]
                          })
                        }
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="button secondary table-action"
                        type="button"
                        onClick={() => saveRow(row.drugId)}
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
    </RoleGate>
  );
}
