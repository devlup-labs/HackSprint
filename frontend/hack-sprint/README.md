# HackSprint — Frontend

**Stack:** React 19 + Vite + Tailwind CSS
**Scope:** The single-page application served to students, organizers/admins, and judges
**Audience:** Engineers working on this codebase

This document describes the frontend as it is currently implemented — the actual folder structure, routing, data flow, and conventions in this codebase, not an aspirational target.

---

## 1. Overview

The frontend is a single Vite-built React SPA that serves three distinct audiences behind one codebase: **public visitors** (landing page, browsing hackathons, the People directory, Contact and Feedback), **students** (registering, forming teams, submitting projects, messaging connections), and **admins/judges/controllers** (creating hackathons, managing participants, scoring submissions, and — for platform controllers — verification, moderation and the contact inbox). Light and dark themes are both supported (`context/ThemeContext.jsx`, a `dark` class on `<html>`); **light is the default** and dark applies only after a visitor picks it (remembered in `localStorage`). All of them share the same React tree, router, and API client — the split between audiences happens through route guards and layouts, not separate builds.

The app talks to the backend exclusively through a single API Gateway origin (see [`../../backend/docs/api-gateway.md`](../../backend/docs/api-gateway.md)) — it never addresses an individual microservice directly, in development or production.

```mermaid
graph TD
    Browser["Browser"] --> Vite["React SPA (this app)"]
    Vite -->|"single origin, VITE_API_URL"| Gateway["API Gateway"]
    Gateway --> User["User Service  /api/auth"]
    Gateway --> Admin["Admin Service  /api/admin"]
    Gateway --> Hackathon["Hackathon Service  /api/hackathons"]
    Gateway --> Media["Media Service  /api/media"]
    Gateway --> Notification["Notification Service  /api/notifications"]
    Gateway --> Chatbot["Chatbot Service  /api/chatbot"]
```

---

## 2. Tech Stack

| Concern | Library | Notes |
|---|---|---|
| UI framework | React 19 | Function components + hooks throughout, no class components |
| Build tool | Vite | Dev server + production bundler |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) | Utility classes, mostly arbitrary-value (`bg-[#0a0a0a]`) rather than a fixed design-token palette |
| Routing | React Router v6 | Nested routes, layouts via `<Outlet />`, route guards |
| Server state | TanStack Query | Used for read-heavy, cacheable data (e.g. hackathon listings) — see [`hooks/useHackathons.js`](src/hooks/useHackathons.js) |
| Client state | Zustand | One store — [`store/authStore.js`](src/store/authStore.js) — holds the current user/role/auth status |
| HTTP client | Axios | One shared instance, see Section 5 |
| Rich text | Tiptap | Used in [`components/RichTextEditor.jsx`](src/components/RichTextEditor.jsx) for admin-authored content |
| Animation | Framer Motion | Scroll/entrance animations on marketing-style pages |
| Auth (OAuth) | `@react-oauth/google` | Student and admin Google login: the popup code flow, plus One Tap / auto sign-in (`useGoogleOneTapLogin`) |
| Icons | `lucide-react` (primary), `react-icons` (secondary) | Most newer pages use lucide-react |
| Toasts | `react-hot-toast` | App-wide notification toasts |
| Misc | `xlsx` (participant export), `dompurify` (sanitizing rendered HTML), `jwt-decode` | Feature-specific, used in a handful of files each |

**No real-time/WebSocket feature exists.** Notifications, discussion threads and friend chat are fetched over regular HTTP and polled (see [`api/notification.api.js`](src/api/notification.api.js) and `components/FriendsChat`). An unused `socket.io-client` dependency was removed from `package.json` for exactly this reason — it had zero imports anywhere in `src/` and was dragging in a vulnerable transitive `ws` version for no benefit. If a live-socket feature is ever added, it starts clean from here.

**PWA.** [`main.jsx`](src/main.jsx) registers `public/service-worker.js`, which is network-first for the app shell (`index.html`) and cache-first for hashed `/assets/*` — network-first specifically because a stale cached shell could reference JS/CSS filenames a newer deploy has already deleted. The service worker versions its own cache and calls `skipWaiting()`/`clients.claim()` so updates take effect on already-open tabs (paired with a `controllerchange` → reload in `main.jsx`), rather than requiring every tab to be closed first. [`components/InstallPrompt.jsx`](src/components/InstallPrompt.jsx) is the floating bottom-right "Install App" button, site-wide — it captures `beforeinstallprompt` on Chromium and shows an "Add to Home Screen" tip on iOS Safari instead, since iOS never fires that event.

