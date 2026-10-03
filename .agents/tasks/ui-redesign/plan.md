# Implementation Plan — Unfazed UI Redesign

> Color palette (from user prompt):
> - **Brand Olive/Sage** `#4A5240` — primary brand, replaces all `primary-600` / `primary-700` roles
> - **Warm Terracotta/Rust** `#C4622D` — accent/CTA, replaces all `teal-600` / `teal-700` roles
> - **Warm Cream/Off-white** `#F5F0E8` — background, replaces `slate-50` / `bg-white` large areas
> - **Dark Charcoal** `#2C2C2C` — body text, replaces `slate-900`
> - **DM Sans** — font family (Google Fonts), replaces Plus Jakarta Sans

---

## 0. Files to Delete (Unused)

`ClientPortalPage.jsx` is **not imported anywhere in AppRoutes.jsx** (confirmed: the `/client` index route renders `ClientDashboardPage`). It is a duplicate with identical functionality.

**Delete:**
```
frontend/src/pages/client/ClientPortalPage.jsx
```

No other source files in `src/` are orphaned. Every remaining file is either imported by AppRoutes.jsx, used transitively (layouts, components, context, api), or is a project config file.

---

## 1. tailwind.config.js — Add Brand Color Tokens

Replace the existing `primary` and `therapy` scales with the new palette. Add `fontFamily` for DM Sans.

**Changes:**
```js
colors: {
  brand: {
    50:  '#f5f0e8',  // cream background
    100: '#ede5d4',
    200: '#d9c9ab',
    300: '#c4a97e',
    400: '#a87c55',
    500: '#4a5240',  // brand olive (primary)
    600: '#3d4435',
    700: '#30362a',
    800: '#232820',
    900: '#161a14',
  },
  accent: {
    50:  '#fdf3ed',
    100: '#fae0cc',
    200: '#f4be9a',
    300: '#ed9668',
    400: '#e3703c',
    500: '#c4622d',  // terracotta accent
    600: '#a5501f',
    700: '#844016',
    800: '#63300f',
    900: '#432009',
  },
  cream: '#F5F0E8',
}
fontFamily: {
  sans: ['DM Sans', 'sans-serif'],
}
```

Keep `borderRadius` overrides. Remove old `primary` and `therapy` keys.

---

## 2. index.css — Font Import + CSS Variables

