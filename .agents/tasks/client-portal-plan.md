# Implementation Plan — Unfazed Client Portal

> Artifact root: `c:\Users\py293\OneDrive\Desktop\Unfazed\.agents\tasks\client-portal\`
> Three FEATs: FEAT-001 (layout crash fix + redesign), FEAT-002 (backend endpoints), FEAT-003 (frontend pages + routes)

---

## Key Findings from Exploration

- **`clientRoutes.js`** uses `router.use(authenticate, authorize('THERAPIST'))` globally → all existing routes are THERAPIST-only. To add CLIENT routes in the same file, the global middleware must be replaced with per-route middleware on each existing route.
- **`sessionRoutes.js`** has the same global `router.use(authenticate, authorize('THERAPIST'))` pattern.
- **`paymentRoutes.js`** already uses per-route middleware → only add the new route.
- **`Navbar.jsx`** exists at `frontend/src/components/common/Navbar.jsx` — it is the therapist top-bar and is NOT used by ClientLayout.
- **`ClientLayout.jsx`** uses `MessageSquare` without importing it — the exact crash. The icon imports are `{ Calendar, FileText, CreditCard, LogOut, HeartHandshake }` but `MessageSquare` is missing.
- **`ClientPortalPage.jsx`** (shared notes page) will be replaced as the index route by `ClientDashboardPage.jsx` but the file is preserved in case it is needed.
- **Client model `intakeData`** has `emergencyContactName`, `emergencyContactPhone`, `emergencyContactRelation`, `presentingConcerns`, `medicalHistory`, `previousTherapy` fields.
- **Payment `amount`** is stored in paise (integer). Frontend must divide by 100 for display.
- `app.js` mounts `clientRoutes` at `/api/v1/clients` — the new CLIENT profile routes will be at `/api/v1/clients/profile`.

---

## FEAT-001: Fix ClientLayout — blank page crash + full sidebar redesign

- [ ] 1. Rewrite `frontend/src/layouts/ClientLayout.jsx` — add missing `MessageSquare` import AND redesign as a full sidebar layout.
      Import: `React`, `useState`, `useEffect` from react; `Outlet`, `NavLink`, `useLocation` from react-router-dom; `useAuth` from `../context/AuthContext`; `LayoutDashboard`, `Calendar`, `MessageSquare`, `CreditCard`, `FileText`, `UserCircle`, `LogOut`, `HeartHandshake`, `X`, `Menu` from lucide-react.
      Nav items: Dashboard (`/client` end=true), Bookings (`/client/bookings`), Chat (`/client/chat`), Payments (`/client/payments`), Notes (`/client/notes`), Profile (`/client/profile`).
      Desktop: fixed left sidebar w-64, teal branding (teal-600 for logo icon, bg-teal-50/text-teal-700 for active nav, teal-600 avatar circle). Main content: `ml-0 lg:ml-64` min-h-screen bg-slate-50.
      Mobile: sticky header + hamburger → drawer (same translate-x pattern as `Sidebar.jsx`). Close on route change with `useLocation` + `useEffect`.
      Files: `frontend/src/layouts/ClientLayout.jsx`
      Verify: `cd frontend && npm run build` — exits 0, no ReferenceError.

---

## FEAT-002: Backend — four missing CLIENT-role endpoints

- [ ] 2. Add `getClientSessions` to `backend/src/controllers/sessionController.js`.
      `Session.find({ clientId: req.user.id }).populate('therapistId', 'name title').sort({ date: -1, startTime: -1 })`. Return `{ success: true, sessions }`. Export alongside existing functions.
      Files: `backend/src/controllers/sessionController.js`
      Verify: `cd backend && node -e "require('./src/app')"` — no errors.

- [ ] 3. Fix `backend/src/routes/sessionRoutes.js` — remove global `router.use` and add per-route middleware. Add `router.get('/mine', authenticate, authorize('CLIENT'), getClientSessions)`.
      Files: `backend/src/routes/sessionRoutes.js`
      Verify: `cd backend && node -e "require('./src/app')"` — no errors.

- [ ] 4. Add `getClientPayments` to `backend/src/controllers/paymentController.js`.
      `Payment.find({ clientId: req.user.id }).populate('sessionId', 'date startTime duration status').sort({ createdAt: -1 })`. Return `{ success: true, payments }`. Export alongside existing functions.
      Files: `backend/src/controllers/paymentController.js`
      Verify: `cd backend && node -e "require('./src/app')"` — no errors.

- [ ] 5. Add `router.get('/mine', authenticate, authorize('CLIENT'), getClientPayments)` to `backend/src/routes/paymentRoutes.js` — place it BEFORE the `/:id` invoice route.
      Files: `backend/src/routes/paymentRoutes.js`
      Verify: `cd backend && node -e "require('./src/app')"` — no errors.

- [ ] 6. Add `getMyProfile` and `updateMyProfile` to `backend/src/controllers/clientController.js`.
      `getMyProfile`: `Client.findById(req.user.id).populate('therapistId', 'name title profileImageUrl')` → `{ success: true, client }`.
      `updateMyProfile`: only allow `name`, `phone`, `intakeData` (emergency contact fields only). Merge intakeData with spread. Call `client.save()`. Return `{ success: true, client }`. Export both alongside existing functions.
      Files: `backend/src/controllers/clientController.js`
      Verify: `cd backend && node -e "require('./src/app')"` — no errors.

- [ ] 7. Fix `backend/src/routes/clientRoutes.js` — remove global `router.use(authenticate, authorize('THERAPIST'))`. Re-apply middleware per-route on the existing six routes. Add `router.get('/profile', authenticate, authorize('CLIENT'), getMyProfile)` and `router.put('/profile', authenticate, authorize('CLIENT'), updateMyProfile)` BEFORE the `/:id` routes. Import `getMyProfile` and `updateMyProfile` from clientController.
      Files: `backend/src/routes/clientRoutes.js`
      Verify: `cd backend && node -e "require('./src/app')"` — no errors.

---

## FEAT-003: Frontend — five client pages + route wiring

- [ ] 8. Create `frontend/src/pages/client/ClientDashboardPage.jsx`.
      Calls `GET /api/v1/sessions/mine` and `GET /api/v1/notes/shared` in a combined `Promise.all` on mount.
      Sections: (a) Welcome banner with user.name + therapist name from `user.therapist`. (b) Therapist card with name/title and "Message Therapist" button (`navigate('/client/chat')`). (c) Last 3 sessions as mini-cards with date, startTime, status badge. "View all" → `/client/bookings`. (d) Last 2 shared notes as mini-cards. "View all" → `/client/notes`.
      Files: `frontend/src/pages/client/ClientDashboardPage.jsx`
      Verify: `cd frontend && npm run build` — exits 0.

- [ ] 9. Create `frontend/src/pages/client/ClientBookingsPage.jsx`.
      Calls `GET /api/v1/sessions/mine`. Lists all sessions in cards/rows: date, startTime–endTime, therapist name, duration, status Badge, paymentStatus chip. If `meetingLink` is set and status is `scheduled`, show `Join Session` anchor. Empty/loading states.
      Files: `frontend/src/pages/client/ClientBookingsPage.jsx`
      Verify: `cd frontend && npm run build` — exits 0.

- [ ] 10. Create `frontend/src/pages/client/ClientPaymentsPage.jsx`.
       Calls `GET /api/v1/payments/mine`. Lists all payments: invoiceNumber, session date, amount ÷ 100 displayed as `₹X.XX`, status Badge, View Invoice button for captured payments. Empty/loading states.
       Files: `frontend/src/pages/client/ClientPaymentsPage.jsx`
       Verify: `cd frontend && npm run build` — exits 0.

- [ ] 11. Create `frontend/src/pages/client/ClientNotesPage.jsx`.
       Calls `GET /api/v1/notes/shared`. Card grid matching the design in the existing `ClientPortalPage.jsx` (copy the card pattern). Session date chip if `note.sessionId` is populated. Empty/loading states.
       Files: `frontend/src/pages/client/ClientNotesPage.jsx`
       Verify: `cd frontend && npm run build` — exits 0.

- [ ] 12. Create `frontend/src/pages/client/ClientProfilePage.jsx`.
       Calls `GET /api/v1/clients/profile` on mount. Pre-fills form: name, phone, emergencyContactName, emergencyContactPhone, emergencyContactRelation. Save calls `PUT /api/v1/clients/profile`. On success, calls `updateUser({ name, phone })` from `useAuth()` to sync the auth context, and shows a green inline success banner for 3 seconds. Read-only therapist card below the form. Password change note pointing to /forgot-password.
       Files: `frontend/src/pages/client/ClientProfilePage.jsx`
       Verify: `cd frontend && npm run build` — exits 0.

- [ ] 13. Update `frontend/src/routes/AppRoutes.jsx` — import all five new pages, change the `/client` index route to `ClientDashboardPage`, add four new child routes (bookings, payments, notes, profile), keep the chat route.
       Route block becomes:
       ```
       <Route index element={<ClientDashboardPage />} />
       <Route path="bookings" element={<ClientBookingsPage />} />
       <Route path="chat" element={<ClientChatPage />} />
       <Route path="payments" element={<ClientPaymentsPage />} />
       <Route path="notes" element={<ClientNotesPage />} />
       <Route path="profile" element={<ClientProfilePage />} />
       ```
       Remove the now-unused `ClientPortalPage` import.
       Files: `frontend/src/routes/AppRoutes.jsx`
       Verify: `cd frontend && npm run build` — exits 0 with all routes resolving.