**Chatbot.** [`components/Chatbot.jsx`](src/components/Chatbot.jsx) is a floating chat widget, also mounted site-wide, backed by [`api/chatbot.api.js`](src/api/chatbot.api.js) → the gateway → a dedicated `chatbot-service` (see `backend/docs/services.md`). It's scoped to platform FAQ only — the backend has no database and cannot answer anything account-specific. Replies **stream**: `ChatbotAPI.streamMessage` reads the server-sent-event response with `fetch` (Axios can't expose a body incrementally in the browser), the widget swaps the typing dots for a growing bubble on the first chunk, and [`components/ChatMarkdown.jsx`](src/components/ChatMarkdown.jsx) renders the Markdown (paragraphs, lists, bold/italic, inline and fenced code, safe links) as React elements — never `innerHTML`, so model output cannot inject markup.

**Friends chat and the outbox.** [`components/FriendsChat/FriendsChat.jsx`](src/components/FriendsChat/FriendsChat.jsx) is the floating direct-message widget for connected students (hidden for admins). Outgoing messages go through [`hooks/useMessageOutbox.js`](src/hooks/useMessageOutbox.js): each message is saved to `localStorage` (`hs_outbox_<userId>`) with a client-generated `clientId`, shown immediately as "Sending…", and sent in the background. Network failures and 429/5xx responses are retried with backoff (2 s, 5 s, 15 s, 30 s, 60 s), immediately again when the browser comes back online or the tab becomes visible, and after a reload. A friend's messages are sent in order, so a stuck message holds back later ones to that friend only. After 8 attempts, or on an error that can never succeed, the bubble shows "Not sent — Retry · Remove". The server ignores a repeated `clientId`, so retrying is always safe.

**Google One Tap.** [`components/auth/GoogleLogin.jsx`](src/components/auth/GoogleLogin.jsx) and [`AdminGoogleAuth.jsx`](src/components/auth/AdminGoogleAuth.jsx) show Google's one-tap prompt (or sign a returning visitor in directly) and keep the "Login with Google" button as the fallback. It is switched off while the other kind of account is signed in, and logging out calls `google.accounts.id.disableAutoSelect()` so auto sign-in doesn't bounce the person straight back in. Google's "Authorized JavaScript origins" for the client id must include the site's origin. Both this and `InstallPrompt` float in the same corner; they coordinate via a `hacksprint:chatbot-toggle` window event so the install button hides itself while the chat panel is open instead of overlapping it.

---

## 3. Folder Structure

```
src/
  api/            One file per backend resource, plus a shared Axios client
  components/     Reusable UI shared across multiple pages
    auth/         Google sign-in (student + admin variants, popup and One Tap)
    Admin/        Admin-dashboard sections: contact inbox, platform users, verification, judge invitations
    Chat/         Discussion-thread chat UI
    FriendsChat/  Direct-message widget (uses the message outbox hook)
    People/       Campus map and shared pieces of the People directory
    Daily/        Daily challenge and streak heatmap
    Dashboard/    Student dashboard widgets
  context/        Theme (light/dark)
  hackathon/      Feature folder for the public hackathon-detail page, on-spot bracket and matches
  hooks/          Shared React hooks (auth, data-fetching)
  layouts/        Route-level layout shells (Navbar + Outlet + Footer)
  pages/          Routed page components
    Admin/        Admin/judge-only pages
    Student/      Student-only pages
    Styles/       Page-level stylesheets for larger, standalone pages
  providers/      App-wide context providers (auth bootstrap)
  routes/         The router tree + route-guard components
  store/          Zustand stores
  utils/          Small, stateless helper functions
```

**Why `hackathon/` exists outside `pages/`:** [`pages/Hackathon.jsx`](src/pages/Hackathon.jsx) (the public hackathon-detail page) is composed from ~8 sub-components (hero, sidebar, content tabs, gallery, upvote, social share). Rather than inline all of that into one file or bury it inside `pages/`, those pieces live together in `hackathon/` as a self-contained feature folder. `RegistrationForm.jsx` and `SubmissionForm.jsx` live here too even though they're routed directly (`/hackathon/RegistrationForm/:slug`) — they're tightly coupled to this feature and reused by `Hero-section`'s flow, so keeping them alongside their siblings mattered more than strict "routed things go in `pages/`" purity.

