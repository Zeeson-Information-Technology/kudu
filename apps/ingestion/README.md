# Kudu Ingestion Worker

Minimal CouchDB -> MongoDB ingestion worker. Consumes CouchDB _changes, upserts into MongoDB, and tracks checkpoints for restart-safe operation.

## Environment variables
Create `.env` (or use process env):
- `COUCHDB_URL=http(s)://user:pass@host:5984`
- `COUCHDB_DB=kudu_facility`
- `MONGODB_URI=mongodb+srv://...`
- `MONGODB_DB=kudu`
- `INGEST_CHECKPOINT_KEY=default`
- `LOG_LEVEL=info`

## Run locally
```
cd apps/ingestion
pnpm install
pnpm dev
```

## Build/start
```
pnpm build
pnpm start
```

## Docker run
```
cd apps/ingestion
docker build -t kudu-ingestion .
docker run --env-file .env -p 8080:8080 kudu-ingestion
```

## DigitalOcean deployment (systemd)
```
sudo mkdir -p /opt/kudu/apps/ingestion
sudo cp -r dist package.json .env /opt/kudu/apps/ingestion
sudo cp deploy/kudu-ingestion.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable kudu-ingestion
sudo systemctl start kudu-ingestion
sudo journalctl -u kudu-ingestion -f
```

## Health endpoint
- `GET http://localhost:8080/health`

## Deploy
- Copy `dist/` and `package.json` to the server, set env vars, run `node dist/index.js`.
- Keep it running with a process manager (systemd/pm2) on DigitalOcean.
