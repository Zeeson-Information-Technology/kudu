# Facility App Routes (Test Checklist)

This list captures every current route and the primary path to test it. Routes under
`/dashboard` require a facility session (create or join first).

## Public / Onboarding
- `/` (root; redirects or links to login/onboarding as configured)
- `/login` (select local user; shared-device note; disabled users tagged)
- `/login/pin?userId=...` (PIN entry if enabled)
- `/onboarding`
- `/onboarding/create-facility`
- `/onboarding/join`

## Dashboard (requires session)
- `/dashboard` (overview)
- End session (header) -> `/login`
- `/dashboard/admin` (admin placeholder)
- `/dashboard/facility` (facility admin settings)
- `/dashboard/encounters` (recent encounters list; start new via patient profile)
  - Dictation review: create encounter with dictation unconfirmed -> “Needs review” badge shows
- `/dashboard/lab` (lab queue)
- `/dashboard/lab/orders/[orderId]` (lab order detail)
- `/dashboard/pharmacy` (pharmacy queue)
- `/dashboard/pharmacy/catalog` (drug catalog; update unit prices)
- `/dashboard/pharmacy/prescriptions/[prescriptionId]` (prescription detail)
- `/dashboard/patients` (patient registry + modal trigger)
  - `/dashboard/patients?new=1` (opens patient registration modal)
  - `/dashboard/patients/new` (standalone registration page; kept for legacy use)
- `/dashboard/patients/[id]` (patient profile)
  - Dictation review badge visible on encounter list rows when notes/assessment/plan need review
- `/dashboard/patients/[id]/encounters/new` (encounter form; create encounter here)
- `/dashboard/patients/[id]/encounters/[encounterId]/lab/new` (create lab order)
- `/dashboard/patients/[id]/encounters/[encounterId]/pharmacy/new` (create prescription)
- `/dashboard/patients/[id]/encounters/[encounterId]/edit` (edit encounter)
- `/dashboard/queues` (queue hub)
- `/dashboard/queues/list?filter=registered`
- `/dashboard/queues/list?filter=in_consult`
- `/dashboard/queues/list?filter=lab_pending`
- `/dashboard/queues/list?filter=pharmacy_pending`
- `/dashboard/registers/opd` (OPD register)
- `/dashboard/sync/conflicts` (sync conflict review)