**Why `components/auth/` exists:** the student and admin Google-login buttons are near-identical (same OAuth flow, different API endpoint and redirect target) and are each reused by two sibling pages (`Login.jsx`/`Signup.jsx` for students, `AdminLogin.jsx`/`AdminSignup.jsx` for admins). Grouping them together makes that duplication visible instead of hiding one copy inside `pages/Student/` and the other inside `components/Admin/`.

**CSS convention:** most components co-locate their stylesheet directly next to the component (`Navbar.jsx` + `Navbar.css`, `AdminProfile.jsx` + `AdminProfile.css`). `pages/Styles/` is the exception, reserved for a handful of large, page-level stylesheets (`Home.css`, `Dashboard.css`, `AllHackathons.css`) that define a whole page's visual system rather than one component's — the split is by size/scope, not an inconsistency to "fix" further.

---

## 4. Routing

All routes are declared in one place: [`routes/AppRoute.jsx`](src/routes/AppRoute.jsx). There's no file-based routing — every route is an explicit `<Route>` entry.

### 4.1 Access model

Three route guards gate access, each a thin wrapper reading auth state from the Zustand store via [`hooks/useAuth.js`](src/hooks/useAuth.js):

| Guard | Behavior |
|---|---|
| [`GuestRoute`](src/routes/GuestRoute.jsx) | Only reachable when **not** logged in (login/signup pages) — redirects to `/dashboard` otherwise |
| [`ProtectedRoute`](src/routes/ProtectedRoute.jsx) | Requires any authenticated session — redirects to `/account/login` otherwise |
| [`AdminRoute`](src/routes/AdminRoute.jsx) | Requires an authenticated session **with** `role === "admin"` — redirects to `/adminlogin` otherwise |

Three layouts wrap their route subtree with a shared `Navbar` + `Footer` shell via `<Outlet />`: `MainLayout` (public pages), `StudentLayout`, and `AdminLayout` (passes `variant="admin"` to `Navbar` for a different nav).

```mermaid
flowchart TD
    Root["/"] --> Public["MainLayout — public pages\n(Home, Hackathons, Hackathon details, People,\nContact, Feedback, Participation Policy,\nOrganizer Playbook, Terms)"]
    Root --> GuestOnly["GuestRoute\n(login / signup)"]
    Root --> StudentArea["ProtectedRoute → StudentLayout\n(dashboard, studenthome,\nregistration form, team details)"]
    Root --> AdminArea["AdminRoute → AdminLayout\n(admin dashboard, create hackathon,\nparticipant list, submission review)"]
    Root --> NotFound["* → 404"]
```

### 4.2 Route table

| Path | Guard | Component |
|---|---|---|
| `/` | — | `Home` |
| `/hackathons` | — | `AllHackathons` |
| `/hackathon/:slug` | — | `Hackathon` (details page) |
| `/hackathon/:slug/bracket` | — | `OnSpotBracketPage` (live bracket for on-spot events) |
| `/people` | — | `People` (directory, campus map, profile pop-ups) |
| `/contact` | — | `Contact` (public contact form) |
| `/feedback` | — | `Feedback` (public feedback form; linked from the footer only, `noindex`) |
| `/participation-policies` | — | `Participation` |
| `/organizer-ruleBook` | — | `Organiser` |
| `/terms-and-condition` | — | `Terms` |
| `/adminhome` | — | `Adminhome` (marketing page for organizers) |
| `/u/:userName` | — | `PublicProfile` |
| `/account/login`, `/account/signup` | GuestRoute | `Login`, `Signup` |
| `/account/forgot-password`, `/account/reset-password` | — | `forgotPassword`, `ResetPassword` |
| `/studenthome`, `/dashboard` | ProtectedRoute | `Studenthome`, `Dashboard` |
| `/hackathon/RegistrationForm/:slug` | ProtectedRoute | `RegistrationForm` |
| `/hackathon/:slug/team/:teamId` | ProtectedRoute | `TeamDetails` |
| `/adminlogin`, `/admin/signup` | — | `AdminLogin`, `AdminSignup` |
| `/admin`, `/createHackathon` | AdminRoute | `AdminProfile` (the dashboard), `CreateHackathonPage` |
| `/admin/:slug/usersubmissions` | AdminRoute | `UserList` (participants/teams for a hackathon) |
| `/admin/hackathon/:hackathonId/submission/:entityType/:entityId` | AdminRoute | `AdminSubmissionDetail` |
| `*` | — | `NotFound` |

