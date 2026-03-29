# CBT-WAEC Simulation App — Master Plan

> **Project:** Einstein's CBT — WAEC Exam Simulation Platform
> **Stack:** Node.js/Express + Firebase Firestore (backend) · Next.js 15 + React 19 (frontends)
> **Portals:** Super Admin · Admin (School) · Student · Marketing Website
> **Last updated:** 2026-03-28

---

## Completed Work

### ✅ Questions Module — Admin Portal
- **Searchable subject dropdown** — replaced plain `<select>` with a combobox that filters subjects as you type; click-outside closes dropdown
- **Multi-select checkboxes** — per-question checkbox + select-all-on-page checkbox in toolbar
- **Bulk delete** — select multiple questions and delete in one action with confirmation modal
- **Backend:** `DELETE /api/admin/questions/bulk-delete` endpoint added to `questionController.js` and `adminRoutes.js`

---

## Active Backlog

Items are ordered by priority. Work through them top-to-bottom.

---

### 🔒 SECURITY — HIGH PRIORITY

#### [SEC-1] B2 — Strip `correctAnswer` from exam API responses ✅ ALREADY DONE
Both `startStudentExam` (examSetupController.js) and `getExamById` (examController.js) already strip
`correctAnswer` and `explanation` from questions before sending to the client. Verified 2026-03-28.

#### [SEC-2] B7 — Firebase service account file exposed in repo
- **File:** `cbt-simulator-backend/firebase-service-account.json`
- **Fix:** Add to `.gitignore`. Use env vars in all environments (already done for production — fix dev too).
- **Status:** TODO

#### [SEC-3] B8 — Missing HTTP security headers
- **Fix:** Install `helmet` package in backend. Add `app.use(helmet())` to `server.js`.
- **Status:** TODO

#### [SEC-4] B9 — Exam `getExamById` missing school-level authorization
- Currently only checks `exam.studentId === req.student.id`. Should also verify `exam.schoolId === req.student.schoolId`.
- **Status:** TODO

---

### 🎯 FEATURE — Calculator

#### [FEAT-1] In-exam & Practice Calculator
- **Component:** `waec-cbt-simulator/src/components/Calculator.jsx`
  - Floating, draggable widget (drag handle on title bar)
  - Supports: digits, `+` `−` `×` `÷` `%` `√` `x²` decimal, clear, backspace, equals
  - Toggle via 🧮 button in exam toolbar
  - Works offline — pure React state, zero external dependencies
  - Respects `prefers-reduced-motion` — no animations on reduced-motion devices
- **Files modified:**
  - `exam-room/page.jsx` — import Calculator, add toggle button in toolbar
  - `practice-room/page.jsx` — same
- **Status:** TODO

---

### 💬 FEATURE — Exam Feedback System

#### [FEAT-2] Post-exam Feedback (Student → Admin → Super Admin)
- **Trigger:** After a student submits a real exam (exam-room only, not mock/practice), show an
  optional feedback modal before redirecting. Student can skip.
- **Feedback fields:** exam difficulty (1–5), interface rating (1–5), free-text comment,
  technical issues checkbox
- **Backend:**
  - New Firestore collection: `feedbacks`
  - New model: `cbt-simulator-backend/models/Feedback.js`
  - New controller: `cbt-simulator-backend/controllers/feedbackController.js`
  - `POST /api/student/feedback` → studentRoutes.js
  - `GET /api/admin/feedbacks` → adminRoutes.js
  - `GET /api/super-admin/feedbacks` → superAdminRoutes.js (filterable by school)
- **Frontend:**
  - `waec-cbt-simulator/exam-room/page.jsx` — FeedbackModal component shown post-submit
  - `waec-cbt-admin/dashboard-content/Feedback.jsx` — new dashboard section
  - `mts-waec-super-admin/dashboard-content/` — add Feedback tab, filterable by school
- **Status:** TODO

---

### 👑 FEATURE — Super Admin: Full Admin/School Drill-Down

#### [FEAT-3] Super Admin View — Admin Details, Students & Performance
- Super admin can select any admin/school and see a full drill-down:
  - School profile + admin details
  - All students of that school (list with status, class, subscription-remaining info)
  - Individual student performance — exam history, scores, subject breakdown
  - Best performing students leaderboard per school
  - Worst performing students (for intervention)
- **Export capability:**
  - Export students list (CSV/PDF)
  - Export results/performance report (CSV/PDF)
  - Export analytics (aggregated stats per school)
- **Backend:**
  - `GET /api/super-admin/admins/:adminId/students` — all students for a school
  - `GET /api/super-admin/admins/:adminId/students/:studentId/performance` — individual performance
  - `GET /api/super-admin/admins/:adminId/analytics` — school-level analytics
  - `GET /api/super-admin/admins/:adminId/leaderboard` — top/bottom students
  - `POST /api/super-admin/reports/export` — generate exportable CSV/PDF
