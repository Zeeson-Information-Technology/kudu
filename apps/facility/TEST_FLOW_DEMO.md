# Facility App Demo Script (5–10 min)

Audience: non-technical testers
Goal: show end-to-end workflow on 2 browsers

## Setup
- Browser A: Admin
- Browser B: Clinician or Nurse

## 1) Admin creates facility (Browser A)
1. Go to `/login` ? **Create facility**.
2. Enter facility details ? submit.
3. Copy the join code.
4. Verify you land on dashboard.

## 2) Clinician joins facility (Browser B)
1. Go to `/login` ? **Join facility**.
2. Enter join code + display name + role (Clinician).
3. Submit ? return to `/login`.
4. Select clinician user ? enter dashboard.

## 3) Register a patient (Browser B)
1. Go to `/dashboard/patients` ? **New patient**.
2. Fill required fields + consents ? create record.
3. Show success panel: Reference ID + QR.
4. Open patient profile.

## 4) Start an encounter (Browser B)
1. Click **Start encounter** from patient profile.
2. Enter vitals + notes ? save.
3. Show encounter appears in patient profile + `/dashboard/encounters`.

## 5) Lab + Pharmacy (Browser B)
1. From encounter ? **Create lab order**.
2. Go to `/dashboard/lab` ? mark as Resulted.
3. From encounter ? **Create prescription**.
4. Go to `/dashboard/pharmacy` ? Dispense.

## 6) Admin review (Browser A)
1. Go to `/dashboard/facility` ? see staff list.
2. View join code + sync status.
3. Go to `/dashboard/encounters` ? see recent list.

## 7) OPD register + export (Browser A)
1. Go to `/dashboard/registers/opd`.
2. Confirm today’s encounter listed.
3. Export CSV.

## Expected outcome
- Data created in Browser B appears in Browser A after sync.
- Sync status shows **Synced** (or **Syncing** briefly).
- All flows are offline-first (continue working if network drops).
