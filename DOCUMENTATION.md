# Einstein's CBT Admin — Developer Documentation

**Product:** Einstein's CBT Admin Portal
**Company:** Mega Tech Solutions
**Framework:** Next.js 15 (App Router)
**Version:** 0.1.0
**Backend API:** `https://cbt-simulator-backend.vercel.app`

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Project Structure](#3-project-structure)
4. [Design System & Styles](#4-design-system--styles)
   - 4.1 [Brand Tokens (Tailwind)](#41-brand-tokens-tailwind)
   - 4.2 [Typography](#42-typography)
   - 4.3 [Shadows & Radii](#43-shadows--radii)
   - 4.4 [Animations & Keyframes](#44-animations--keyframes)
   - 4.5 [Global CSS Component Classes](#45-global-css-component-classes)
   - 4.6 [Styles.js — Centralised Class Strings](#46-stylesjs--centralised-class-strings)
5. [Authentication Architecture](#5-authentication-architecture)
6. [PWA Architecture](#6-pwa-architecture)
7. [App Entry & Routing](#7-app-entry--routing)
   - 7.1 [Root Layout](#71-root-layout-srcapplayoutjsx)
   - 7.2 [Entry Page](#72-entry-page-srcapppagejsx)
   - 7.3 [404 Page](#73-404-page-srcappnot-foundjsx)
8. [Auth Pages](#8-auth-pages)
   - 8.1 [Login](#81-login-srcapploginpagejsx)
   - 8.2 [Register](#82-register-srcappregisterpagejsx)
9. [Context](#9-context)
   - 9.1 [AuthContext](#91-authcontext)
10. [Shared Components](#10-shared-components)
    - 10.1 [ProtectedRoute](#101-protectedroute)
    - 10.2 [SplashScreen](#102-splashscreen)
    - 10.3 [SupportChat](#103-supportchat)
    - 10.4 [UpdateNotification](#104-updatenotification)
    - 10.5 [PWAInstallPrompt](#105-pwainstallprompt)
11. [Dashboard Shell](#11-dashboard-shell)
    - 11.1 [Dashboard Page](#111-dashboard-page)
    - 11.2 [Navbar](#112-navbar)
    - 11.3 [Sidebar](#113-sidebar)
12. [Dashboard Content Sections](#12-dashboard-content-sections)
    - 12.1 [Home](#121-home)
    - 12.2 [Students](#122-students)
    - 12.3 [Subjects](#123-subjects)
    - 12.4 [Questions](#124-questions)
    - 12.5 [Exams](#125-exams)
    - 12.6 [Results](#126-results)
    - 12.7 [Performance](#127-performance)
    - 12.8 [Support](#128-support)
    - 12.9 [Settings](#129-settings)
    - 12.10 [Subscription](#1210-subscription)
    - 12.11 [Help](#1211-help)
13. [Hooks](#13-hooks)
    - 13.1 [useServiceWorker](#131-useserviceworker)
14. [API Reference](#14-api-reference)
15. [LocalStorage Bridge Pattern](#15-localstorage-bridge-pattern)
16. [Cross-Cutting Patterns](#16-cross-cutting-patterns)

---

## 1. Project Overview

Einstein's CBT Admin is a **Progressive Web App (PWA)** administration portal for managing a WAEC/CBT exam simulation platform. It is used by school administrators to:

- Manage student accounts, subjects, and access rights
- Create and configure exams (WAEC, NECO, JAMB, GCE, Internal)
- Build and import question banks
- Monitor exam results and per-student performance analytics
- Manage subscriptions and process payments via Paystack
- Communicate with the Mega Tech support team via a real-time chat widget
- Configure account settings including 2FA security

The admin portal is entirely separate from the student-facing CBT simulator app. Communication with the backend is via a shared REST API hosted on Vercel.

---

## 2. Tech Stack & Dependencies

### Core

| Package | Version | Role |
|---|---|---|
| `next` | ^15.5.12 | React framework (App Router) |
| `react` / `react-dom` | ^19.2.4 | UI runtime |
| `tailwindcss` | ^3.4.17 | Utility-first CSS |
| `framer-motion` | ^12.34.2 | All animations and transitions |
| `react-hot-toast` | ^2.6.0 | Toast notification system |

### UI & Icons

| Package | Role |
|---|---|
| `@nextui-org/react` ^2.6.11 | Tailwind plugin (used in config) |
| `lucide-react` ^0.507.0 | Primary icon set |
| `react-icons` ^5.5.0 | Supplementary icons |
| `@fortawesome/react-fontawesome` | FontAwesome icons |
| `@heroicons/react` ^2.2.0 | Heroicons |

### Utilities

| Package | Role |
|---|---|
| `axios` ^1.8.4 | HTTP client (installed; direct `fetch` used in practice) |
| `js-cookie` ^3.0.5 | Cookie utility |
| `recharts` ^2.15.3 | Chart library (available for future use) |
| `gsap` ^3.12.7 | Animation library (available for future use) |
| `react-signature-canvas` ^1.1.0 | Signature capture (available for future use) |

### Build Config (`next.config.ts`)

```ts
reactStrictMode: true
eslint.ignoreDuringBuilds: true       // ESLint errors don't fail CI builds
typescript.ignoreBuildErrors: true     // TS errors don't fail CI builds
images.unoptimized: true               // Disables Next.js image optimisation
```

---

## 3. Project Structure

```
waec-cbt-admin/
├── public/
│   ├── logo.png                    # Primary app logo (used in 404, PWA prompt, splash)
│   ├── icons/                      # PWA icons (72×72 → 512×512)
│   ├── manifest.json               # PWA web app manifest
│   ├── sw.js                       # Service worker (caching, offline)
│   ├── sw-register.js              # SW registration script (loaded via <script defer>)
│   ├── offline.html                # Offline fallback page
│   └── splash.png                  # Splash image asset
│
├── src/
│   ├── app/
│   │   ├── layout.jsx              # Root layout — AuthProvider, Toaster, PWAInstallPrompt
│   │   ├── page.jsx                # Entry point — SplashScreen + auth redirect
│   │   ├── not-found.jsx           # Custom 404 page
│   │   ├── login/
│   │   │   ├── page.jsx            # Admin login form
│   │   │   ├── styles.js           # Login-specific Tailwind class strings
│   │   │   └── verify-2fa/
│   │   │       └── page.jsx        # Two-factor verification page
│   │   ├── register/
│   │   │   └── page.jsx            # New school registration form
│   │   ├── verify-email/
│   │   │   ├── page.jsx            # Email verification handler
│   │   │   └── pending/
│   │   │       └── page.jsx        # "Check your inbox" waiting screen
│   │   ├── dashboard/
│   │   │   ├── page.jsx            # Dashboard shell (section routing)
│   │   │   ├── student-registration/
│   │   │   │   └── page.jsx        # Create/edit student form
│   │   │   └── subscription/
│   │   │       └── verify/
│   │   │           └── page.jsx    # Post-payment verification (Paystack callback)
│   │   ├── hooks/
│   │   │   └── useServiceWorker.js # SW registration + update detection hook
│   │   ├── data/questions/         # Static question data files (per subject)
│   │   ├── styles.js               # App-level Tailwind class strings
│   │   └── login/styles.js         # Login-specific Tailwind class strings
│   │
│   ├── components/
│   │   ├── ProtectedRoute.jsx      # Auth guard — wraps protected pages
│   │   ├── SplashScreen.jsx        # Animated loading screen
│   │   ├── SupportChat.jsx         # Floating support chat widget
│   │   ├── UpdateNotification.jsx  # "New version available" banner
│   │   ├── PWAInstallPrompt.jsx    # Bottom-right PWA install card
│   │   ├── dashboard-components/
│   │   │   ├── Navbar.jsx          # Top sticky navbar
│   │   │   └── Sidebar.jsx         # Collapsible left sidebar
│   │   └── dashboard-content/
│   │       ├── Home.jsx            # Overview KPIs and stats
│   │       ├── Students.jsx        # Student management table
│   │       ├── Subjects.jsx        # Subject browser
│   │       ├── Questions.jsx       # Question bank CRUD
│   │       ├── Exams.jsx           # Exam setup and management
│   │       ├── Results.jsx         # Exam results viewer and exporter
│   │       ├── Performance.jsx     # Per-student performance analytics
│   │       ├── Support.jsx         # Support ticket creation and list
│   │       ├── Settings.jsx        # Account and system settings
│   │       ├── Subscription.jsx    # Plan selection and payment history
│   │       └── Help.jsx            # FAQ, guides, contact info
│   │
│   ├── context/
│   │   └── AuthContext.jsx         # Global auth state and API wrapper
│   │
│   └── styles/
│       ├── globals.css             # Tailwind base + global CSS vars + component classes
│       └── styles.js               # All centralised Tailwind className strings
│
├── tailwind.config.js              # Theme tokens, fonts, animations
├── next.config.ts                  # Next.js config
├── package.json
├── PLAN.md                         # UI/UX consistency work log
└── DOCUMENTATION.md                # This file
```

---

## 4. Design System & Styles

### 4.1 Brand Tokens (Tailwind)

All custom tokens are defined in `tailwind.config.js` under `theme.extend.colors`.

#### Brand Colours

| Token | Hex | Usage |
|---|---|---|
| `brand-primary` | `#1F2A49` | Primary buttons, active states, borders, headings |
| `brand-primary-dk` | `#141C33` | Hover state for primary buttons |
| `brand-primary-lt` | `#EDF0F7` | Light button backgrounds, active tab backgrounds, spinner track |
| `brand-accent` | `#3A4F7A` | Secondary brand colour, gradient midpoints |
| `brand-gold` | `#FFB300` | Premium/unlimited plan elements, 404 number |
| `brand-navy` | `#0D1220` | Sidebar header background, deepest navy |

#### Surface Tokens

| Token | Hex | Usage |
|---|---|---|
| `surface-muted` | `#F5F7FB` | Page background, empty-state backgrounds |
| `surface-subtle` | `#EDF0F7` | Card inner sections, table row hover, progress bar tracks |

#### Content (Text) Tokens

| Token | Hex | Usage |
|---|---|---|
| `content-primary` | `#0D1117` | Body text, headings |
| `content-secondary` | `#525F7F` | Sub-labels, secondary text |
| `content-muted` | `#8898AA` | Placeholder text, timestamps, metadata |

#### Border Token

| Token | Hex | Usage |
|---|---|---|
| `border` | `#E4E9F0` | All card, input, and divider borders |

#### Status Tokens

| Token | Hex | Usage |
|---|---|---|
| `success` | `#16a34a` | Success badges, pass indicators |
| `success-light` | `#dcfce7` | Success badge backgrounds |
| `success-dark` | `#15803d` | Success hover states |
| `warning` | `#d97706` | Warning badges |
| `warning-light` | `#fef3c7` | Warning badge backgrounds |
| `warning-dark` | `#b45309` | Warning text |
| `danger` | `#dc2626` | Error badges, danger zone |
| `danger-light` | `#fee2e2` | Error badge backgrounds |
| `info` | `#2563eb` | Info badges |
| `info-light` | `#dbeafe` | Info badge backgrounds |

---

### 4.2 Typography

Three font families are imported from Google Fonts in `globals.css`:

| Token | Family | Usage |
|---|---|---|
| `font-inter` | Inter (100–900) | **Default** — all body text, UI labels, buttons |
| `font-playfair` | Playfair Display (400–800) | **H1/H2 headings only** — page titles, large stats |
| `font-mono` | JetBrains Mono | Code or monospace contexts |

> **Rule:** `font-playfair` is only applied to heading-level elements (text-xl and above with font-bold). All body text, labels, badges, and buttons use `font-inter` (the inherited default).

iOS font-size floor of **16px** is set on all inputs (in `globals.css`) to prevent iOS Safari from auto-zooming on focus. This drops to 14px at the `md` breakpoint.

---

### 4.3 Shadows & Radii

#### Box Shadows

| Token | Value | Usage |
|---|---|---|
| `shadow-card` | `0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)` | Default card |
| `shadow-card-md` | `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)` | Hovered card |
| `shadow-card-lg` | `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)` | Modal/elevated card |
| `shadow-brand` | `0 4px 14px rgba(31,42,73,0.3)` | Navy-tinted button shadows |
| `shadow-gold` | `0 4px 14px rgba(255,179,0,0.3)` | Gold-tinted button shadows |

#### Border Radii

| Token | Value |
|---|---|
| `rounded-sm` | 6px |
| `rounded` | 8px |
| `rounded-md` | 10px |
| `rounded-lg` | 12px |
| `rounded-xl` | 16px |
| `rounded-2xl` | 20px |
| `rounded-3xl` | 24px |

---

### 4.4 Animations & Keyframes

Defined in `tailwind.config.js` under `keyframes` and `animation`:

| Animation | Keyframe | Usage |
|---|---|---|
| `spin` | Standard 360° | Loading spinners |
| `pulse` | opacity 1→0.5→1 | Unread dot indicators |
| `shimmer` | translateX(-100%→100%) + gradient | Skeleton loading cards |
| `fade-up` | opacity 0→1, y 10px→0 | Content entrance |
| `pulse-glow` | box-shadow glow expand/contract | Notification badges |
| `ping-once` | scale + fade out (once only) | One-shot attention ping |
| `rotate` | 360° continuous | Custom spinners |
| `beep` | scale 1→1.2→1 | Alert emphasis |
| `blink` | opacity 1→0→1 | Cursor blink |
| `dotBlink` | opacity 0→1→0 | Three-dot typing indicator |
| `gradient` | backgroundPosition shift | Animated gradient backgrounds |

**Framer Motion** is used for all component-level animations:

```js
// Standard card stagger pattern used across all list components
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.25, ease: 'easeOut' }
  }),
};
// Usage: <motion.div custom={i} variants={cardVariants} initial="hidden" animate="visible">

// Dashboard section transition (in dashboard/page.jsx)
<AnimatePresence mode="wait">
  <motion.div
    key={activeSection}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
  >
```

---

### 4.5 Global CSS Component Classes

Defined in `src/styles/globals.css` under `@layer components`. These are reusable utility classes available in any component.

#### Buttons

| Class | Description |
|---|---|
| `.btn-base` | Shared base: flex, centred, font-semibold, transition, min-height 44px |
| `.btn-primary` | Navy background, white text, brand hover |
| `.btn-secondary` | White background, navy border and text |
| `.btn-gold` | Gold background, white text |
| `.btn-danger` | Red background, white text |
| `.btn-ghost` | Transparent, navy text, surface hover |

#### Inputs

| Class | Description |
|---|---|
| `.input-field` | Full-width, border, rounded-lg, brand focus ring |
| `.input-underline` | Borderless, bottom-border only (used in login) |

#### Cards

| Class | Description |
|---|---|
| `.card` | White bg, border-border, shadow-card, rounded-xl |
| `.card-hover` | `.card` + hover:shadow-card-md + hover:border-brand-primary |
| `.card-brand` | Navy bg, white text |
| `.glass` | Backdrop-blur, semi-transparent white background |

#### Badges

| Class | Description |
|---|---|
| `.badge-base` | Inline-flex, rounded-full, text-xs, font-semibold, px-2 py-1 |
| `.badge-success` | Green background and text |
| `.badge-warning` | Amber background and text |
| `.badge-danger` | Red background and text |
| `.badge-info` | Blue background and text |
| `.badge-brand` | Navy background and text |
| `.badge-gold` | Gold background and text |
| `.badge-admin` | Navy background (admin-specific) |

#### Other

| Class | Description |
|---|---|
| `.spinner` | 24px rotating ring in brand colours |
| `.spinner-sm` | 16px variant |
| `.skeleton` | Shimmer animation placeholder block |
| `.progress-bar` | Full-width track, rounded, surface-subtle bg |
| `.progress-fill` | Brand-primary fill with transition |
| `.table-wrapper` | Overflow-x-auto container |
| `.table-header` | `<thead>` styling with surface-muted bg |
| `.table-row` | `<tr>` with border-b and hover bg |
| `.nav-item` | Sidebar/navbar item base |
| `.nav-item-active` | Brand-primary-lt bg, brand-primary text |
| `.nav-item-inactive` | Transparent bg, content-secondary text |

#### iOS Safe Area Utilities

```css
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.pt-safe { padding-top: env(safe-area-inset-top); }
```

---

### 4.6 Styles.js — Centralised Class Strings

`src/styles/styles.js` exports named constants for every layout-level className used across the dashboard. This is the **single source of truth** for structural styles.

Key exports by area:

```js
// Dashboard shell
dashboardContainer   // full-height flex-col wrapper
dashboardMain        // flex row (sidebar + content)
dashboardContent     // main element, flex-1, overflow-y-auto
dashboardInner       // padding wrapper inside animated motion.div

// Dashboard loading screens
dashboardLoading / dashboardLoadingInner / dashboardLoadingSpinner / dashboardLoadingText

// Navbar
navbarContainer / navbarLogo / navbarBreadcrumb / navbarProfileBtn ...

// Sidebar
sidebarContainer / sidebarHeader / sidebarNavGroup / sidebarNavItem / sidebarNavItemActive ...

// Dashboard Home — stat cards
homeStatCard         // gradient card base (text-white, requires inline style background)
homeStatCardTop / homeStatCardIconWrap / homeStatCardIcon / homeStatCardValue / homeStatCardLabel

// Dashboard Home — quick actions
homeActionCard / homeActionIcon / homeActionTitle / homeActionDesc

// Common section headers
examsContainer / examsHeader / examsTitle / examsSubtitle

// Modals
modalOverlay / modalContainer / modalTitle / modalText / modalActions
modalButtonSecondary / modalButtonDanger
```

> **Important:** `homeStatCard` has `text-white` with no background. Every component using it **must** pass an inline `style={{ background: gradient }}` — otherwise the card content is invisible.

---

## 5. Authentication Architecture

### Overview

Authentication uses **HTTP-only cookies** managed entirely by the backend. No JWT or token is stored in client-side storage. The browser automatically sends cookies with every request via `credentials: 'include'`.

### Flow

```
App loads → AuthContext mounts → checkAuth() → GET /api/auth/me
  ├── 200 OK  → user state populated → isAuthenticated = true
  └── 401     → user = null → isAuthenticated = false → redirect to /login

Login → POST /api/auth/login
  ├── Success (no 2FA)  → user state set → redirect to /dashboard
  ├── requiresTwoFactor → redirect to /login/verify-2fa?userId=...&tkn=...
  └── Error             → toast.error(message)

fetchWithAuth() on any API call
  ├── Success → return response
  ├── 401     → POST /api/auth/refresh (attempt silent re-auth)
  │   ├── Refresh OK  → retry original request
  │   └── Refresh 401 → clear user → router.replace('/login')
  └── Other error → return response (caller handles)
```

### AuthContext API

```js
const {
  user,                // Current admin user object or null
  isAuthenticated,     // Boolean — derived from !!user
  authChecked,         // Boolean — true once initial check resolved
  loading,             // Boolean — request in-flight
  login,               // (identifier, password) => Promise
  logout,              // () => Promise — clears cookies, nulls user
  register,            // (formData) => Promise
  verifyEmail,         // (token) => Promise
  verifyTwoFactor,     // (userId, token, tempToken) => Promise
  updateUser,          // (partialData) => void — merges into user state
  refreshUser,         // () => Promise — re-fetches /api/auth/me
  fetchWithAuth,       // (endpoint, options) => Promise<Response>
} = useAuth();
```

### fetchWithAuth

The primary API wrapper. Use this for **all** authenticated requests:

```js
const response = await fetchWithAuth('/admin/students');
if (response.ok) {
  const data = await response.json();
}
```

- Automatically prepends `https://cbt-simulator-backend.vercel.app/api`
- Always includes `credentials: 'include'`
- Handles 401 → refresh → retry silently
- On repeated 401, clears session and redirects to login

---

## 6. PWA Architecture

The app is a fully installable Progressive Web App.

### Components

| File | Role |
|---|---|
| `public/manifest.json` | Web App Manifest — name, icons, start URL, shortcuts |
| `public/sw.js` | Service Worker — caching strategy, offline support |
| `public/sw-register.js` | External registration script loaded via `<script defer>` |
| `public/offline.html` | Fallback page served when offline |
| `src/app/hooks/useServiceWorker.js` | Registration hook with retry logic and update detection |
| `src/components/UpdateNotification.jsx` | Banner shown when new SW version is waiting |
| `src/components/PWAInstallPrompt.jsx` | Native install prompt card |

### Manifest Configuration

```json
{
  "name": "Einstein's CBT Admin",
  "short_name": "CBT Admin",
  "display": "standalone",
  "start_url": "/dashboard",
  "theme_color": "#1F2A49",
  "background_color": "#F5F7FB"
}
```

Shortcuts registered: "Manage Exams" (`/dashboard?section=exams`), "View Results" (`/dashboard?section=results`).

### PWA Install Prompt Logic

`PWAInstallPrompt` intercepts the browser's `beforeinstallprompt` event and surfaces it as a styled card after 3 seconds.

**Will NOT show if:**
- `window.matchMedia('(display-mode: standalone)').matches` → already installed
- `window.navigator.standalone === true` → iOS installed app
- `localStorage.pwa_prompt_dismissed` is set → user previously dismissed

**iOS Note:** `beforeinstallprompt` is not supported on iOS Safari. The component handles this gracefully — it simply doesn't render on iOS.

### Service Worker

`useServiceWorker` hook features:
- Disabled in development (avoids Turbopack conflicts)
- Checks for existing registration before re-registering
- 2-second delay after page `load` before registering
- Up to 3 retries with `3000ms × retryCount` exponential backoff
- Detects `registration.waiting` and `updatefound` events
- `skipWaiting()` posts `{ type: 'SKIP_WAITING' }` to waiting worker then reloads

---

## 7. App Entry & Routing

### 7.1 Root Layout (`src/app/layout.jsx`)

Wraps the entire app. Contains:
- `<AuthProvider>` — global auth context
- `<Toaster>` — global toast notifications (positioned `top-center`)
- `<PWAInstallPrompt>` — global install prompt
- All `<head>` PWA meta tags
- `offline`/`online` event listeners → persistent toast feedback

**Toast Theme:**

| Type | Style |
|---|---|
| Success | `#EDF0F7` bg, `#1F2A49` text, left navy border |
| Error | `#FEF2F2` bg, `#DC2626` text, left red border |
| Loading | `#F9FAFB` bg, `#626060` text, left gray border |

### 7.2 Entry Page (`src/app/page.jsx`)

Route `/`. Shows `<SplashScreen>` for 3 seconds then:
- Authenticated → `router.push('/dashboard')`
- Not authenticated → `router.push('/login')`

The decision waits for `authChecked === true` before redirecting.

### 7.3 404 Page (`src/app/not-found.jsx`)

Automatically rendered by Next.js for any unmatched URL.

**Design:**
- Full-screen dark navy gradient (`#1F2A49 → #141C33`)
- `/public/logo.png` — 80×80px rounded icon
- Gold `#FFB300` large "404" in Playfair Display
- Radial glow decorations in corners
- Framer Motion staggered entrance animations

**CTAs:**
- **← Go Back** — `router.back()` — ghost bordered button
- **Return to Login →** — `router.push('/login')` — white filled button

---

## 8. Auth Pages

### 8.1 Login (`src/app/login/page.jsx`)

Full-screen navy gradient login form.

**State:**

| Variable | Type | Purpose |
|---|---|---|
| `identifier` | string | Email input |
| `password` | string | Password input |
| `rememberMe` | boolean | Remember session checkbox |
| `loading` | boolean | Submission in-flight |
| `showPassword` | boolean | Toggle password visibility |
| `mounted` | boolean | Hydration guard |

**Key Behaviour:**
- On success: `router.push('/dashboard')`
- On 2FA required: `router.push('/login/verify-2fa?userId=...&tkn=...')`
- Forgot password: toast directing admin to contact system admin
- Video loading overlay: `/loader.mp4` plays during submission

**UI Patterns:**
- Underline-only inputs (`.input-underline`) — no border box
- Ghost watermark logo (5% opacity) behind form panel
- Radial centre-glow + corner accent divs
- Admin capabilities listed in 2×2 grid

### 8.2 Register (`src/app/register/page.jsx`)

Two-section form: **Administrator Info** + **School Info**.

**Form Fields:** `email`, `password`, `confirmPassword`, `name`, `schoolName`, `schoolAddress`, `schoolPhone`

**Password Strength Meter:** 5-level bar (Very Weak → Strong) based on:
- Length ≥ 6 (+1), ≥ 10 (+1)
- Contains uppercase (+1)
- Contains number (+1)
- Contains special character (+1)

**On Success:** Stores email in `sessionStorage('pendingVerificationEmail')`, redirects to `/verify-email/pending?email=...`

---

## 9. Context

### 9.1 AuthContext

**File:** `src/context/AuthContext.jsx`
**Provider:** `<AuthProvider>` (wraps entire app in layout.jsx)
**Hook:** `useAuth()`

**Base URL:** `https://cbt-simulator-backend.vercel.app`

**All API Endpoints Used:**

| Method | Endpoint | Function |
|---|---|---|
| GET | `/api/auth/me` | `checkAuth()` — initial load + after refresh |
| POST | `/api/auth/register` | `register(formData)` |
| POST | `/api/auth/verify-email` | `verifyEmail(token)` |
| POST | `/api/auth/login` | `login(identifier, password)` |
| POST | `/api/auth/verify-2fa` | `verifyTwoFactor(userId, token, tempToken)` |
| POST | `/api/auth/refresh` | Internal — auto-called on 401 by `fetchWithAuth` |
| POST | `/api/auth/logout` | `logout()` |

**Context Value Shape:**

```ts
{
  user: User | null,
  isAuthenticated: boolean,       // !!user
  authChecked: boolean,
  loading: boolean,
  login: (identifier, password) => Promise<void>,
  logout: () => Promise<void>,
  register: (formData) => Promise<void>,
  verifyEmail: (token) => Promise<void>,
  verifyTwoFactor: (userId, token, tempToken) => Promise<void>,
  updateUser: (partial: Partial<User>) => void,
  refreshUser: () => Promise<void>,
  fetchWithAuth: (endpoint: string, options?: RequestInit) => Promise<Response>,
}
```

---

## 10. Shared Components

### 10.1 ProtectedRoute

**File:** `src/components/ProtectedRoute.jsx`
**Props:** `{ children }`

Wraps any page that requires authentication. Three render states:

1. `!authChecked` → full-screen spinner (brand-primary-lt background, rotating spinner)
2. `authChecked && !isAuthenticated` → calls `router.replace('/login')`, renders null
3. `authChecked && isAuthenticated` → renders `children`

Used in: `dashboard/page.jsx`

### 10.2 SplashScreen

**File:** `src/components/SplashScreen.jsx`
**Props:** None

Animated loading screen shown at app entry.

**Animations:**
- Logo: scale `[0.3 → 1.1 → 1]` bounce-in, then continuous `[1 → 1.05 → 1]` pulse
- Progress bar: `#2563EB` blue, fills over 5000ms via 50ms `setInterval`
- Three pulsing dots below progress bar
- Framer Motion `AnimatePresence` fade-out when `visible = false`

**Content:** Hardcoded school name "Kogi State College of Education".

### 10.3 SupportChat

**File:** `src/components/SupportChat.jsx`
**Props:** `{ isOpen: boolean, onClose: fn, initialTicket: { id } | null }`

Floating chat widget for admin-to-support communication.

**Views:** `'list'` (ticket list) → `'chat'` (conversation for a specific ticket)

**State:**

| Variable | Purpose |
|---|---|
| `tickets[]` | All support tickets |
| `selectedTicket` | Currently open ticket |
| `newMessage` | Compose input value |
| `view` | `'list'` or `'chat'` |
| `unreadCount` | Badge on FAB button |
| `pollingInterval` ref | 5-second refresh handle |

**API Endpoints:**

| Method | Endpoint | Usage |
|---|---|---|
| GET | `/admin/tickets` | Fetch all tickets + polling |
| POST | `/admin/tickets/{id}/reply` | Send message |

**Key Behaviours:**
- Polls every 5 seconds while open
- Detects new `super_admin` messages → plays audio notification + shows custom toast
- Custom toast is clickable → opens the chat for that ticket
- Dispatches `openChatWithTicket` DOM event (consumed by `dashboard/page.jsx`)
- Closed tickets disable the message input
- Admin bubbles align right (navy), support team bubbles align left (surface-subtle)

**FAB Button:** Fixed `bottom-20 right-4 z-[100]`, pulsing red badge for unread count.

### 10.4 UpdateNotification

**File:** `src/components/UpdateNotification.jsx`
**Props:** `{ show: boolean, onUpdate: fn }`

Small fixed card shown when a new service worker version is available. Navy left-border accent, "Update Now" primary button.

### 10.5 PWAInstallPrompt

**File:** `src/components/PWAInstallPrompt.jsx`
**Props:** None (self-contained)

**Behaviour:**
- Listens for `beforeinstallprompt` browser event
- Waits 3 seconds after event fires before showing
- Silently skips if: standalone mode, iOS standalone, or `localStorage.pwa_prompt_dismissed` set
- "Install App" → calls `deferredPrompt.prompt()`, awaits `userChoice`
- "Not now" → sets `localStorage.pwa_prompt_dismissed = '1'` → permanently dismissed
- `appinstalled` event → auto-hides and marks dismissed

**Animation:** Framer Motion spring slide-up (`stiffness: 280, damping: 26`).

**Layout:** White card, gradient left-accent bar, app icon + text + buttons. Fixed `bottom-4 right-4 z-[9999]`.

---

## 11. Dashboard Shell

### 11.1 Dashboard Page

**File:** `src/app/dashboard/page.jsx`

The master shell component. Manages all navigation state and renders content sections.

**State:**

| Variable | Default | Purpose |
|---|---|---|
| `sidebarOpen` | `true` | Sidebar visibility (auto-false on mobile) |
| `pageLoading` | `true` | 100ms debounce after auth confirmed |
| `activeSection` | `'home'` | Current content section |
| `showSupportChat` | `false` | Support chat overlay |
| `pendingTicket` | `null` | Pre-load a ticket in chat |

**Section Routing:**

```js
switch (activeSection) {
  case 'home':         → <DashboardHome />
  case 'students':     → <Students />
  case 'subjects':     → <Subjects />
  case 'questions':    → <Questions />
  case 'performance':  → <Performance />
  case 'results':      → <Results />
  case 'support':      → <Support onOpenChat={handleOpenChat} />
  case 'settings':     → <Settings />
  case 'help':         → <Help />
  case 'subscription': → <Subscription />
  case 'exams':        → <Exams />
  default:             → <DashboardHome />
}
```

**URL Param Handling:**
- `?section=subscription&payment_ref=XXX` → shows payment success toast, cleans URL
- `?ticketCreated=true` → shows support ticket created toast, cleans URL

**Section Transition:**

```jsx
<AnimatePresence mode="wait">
  <motion.div
    key={activeSection}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
  >
    {renderSection()}
  </motion.div>
</AnimatePresence>
```

### 11.2 Navbar

**File:** `src/components/dashboard-components/Navbar.jsx`
**Props:** `{ activeSection, setActiveSection, onMenuClick, onSupportClick }`

**API:** `GET /api/auth/me` on mount (live user data separate from auth context).

**Features:**
- Hamburger menu (calls `onMenuClick` to toggle sidebar)
- Centre breadcrumb (md+ screens): maps `activeSection` → display name
- Profile avatar: gradient navy initials (`getInitials(name)`)
- Notification bell (visual only)
- Profile dropdown: Account Settings, Help, Support, Sign Out
- Logout confirmation modal (Framer Motion scale-in `0.9 → 1`)
- Click-outside handler closes dropdown

### 11.3 Sidebar

**File:** `src/components/dashboard-components/Sidebar.jsx`
**Props:** `{ isOpen, onClose, activeSection, setActiveSection, onSupportClick }`

**Navigation Groups:**

| Group | Sections |
|---|---|
| MANAGEMENT | Dashboard, Student Management, Subject Management, Question Bank, Exam Setup |
| ANALYTICS | Performance, Exam Results |
| ACCOUNT | Subscription, Support Tickets, Settings, Help & Resources |

**Animation:** Framer Motion spring `x: 0 ↔ -280`. `visibility: hidden` (not `display: none`) when closed — preserves DOM layout.

**Active Indicators:** `layoutId="activeBorder"` and `layoutId="activeDot"` — Framer Motion shared layout animated indicators.

**Mobile:** Semi-transparent overlay (`bg-black/40 backdrop-blur-sm`) blocks background interaction. Sidebar is 264px wide.

**Footer:** "Need assistance?" panel + red "Sign Out" button.

---

## 12. Dashboard Content Sections

### 12.1 Home

**File:** `src/components/dashboard-content/Home.jsx`
**API:** `GET /admin/dashboard/stats`

The overview dashboard. Eight KPI stat cards, quick actions, subscription info, student capacity bar, exam insights, subject performance, recent exams, and score distribution.

**State:**

| Variable | Purpose |
|---|---|
| `stats` | `{ totalStudents, studentsInExamMode, totalExams, averageScore, openTickets, passRate }` |
| `subscription` | Full subscription object |
| `recentExams[]` | Last N exam records |
| `subjectPerformance{}` | Map of subject name → avg score |
| `loading` | Skeleton state |
| `statsError` | Error message or null |

**Derived Data (useMemo):**
- `examBreakdown` — completed, in-progress, auto-submitted, highest/lowest score, avg duration, total tab switches
- `subjectPerfEntries` — sorted subject performance entries

**KPI Cards:**
All use `homeStatCard` from `styles.js` which is `text-white` with **no background**. Each card must receive `style={{ background: gradient }}` with one of `STAT_GRADIENTS`:

```js
const STAT_GRADIENTS = [
  'linear-gradient(135deg, #1F2A49 0%, #3A4F7A 100%)',
  'linear-gradient(135deg, #1F2A49 0%, #2d3f6b 100%)',
  // ... 8 entries
];
```

**Loading State:** Full skeleton grid using `.skeleton` shimmer animation — no content flash.

**Subscription Banner:** Green (`bg-success-light border-success`) if active, amber (`bg-warning-light border-warning`) if inactive/expiring.

### 12.2 Students

**File:** `src/components/dashboard-content/Students.jsx`
**API:** Multiple endpoints (see table below)

Full student management interface. Horizontally scrollable table, client-side search, paginated API fetch (50 per page).

**API Endpoints:**

| Method | Endpoint | Usage |
|---|---|---|
| GET | `/admin/students?limit=50&page={n}` | List students |
| GET | `/admin/subjects` | Populate "Add Subject" select |
| GET | `/admin/students/{id}` | Pre-load for performance view |
| DELETE | `/admin/students/{id}` | Delete student |
| POST | `/admin/students/{id}/subjects` | Add subject to student |
| DELETE | `/admin/students/{id}/subjects` | Remove subject |
| PATCH | `/admin/students/{id}/exam-mode` | Toggle exam mode on/off |

**Key Actions:**
- **View** — fetches full student, stores to localStorage, navigates to `performance` section
- **Edit** — stores student to `localStorage('edit_student')`, pushes to `/dashboard/student-registration?edit=true`
- **Toggle Exam Mode** — PATCH request, updates table row in-place
- **Add Subject** — modal with subject select dropdown
- **Remove Subject** — inline × button on each subject pill
- **Delete** — confirmation modal

**Search:** Client-side filter across `name`, `email`, `loginId`, `NIN`.

### 12.3 Subjects

**File:** `src/components/dashboard-content/Subjects.jsx`
**API:** `GET /admin/subjects`

Read-only subject browser. Supports search by name/code and filter by exam type.

**Exam Types:** WAEC, NECO, JAMB, GCE, Internal

**Card Shows:** Subject name, code, description, exam type badge, duration, question count, "Global" badge (if `subject.isGlobal`).

**"Manage Questions":** Stores selected subject to `localStorage('selected_subject')` and navigates to `questions` section.

**Animations:** Staggered `cardVariants` on each card (`delay: i * 0.06`), `whileHover={{ y: -4 }}`.

### 12.4 Questions

**File:** `src/components/dashboard-content/Questions.jsx`
**API:** Multiple endpoints

Full CRUD question bank with single-entry and bulk import modes.

**API Endpoints:**

| Method | Endpoint | Usage |
|---|---|---|
| GET | `/admin/questions` | Fetch all questions |
| GET | `/admin/subjects` | Populate subject filter |
| POST | `/admin/questions` | Create single question |
| PUT | `/admin/questions/{id}` | Edit question |
| DELETE | `/admin/questions/{id}` | Delete question |
| POST | `/admin/questions/bulk-import` | Bulk JSON/CSV import |

**Question Form Fields:**
`subjectId`, `question`, `options[4]`, `correctAnswer` (A/B/C/D), `marks`, `difficulty` (easy/medium/hard), `topic`, `class`, `mode` (exam/practice), `explanation`

**Bulk Import:**
- Accepts raw JSON textarea or CSV file upload
- CSV parser converts rows to JSON automatically
- "Download Template" generates a sample CSV
- Feature-gated: `canUseBulkImport = user?.subscription?.plan !== 'monthly'`

**Filters:** Subject, mode (exam/practice), difficulty (easy/medium/hard), free-text search

**Pagination:** Client-side, 10 per page.

**Pre-selection:** On mount, reads `localStorage('selected_subject')` and pre-selects subject filter.

### 12.5 Exams

**File:** `src/components/dashboard-content/Exams.jsx`
**API:** Multiple endpoints

Exam setup manager with full lifecycle: create → assign students → activate → deactivate → view results → delete.

**API Endpoints:**

| Method | Endpoint | Usage |
|---|---|---|
| GET | `/admin/exam-setups?limit=50&page={n}` | List exams |
| GET | `/admin/subjects` | Subject selector |
| GET | `/admin/students` | Student assignment |
| GET | `/admin/questions` | Available question counts |
| GET | `/admin/exam-setups/{id}/results` | Inline results view |
| POST | `/admin/exam-setups` | Create exam |
| PUT | `/admin/exam-setups/{id}` | Edit exam |
| DELETE | `/admin/exam-setups/{id}` | Delete exam |
| PATCH | `/admin/exam-setups/{id}/activate` | Activate exam |
| PATCH | `/admin/exam-setups/{id}/deactivate` | Deactivate exam |
| POST | `/admin/exam-setups/{id}/students` | Assign students |

**Exam Form Fields:**

```js
{
  title, description, class,
  subjects: [{ subjectId, questionCount }],  // Multi-subject support
  duration,           // Minutes
  passMark,           // Percentage threshold
  startDate, startTime, endDate, endTime,
  instructions,
  allowRetake,        // Boolean
  shuffleQuestions,   // Boolean
  showResults,        // Boolean — show results to students after exam
  questionSelection,  // 'random' | 'sequential'
}
```

**Multi-Subject Exam Builder:** `addSubject()` / `removeSubject(index)` dynamically add/remove subject slots. Each slot shows available question count and estimated marks.

**Question Count Input — Validated:**

```js
// Clamped onChange — prevents NaN and overflow
const raw = parseInt(e.target.value, 10);
if (isNaN(raw)) { handleSubjectChange(index, 'questionCount', ''); return; }
handleSubjectChange(index, 'questionCount', Math.min(Math.max(1, raw), availableQuestions || 100));
```

**Student Assignment:** Filter by class, "Select All in Class" toggle, individual checkboxes.

**Status Badges:** `draft`, `active`, `completed`, `cancelled` — each with semantic colour tokens.

### 12.6 Results

**File:** `src/components/dashboard-content/Results.jsx`
**API:** `GET /admin/exam-setups`, `GET /admin/exam-setups/{id}/results`

Results viewer with aggregate stats, per-exam breakdown, and export capabilities.

**Top Stats Bar:** Total Exams, Results Submitted, Average Score, Pass Rate (computed by looping through each exam's results on load).

**Per-Exam Modal:** Shows 5 sub-stats (Total Students, Submitted, Avg Score, Pass Rate, Distinctions) + scrollable student-by-student table.

**Table Row Colours:** Based on score tier:
- ≥75% → `bg-green-100 text-green-600`
- ≥60% → `bg-blue-100 text-blue-600`
- ≥50% → `bg-yellow-100 text-yellow-600`
- <50% → `bg-red-100 text-red-600`

**Export Functions:**

| Format | Method |
|---|---|
| CSV | Builds comma-separated string, downloads via `Blob` + `<a>` click |
| PDF | Opens print window with fully styled HTML (tables, branded header), calls `window.print()` |
| Word | Creates `.doc` via `application/msword` Blob |

**Print CSS:** Uses brand navy `#1F2A49` for headings and table headers in the generated PDF/print HTML.

### 12.7 Performance

**File:** `src/components/dashboard-content/Performance.jsx`
**API:** None — reads from localStorage (populated by Students section)

Per-student analytics view. Shows KPI cards, subject performance bars, and recent exam history.

**LocalStorage Keys Read:**

| Key | Set By | Content |
|---|---|---|
| `selected_student` | Students.jsx | Full student object |
| `student_exams` | Students.jsx | Array of exam records |

**Safe LocalStorage Parse:**

```js
const safeParseLS = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    return JSON.parse(raw);
  } catch { return null; }
};
```

**Computed Stats:**
- `completedExams` — exams where `status === 'completed'`
- `averageScore` — mean of `exam.percentage` across completed exams
- `subjectMap` — grouped per-subject average from `exam.subjects[].subjectName`

**KPI Cards:** Three cards with `PERF_GRADIENTS` inline styles — same pattern as Home.jsx.

**Subject Score Bar Colours:**
- ≥70% → `bg-success-light` fill
- ≥50% → `bg-warning-light` fill
- <50% → `bg-danger-light` fill

**Empty State:** If `!selectedStudent`, renders a "Go to Students →" CTA.

### 12.8 Support

**File:** `src/components/dashboard-content/Support.jsx`
**Props:** `{ setActiveSection, onOpenChat }`
**API:** `GET /admin/tickets`, `POST /admin/tickets`

Ticket management panel with 10-second polling.

**API Endpoints:**

| Method | Endpoint | Usage |
|---|---|---|
| GET | `/admin/tickets` | List tickets (and polling refresh) |
| POST | `/admin/tickets` | Create new ticket |

**Ticket Create Form:** `subject`, `category` (technical/bug/feature/account/other), `priority` (low/medium/high), `description`

**Unread Detection:**

```js
const hasUnreadMessages = (ticket) =>
  ticket.messages?.some(msg => msg.sender === 'super_admin' && !msg.read);
```

Tickets with unread messages show a double navy border + pulsing dot.

**Stat Boxes:** Total Tickets, Open, In Progress, High Priority — computed client-side from `tickets` array.

**Polling:** `setInterval` every 10 seconds while component is mounted. Cleared on unmount.

### 12.9 Settings

**File:** `src/components/dashboard-content/Settings.jsx`

Five-tab settings panel. Tabs slide via `AnimatePresence mode="wait"`.

**Tabs:**

| Tab | Key | Content |
|---|---|---|
| Profile | `profile` | Name, phone, school info editing |
| Security | `security` | Password change, 2FA enable/disable |
| Notifications | `notifications` | Email/in-app notification toggles |
| Exam Settings | `exam` | Default pass mark, duration, question count |
| Appearance | `appearance` | Theme colour, compact mode, dark mode (coming soon) |

**API Endpoints:**

| Method | Endpoint | Usage |
|---|---|---|
| PUT | `/admin/profile` | Update profile |
| POST | `/admin/change-password` | Change password |
| POST | `/auth/setup-2fa` | Generate 2FA QR code |
| POST | `/auth/verify-2fa-setup` | Confirm 2FA with token |
| POST | `/auth/disable-2fa` | Disable 2FA |
| POST | `/settings/notifications` | Save notification prefs |
| POST | `/settings/exam` | Save exam defaults |
| POST | `/settings/appearance` | Save appearance prefs |
| DELETE | `/auth/delete-account` | Delete account |

**2FA Flow:**
1. Click "Enable 2FA" → `POST /auth/setup-2fa` → receives QR code image URL
2. QR displayed → user scans with authenticator app
3. User enters 6-digit token → auto-advances between 6 input boxes
4. `POST /auth/verify-2fa-setup` with token → 2FA enabled

**Toggle Component:** Reusable CSS-only toggle switch built inline:

```jsx
const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-11 h-6 bg-surface-subtle ... peer-checked:bg-brand-primary" />
  </label>
);
```

**Danger Zone:** Red card at bottom of Security tab. "Delete Account" requires `window.confirm()` before firing. On success, redirects to `/login`.

### 12.10 Subscription

**File:** `src/components/dashboard-content/Subscription.jsx`

Plan selection and payment management. Integrates with Paystack for payment processing.

**API Endpoints:**

| Method | Endpoint | Usage |
|---|---|---|
| GET | `/admin/subscription/plans` | Fetch available plans |
| GET | `/admin/subscription/status` | Current subscription status |
| GET | `/admin/subscription/payments` | Payment history |
| GET | `/admin/payment/methods` | Available payment methods |
| POST | `/admin/subscription/initialize` | Initiate Paystack payment |

**Plan Tiers:** Monthly, Termly, Yearly, Unlimited (in display order)

**Payment Flow:**
1. Select plan → click "Get Started"
2. `POST /admin/subscription/initialize` → returns `{ payment: { authorizationUrl } }`
3. Store `{ planKey, planName }` in `sessionStorage('pendingPayment')`
4. `window.location.href = authorizationUrl` → Paystack hosted payment page
5. Paystack redirects back to `/dashboard?section=subscription&payment_ref=XXX`
6. `dashboard/page.jsx` detects `payment_ref` → shows success toast, cleans URL

**Unlimited Plan Styling:** Uses `brand-gold` (#FFB300) elements — gold price text, gold "BEST VALUE" badge, gold "Get Started" button (`bg-brand-gold hover:bg-warning-dark`).

**All Other Plans:** `bg-brand-primary` buttons.

**Currency:** Nigerian Naira (NGN) formatted via `Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' })`.

### 12.11 Help

**File:** `src/components/dashboard-content/Help.jsx`

Static help and resources page. No API calls.

**Sections:**
1. **Guide Cards** — 3-column grid with gradient backgrounds. Topics: Getting Started, Creating Exams, Managing Students, Analysing Results
2. **FAQ Accordion** — Toggle `activeFaq` state, Framer Motion animated height
3. **Contact Methods** — Email, Phone, Live Chat, Knowledge Base in a card grid
4. **System Info** — Current version (v2.5.0), last update date, documentation link
5. **CTA Banner** — Navy background, "Contact Support Now" button → opens Support section
6. **Contact Form Modal** — Subject + message fields (no API call — closes on submit)

---

## 13. Hooks

### 13.1 useServiceWorker

**File:** `src/app/hooks/useServiceWorker.js`

```js
const { swStatus, updateAvailable, skipWaiting } = useServiceWorker();
```

| Return | Type | Values |
|---|---|---|
| `swStatus` | string | `'loading'`, `'development'`, `'unsupported'`, `'registered'`, `'failed'` |
| `updateAvailable` | boolean | `true` when a new SW version is waiting |
| `skipWaiting` | function | Posts `SKIP_WAITING` to SW, reloads page |

**Disabled in:** `process.env.NODE_ENV === 'development'` (avoids Turbopack conflicts).

**Registration Delay:** 2000ms after `document.readyState === 'complete'` to avoid blocking initial paint.

**Retry Logic:** Up to 3 retries with `3000ms × retryCount` delay between attempts.

---

## 14. API Reference

All requests use `fetchWithAuth()` from `AuthContext`. Base URL: `https://cbt-simulator-backend.vercel.app/api`

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| GET | `/auth/me` | Get current user |
| POST | `/auth/login` | Admin login |
| POST | `/auth/logout` | Logout |
| POST | `/auth/register` | Register new school |
| POST | `/auth/verify-email` | Verify email token |
| POST | `/auth/refresh` | Refresh auth session |
| POST | `/auth/verify-2fa` | Verify 2FA code on login |
| POST | `/auth/setup-2fa` | Generate 2FA QR code |
| POST | `/auth/verify-2fa-setup` | Confirm 2FA setup |
| POST | `/auth/disable-2fa` | Disable 2FA |
| DELETE | `/auth/delete-account` | Delete admin account |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/dashboard/stats` | All KPI data for Home section |

### Students

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/students?limit=N&page=N` | Paginated student list |
| GET | `/admin/students/{id}` | Single student with exams |
| DELETE | `/admin/students/{id}` | Delete student |
| POST | `/admin/students/{id}/subjects` | Add subject to student |
| DELETE | `/admin/students/{id}/subjects` | Remove subject |
| PATCH | `/admin/students/{id}/exam-mode` | Toggle exam mode |

### Subjects

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/subjects` | All subjects available to school |

### Questions

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/questions` | All questions |
| POST | `/admin/questions` | Create single question |
| PUT | `/admin/questions/{id}` | Edit question |
| DELETE | `/admin/questions/{id}` | Delete question |
| POST | `/admin/questions/bulk-import` | Bulk import (JSON) |

### Exams

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/exam-setups?limit=N&page=N` | Paginated exam list |
| POST | `/admin/exam-setups` | Create exam |
| PUT | `/admin/exam-setups/{id}` | Edit exam |
| DELETE | `/admin/exam-setups/{id}` | Delete exam |
| PATCH | `/admin/exam-setups/{id}/activate` | Activate |
| PATCH | `/admin/exam-setups/{id}/deactivate` | Deactivate |
| POST | `/admin/exam-setups/{id}/students` | Assign students |
| GET | `/admin/exam-setups/{id}/results` | Exam results |

### Results

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/exam-setups/{id}/results` | Per-exam student results |

### Support Tickets

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/tickets` | All tickets |
| POST | `/admin/tickets` | Create ticket |
| POST | `/admin/tickets/{id}/reply` | Reply to ticket |

### Settings

| Method | Endpoint | Description |
|---|---|---|
| PUT | `/admin/profile` | Update profile |
| POST | `/admin/change-password` | Change password |
| POST | `/settings/notifications` | Save notification settings |
| POST | `/settings/exam` | Save exam defaults |
| POST | `/settings/appearance` | Save appearance settings |

### Subscription & Payments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/subscription/plans` | Available plan tiers |
| GET | `/admin/subscription/status` | Current subscription |
| GET | `/admin/subscription/payments` | Payment history |
| GET | `/admin/payment/methods` | Payment methods |
| POST | `/admin/subscription/initialize` | Initiate Paystack payment |

---

## 15. LocalStorage Bridge Pattern

Several sections communicate by writing/reading `localStorage`. This avoids prop drilling and API re-fetching for data already loaded.

| Key | Written By | Read By | Content |
|---|---|---|---|
| `selected_student` | `Students.jsx → handleViewStudent()` | `Performance.jsx` | Full student object |
| `student_exams` | `Students.jsx → handleViewStudent()` | `Performance.jsx` | Array of exam records |
| `student_performance` | `Students.jsx → handleViewStudent()` | `Performance.jsx` | Performance data (if provided by API) |
| `edit_student` | `Students.jsx → handleEditStudent()` | `student-registration/page.jsx` | Student object for editing |
| `selected_subject` | `Subjects.jsx → handleViewQuestions()` | `Questions.jsx` (mount) | Subject object |
| `pwa_prompt_dismissed` | `PWAInstallPrompt.jsx` | `PWAInstallPrompt.jsx` | `'1'` if dismissed |

**Safe Parse Pattern** (used in Performance.jsx):

```js
const safeParseLS = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    return JSON.parse(raw);
  } catch { return null; }
};
```

> Always use this pattern when reading from localStorage. `JSON.stringify(undefined)` produces the literal string `"undefined"`, which causes `JSON.parse()` to throw.

---

## 16. Cross-Cutting Patterns

### Firestore Timestamp Handling

The backend returns Firestore timestamps as `{ _seconds, _nanoseconds }` objects. Every `formatDate` utility across all components checks for this:

```js
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp._seconds
    ? new Date(timestamp._seconds * 1000)
    : new Date(timestamp);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
```

### Staggered Card Animations

Used in Questions, Subjects, Exams, Subscription, Support, and Home:

```js
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: 'easeOut' }
  }),
};

// Component:
<motion.div
  key={item.id}
  custom={i}
  variants={cardVariants}
  initial="hidden"
  animate="visible"
  whileHover={{ y: -4, transition: { duration: 0.15 } }}
>
```

### Skeleton Loading

All content sections show skeleton cards during loading. Use the `.skeleton` utility class:

```jsx
<div className="skeleton rounded-xl h-24 w-full" />
```

The shimmer animation is defined in `globals.css` via `@keyframes shimmer`.

### Pagination Pattern

API-level pagination (50 per page) used in Students, Exams, Results:

```js
const [page, setPage] = useState(1);
const [totalCount, setTotalCount] = useState(0);
const LIMIT = 50;

// Fetch
GET /admin/students?limit=50&page={page}

// UI
const totalPages = Math.ceil(totalCount / LIMIT);
<button onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</button>
<span>Page {page} of {totalPages}</span>
<button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next</button>
```

### Modal Pattern

All modals use Framer Motion `AnimatePresence` + `motion.div`:

```jsx
<AnimatePresence>
  {showModal && (
    <motion.div
      className={modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={modalContainer}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* modal content */}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

### Status Badge Colours

Consistent across all components:

```js
// Ticket / general status
'open'        → 'bg-brand-primary-lt text-brand-primary'
'in_progress' → 'bg-warning-light text-warning-dark'
'closed'      → 'bg-surface-subtle text-content-muted'

// Exam status
'active'    → 'bg-success-light text-success'
'draft'     → 'bg-surface-subtle text-content-muted'
'completed' → 'bg-info-light text-info'
'cancelled' → 'bg-danger-light text-danger'

// Priority
'high'   → 'bg-danger-light text-danger'
'medium' → 'bg-warning-light text-warning-dark'
'low'    → 'bg-success-light text-success'
```

### Font Usage Rule

```
font-playfair  → H1/H2 headings only (text-xl+ with font-bold)
               → Examples: page titles, section headers, 404 number
               → Defined as named tokens in styles.js: examsTitle, homeTitle, etc.

font-inter     → Everything else (inherited default — do not declare explicitly)
               → All labels, badges, buttons, body text, table cells
```

---

*Documentation generated for Einstein's CBT Admin v0.1.0 — Mega Tech Solutions*
*Last updated: March 2026*