- **Frontend (`mts-waec-super-admin`):**
  - Admins list page → click any admin → drill-down panel
  - Student table with performance columns
  - Charts (Recharts) for subject performance
  - Export buttons (CSV download in-browser, PDF via print API)
- **Status:** TODO

---

### 🏆 FEATURE — Student Achievements & Rewards System

#### [FEAT-4] Achievements (Earned by Performance)
Achievements are earned automatically based on exam/practice results. Each achievement
has a badge, title, description, and point value.

**Achievement Triggers:**

| Badge | Trigger | Points |
|---|---|---|
| 🌟 First Exam | Complete first exam | 50 |
| 🔥 On Fire | Score ≥ 90% on any exam | 100 |
| 🎯 Sharpshooter | Answer 10 questions in a row correctly | 75 |
| 📚 Practice Makes Perfect | Complete 10 practice sessions | 80 |
| 💎 Diamond Scholar | Score ≥ 90% on 5 consecutive exams | 300 |
| 🏅 Subject Master | Score ≥ 85% in a subject 3 times | 150 |
| ⚡ Speed Demon | Complete exam in under half the allotted time with ≥ 80% | 120 |
| 🎓 All-Rounder | Score ≥ 70% in 5 different subjects | 200 |
| 👑 Top of Class | Rank #1 in any school exam | 250 |
| 🔁 Comeback Kid | Improve score by ≥ 20% over previous attempt | 100 |

**Backend:**
- New Firestore collection: `achievements` (per-student records)
- New model: `cbt-simulator-backend/models/Achievement.js`
- Achievement evaluation runs in `examController.submitExam` and `practiceController.savePracticeResult`
  after scoring — awards new badges if criteria met
- `GET /api/student/achievements` — returns earned achievements + total points
- `GET /api/student/achievements/leaderboard` — top students by points in same school

**Frontend (`waec-cbt-simulator`):**
- `Achievements.jsx` dashboard section — currently static, make fully dynamic
  - Grid of earned badges (glowing/active) and locked badges (greyed out)
  - Total points display
  - Achievement unlock animation (confetti/glow on first earn)
  - School leaderboard tab

#### [FEAT-5] Rewards & Points System
- **Earning points:** Points are awarded when achievements are unlocked (see table above)
- **Point accumulation:** Cumulative — never expire
- **Leaderboard:** School-wide ranking by total points

**Rewards (Redeemable):**
- The rewards system is built now but payout is gated:
  - Digital rewards (available immediately): Extra practice questions unlock, profile badge, certificate download
  - Monetary rewards (COMING SOON): Withdraw via Paystack — infrastructure is prepared but disabled until admin enables it per school

**Monetary Withdrawal Flow (Prepared, Not Yet Live):**
- Admin can set a "reward budget" per term from the school's admin dashboard
- Students with ≥ threshold points see a "Claim Reward" button
- Withdrawal goes to student's bank via Paystack Transfer API (test mode uses Paystack test credentials)
- Super admin can view and approve reward disbursements

**Backend:**
- New Firestore collection: `rewards` (withdrawal requests)
- `GET /api/student/rewards/balance` — current redeemable points + status
- `POST /api/student/rewards/redeem` — request reward (queued for approval)
- `GET /api/admin/rewards` — view all reward requests for school
- `POST /api/admin/rewards/:id/approve` — approve/reject a reward
- `GET /api/super-admin/rewards` — platform-wide reward overview

**Frontend (`waec-cbt-simulator`):**
- New `Rewards.jsx` dashboard section — reachable from Achievements page via "Redeem Points" button
  - Points balance card
  - Available rewards grid (digital unlockable + monetary with "Coming Soon" badge)
  - Redemption history
  - Withdrawal form (bank name, account number) — submits to Paystack (test mode)

**Status:** TODO (Achievement backend first, then Rewards)

---

### 📱 FEATURE — All Student Dashboard Pages: Fully Dynamic

Currently static pages that need live data:

#### [FEAT-6] Dynamic Dashboard Pages
| Page | Current State | What To Build |
|---|---|---|
| `Achievements.jsx` | Static mock data | Live from `GET /api/student/achievements` |
| `StudyGroups.jsx` | Static | Phase 1: Coming soon page. Phase 2: Group creation, invite by loginId, shared practice sessions |
| `TimedTests.jsx` | Static | Live timed tests — student picks subject + time limit, server returns randomized questions, scores are saved and shown in performance |
| `PastQuestions.jsx` | Static | Pull from questions bank filtered by `mode: practice`, paginated, searchable by topic/subject/year |
| `Home.jsx` | Mostly dynamic | Add upcoming exams widget, recent practice scores, achievement notification strip |
| `Performance.jsx` | Partially dynamic | Add subject-by-subject radar chart, improvement trend line, predicted grade |

