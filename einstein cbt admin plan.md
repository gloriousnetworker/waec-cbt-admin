# Einstein CBT Admin — Comprehensive Project Plan

> **Live URL:** https://einsteinsadmin.vercel.app/
> **Backend API:** https://cbt-simulator-backend.vercel.app
> **Project Type:** Progressive Web App (PWA) — School Administrator Dashboard
> **Framework:** Next.js 15 (App Router) · React 19 · JavaScript/JSX
> **Last Audited:** 2026-03-21

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Directory Structure](#3-directory-structure)
4. [Technology Stack](#4-technology-stack)
5. [Authentication & Authorization System](#5-authentication--authorization-system)
6. [Page Routes & Navigation](#6-page-routes--navigation)
7. [Dashboard Sections (Features)](#7-dashboard-sections-features)
8. [Data Models](#8-data-models)
9. [API Layer](#9-api-layer)
10. [State Management](#10-state-management)
11. [PWA Implementation](#11-pwa-implementation)
12. [Payment Integration (Paystack)](#12-payment-integration-paystack)
13. [UI/UX System](#13-uiux-system)
14. [Environment Variables & Configuration](#14-environment-variables--configuration)
15. [Known Gaps & Incomplete Features](#15-known-gaps--incomplete-features)
16. [Improvement Roadmap](#16-improvement-roadmap)

---

## 1. Project Overview

Einstein CBT Admin is the **school administrator dashboard** for the Einstein CBT simulation platform. It enables school admins to:

- Register their school and manage admin profile
- Manage student accounts (create, edit, delete, assign subjects)
- Build a question bank per subject
- Create and configure exams (duration, pass mark, scheduling)
- Activate exams and assign them to students or full classes
- View exam results and performance analytics
- Manage subscription and process payments via Paystack
- Communicate with the super admin via support tickets
- Run as an installable PWA on any device (works offline for cached pages)

**Target Users:** School administrators / teachers managing WAEC-style CBT exams for their students.

**Companion Apps:**
- **Student-side app** — where students log in and take exams
- **Super Admin app** — platform-level management, ticket resolution, subscription oversight

---

## 2. Architecture Overview

```
Browser (Admin)
      │
      │  All requests to /api/* (same-origin)
      ▼
Next.js App (Vercel)                  ← einsteinsadmin.vercel.app
  ├── App Router Pages (JSX)
  ├── React Context (AuthContext)
  └── /api/[...path]/route.js         ← Same-origin proxy
              │
              │  Server-to-server (no ITP restrictions)
              ▼
  Backend API (Vercel Serverless)     ← cbt-simulator-backend.vercel.app
  └── Database (abstracted)
              │
              ▼
  Paystack (payment gateway)          ← for subscription payments
```

### Why the Proxy?
iOS Safari ITP (Intelligent Tracking Prevention) and PWA standalone mode block third-party cookies. The `/api/[...path]` proxy makes all API calls **first-party** (same origin), so auth cookies work reliably on all platforms and browsers.

---

## 3. Directory Structure

```
waec-cbt-admin/
├── public/
│   ├── icons/                        # PWA app icons (72px → 512px)
│   ├── logo.png                      # App logo
│   ├── manifest.json                 # PWA manifest
│   ├── offline.html                  # Offline fallback page
│   ├── sw.js                         # Service worker
│   ├── sw-register.js                # SW registration helper
│   ├── splash.png                    # Splash screen image
│   └── loader.mp4                    # Login screen animation
│
├── src/
│   ├── app/
│   │   ├── api/[...path]/route.js    # Proxy to backend (all methods)
│   │   ├── login/
│   │   │   ├── page.jsx              # Login form
│   │   │   ├── styles.js             # Login Tailwind class strings
│   │   │   └── verify-2fa/page.jsx   # 2FA verification page
│   │   ├── register/page.jsx         # School admin registration
│   │   ├── verify-email/
│   │   │   ├── page.jsx              # Email verification handler
│   │   │   └── pending/page.jsx      # "Check your inbox" screen
│   │   ├── dashboard/
│   │   │   ├── page.jsx              # Dashboard shell (section router)
│   │   │   ├── student-registration/page.jsx  # Student create/edit form
│   │   │   └── subscription/verify/page.jsx   # Paystack callback handler
│   │   ├── data/questions/           # Static WAEC question data per subject
│   │   │   ├── index.js              # Exports all subjects
│   │   │   ├── mathematics.js
│   │   │   ├── english.js
│   │   │   ├── biology.js
│   │   │   ├── physics.js
│   │   │   ├── chemistry.js
│   │   │   ├── economics.js
│   │   │   ├── government.js
│   │   │   ├── accounting.js
│   │   │   ├── commerce.js
│   │   │   ├── geography.js
│   │   │   ├── literature.js
│   │   │   ├── civiledu.js
│   │   │   ├── agricscience.js
│   │   │   ├── dataprocessing.js
│   │   │   ├── crk.js
│   │   │   └── irk.js
│   │   ├── hooks/useServiceWorker.js # PWA SW hook
│   │   ├── styles/styles.js          # App-level Tailwind class strings
│   │   ├── layout.jsx                # Root layout (AuthProvider, Toaster)
│   │   ├── page.jsx                  # Entry point (splash/redirect)
│   │   └── not-found.jsx             # Custom 404 page
│   │
│   ├── components/
│   │   ├── ProtectedRoute.jsx        # Auth guard HOC
│   │   ├── SplashScreen.jsx          # Animated loading screen
│   │   ├── SupportChat.jsx           # Floating chat widget
│   │   ├── UpdateNotification.jsx    # PWA update banner
│   │   ├── PWAInstallPrompt.jsx      # Install to home screen card
│   │   ├── Navbar.jsx                # Landing page navbar
│   │   ├── Footer.jsx                # Landing page footer
│   │   ├── ManualSWRegister.jsx      # SW registration fallback
│   │   ├── OfflineDetector.jsx       # Network status detector
│   │   ├── ChunkErrorBoundary.jsx    # React error boundary
│   │   ├── dashboard-components/
│   │   │   ├── Navbar.jsx            # Dashboard top bar
│   │   │   ├── Sidebar.jsx           # Collapsible left nav
│   │   │   ├── Content.jsx           # Content wrapper
│   │   │   └── Footer.jsx            # Dashboard footer
│   │   └── dashboard-content/
│   │       ├── Home.jsx              # KPI stats & quick actions
│   │       ├── Students.jsx          # Student CRUD & management
│   │       ├── Subjects.jsx          # Subject browser
│   │       ├── Questions.jsx         # Question bank CRUD
│   │       ├── Exams.jsx             # Exam creation & management
│   │       ├── Results.jsx           # Results viewer & export
│   │       ├── Performance.jsx       # Student performance analytics
│   │       ├── Support.jsx           # Support ticket system
│   │       ├── Settings.jsx          # Account & system settings
│   │       ├── Subscription.jsx      # Plan & payment management
│   │       └── Help.jsx              # FAQ & documentation
│   │
│   ├── context/AuthContext.jsx       # Global auth state + API wrapper
│   ├── lib/api.js                    # API endpoint constants
│   ├── utils/api.js                  # Authenticated fetch utilities
│   └── styles/
│       ├── globals.css               # Tailwind base + CSS custom properties
│       └── styles.js                 # Centralized Tailwind class strings
│
├── .env                              # Environment variables
├── package.json
├── tailwind.config.js
├── next.config.ts
├── vercel.json
├── tsconfig.json
└── [documentation files]
```

---

## 4. Technology Stack

### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^15.5.12 | React framework, App Router, SSR |
| `react` | ^19.2.4 | UI runtime |
| `react-dom` | ^19.2.4 | DOM rendering |

### Styling & UI
| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^3.4.17 | Utility-first CSS (primary styling) |
| `@nextui-org/react` | ^2.6.11 | Theme plugin for Tailwind |
| `framer-motion` | ^12.34.2 | Animations, transitions, page motion |
| `gsap` | ^3.12.7 | Advanced animations (installed, available) |

### Icons
| Package | Purpose |
|---------|---------|
| `lucide-react` | Primary icon set (24×24) |
| `react-icons` | Supplementary (FontAwesome, Feather, etc.) |
| `@heroicons/react` | Tailwind Labs icons |
| `@fortawesome/react-fontawesome` | FontAwesome solid icons |

### Data & State
| Package | Purpose |
|---------|---------|
| `js-cookie` | Cookie management |
| `axios` | HTTP client (installed; native fetch used in practice) |
| `recharts` | Charts & data visualization (available, not fully used) |

### Notifications
| Package | Purpose |
|---------|---------|
| `react-hot-toast` | Primary toast/notification system |
| `react-toastify` | Alternative toasts (installed) |

### Utilities
| Package | Purpose |
|---------|---------|
| `react-signature-canvas` | Signature capture (installed, available) |
| `@types/next-pwa` | PWA TypeScript types |

---

## 5. Authentication & Authorization System

### Login Flow

```
Admin enters email + password
        │
        ▼
POST /api/auth/login
        │
        ├── 2FA disabled? ──→ Set cookies (accessToken + refreshToken)
        │                     Update AuthContext.user
        │                     Redirect to /dashboard
        │
        └── 2FA enabled? ──→ Response: { requiresTwoFactor, userId, tempToken }
                              Redirect to /login/verify-2fa
                                    │
                                    ▼
                              User enters 6-digit TOTP code
                                    │
                                    ▼
                              POST /api/auth/verify-2fa
                                    │
                                    ▼
                              Set cookies → Redirect to /dashboard
```

### Registration Flow

```
Admin fills registration form (/register)
        │
        ▼
POST /api/auth/register
        │
        ▼
Account created (pending_email_verification)
Verification email sent
        │
        ▼
Redirect to /verify-email/pending
        │
        ▼
User clicks email link → /verify-email?token=X
        │
        ▼
POST /api/auth/verify-email (token)
        │
        ▼
Account activated → Redirect to /login
```

### Session Management
- **Access Token:** 15-minute expiry (httpOnly cookie)
- **Refresh Token:** 7-day expiry (httpOnly cookie)
- **Token Refresh:** Automatic on `401` response → `POST /api/auth/refresh`
- **Session Check:** On every app load, `GET /api/auth/me` validates session
- **Logout:** `POST /api/auth/logout` clears cookies

### 2FA (TOTP-Based)

**Setup:**
1. Admin → Settings → Security → Enable 2FA
2. `POST /api/auth/setup-2fa` → Returns QR code (data:image PNG)
3. Admin scans with Google Authenticator / Authy
4. Enters 6-digit code → `POST /api/auth/verify-2fa-setup`
5. Backend activates 2FA, returns backup codes

**Disable:**
1. Admin enters current password
2. `POST /api/auth/disable-2fa` → 2FA deactivated

**Backup Codes:**
- Generated during 2FA setup (one-time use)
- Regenerate on demand: `POST /api/auth/generate-backup-codes`

### Authorization (RBAC)
| Role | Access |
|------|--------|
| `admin` | Own school data only (students, exams, results, settings) |
| `super_admin` | All schools, platform settings, ticket responses |

> **Note:** Authorization is **backend-enforced**. Frontend does not hide admin-only UI elements — it relies on backend returning `403` or `401`.

### Route Protection
- `ProtectedRoute.jsx` wraps all dashboard pages
- Reads `isAuthenticated` from `AuthContext`
- Shows spinner while checking, redirects to `/login` if unauthenticated
- `AuthContext` provides `fetchWithAuth()` — auto-retries with token refresh on `401`

---

## 6. Page Routes & Navigation

### Public Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `app/page.jsx` | Splash screen → redirect based on auth state |
| `/login` | `app/login/page.jsx` | Email + password login |
| `/login/verify-2fa` | `app/login/verify-2fa/page.jsx` | 6-digit TOTP code entry |
| `/register` | `app/register/page.jsx` | New school admin registration |
| `/verify-email` | `app/verify-email/page.jsx` | Token-based email verification |
| `/verify-email/pending` | `app/verify-email/pending/page.jsx` | "Check your inbox" screen |

### Protected Routes (Dashboard Shell)
| Route | Section Param | Component | Description |
|-------|--------------|-----------|-------------|
| `/dashboard` | `home` (default) | `Home.jsx` | KPI overview, quick actions |
| `/dashboard?section=students` | `students` | `Students.jsx` | Student management |
| `/dashboard?section=subjects` | `subjects` | `Subjects.jsx` | Subject browser |
| `/dashboard?section=questions` | `questions` | `Questions.jsx` | Question bank CRUD |
| `/dashboard?section=exams` | `exams` | `Exams.jsx` | Exam creation & management |
| `/dashboard?section=results` | `results` | `Results.jsx` | Results viewer & export |
| `/dashboard?section=performance` | `performance` | `Performance.jsx` | Student analytics |
| `/dashboard?section=support` | `support` | `Support.jsx` | Support tickets |
| `/dashboard?section=settings` | `settings` | `Settings.jsx` | Account settings |
| `/dashboard?section=subscription` | `subscription` | `Subscription.jsx` | Plan & payments |
| `/dashboard?section=help` | `help` | `Help.jsx` | FAQ & docs |

### Special Routes
| Route | Description |
|-------|-------------|
| `/dashboard/student-registration` | Student create/edit form (full page) |
| `/dashboard/subscription/verify` | Paystack payment callback handler |
| `/api/[...path]` | Proxy to backend API |
| `*` | Custom 404 page (`not-found.jsx`) |

### Sidebar Navigation Order
1. Home
2. Students
3. Subjects
4. Questions
5. Exams
6. Results
7. Performance
8. Support
9. Settings
10. Subscription
11. Help

---

## 7. Dashboard Sections (Features)

### 7.1 Home (`Home.jsx`)
**Purpose:** KPI overview and quick access hub

**KPI Stat Cards:**
- Total Students registered
- Students currently in exam mode
- Total exams created
- Active exams right now
- Subscription status
- Storage usage

**Quick Action Buttons:**
- Add Student
- Create Exam
- View Results
- View Performance

**Additional Panels:**
- Recent performance data
- Subject-wise performance breakdown with progress bars (color-coded)
- Premium feature banner

**API Calls:**
- `GET /admin/dashboard` — overall stats
- `GET /admin/students` — student count
- `GET /admin/exam-setups` — exam count

---

### 7.2 Students (`Students.jsx`)
**Purpose:** Full student lifecycle management

**Features:**
- Paginated table (50 per page) with search by name
- **Create student** modal: first name, last name, middle name, email, class, NIN, phone, DOB
- **Edit student** modal: update any field
- **Delete student** with confirmation dialog
- **Assign subjects** to student
- **View student performance** shortcut
- Auto-generate login credentials for students
- Show subject list per student

**API Calls:**
- `GET /admin/students?limit=50&page=1`
- `POST /admin/students`
- `PUT /admin/students/:id`
- `DELETE /admin/students/:id`
- `GET /admin/subjects`
- `POST /admin/students/:id/subjects`

---

### 7.3 Subjects (`Subjects.jsx`)
**Purpose:** Browse all registered subjects for the school

**Features:**
- Card-based subject grid
- Subject code and name
- Question count per subject
- Search by subject name
- Filter by class level (JSS / SS)

**API Calls:**
- `GET /admin/subjects`

---

### 7.4 Questions (`Questions.jsx`)
**Purpose:** Build and manage the question bank

**Features:**
- Question table: subject, question text, type, created date
- **Create question** modal: subject, question text, type, options (A-D), correct answer, marks, difficulty
- **Edit question** modal
- **Delete question** with confirmation
- Filter questions by subject
- Search questions by text
- Pagination

**Question Types:**
- Multiple choice (4 options)
- Essay (open-ended)
- Short answer

**Difficulty Levels:** Easy, Medium, Hard

**API Calls:**
- `GET /admin/questions`
- `POST /admin/questions`
- `PUT /admin/questions/:id`
- `DELETE /admin/questions/:id`

---

### 7.5 Exams (`Exams.jsx`)
**Purpose:** Create, configure, and manage exams

**Features:**
- Exam table: title, class, status, duration, pass mark
- **Create exam** modal:
  - Title, description, class selection
  - Subject selection + question count per subject
  - Duration (minutes), pass mark (%)
  - Start date/time, end date/time
  - Shuffle questions toggle
  - Show results to student toggle
  - Question selection method (random / sequential)
  - Allow retake toggle
  - Instructions field
- **View exam details** modal
- **Edit exam** modal
- **Activate exam** → sets status to `active`
- **Deactivate exam** → sets status to `draft`
- **Assign students** → select by class or individual students
- **Select all students in class** bulk action
- **View exam results/statistics**
- **Delete exam** with confirmation

**Exam Statuses:**
- `draft` — created but not yet active
- `active` — live, students can take it
- `completed` — past end date/time

**API Calls:**
- `GET /admin/exam-setups?limit=50&page=1`
- `POST /admin/exam-setups`
- `PUT /admin/exam-setups/:id`
- `DELETE /admin/exam-setups/:id`
- `POST /admin/exam-setups/:id/activate`
- `POST /admin/exam-setups/:id/deactivate`
- `POST /admin/exam-setups/:id/assign-students`
- `GET /admin/exam-setups/:id/results`
- `GET /admin/subjects` (for subject picker)
- `GET /admin/students` (for student assignment)

---

### 7.6 Results (`Results.jsx`)
**Purpose:** View and export exam results

**Features:**
- Results table: student name, subject, score, total marks, percentage, grade
- Filter by class, subject, exam
- Grade badge display (A, B, C, D, F)
- Average score calculation
- **Export results to CSV**
- View result detail modal
- Pagination

**Grade Scale:**
- A: 70-100%
- B: 60-69%
- C: 50-59%
- D: 45-49%
- F: Below 45%

**API Calls:**
- `GET /admin/results` (with filters)

---

### 7.7 Performance (`Performance.jsx`)
**Purpose:** Deep per-student performance analytics

**Features:**
- Student selector dropdown
- Subject-wise average scores
- Performance trend (improving / declining / stable)
- Recent exam history table
- Performance insights (strengths, weaknesses)
- Overall statistics (total exams, average score, best subject, weakest subject)
- Visual charts (Recharts integration)

**API Calls:**
- `GET /admin/students/:id/performance`

---

### 7.8 Support (`Support.jsx`)
**Purpose:** Communicate with super admin via ticketing system

**Features:**
- Ticket list: subject, category, priority, status, created date
- **Create ticket** modal: subject, category, priority, description
- **View ticket** modal: full conversation thread
- **Reply to ticket** (add message)
- **Close ticket**
- Filter by status (open, in-progress, closed)
- Priority badge (low, medium, high, urgent)
- Floating chat widget integration

**Ticket Categories:** Technical, Billing, Account, Feature Request, Other

**API Calls:**
- `GET /admin/support/tickets`
- `POST /admin/support/tickets`
- `GET /admin/support/tickets/:id`
- `POST /admin/support/tickets/:id/messages`

---

### 7.9 Settings (`Settings.jsx`)
**Purpose:** Admin account, security, and system preferences

**Tabs:**

#### Profile Tab
- Edit: name, email, role, school, phone, address
- Save profile via `PUT /admin/profile`

#### Security Tab
- Change password (current + new + confirm)
- Enable 2FA: QR code generation + TOTP setup flow
- Disable 2FA: password confirmation
- Generate backup codes
- View last login activity

#### Notifications Tab
- Toggle: email notifications, exam reminders, study reminders
- Save via `PUT /admin/settings/notifications`

#### Exam Settings Tab
- Toggle: auto-save answers, timer sound alerts, tab-switch warning
- Save via `PUT /admin/settings/exam`

#### Appearance Tab
- Dark mode toggle
- Theme selector (navy/default)
- Save via `PUT /admin/settings/appearance`

**API Calls:**
- `PUT /admin/profile`
- `POST /admin/change-password`
- `POST /admin/setup-2fa`
- `POST /admin/verify-2fa-setup`
- `POST /admin/disable-2fa`
- `POST /admin/generate-backup-codes`

---

### 7.10 Subscription (`Subscription.jsx`)
**Purpose:** Manage subscription plans and process payments

**Features:**
- Current subscription status card (plan, expiry, student limit)
- Available plans display (Starter, Professional, Enterprise)
- **Initialize payment** → Paystack redirect
- Payment history table (reference, amount, date, status)
- View payment detail
- Renew subscription button
- Student limit usage bar

**Subscription Plans:**
- **Starter** — limited students
- **Professional** — more students, advanced features
- **Enterprise** — unlimited students, all features

**Payment Flow:**
1. Admin selects plan → `POST /admin/subscription/initialize`
2. Backend returns Paystack authorization URL
3. Frontend redirects to Paystack
4. After payment → Paystack redirects to `/dashboard/subscription/verify?reference=XXX`
5. Frontend calls `POST /admin/subscription/verify`
6. Subscription activated

**API Calls:**
- `GET /admin/subscription/plans`
- `GET /admin/subscription/status`
- `GET /admin/subscription/payments`
- `GET /admin/payment/methods`
- `POST /admin/subscription/initialize`
- `POST /admin/subscription/verify`

---

### 7.11 Help (`Help.jsx`)
**Purpose:** In-app documentation and support resources

**Features:**
- FAQ accordion sections
- Quick-start guide
- Links to detailed documentation
- Contact super admin button
- Common troubleshooting steps
- Platform changelog/release notes

---

## 8. Data Models

### Admin (User)
```js
{
  id: string,
  email: string,
  name: string,
  role: 'admin' | 'super_admin',
  schoolId: string | null,
  school: string,
  phone: string,
  address: string,
  status: 'active' | 'inactive',
  twoFactorEnabled: boolean,
  subscription: Subscription | null,
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

### Student
```js
{
  id: string,
  firstName: string,
  lastName: string,
  middleName: string | null,
  email: string,
  loginId: string,           // auto-generated login credential
  nin: string | null,
  phone: string | null,
  dateOfBirth: Date | null,
  class: 'JSS1'|'JSS2'|'JSS3'|'SS1'|'SS2'|'SS3',
  schoolId: string,
  subjects: Subject[],
  status: 'active' | 'inactive',
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

### Subject
```js
{
  id: string,
  name: string,
  code: string,
  description: string,
  schoolId: string,
  questionCount: number,
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

### Question
```js
{
  id: string,
  subject: string,
  questionText: string,
  type: 'multiple-choice' | 'essay' | 'short-answer',
  options: string[],          // A, B, C, D for multiple choice
  correctAnswer: string | number,
  marks: number,
  difficulty: 'easy' | 'medium' | 'hard',
  schoolId: string,
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

### Exam (ExamSetup)
```js
{
  id: string,
  title: string,
  description: string,
  class: string,
  subjects: {
    subjectId: string,
    questionCount: number
  }[],
  duration: number,           // minutes
  passMark: number,           // 0–100 percentage
  totalMarks: number,         // auto-calculated
  startDate: ISO8601,
  startTime: string,          // 'HH:MM'
  endDate: ISO8601,
  endTime: string,
  instructions: string | null,
  allowRetake: boolean,
  shuffleQuestions: boolean,
  showResults: boolean,
  questionSelection: 'random' | 'sequential',
  status: 'draft' | 'active' | 'completed',
  schoolId: string,
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

### Result
```js
{
  id: string,
  examSetupId: string,
  studentId: string,
  studentName: string,
  subject: string,
  score: number,
  totalMarks: number,
  percentage: number,
  grade: 'A' | 'B' | 'C' | 'D' | 'F',
  status: 'completed' | 'in_progress' | 'not_started',
  startTime: ISO8601,
  endTime: ISO8601,
  duration: number,
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

### Support Ticket
```js
{
  id: string,
  schoolId: string,
  adminId: string,
  subject: string,
  category: 'technical'|'billing'|'account'|'feature_request'|'other',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  description: string,
  status: 'open' | 'in-progress' | 'closed',
  messages: {
    id: string,
    senderId: string,
    senderRole: 'admin' | 'super_admin',
    message: string,
    createdAt: ISO8601
  }[],
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

### Subscription
```js
{
  id: string,
  schoolId: string,
  plan: 'monthly' | 'termly' | 'yearly' | 'unlimited',
  price: number,
  studentLimit: number,
  status: 'active' | 'expired' | 'cancelled',
  startDate: ISO8601,
  endDate: ISO8601,
  autoRenew: boolean,
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

### Payment
```js
{
  id: string,
  schoolId: string,
  reference: string,           // Paystack reference
  amount: number,
  currency: 'NGN',
  status: 'pending' | 'success' | 'failed',
  paymentMethod: 'card' | 'bank_transfer',
  plan: string,
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

---

## 9. API Layer

### Proxy Architecture
**File:** `src/app/api/[...path]/route.js`

All API calls go through `/api/*` (same-origin proxy) which forwards to `https://cbt-simulator-backend.vercel.app`.

**Cookie Handling:**
- Backend `Set-Cookie` domain is stripped
- `SameSite` changed to `Lax`
- Cookies stored on frontend domain (first-party)

**Supported Methods:** GET, POST, PUT, PATCH, DELETE, OPTIONS

### API Endpoints Reference

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| POST | `/api/auth/verify-2fa` | 2FA code verification |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/register` | New admin registration |
| POST | `/api/auth/verify-email` | Email token verification |
| POST | `/api/auth/setup-2fa` | Generate 2FA QR code |
| POST | `/api/auth/verify-2fa-setup` | Confirm 2FA setup |
| POST | `/api/auth/disable-2fa` | Disable 2FA |
| POST | `/api/auth/generate-backup-codes` | New backup codes |

#### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/students?limit=50&page=1` | List students (paginated) |
| POST | `/admin/students` | Create student |
| PUT | `/admin/students/:id` | Update student |
| DELETE | `/admin/students/:id` | Delete student |
| POST | `/admin/students/:id/subjects` | Assign subject to student |
| GET | `/admin/students/:id/performance` | Student performance data |

#### Subjects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/subjects` | List all subjects |
| POST | `/admin/subjects` | Create subject |

#### Questions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/questions` | List questions |
| POST | `/admin/questions` | Create question |
| PUT | `/admin/questions/:id` | Update question |
| DELETE | `/admin/questions/:id` | Delete question |

#### Exams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/exam-setups?limit=50&page=1` | List exams (paginated) |
| POST | `/admin/exam-setups` | Create exam |
| PUT | `/admin/exam-setups/:id` | Update exam |
| DELETE | `/admin/exam-setups/:id` | Delete exam |
| POST | `/admin/exam-setups/:id/activate` | Activate exam |
| POST | `/admin/exam-setups/:id/deactivate` | Deactivate exam |
| POST | `/admin/exam-setups/:id/assign-students` | Assign students |
| GET | `/admin/exam-setups/:id/results` | Get exam results |

#### Results & Performance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/results` | All results (filterable) |
| GET | `/admin/dashboard` | Dashboard stats overview |

#### Settings & Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/profile` | Get admin profile |
| PUT | `/admin/profile` | Update admin profile |
| POST | `/admin/change-password` | Change password |

#### Support
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/support/tickets` | List tickets |
| POST | `/admin/support/tickets` | Create ticket |
| GET | `/admin/support/tickets/:id` | Get ticket details |
| POST | `/admin/support/tickets/:id/messages` | Reply to ticket |

#### Subscription & Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/subscription/plans` | Available plans |
| GET | `/admin/subscription/status` | Current subscription |
| GET | `/admin/subscription/payments` | Payment history |
| GET | `/admin/payment/methods` | Payment methods |
| POST | `/admin/subscription/initialize` | Initiate Paystack payment |
| POST | `/admin/subscription/verify` | Verify payment after callback |

---

## 10. State Management

### Global State: `AuthContext` (`src/context/AuthContext.jsx`)

```js
// Exposed state
{
  user: User | null,
  loading: boolean,
  authChecked: boolean,
  isAuthenticated: boolean
}

// Exposed methods
register(formData)
login(email, password)
logout()
verifyEmail(token)
verifyTwoFactor(userId, token, tempToken)
checkAuth()
refreshUser()
updateUser(updatedData)
fetchWithAuth(endpoint, options)  // API wrapper with auto-refresh
```

**Key Behaviors:**
- Auto-checks session on mount (`GET /api/auth/me`)
- Auto-retries with refresh token on `401` response
- Triggers toast on auth events (login success, logout, errors)
- Redirects to `/login` on session expiration

### Local Component State
Each dashboard section uses `useState` for:
- Data arrays (students, exams, etc.)
- UI state (modal open/closed, loading spinner)
- Form input values
- Pagination (page number, total)
- Filters and search terms
- Selected items

### Browser Storage
| Storage | Key | Value | Usage |
|---------|-----|-------|-------|
| `sessionStorage` | `pendingPayment` | Paystack reference | During Paystack checkout |
| `sessionStorage` | `registeredEmail` | Email string | After registration |
| Cookies (auto) | `accessToken` | JWT | 15-min auth token |
| Cookies (auto) | `refreshToken` | JWT | 7-day refresh token |

---

## 11. PWA Implementation

### Files
| File | Purpose |
|------|---------|
| `public/manifest.json` | App name, icons, colors, display mode |
| `public/sw.js` | Service worker (caching, offline support) |
| `public/sw-register.js` | SW registration bootstrap |
| `public/offline.html` | Shown when offline + page not cached |
| `public/icons/` | 8 icon sizes (72, 96, 128, 144, 152, 192, 384, 512) |

### Components
| Component | Purpose |
|-----------|---------|
| `PWAInstallPrompt.jsx` | "Install to home screen" card (bottom-right) |
| `UpdateNotification.jsx` | "New version available" banner |
| `ManualSWRegister.jsx` | Fallback SW registration |
| `OfflineDetector.jsx` | Network status change detection |
| `hooks/useServiceWorker.js` | SW registration hook |

### Caching Strategy
- Static assets: cache-first (images, fonts, scripts)
- API calls: network-first (falls back to cache if available)
- Pages: stale-while-revalidate
- Offline fallback: `offline.html` served if no cache hit

### PWA Metadata (in `layout.jsx`)
- `<meta name="theme-color">` — brand color
- `<link rel="manifest">` — manifest.json
- `<meta name="apple-mobile-web-app-*">` — iOS support
- Splash screen images for iOS

---

## 12. Payment Integration (Paystack)

### Environment Keys
```env
PAYSTACK_SECRET_KEY=sk_test_...    # Server-side (proxy/backend)
PAYSTACK_PUBLIC_KEY=pk_test_...    # Currently test keys
```

### Payment Flow
```
Admin selects plan
      │
      ▼
POST /admin/subscription/initialize
      │  { plan, paymentMethod }
      ▼
Backend → Paystack API → Returns { authorization_url, reference }
      │
      ▼
Frontend stores reference in sessionStorage
Frontend redirects to authorization_url (Paystack checkout)
      │
      ▼
User completes payment on Paystack
      │
      ▼
Paystack redirects to:
  /dashboard/subscription/verify?reference=REF
      │
      ▼
POST /admin/subscription/verify { reference }
      │
      ▼
Backend verifies with Paystack → Activates subscription
      │
      ▼
Frontend shows success, refreshes subscription status
```

### Test Card Details
- **Card Number:** 4084 0840 8408 4081
- **Expiry:** Any future date
- **CVV:** Any 3 digits
- **OTP:** 123456

---

## 13. UI/UX System

### Design Tokens (Tailwind Config)

**Colors:**
```js
navy: { 50→950 }          // Primary brand color (blue-navy)
gold: { 50→950 }          // Accent color
// Status colors inherit from Tailwind defaults
// green (success), yellow (warning), red (danger)
```

**Typography:**
- Body: Inter (sans-serif)
- Headings: Playfair Display (serif)

**Shadows:**
- `shadow-card` — card elevation
- `shadow-card-md` — medium card
- `shadow-card-lg` — large card
- `shadow-brand` — brand color glow
- `shadow-gold` — gold accent glow

**Custom Animations:**
- `rotate` — spinning loader
- `beep` — audio alert visual
- `blink` — cursor blink
- `dotBlink` — loading dots
- `fade-up` — entrance animation

### Animation System (Framer Motion)
- Page transitions (route changes)
- Modal entrance (fade + scale)
- List stagger animations (children fade in sequence)
- Button hover/active effects
- Sidebar collapse/expand

### Component Patterns
- **Modals:** Centered, overlay backdrop, Framer Motion scale-in
- **Tables:** Striped rows, sticky header, responsive (scroll on mobile)
- **Forms:** Controlled inputs, inline validation messages, loading states
- **Cards:** Rounded corners, shadow, hover elevation
- **Buttons:** Primary (navy), secondary (outline), danger (red), icon-only
- **Badges:** Pill-shaped, color-coded by type/status
- **Toasts:** Top-center, auto-dismiss (success: 3s, error: 5s)

### Responsive Breakpoints
- Mobile: `< 640px` — single column, collapsed sidebar
- Tablet: `640px – 1024px` — two-column layouts
- Desktop: `> 1024px` — full sidebar + multi-column dashboard

### Centralized Styles
- `src/styles/styles.js` — Tailwind class strings exported as JS constants
- `src/app/login/styles.js` — Login-specific classes
- `src/styles/globals.css` — Base layer, CSS custom properties

---

## 14. Environment Variables & Configuration

### `.env` File
```env
# Backend proxy target
BACKEND_URL=https://cbt-simulator-backend.vercel.app

# Paystack (Test Keys — replace with production for go-live)
PAYSTACK_SECRET_KEY=sk_test_c9976d1699108af013b9302085ca51916c262c78
PAYSTACK_PUBLIC_KEY=pk_test_a1298d54bf06f2ea38870eea4c5730385c318fab

# App URL (used in backend emails/redirects)
FRONTEND_URL=https://einsteinsadmin.vercel.app/
```

### `next.config.ts` Notes
- ESLint disabled during builds (`eslint.ignoreDuringBuilds: true`)
- Image optimization disabled (`images.unoptimized: true`)
- Proxy rewrite configured for `/api/*` → backend

### `vercel.json` Notes
- Build framework: Next.js
- Auto-deploys on push to `main` branch

### `tailwind.config.js` Notes
- `@nextui-org/react` plugin registered
- Custom theme tokens (colors, fonts, shadows, animations)
- Content paths include all component and page files

---

## 15. Known Gaps & Incomplete Features

### Not Yet Implemented
| Feature | Status | Notes |
|---------|--------|-------|
| Bulk student CSV upload | Planned (Phase 2) | Mentioned in README roadmap |
| Class-wide report export | Planned (Phase 2) | Results page has CSV per-exam only |
| SMS notifications | Planned (Phase 2) | No SMS provider integrated |
| Parent/guardian portal | Planned (Phase 2) | Separate app required |
| Dark mode full theme | In Progress | Toggle exists, but not all components themed |
| Recharts visualizations | Partial | Library installed, not fully integrated in Performance section |
| Real-time updates | Missing | WebSocket/SSE not implemented; page refresh required |
| Batch delete/edit | Missing | No multi-select for students or questions |
| Cross-tab session sync | Missing | Logging out in one tab doesn't affect other tabs |
| Session timeout warning | Missing | No "you'll be logged out in X minutes" banner |
| Offline API fallback | Partial | SW caches pages but API calls fail offline |
| `react-signature-canvas` | Available | Installed but no use case implemented |
| GSAP animations | Available | Installed but Framer Motion used instead |
| Axios usage | Available | Installed but native fetch used in practice |
| TypeScript migration | Partial | `tsconfig.json` present but most files are `.jsx` |
| Unit/integration tests | Missing | No test setup (Jest/Vitest) |

### Known Potential Issues
1. **iOS Safari 2FA cookies** — The proxy solves ITP for normal login, but 2FA flow has a redirect chain that may re-trigger ITP
2. **Paystack test keys in git** — Should be moved to Vercel environment secrets before production
3. **ESLint bypassed in build** — `eslint.ignoreDuringBuilds: true` means code quality issues won't block deploys
4. **Image optimization disabled** — All images served unoptimized (larger bundle)
5. **No TypeScript enforcement** — Type errors won't surface without running `tsc`

---

## 16. Improvement Roadmap

### Phase 1 — Stability & Quality (Immediate)
- [ ] Enable TypeScript strict mode and migrate `.jsx` → `.tsx`
- [ ] Add Jest + React Testing Library setup
- [ ] Move Paystack keys to Vercel environment secrets
- [ ] Re-enable ESLint in builds (fix existing warnings first)
- [ ] Enable Next.js image optimization
- [ ] Add session timeout warning banner (T-2 min before expiry)
- [ ] Cross-tab logout detection (BroadcastChannel API)

### Phase 2 — Feature Completion (Short-term)
- [ ] Complete dark mode theme across all components
- [ ] Integrate Recharts fully in Performance section (line, bar, pie charts)
- [ ] Add bulk student CSV upload with template download
- [ ] Implement class-wide PDF/Excel report export
- [ ] Add batch delete for students and questions
- [ ] Real-time exam status (Server-Sent Events or polling)
- [ ] Add offline API response caching (IndexedDB via Workbox)

### Phase 3 — New Features (Medium-term)
- [ ] SMS notifications via Termii or Twilio
- [ ] Parent/guardian view portal (read-only student results)
- [ ] Advanced exam scheduling (recurring exams)
- [ ] Exam analytics dashboard (pass rate trends, question difficulty analysis)
- [ ] Print-ready result slips per student
- [ ] Student import from Excel

### Phase 4 — Scale & Platform (Long-term)
- [ ] School management system integration (API)
- [ ] White-label branding per school
- [ ] Dedicated mobile app (React Native)
- [ ] Multi-admin support per school (with different permission levels)
- [ ] Automated result computation and grade release control
- [ ] AI-assisted question generation from syllabus content

---

## Appendix: Quick Reference

### Key Files to Know
| File | Why It Matters |
|------|---------------|
| `src/context/AuthContext.jsx` | All auth logic + `fetchWithAuth` wrapper |
| `src/app/api/[...path]/route.js` | The proxy — how cookies and API calls work |
| `src/components/dashboard-content/Exams.jsx` | Most complex component |
| `src/components/dashboard-content/Students.jsx` | Core student management |
| `tailwind.config.js` | Design tokens and theme |
| `.env` | All configuration / secrets |
| `public/sw.js` | PWA offline caching logic |

### Backend API Base URL
```
https://cbt-simulator-backend.vercel.app
```

### Local Development
```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Build for production
npm run lint     # Run ESLint
npm run start    # Start production build locally
```

### Deployment
- Push to `main` branch → Vercel auto-deploys
- Live at: https://einsteinsadmin.vercel.app/

---

*This document was generated via a full codebase audit on 2026-03-21. Update as new features are added or architecture changes are made.*

---

## What the Einstein CBT Admin Is Used For

The Einstein CBT Admin is a **school management dashboard** built for school administrators and teachers. Here is a plain-language summary of everything a school admin can do inside this platform:

### 1. Student Account Management
Admins create and manage student accounts on behalf of the school. They can add individual students with details like name, class, email, and date of birth. Each student is automatically issued login credentials to access the student-facing CBT app. Admins can also edit student profiles, assign subjects to students, and delete accounts when no longer needed.

### 2. Question Bank
Admins build a question bank by creating questions for each subject. Questions can be multiple choice (with four options and a correct answer), essay, or short answer. Each question has a difficulty level (easy, medium, hard) and a mark value. The question bank is what powers all exams — no exam can run without questions being in the bank first.

### 3. Exam Creation & Management
Admins create exams by selecting subjects, specifying how many questions to pull per subject, setting a duration, pass mark, and start/end date and time. Exams can be configured to shuffle questions, show results immediately to students, or allow retakes. Once an exam is ready, the admin activates it and assigns it to specific students or an entire class. Exams can be deactivated or deleted at any time.

### 4. Results Viewing & Export
After students complete an exam, admins can view all results in a table — showing each student's score, total marks, percentage, and grade (A through F). Results can be filtered by class or subject. Admins can also export results to CSV for record-keeping or sharing with other staff.

### 5. Student Performance Tracking
Admins can drill into individual student performance over time — seeing subject-wise average scores, recent exam history, performance trends (improving or declining), and identifying strengths and weaknesses per student. This helps admins identify students who need extra attention.

### 6. Subscription Management
The platform operates on a subscription model with **4 available plans**. Each plan unlocks a set number of student registrations and is valid for a defined period. Admins pick the plan that fits their school size and budget:

| Plan | Price | Student Limit | Validity |
|------|-------|--------------|---------|
| **Monthly** | ₦15,000 | Up to 50 students | 30 days |
| **Termly** | ₦42,000 | Up to 200 students | 120 days (one school term) |
| **Yearly** | ₦150,000 | Up to 500 students | 365 days |
| **Unlimited** | ₦250,000 | Unlimited students | 365 days |

- The **Monthly** plan suits small schools or those wanting to trial the platform with a small cohort.
- The **Termly** plan is designed around the Nigerian school term calendar, giving a full term of access for mid-size schools.
- The **Yearly** plan is the most popular for established schools running exams across the full academic year.
- The **Unlimited** plan removes the student cap entirely — ideal for large schools or those with fluctuating enrolment.

Admins can view their current plan, see the expiry date, check how many student slots remain, and initiate a payment to upgrade or renew. Payments are processed securely via **Paystack** (card payment). Full payment history is also accessible from the Subscription section.

### 7. Support & Communication with Super Admin
If an admin encounters a problem or needs assistance, they can open a **support ticket** directly from the dashboard. Tickets are categorized (technical, billing, account, feature request) and assigned a priority level. The super admin responds from the super admin portal, and the conversation is tracked in a thread — similar to a helpdesk. Admins can also use a floating chat widget for quicker communication.

### 8. Account & Security Settings
Admins can update their profile information (name, phone, address), change their password, and set up **Two-Factor Authentication (2FA)** via Google Authenticator or Authy for extra security. Backup codes are generated during 2FA setup in case the authenticator app is unavailable. Notification preferences and exam-related settings (auto-save, timer sounds, tab-switch warnings) are also configurable here.

### 9. Subject Browser
Admins can view all subjects registered for their school, see how many questions exist per subject, and filter subjects by class level (JSS or SS). This gives a quick overview of how well-populated the question bank is before creating exams.

### 10. App Installability (PWA)
The admin dashboard works as a **Progressive Web App** — meaning it can be installed directly on a phone, tablet, or desktop like a native app. It works on any device and even loads previously visited pages when offline.

---

In short, the Einstein CBT Admin gives a school everything it needs to run a complete computer-based testing program — from setting up students and building question banks, to scheduling exams, reviewing performance, managing payments, and staying in contact with platform support.