Replace `Plus_Jakarta_Sans` reference in PublicLayout inline style with DM Sans in the global CSS so it applies everywhere.

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
  body { @apply bg-cream text-[#2C2C2C] font-sans; }
  /* scrollbar: replace bg-slate-300/400 with brand tones */
}
```

---

## 3. Ordered Edit List by Section

### A. Layouts

#### `frontend/src/layouts/PublicLayout.jsx`
- Remove inline `font-['Plus_Jakarta_Sans',sans-serif]` (now global via tailwind fontFamily).
- `bg-white/80` nav → `bg-cream/90`
- `bg-primary-600` logo box → `bg-brand-500`
- `text-primary-600` links → `text-brand-500`
- `bg-primary-700` register button → `bg-accent-500 hover:bg-accent-600`
- Footer: `bg-primary-600` logo → `bg-brand-500`; `text-primary-600` → `text-brand-500`
- `text-emerald-500` shield → keep (semantic green, not brand color)

#### `frontend/src/layouts/TherapistLayout.jsx`
- `bg-slate-50` → `bg-cream`
- No color classes — passes through to Sidebar/Navbar. One-line change.

#### `frontend/src/layouts/ClientLayout.jsx`
- `bg-slate-50` → `bg-cream`
- `bg-teal-600` logo/avatar → `bg-accent-500`
- `text-teal-600` "Client Portal" sub-label → `text-accent-500`
- `bg-teal-50 text-teal-700` active nav → `bg-brand-50 text-brand-600`
- Mobile header `bg-teal-600` icon → `bg-accent-500`

---

### B. Common Components

#### `frontend/src/components/common/Sidebar.jsx`
- `bg-primary-600` logo box → `bg-brand-500`
- `text-primary-600` sub-label → `text-brand-500`
- `bg-primary-50 text-primary-700` active nav item → `bg-brand-50 text-brand-600`
- `text-primary-600` external link icon → `text-brand-500`
- `text-primary-600` feedback/subscription links → `text-brand-500`
- `hover:text-primary-600` nav hover → `hover:text-brand-500`

#### `frontend/src/components/common/Navbar.jsx`
- `bg-primary-50 text-primary-700` clinic URL badge → `bg-brand-50 text-brand-600 border-brand-200`
- `bg-primary-600` avatar → `bg-brand-500`
- `text-primary-600` sparkles icon → `text-accent-500`

#### `frontend/src/components/common/Button.jsx`
- `bg-primary-600 hover:bg-primary-700` primary → `bg-brand-500 hover:bg-brand-600`
- `focus:ring-primary-500` → `focus:ring-brand-500`
- `bg-primary-50 text-primary-700 hover:bg-primary-100` soft → `bg-brand-50 text-brand-600 hover:bg-brand-100`

#### `frontend/src/components/common/Badge.jsx`
- `bg-primary-50 text-primary-700 border-primary-200` primary variant → `bg-brand-50 text-brand-600 border-brand-200`

#### `frontend/src/components/common/CookieConsent.jsx`
- `bg-primary-50 text-primary-600` cookie icon bg → `bg-brand-50 text-brand-500`
- `text-primary-600` links → `text-brand-500`
- `bg-primary-600 hover:bg-primary-700` accept button → `bg-accent-500 hover:bg-accent-600`

#### `frontend/src/components/common/FeedbackModal.jsx`
- `focus:ring-primary-500` all inputs → `focus:ring-brand-500`
- `text-primary-600` support icon, subscription link → `text-brand-500`

#### `frontend/src/components/common/Modal.jsx`
- `focus:ring-slate-300` X button → `focus:ring-brand-200`
- Mostly neutral — no color tokens to swap beyond this.

#### `frontend/src/components/common/RichTextEditor.jsx`
- `focus-within:ring-primary-500` → `focus-within:ring-brand-500`

---

### C. Auth Pages

#### `frontend/src/pages/auth/LoginPage.jsx`
- `bg-primary-600` logo box → `bg-brand-500`
- `focus:ring-primary-500 focus:border-primary-500` inputs → `focus:ring-brand-500 focus:border-brand-500`
- `<Stethoscope>` icon `text-primary-600` → `text-brand-500`
- `<HeartHandshake>` icon `text-teal-600` → `text-accent-500`
- `variant={isClient ? 'secondary' : 'primary'}` — Button primary now uses brand-500 (handled by Button.jsx change)
- `text-primary-600` forgot/register links → `text-brand-500`

#### `frontend/src/pages/auth/RegisterPage.jsx`
- `bg-primary-600` logo → `bg-brand-500`
- `focus:ring-primary-500 focus:border-primary-500` inputs → `focus:ring-brand-500`
- `text-primary-600` slug preview, sign-in link → `text-brand-500`
- `bg-primary-50` slug preview box → `bg-brand-50`

#### `frontend/src/pages/auth/ForgotPasswordPage.jsx`
- `bg-primary-600` icon bg → `bg-brand-500`
- `text-primary-600` link → `text-brand-500`
- `focus:ring-primary-500` → `focus:ring-brand-500`

#### `frontend/src/pages/auth/ResetPasswordPage.jsx`
- `bg-primary-600` icon bg → `bg-brand-500`
- `bg-primary-600` sign in link → `bg-brand-500`
- `focus:ring-primary-500` → `focus:ring-brand-500`

#### `frontend/src/pages/auth/SetupPasswordPage.jsx`
- `bg-teal-600 hover:bg-teal-700` submit button → `bg-accent-500 hover:bg-accent-600`
- `from-teal-50` gradient → `from-cream`
- `bg-teal-600` icon bg → `bg-accent-500`
- `focus:ring-teal-500 focus:border-teal-500` inputs → `focus:ring-accent-500`
- `text-teal-600` links → `text-accent-500`

---

### D. Public Pages

#### `frontend/src/pages/public/LandingPage.jsx`
- `bg-primary-50 text-primary-700 border-primary-200` pill badge → `bg-brand-50 text-brand-600 border-brand-200`
- `text-primary-600` headline span → `text-accent-500`
- `bg-primary-600 hover:bg-primary-700` CTA button → `bg-brand-500 hover:bg-brand-600`
- `bg-primary-50 text-primary-600` calendar icon box → `bg-brand-50 text-brand-600`
- `bg-teal-50 text-teal-600` users icon box → `bg-accent-50 text-accent-500`
- `bg-white rounded-2xl` feature cards → keep white card with `bg-cream` page bg

#### `frontend/src/pages/public/BookingPage.jsx`
- `bg-primary-600` / `text-primary-600` CTAs and focus rings → `bg-brand-500` / `text-brand-500` / `focus:ring-brand-500`
- `bg-teal-` slot selection highlight → `bg-accent-100 border-accent-500`

#### `frontend/src/pages/public/PublicProfilePage.jsx`
- `bg-primary-` / `text-primary-` brand accents → `bg-brand-` / `text-brand-`
- `bg-teal-` secondary accents → `bg-accent-`

#### `frontend/src/pages/public/PrivacyPolicyPage.jsx`
- `text-primary-600` headings/links → `text-brand-500`

#### `frontend/src/pages/public/TermsPage.jsx`
- `text-primary-600` headings/links → `text-brand-500`

---

### E. Therapist Pages

#### `frontend/src/pages/therapist/DashboardPage.jsx`
- `from-primary-700 to-primary-900` gradient banner → `from-brand-600 to-brand-800`
- `bg-primary-50 text-primary-600` KPI icon boxes → `bg-brand-50 text-brand-500`
- `bg-teal-50 text-teal-600` Today's Sessions KPI → `bg-accent-50 text-accent-500`
- `text-primary-600` links → `text-brand-500`
- `hover:border-primary-300 hover:bg-primary-50/40 hover:text-primary-700` quick action cards → brand equivalents

#### `frontend/src/pages/therapist/CalendarPage.jsx`
- Tab active state `bg-primary-` → `bg-brand-`
- `text-primary-600` / `focus:ring-primary-500` form elements → brand
- `bg-teal-` slot/day accent → `bg-accent-`

#### `frontend/src/pages/therapist/ClientsPage.jsx`
- `text-primary-600` / `bg-primary-` accents → brand
- `bg-teal-` accents → accent

#### `frontend/src/pages/therapist/ClientDetailPage.jsx`
- Same primary→brand, teal→accent swap pattern

#### `frontend/src/pages/therapist/NotesPage.jsx`
- `bg-primary-` / `text-primary-` → brand; `bg-teal-` → accent

#### `frontend/src/pages/therapist/PaymentsPage.jsx`
- `bg-primary-` header → brand
- Revenue summary accent colors

#### `frontend/src/pages/therapist/AnalyticsPage.jsx`
- Recharts fill colors: `#2563eb` (primary-600) → `#4A5240`; teal chart lines → `#C4622D`
- `text-primary-` KPI labels → brand

#### `frontend/src/pages/therapist/ChatPage.jsx`
- `bg-primary-600` sent messages, avatar, send button → `bg-brand-500`
- `border-primary-600` selected conversation border → `border-brand-500`
- `focus:ring-primary-500` message input → `focus:ring-brand-500`

#### `frontend/src/pages/therapist/SubscriptionPage.jsx`
- `bg-primary-` plan cards, CTAs → brand

#### `frontend/src/pages/therapist/ProfilePage.jsx`
- `bg-primary-` / `text-primary-` → brand
- `focus:ring-primary-500` inputs → `focus:ring-brand-500`

---

### F. Client Pages

#### `frontend/src/pages/client/ClientDashboardPage.jsx`
- `text-teal-600` labels/links → `text-accent-500`
- `bg-teal-600` avatar/button → `bg-accent-500 hover:bg-accent-600`
- `from-teal-600 to-teal-800` avatar gradient → `from-accent-500 to-accent-700`
- `bg-white rounded-2xl` banner cards stay white; page bg → `bg-cream` (from layout)

#### `frontend/src/pages/client/ClientBookingsPage.jsx`
- `text-teal-600` label → `text-accent-500`
- `bg-teal-600` join session button → `bg-accent-500 hover:bg-accent-600`
- Calendar icon `text-teal-600` → `text-accent-500`

#### `frontend/src/pages/client/ClientChatPage.jsx`
- `bg-teal-600` sent messages bubble, avatar, send button → `bg-brand-500`
- `text-teal-600` therapist title, focus rings → `text-accent-500` / `focus:ring-brand-500`
- `from-teal-600 to-teal-800` avatar gradient → `from-brand-500 to-brand-700`

#### `frontend/src/pages/client/ClientPaymentsPage.jsx`
- `text-teal-600` receipt icon, label → `text-accent-500`
- `border-teal-600 text-teal-600` invoice button → `border-accent-500 text-accent-500 hover:bg-accent-50`

#### `frontend/src/pages/client/ClientNotesPage.jsx`
- `text-teal-600` label → `text-accent-500`

#### `frontend/src/pages/client/ClientProfilePage.jsx`
- `text-teal-600` section icons/labels → `text-accent-500`
- `bg-teal-600 hover:bg-teal-700` save button → `bg-accent-500 hover:bg-accent-600`
- `focus:ring-teal-500` inputs → `focus:ring-accent-500`
- `from-teal-600 to-teal-800` therapist avatar → `from-brand-500 to-brand-700`

---

## 4. Responsiveness Gaps

| Gap | Location | Fix |
|-----|----------|-----|
| Chat page has fixed `h-[calc(100vh-8rem)]` — clips on short mobile screens | `ChatPage.jsx`, `ClientChatPage.jsx` | Add `min-h-0` to flex children; use `h-[calc(100dvh-8rem)]` for mobile |
| Chat left-panel (`w-80`) is hidden on mobile — no toggle | `ChatPage.jsx` | Add mobile drawer for conversation list; show back-to-list button in message view |
| PublicLayout nav has no mobile hamburger — on very small screens the "For Therapists" button overflows | `PublicLayout.jsx` | Conditionally hide text on `<sm` or add a proper mobile nav menu |
| `ClientDashboardPage` recent sessions grid goes to 3 cols on `md` without min-width — tight on 768px tablets | `ClientDashboardPage.jsx` | Change to `sm:grid-cols-2 lg:grid-cols-3` |
| Table-like payment/booking lists in `ClientPaymentsPage`, `ClientBookingsPage` use `sm:flex-row` — OK, no raw `<table>` tags that need overflow-x | Already responsive | No change needed |
| `DashboardPage` welcome banner widget `min-w-[280px]` can overflow on 360px phones | `DashboardPage.jsx` | Change to `w-full md:w-auto md:min-w-[280px]` |
| `AnalyticsPage` Recharts charts need `<ResponsiveContainer>` widths verified on mobile — already uses it | Already responsive | No change needed |
| `CalendarPage` availability day-grid needs `flex-wrap` check on mobile | `CalendarPage.jsx` | Confirm `flex-wrap` applied to day toggle row |
| `Sidebar.jsx` mobile drawer width is `w-72` — fine on all phones | OK | No change |

---

## 5. Build & Verification Steps

```bash
# 1. Install — no new npm deps needed (DM Sans is a Google Fonts CDN import)
cd frontend

# 2. Build to catch Tailwind class errors and JSX issues
npm run build

# 3. Dev server smoke-test
npm run dev
# Then open: http://localhost:5173
# Verify: Landing, Login (both tabs), SetupPassword, /dashboard, /client

# 4. Confirm DM Sans loads
# Browser DevTools → Network → filter "fonts.gstatic" — should show DM Sans WOFF2

# 5. Confirm no orphan primary-/teal- classes remain
# (grep only, not a verification step — run after each FEAT to catch misses)
# grep -r "primary-\|teal-6\|teal-7" src/
```

---

## 6. Notes & Assumptions

- The user asked for "make UI based on these colors" — the colors were described verbally (olive/sage, terracotta, cream). The hex values `#4A5240`, `#C4622D`, `#F5F0E8` are the standard matches to those descriptions.  
  **Assumption**: if the user provides actual hex swatches that differ, the implementer should update `tailwind.config.js` token values only — the class names in all JSX files stay the same.
- `bg-emerald-`, `bg-amber-`, `bg-rose-` semantic status colors (success/warning/danger) are intentionally left unchanged — they convey system meaning, not brand identity.
- `bg-[#F8FAFC]` hardcoded chat background in both ChatPage and ClientChatPage should be replaced with `bg-cream/60` to align with the new palette.