**The admin dashboard.** `/admin` is a sidebar layout: a sticky, collapsible left panel (the open/closed choice is remembered in `localStorage`; on phones it becomes a scrolling tab row) and one section at a time on the right. Every admin sees *Overview* (profile card, create-event card, stats, judge invitations, events assigned for judging) and *My events*. Platform controllers also see *Verification*, *Event approvals*, *Enquiries*, *Platform users*, *Admins* and *All events*, with count badges on the first three. Only one account type is active per browser: signing in as an organiser while a student session exists (or the reverse) is refused until the person logs out (`utils/sessionGuard.js`).

Note the intentional asymmetry: `/adminlogin` and `/admin/signup` are **not** wrapped in `GuestRoute` the way student login/signup are — an already-logged-in admin can still reach the admin login page directly. That's existing behavior, not an oversight to fix casually.

---

## 5. API Layer

Every backend call goes through one shared Axios instance: [`api/client.js`](src/api/client.js). Nothing in `src/` should construct its own `axios.create()` or call `fetch()` against the backend directly — grep for `axios.create` before adding a new one.

```mermaid
sequenceDiagram
    participant Component
    participant APIModule as "*.api.js"
    participant Client as "api/client.js"
    participant Gateway as "API Gateway"

    Component->>APIModule: HackathonAPI.getHackathons()
    APIModule->>Client: client.get(API.HACKATHON)
    Client->>Client: attach Authorization header
    Client->>Gateway: GET /api/hackathons
    Gateway-->>Client: 200 / 401
    alt 401 and not already retried
        Client->>Gateway: POST /refresh-token (student or admin)
        Gateway-->>Client: new access token
        Client->>Gateway: retry original request
    end
    Client-->>APIModule: response
    APIModule-->>Component: data
```

**Base URL.** `client.js` reads `import.meta.env.VITE_API_URL` — set per-environment (see `.env.example`), never hardcoded. Vite inlines this at *build* time, so changing it requires a rebuild, not just a redeploy.

**Endpoint constants.** [`api/endpoints.js`](src/api/endpoints.js) centralizes every backend path prefix (`API.AUTH`, `API.ADMIN`, `API.ADMIN_AUTH`, `API.ADMIN_PUBLIC`, `API.HACKATHON`, `API.MEDIA`, …) as a relative string. Student endpoints live under `/api/auth` (user-service), organiser endpoints under `/api/admin` (admin-service — login, profile, verification, controller tools), the public Contact and Feedback forms under `/api/admin/public`, and judge routes still under `/api/hackathons/platform/admin` (hackathon-service). Every `*.api.js` file composes full paths from these constants — no file hardcodes a full URL or a raw path string.

**Two kinds of session.** A student session is a `token` in `localStorage`; an organiser session is an `adminToken`. The app now allows only one at a time (see the admin dashboard note in Section 4), but the client still keeps them independent. The request interceptor picks which token to attach based on `config.adminRequest` or whether the URL contains `/admin`. The response interceptor's 401→refresh logic tracks in-flight refreshes **separately per surface** (`refreshState.student` / `refreshState.admin`), so a student token refresh never blocks or gets blocked by an admin token refresh happening in the same tab.

**One file per resource.** `auth.api.js`, `admin-auth.api.js`, `hackathon.api.js`, `registration.api.js`, `team.api.js`, `submission.api.js`, `voting.api.js`, `discussion.api.js`, `match.api.js`, `admin.api.js`, `judge.api.js`, `media.api.js`, `notification.api.js`, `push.api.js`, `profile.api.js`, `people.api.js`, `connections.api.js`, `messages.api.js`, `skills.api.js`, `daily.api.js`, `contact.api.js`, `chatbot.api.js` — each wraps `client` calls for one backend resource and is re-exported from [`api/index.js`](src/api/index.js) for convenient importing.

---

## 6. State Management

Two different tools are used deliberately for two different kinds of state — this is not redundancy:

- **Zustand (`store/authStore.js`)** — client-only state: who is logged in, as what role, and whether the initial auth check has finished. Read through [`hooks/useAuth.js`](src/hooks/useAuth.js), never by importing the store directly in a component.
- **TanStack Query (`hooks/useHackathons.js`)** — server state: data that actually lives in the backend (hackathon listings). Query handles caching, refetching, and loading/error state for anything fetched from the API — plain `useState` + `useEffect` fetching is the older pattern still present in some pages (e.g. `Dashboard.jsx`), not the one to copy for new data-fetching code.

