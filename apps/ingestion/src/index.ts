import "dotenv/config";
import http from "node:http";
import { MongoClient } from "mongodb";
import { z } from "zod";

const envSchema = z.object({
  COUCHDB_URL: z.string().min(1),
  COUCHDB_DB: z.string().min(1),
  MONGODB_URI: z.string().min(1),
  MONGODB_DB: z.string().min(1),
  INGEST_CHECKPOINT_KEY: z.string().default("default"),
  LOG_LEVEL: z.string().default("info")
});

type LogLevel = "debug" | "info" | "warn" | "error";

const env = envSchema.parse({
  COUCHDB_URL: process.env.COUCHDB_URL,
  COUCHDB_DB: process.env.COUCHDB_DB,
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_DB: process.env.MONGODB_DB,
  INGEST_CHECKPOINT_KEY: process.env.INGEST_CHECKPOINT_KEY,
  LOG_LEVEL: process.env.LOG_LEVEL
});

const log = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
  const levels: LogLevel[] = ["debug", "info", "warn", "error"];
  const currentIndex = levels.indexOf((env.LOG_LEVEL as LogLevel) ?? "info");
  const messageIndex = levels.indexOf(level);

  if (messageIndex < currentIndex) {
    return;
  }

  const payload = {
    level,
    message,
    ...meta
  };
  console.log(JSON.stringify(payload));
};

const patientSchema = z.object({
  type: z.literal("patient"),
  patientId: z.string(),
  referenceId: z.string(),
  demographics: z.object({
    firstName: z.string(),
    lastName: z.string(),
    sex: z.string(),
    dateOfBirth: z.string().optional(),
    approxAge: z.number().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    facilityNote: z.string().optional()
  }),
  consent: z.object({
    consentToCreateRecord: z.boolean(),
    consentToShareWithinFacility: z.boolean()
  }),
  createdAt: z.string(),
  updatedAt: z.string()
});

const encounterSchema = z.object({
  type: z.literal("encounter"),
  encounterId: z.string(),
  patientId: z.string(),
  encounterDateTime: z.string(),
  department: z.string(),
  vitals: z.record(z.string(), z.number().optional()).optional(),
  notes: z
    .object({
      chiefComplaint: z.string().optional(),
      clinicalNotes: z.string().optional()
    })
    .optional(),
  diagnosisCodes: z.array(z.string()),
  flags: z.object({
    labRequestNeeded: z.boolean(),
    prescriptionNeeded: z.boolean()
  }),
  createdAt: z.string(),
  updatedAt: z.string()
});

type CouchChange = {
  id: string;
  deleted?: boolean;
  doc?: Record<string, unknown> & { _id?: string; _rev?: string; type?: string };
};

type CheckpointDoc = {
  _id: string;
  key: string;
  lastSeq: string;
  updatedAt: string;
};

const checkpointId = (key: string) => `checkpoint:${key}`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchChanges = async (since: string) => {
  const url = new URL(`${env.COUCHDB_URL}/${env.COUCHDB_DB}/_changes`);
  url.searchParams.set("since", since);
  url.searchParams.set("include_docs", "true");
  url.searchParams.set("limit", "100");
  url.searchParams.set("style", "main_only");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`CouchDB _changes failed: ${response.status}`);
  }

  return (await response.json()) as {
    results: CouchChange[];
    last_seq: string;
  };
};

const buildHealthServer = (getStatus: () => Record<string, unknown>) =>
  http.createServer((_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(200);
    res.end(JSON.stringify(getStatus()));
  });

