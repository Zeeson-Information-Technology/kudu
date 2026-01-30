# CouchDB Sync Test (Multi-Device + Roles)

Use this checklist to validate cross-device sync and role-based joining.

## Prerequisites
- Docker Desktop running
- CouchDB container running on `localhost:5984`
- Facility app running on `http://localhost:3001`
- `apps/facility/.env.local` includes:
  - `NEXT_PUBLIC_COUCHDB_URL=http://admin:pass@localhost:5984/kudu_facility`

## Find the admin PC IP
On the admin PC, run:
```powershell
ipconfig
```
Use the IPv4 Address shown (example: `192.168.1.50`) in all links below.

## Quick health checks
1) CouchDB responds:
   ```powershell
   curl.exe http://localhost:5984
   ```
2) Database exists:
   ```powershell
   curl.exe -u admin:pass http://localhost:5984/_all_dbs
   ```
   Confirm `kudu_facility` is listed.

## Multi-device join test (different PCs)
1) **PC A (Admin)**
   - Visit `http://<admin-pc-ip>:3001/onboarding/create-facility`
   - Create a facility and copy the join code
   - Go to `http://<admin-pc-ip>:3001/dashboard` and wait for SyncStatus = **Synced**

2) **PC B (Doctor/Clinician)**
   - Visit `http://<admin-pc-ip>:3001/onboarding/join`
   - Enter join code + name + role = `clinician`
   - Submit and confirm redirect to `/dashboard`

3) **PC C (Nurse)**
   - Visit `http://<admin-pc-ip>:3001/onboarding/join`
   - Enter join code + name + role = `nurse`
   - Submit and confirm redirect to `/dashboard`

## Same-machine alternative (multiple browsers)
- Use different browsers (Chrome/Edge/Firefox) or an Incognito window to simulate different devices.

## Verification steps
- Browser B sees the same facility name in the header
- Browser B can see Patients/Encounters for the facility
- SyncStatus shows **Synced** in both browsers

## Troubleshooting
- If other PCs cannot load the admin PC URL, ensure Windows Firewall allows inbound traffic to port `3001`.
- If join says “Join code not found,” wait 5–10 seconds and retry.
- If SyncStatus shows **Local only**, confirm the `NEXT_PUBLIC_COUCHDB_URL` is correct and restart the dev server.
- If CouchDB is down:
  ```powershell
  docker start couchdb
  ```