**New endpoints needed:**
- `GET /api/student/timed-tests/start` — same as practice but with strict timer
- `GET /api/student/past-questions` — paginated past questions (practice mode)
- `GET /api/student/dashboard/summary` — single endpoint for Home widgets (upcoming exams, recent scores, latest achievement)

---

### 🖥️ COMPATIBILITY — Old Monitors & Offline

#### [COMPAT-1] Self-host Google Fonts (Offline Requirement)
- **Problem:** Inter font loads from Google Fonts CDN — fails when no internet
- **Fix:** Download Inter font files → place in `waec-cbt-simulator/public/fonts/` → update CSS `@font-face` declarations
- Apply to all 3 portals (student, admin, super-admin)
- **Status:** TODO

#### [COMPAT-2] Respect `prefers-reduced-motion`
- **Problem:** Framer Motion animations + GSAP can cause jank on old Pentium/Celeron PCs
- **Fix:** Add CSS `@media (prefers-reduced-motion: reduce)` rules to disable transitions;
  wrap framer-motion variants with motion check
- **Status:** TODO

#### [COMPAT-3] Minimum viewport width for exam room
- **Problem:** Exam room can collapse on 1024×768 monitors
- **Fix:** Add `min-width: 1024px` to exam-room layout + ensure horizontal scroll never hides answer options
- **Status:** TODO

#### [COMPAT-4] PWA / Offline Exam Mode
- **Problem:** Service worker caches shell only — if internet drops mid-exam after page reload, questions won't load
- **Fix (Option C — Offline-First Exam):**
  1. When student opens exam-instructions page, ALL questions for the exam are fetched and
     stored in `localStorage` under key `exam_questions_{examId}`
  2. `exam-room/page.jsx` reads questions from localStorage first, falls back to API
  3. Answers continue to be saved to localStorage every 30s (already done ✓)
  4. On submit: if network unavailable, store result in localStorage under `pending_submission_{examId}`,
     service worker Background Sync retries when connectivity returns
  5. Update `sw.js` to handle Background Sync (`sync` event)
- **Status:** TODO

---

### 🏫 DEPLOYMENT — School Server (Fully Local / Offline)

#### [DEPLOY-1] Local School Server Deployment Guide

**Architecture for offline school use:**

```
School Server PC (Windows/Linux)
├── Firebase Emulator (port 8080 — local Firestore)
├── Node.js Backend (port 5000)
├── Student Portal — Next.js (port 3000)
├── Admin Portal — Next.js (port 3001)
└── Super Admin Portal — Next.js (port 3002)

Student PCs (30–60 computers)
└── Browser → http://[server-ip]:3000
```

**Prerequisites on server PC:**
- Node.js 18+
- Java 11+ (required by Firebase Emulator)
- Firebase CLI: `npm install -g firebase-tools`

**Setup steps:**
1. `firebase login` (one-time, requires internet)
2. `firebase emulators:start --only firestore --project einstein-cbt`
3. Set backend env: `FIRESTORE_EMULATOR_HOST=localhost:8080`
4. Seed exam data (students, questions, subjects) via admin portal
5. `npm run build && npm start` for all three portals
6. School network: configure router to allow LAN access to server IP

**Before each exam session:**
- Ensure Firebase Emulator is running
- Seed current students + exam setup
- All students connect via local IP — no internet required

**Backup:** Export Firestore emulator data after each session:
`firebase emulators:export ./backup/session-$(date +%Y%m%d)`

---

## Testing Strategy

### Backend Tests (`cbt-simulator-backend/tests/`)
- `unit/helpers.test.js` — shuffleArray, score calculation
- `unit/tokenService.test.js` — JWT sign/verify/expire
- `unit/validation.test.js` — input validation rules
- `unit/subscriptionService.test.js` — plan limits, expiry dates
- `integration/auth.test.js` — register, login, 2FA flow (requires Firebase Emulator)
- `integration/questions.test.js` — CRUD + bulk delete
- `integration/exam.test.js` — start, save answer, submit, score calculation

### Frontend Tests
- Build pass check: `npm run build` on all three portals
- No TypeScript/ESLint errors on build

---

## Changelog

| Date | Version | Changes |
|---|---|---|
| 2026-03-28 | 1.0.0 | Initial plan created |
| 2026-03-28 | 1.0.1 | Bulk delete questions (admin portal) |
| 2026-03-28 | 1.0.2 | Searchable subject dropdown (admin portal) |
| 2026-03-28 | 1.0.3 | Confirmed SEC-1 (B2) already fixed in codebase |
| 2026-03-28 | 1.0.4 | Plan.md created, .gitignore added, unit tests written |
