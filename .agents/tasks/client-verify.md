# Client Management — Verification Notes

Date: 2025-01-30

## Backend syntax checks

- `backend/src/controllers/clientController.js` — `node --check`: ✅ OK
- `backend/src/routes/clientRoutes.js` — `node --check`: ✅ OK

## Frontend build

```
vite v6.4.3 building for production...
✓ 2454 modules transformed.
dist/index.html                     2.79 kB │ gzip:   1.12 kB
dist/assets/index-vlINcKsR.css     42.55 kB │ gzip:   7.70 kB
dist/assets/index-DlZAdF_t.js   1,380.03 kB │ gzip: 388.26 kB
✓ built in 1m 9s
```

Chunk-size warning is pre-existing (whole app in one chunk) — unrelated to this change.

## Changes implemented

### Backend
1. **clientController.js — createClient**: Added therapist-email uniqueness guard after duplicate-client check (returns 409 if the email belongs to a registered therapist).
2. **clientController.js — createClient + resendInvite**: Removed `NODE_ENV !== 'production'` gate; `inviteLink` is now always returned.
3. **clientController.js — getInviteLink**: New function: generates fresh invite token (no email), returns `inviteLink`. Checks activation status via `+password` projection.
4. **clientController.js — updateClient**: Added `email` to destructuring; added `.select('+password')` to initial query; added email-change validation (activated check, duplicate-client check, therapist-email check); regenerates invite token on email change; returns `inviteLink` in response when changed.
5. **clientRoutes.js**: Added `getInviteLink` import; registered `GET /:id/invite-link` route before the bare `GET /:id` to avoid wildcard collision.

### Frontend
6. **ClientsPage.jsx — Copy Invite Link**: New `handleCopyInviteLink` function calls `GET /clients/:id/invite-link`; copies to clipboard; shows "Link Copied!" feedback via `copiedFor` state. Old "Copy Invite Link" button now calls this instead of `handleResendInvite`.
7. **ClientsPage.jsx — Resend Email**: New "Resend Email" button added below "Copy Invite Link" button; calls `handleResendInvite` which POSTs to resend-invite (sends email, no clipboard).
8. **ClientsPage.jsx — Modal reset**: `closeModal` resets both `inviteLink` and `error`; Done button calls `closeModal`; form data resets to defaults including `tags: ['Active']`.
9. **ClientsPage.jsx — Tags chip UI**: Replaced free-text tags input with multi-select chip buttons using `TAG_OPTIONS` constant. Tags stored as array; no `.split(',')` needed in payload.
10. **ClientsPage.jsx — 'View Timeline' → 'View Profile'**: Renamed action link text.
11. **ClientsPage.jsx — Edit Client modal**: Added full edit modal with `Pencil` button per row; fields: name, phone, email (disabled if activated via `consentSignedAt`), tags chips, status, gender, dateOfBirth; shows new invite link panel when email is changed; proper error display.