const run = async () => {
  const client = new MongoClient(env.MONGODB_URI);
  await client.connect();
  const db = client.db(env.MONGODB_DB);

  const patients = db.collection("patients");
  const encounters = db.collection("encounters");
  const checkpoints = db.collection<CheckpointDoc>("ingest_checkpoints");
  const audits = db.collection("ingest_audit");

  await patients.createIndex({ patientId: 1 }, { unique: true });
  await patients.createIndex({ referenceId: 1 }, { unique: true, sparse: true });
  await encounters.createIndex({ encounterId: 1 }, { unique: true });
  await checkpoints.createIndex({ key: 1 }, { unique: true });

  const checkpointKey = env.INGEST_CHECKPOINT_KEY;
  const checkpoint = await checkpoints.findOne({ key: checkpointKey });
  let lastSeq = checkpoint?.lastSeq ?? "0";
  let lastRunAt: string | null = null;
  let lastErrorAt: string | null = null;
  let failedCountRecent = 0;
  let backoffMs = 1000;

  const healthServer = buildHealthServer(() => ({
    status: "ok",
    lastSeq,
    lastRunAt,
    lastErrorAt,
    failedCountRecent
  }));

  healthServer.listen(8080, () => {
    log("info", "health server started", { port: 8080 });
  });

  const processBatch = async () => {
    lastRunAt = new Date().toISOString();
    failedCountRecent = 0;
    let processedCount = 0;
    let upsertedCount = 0;

    let changeSet;
    try {
      changeSet = await fetchChanges(lastSeq);
      backoffMs = 1000;
    } catch (error) {
      log("error", "failed to fetch changes", { error: (error as Error).message });
      lastErrorAt = new Date().toISOString();
      failedCountRecent += 1;
      await sleep(backoffMs);
      backoffMs = Math.min(backoffMs * 2, 60000);
      return;
    }

    for (const change of changeSet.results) {
      const doc = change.doc;
      if (!doc || change.deleted) {
        continue;
      }
      if (doc._id?.startsWith("_design/") || doc.type === "meta") {
        continue;
      }

      processedCount += 1;

      try {
        if (doc.type === "patient" && doc._id?.startsWith("patient:")) {
          const parsed = patientSchema.parse(doc);
          await patients.updateOne(
            { patientId: parsed.patientId },
            {
              $set: {
                patientId: parsed.patientId,
                referenceId: parsed.referenceId,
                demographics: parsed.demographics,
                consent: parsed.consent,
                createdAt: parsed.createdAt,
                updatedAt: parsed.updatedAt,
                sourceDocId: doc._id
              }
            },
            { upsert: true }
          );
          await audits.insertOne({
            docId: doc._id,
            type: "patient",
            seenAt: new Date().toISOString(),
            action: "upserted"
          });
          upsertedCount += 1;
          continue;
        }

        if (doc.type === "encounter" && doc._id?.startsWith("encounter:")) {
          const parsed = encounterSchema.parse(doc);
          await encounters.updateOne(
            { encounterId: parsed.encounterId },
            {
              $set: {
                encounterId: parsed.encounterId,
                patientId: parsed.patientId,
                encounterDateTime: parsed.encounterDateTime,
                department: parsed.department,
                vitals: parsed.vitals,
                notes: parsed.notes,
                diagnosisCodes: parsed.diagnosisCodes,
                flags: parsed.flags,
                createdAt: parsed.createdAt,
                updatedAt: parsed.updatedAt,
                sourceDocId: doc._id
              }
            },
            { upsert: true }
          );
          await audits.insertOne({
            docId: doc._id,
            type: "encounter",
            seenAt: new Date().toISOString(),
            action: "upserted"
          });
          upsertedCount += 1;
          continue;
        }

        await audits.insertOne({
          docId: doc._id,
          type: doc.type ?? "unknown",
          seenAt: new Date().toISOString(),
          action: "skipped",
          errors: "Unsupported document type"
        });
      } catch (error) {
        await audits.insertOne({
          docId: doc._id ?? "unknown",
          type: doc.type ?? "unknown",
          seenAt: new Date().toISOString(),
          action: "error",
          errors: (error as Error).message
        });
        failedCountRecent += 1;
      }
    }

    lastSeq = changeSet.last_seq;
    await checkpoints.updateOne(
      { key: checkpointKey },
      {
        $set: {
          key: checkpointKey,
          lastSeq,
          updatedAt: new Date().toISOString()
        }
      },
      { upsert: true }
    );

    log("info", "batch processed", {
      processedCount,
      upsertedCount,
      failedCount: failedCountRecent,
      lastSeq
    });
  };

  log("info", "ingestion worker started", { lastSeq });
  await processBatch();

  setInterval(() => {
    processBatch().catch((error) => {
      log("error", "batch processing failed", { error: (error as Error).message });
      lastErrorAt = new Date().toISOString();
      failedCountRecent += 1;
    });
  }, 5000);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