**Auth bootstrap.** On every full page load, [`providers/AuthProvider.jsx`](src/providers/AuthProvider.jsx) runs once: it checks `localStorage` for an `adminToken` first, then a student `token`, calls the matching profile endpoint to validate it, and populates the Zustand store accordingly — this is what `ProtectedRoute`/`AdminRoute`/`GuestRoute` are reading `loading`/`isAuthenticated` from before they redirect.

```mermaid
flowchart LR
    Load["Page load"] --> Provider["AuthProvider bootstrap"]
    Provider -->|"adminToken present & valid"| AdminSession["role: admin"]
    Provider -->|"token present & valid"| StudentSession["role: student"]
    Provider -->|"neither, or invalid"| NoSession["logged out"]
    AdminSession --> Store["Zustand authStore"]
    StudentSession --> Store
    NoSession --> Store
    Store --> Guards["Route guards read isAuthenticated / role"]
```

---

## 7. Environment Variables

See [`.env.example`](.env.example). Two variables are needed:

```
VITE_API_URL=http://localhost:5000          # dev
VITE_API_URL=https://rahul1901.prometeo.in  # prod
VITE_GOOGLE_CLIENT_ID=<your Google OAuth web client id>
```

Set both in Vercel's project dashboard for production (the frontend deploys there independently of the backend's EC2/Docker pipeline — see `../../backend/docs/observability.md` for that side). `VITE_GOOGLE_CLIENT_ID` is read by the login and signup pages for both the popup flow and One Tap, and the client's "Authorized JavaScript origins" in Google Cloud must list every origin the site is served from (including `http://localhost:5173` for development).

---

## 8. Local Development

```bash
npm install
npm run dev       # Vite dev server
npm run build     # production build (also what CI/Vercel runs)
npm run preview   # serve the production build locally
npm run lint      # ESLint across src/
```

**Docker.** The included `Dockerfile` is a multi-stage build: `npm ci` + `vite build` in a `node:20-alpine` builder stage, then the static `dist/` output served by `nginx:alpine`. `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID` must be passed as build args (see `.dockerignore` — `.env` is excluded from the build context, so they can't be baked in any other way):

```bash
docker build \
  --build-arg VITE_API_URL=https://rahul1901.prometeo.in \
  --build-arg VITE_GOOGLE_CLIENT_ID=<google web client id> \
  -t hacksprint-frontend .
```

The nginx stage uses a custom [`nginx.conf`](nginx.conf), not the stock image default — this matters because it's a client-side-routed SPA. Without `try_files $uri $uri/ /index.html;`, directly loading or refreshing any route other than `/` (e.g. `/dashboard`, `/hackathon/some-slug`) would 404, since no such file exists on disk. This config also enables gzip and long-cache headers for hashed `dist/assets/*` files, and explicitly disables caching on `service-worker.js`.

---

## 9. Conventions Worth Knowing Before Contributing

- **Never** construct a second Axios instance or call the backend outside `api/client.js` — this codebase already had one dead duplicate client removed for exactly this reason.
- **Never** hardcode a service name, `localhost`, or an EC2 IP as an API base URL — always `VITE_API_URL` through the gateway.
- New backend-path constants go in `api/endpoints.js`, not inline in a component.
- File names for components are PascalCase (`HeroSection.jsx`, not `Hero-section.jsx`) — a handful of older kebab-case files were renamed to match; keep new files consistent.
- Outgoing user-authored messages should go through an outbox with a client-generated id (see `useMessageOutbox`) rather than a bare `await send()`, and the matching endpoint should be idempotent on that id.
- Render model-generated or user-generated text as React elements (as `ChatMarkdown` does), never with `dangerouslySetInnerHTML`.
- Light and dark mode are both first-class: use the CSS variables / Tailwind `dark:` variants already in use rather than hardcoded colours, and check both before shipping a page.
- Prefer TanStack Query for new data-fetching over ad hoc `useState`/`useEffect` fetch logic, even though older pages still do it the manual way.
- This project's ESLint config flags destructured render-prop parameters like `{ icon: Icon }` as unused vars — that's a known false positive across many files here, not a real bug to "fix" by renaming things.
