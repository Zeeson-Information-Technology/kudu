# Facility App Test Flow (Concise)

Last updated: 2026-01-30

## Quick start
1) Start app: `pnpm dev` (apps/facility)
2) Open `/login`.
3) Ensure `NEXT_PUBLIC_COUCHDB_URL` is set and app is restarted.

## A) Facility + User onboarding
- Create facility ? verify join code shown.
- Join facility (new browser) ? select role ? user appears in staff list.
- Admin can see staff list in `/dashboard/facility`.

## B) Cross-browser sync
- Browser A: create facility + user.
- Wait for SyncStatus = Synced.
- Browser B: open `/login` ? facility appears ? select user ? dashboard.

## C) Patient registration
- `/dashboard/patients?new=1` ? create patient.
- Verify Reference ID + QR shown.
- Return to list ? patient appears.

## D) Encounter capture
- From patient profile ? start encounter.
- Fill vitals + notes ? save.
- Encounter appears on `/dashboard/encounters` list.

## E) Lab workflow
- Create lab order from encounter.
- `/dashboard/lab` ? order shows in Requested.
- Add result ? moves to Resulted.

## F) Pharmacy workflow
- Create prescription from encounter.
- `/dashboard/pharmacy` ? appears in Prescribed.
- Dispense ? moves to Dispensed.

## G) Queues
- `/dashboard/queues` ? registered/in-consult flags update after encounter.

## H) OPD register
- `/dashboard/registers/opd` ? list reflects encounters.
- Export CSV ? file downloads.

## I) Sync status
- Header shows SyncStatus (Local only / Syncing / Synced / Error).
- If conflicts appear: `/dashboard/sync/conflicts` shows list.

## Notes
- Data is offline-first (PouchDB). Remote sync is best-effort.
- Each browser has its own local store; cross-browser visibility depends on sync.
