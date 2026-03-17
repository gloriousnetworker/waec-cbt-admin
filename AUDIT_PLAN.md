# CBT Simulator Backend — Full Audit & Fix Plan

> Generated: 2026-03-17
> Auditor: Claude Code
> Last Updated: 2026-03-17
> Status: **ALL BATCHES COMPLETE ✅**

---

## BATCH 1 — APPLIED ✅ (Zero frontend impact)

All changes below have been applied to the codebase.

---

### ✅ C-1 · Unauthenticated Super Admin Creation
**File changed:** `controllers/authController.js`
**Change:** Added a guard at the top of `createSuperAdmin` that queries for any existing `super_admin` role user. If one exists, the endpoint returns `403 Forbidden` immediately.
**Frontend impact:** None. No frontend app should ever call this endpoint post-setup.
**Paystack dashboard action required:** None.

---

### ✅ C-2 · Paystack Webhook Behind Auth Middleware
**Files changed:** `routes/adminRoutes.js`, `server.js`
**Change:**
- Removed `router.post('/payment/webhook', ...)` from `adminRoutes.js` (which sits behind `authenticate` + `authorize('admin')`)
- Registered webhook at top-level in `server.js`: `app.post('/api/webhooks/paystack', paymentController.handleWebhook)`
- The controller already performs HMAC signature verification — that is the sole authentication for webhooks.

**ACTION REQUIRED (Ops):** Update the Paystack dashboard webhook URL from:
```
https://your-api.vercel.app/api/admin/payment/webhook
```
to:
```
https://your-api.vercel.app/api/webhooks/paystack
```

**Frontend impact:** None. Paystack calls this, not the frontend.

---

### ✅ C-4 · Firebase Silently Sets db = null
**File changed:** `config/firebase.js`, `server.js`
**Changes:**
- `config/firebase.js`: In production, `process.exit(1)` is called if Firebase init fails — server won't start in a broken state.
- `server.js`: `/health` endpoint now checks `db` and returns `503` if not connected.
- `server.js`: `require('./config/firebase')` added at the top so Firebase initializes at startup, not lazily.

**Frontend impact:** None. The health check response shape changed (added `reason` field on failure), but only monitoring tools use it.

---

### ✅ H-1 · Mass Assignment via req.body to DB Updates
**Files changed:** `controllers/adminController.js`, `controllers/superAdminController.js`
**Changes:**
- `updateStudent`: Now only allows these fields: `firstName`, `lastName`, `middleName`, `nin`, `phone`, `dateOfBirth`, `class`, `gender`, `address`. All other fields in `req.body` are silently ignored.
- `updateSubject`: Now only allows: `name`, `code`, `description`, `examType`, `duration`, `questionCount`, `status`.

**Frontend impact:** None for normal usage. If any frontend was sending extra fields like `schoolId` or `role` in update requests (it shouldn't), those will now be silently ignored.

---

### ✅ H-2 · No Rate Limiting on Auth Endpoints
**Files changed:** `server.js`, `package.json`
**Changes:**
- Installed `express-rate-limit` package.
- Applied a 20 requests / 15 minutes limiter to:
  - `POST /api/auth/login`
  - `POST /api/auth/verify-2fa`
  - `POST /api/auth/create-super-admin`
  - `POST /api/student/login`

**Frontend impact:** None for normal usage. A user would need to make 20 failed login attempts in 15 minutes to be rate limited.

---

### ✅ H-4 · N+1 Query in Exam Question Fetching
**Files changed:** `models/ExamSetup.js`, `controllers/examSetupController.js`
**Changes:**
- `ExamSetup.getQuestionsForExam`: Replaced per-question loop with a single `db.getAll(...refs)` batch call.
- `examSetupController.startStudentExam`: Replaced `Question.findAll({ ids })` loop with a single `db.getAll(...refs)` batch call.

A 100-question exam now triggers **1 Firestore read** instead of **100**.

**Frontend impact:** None. Same data returned, just faster.

---

### ✅ H-6 · Firebase Lazily Initialized
**File changed:** `server.js`
**Change:** Added `require('./config/firebase')` at the top of `server.js` before routes are loaded. Firebase now initializes at startup so any config errors appear in server logs immediately, not on the first user request.

**Frontend impact:** None.

---

### ✅ M-1 · CORS Dev Bypass Could Leak to Production
**File changed:** `server.js`
**Change:** Removed `|| process.env.NODE_ENV === 'development'` from the CORS origin check. All origins are now always checked against the explicit `allowedOrigins` array regardless of environment.

**Frontend impact:** None. All production and local frontend origins are already in the `allowedOrigins` array:
```js
'http://localhost:3000',
'http://localhost:3001',
'https://mts-waec-super-admin.vercel.app',
'https://waec-cbt-simulator.vercel.app',
'https://waec-cbt-admin.vercel.app',
'https://einsteinscbt.vercel.app'
```
If you add a new frontend domain, add it to this array in `server.js`.

---

### ✅ M-2 · Invalid Fallback URL in Email Service
**File changed:** `services/emailService.js`
**Change:** Fixed `'http://https://waec-cbt-admin.vercel.app'` → `'https://waec-cbt-admin.vercel.app'`

**Frontend impact:** None. Only affects email link generation when `FRONTEND_URL` env var is missing.

---

### ✅ M-3 · Biased Shuffle Algorithm
**Files changed:** `utils/helpers.js`, `models/Question.js`, `controllers/examSetupController.js`
**Changes:**
- Created `utils/helpers.js` with an exported `shuffleArray(array)` using the Fisher-Yates algorithm.
- Replaced all `array.sort(() => 0.5 - Math.random())` calls with `shuffleArray(array)`.

Affected locations:
- `Question.getRandomQuestions` — practice questions
- `examSetupController.createExamSetup` — question selection at exam creation
- `examSetupController.updateExamSetup` — question re-selection on update
- `examSetupController.startStudentExam` — question shuffle at exam start

**Frontend impact:** None. Same questions, same count — just statistically fair ordering.

---

### ✅ M-5 · Missing Firestore Composite Indexes
**File created:** `firestore.indexes.json`
**Change:** Created index definitions for all multi-field queries used in the app.

**ACTION REQUIRED (Ops):** Deploy these indexes to Firestore:
```bash
firebase deploy --only firestore:indexes
```
Or manually create them via the Firebase Console using the index definitions in `firestore.indexes.json`.

**Frontend impact:** None. Fixes silent query failures on large datasets.

---

### ✅ M-7 · Unvalidated Ticket Status
**File changed:** `controllers/superAdminController.js`
**Change:** `updateTicketStatus` now validates `status` against `['open', 'in_progress', 'resolved', 'closed']` and returns `400` for invalid values.

**Frontend impact:** None, as long as the super admin dashboard is sending one of those four values.

---

### ✅ L-2 · Redundant Ternary in clearTokenCookies
**File changed:** `services/tokenService.js`
**Change:** Removed `domain: isProduction ? undefined : undefined` — both branches were identical dead code.

---

### ✅ L-1 · Dead Code Files Deleted
**Files deleted:**
- `routes/examRoutes.js` — entirely commented out, not imported anywhere
- `controllers/subjectController.js` — entirely commented out, not imported anywhere

---

## BATCH 2 — COMPLETE ✅ (Applied 2026-03-17)

All frontend coordination confirmed via ADMIN_BATCH2_FRONTEND.md, SUPER_ADMIN_FRONTEND_FIX_PLAN.md, and FRONTEND_AUDIT_FIX.md before applying.

---

### ✅ C-3 · JWT Tokens Removed from JSON Response Body
**Severity:** CRITICAL
**Files changed:** `controllers/authController.js` (login, verify2FA)

**Change applied:** Removed `tokens` from `login()` and `verify2FA()` response bodies. Auth is now cookie-only. `TokenService.setTokenCookies()` still sets both httpOnly cookies on every successful login — no change to that flow.

**Student login note:** `studentController.js` `studentLogin()` never returned tokens in the body — confirmed safe, no change needed there.

**Frontend status:** All 3 frontends confirmed ready before this was applied.

---

### ✅ H-3 · Default Student Password Removed from API Response
**Severity:** HIGH
**File changed:** `controllers/adminController.js` (`createStudent`)

**Change applied:** Removed `password: '123456'` from the `credentials` object in the response. `loginId`, `email`, and `nin` are still returned. Admin frontend now displays `123456` as a hardcoded static string.

---

### ✅ H-5 · Raw TOTP Secret Removed from 2FA Setup Response
**Severity:** HIGH
**File changed:** `controllers/authController.js` (`setup2FA`)

**Change applied:** Removed `secret` and `otpauthUrl` from the response. Only `qrCode` (data URI) is returned. Both admin and super admin frontends confirmed they no longer read or display the raw secret.

---

### ✅ M-6 · Pagination Added to Admin + Super Admin List Endpoints
**Severity:** MEDIUM
**Files changed:** `controllers/adminController.js`, `controllers/questionController.js`, `controllers/examSetupController.js`, `controllers/superAdminController.js`

**Pattern applied to all endpoints:**
- No `?limit`/`?page` params → returns full array, original response shape (100% backward compatible)
- With `?limit=50&page=1` → returns `{ [key]: paginatedArray, total, page, limit }`

**Admin endpoints now paginated:**
| Endpoint | Response key |
|----------|-------------|
| `GET /api/admin/students` | `students` |
| `GET /api/admin/questions` | `questions` |
| `GET /api/admin/exam-setups` | `exams` |
| `GET /api/admin/exam-setups/:id/results` | `results` |

**Super Admin endpoints now paginated:**
| Endpoint | Response key |
|----------|-------------|
| `GET /api/super-admin/admins` | `admins` |
| `GET /api/super-admin/schools` | `schools` |
| `GET /api/super-admin/students` | `students` |
| `GET /api/super-admin/tickets` | `tickets` |

**Student endpoints NOT yet paginated** — student frontend has not implemented pagination UI. See section below.

---

### ✅ M-6 · Student Endpoint Pagination — COMPLETE

**Applied:** 2026-03-17
**Files changed:** `controllers/examController.js`, `controllers/studentController.js`, `controllers/practiceController.js`

**Endpoints paginated:**
- `GET /api/student/results` — response key `results`
- `GET /api/student/history` — response key `exams`
- `GET /api/student/practice/history` — response key `practices`

**Pattern applied:** Same backward-compatible `?limit=N&page=N` pattern as all admin/super admin endpoints. No params → original full-array response. With both params → `{ [key]: paginatedArray, total, page, limit }`.

**Frontend status:** Student frontend confirmed ready in `FRONTEND_AUDIT_FIX.md` (FIX 9 — M-6). `Performance.jsx` paginates exam history and practice history independently. `PastQuestions.jsx` paginates results. All use `LIMIT=20`, send `?limit=20&page=N`, read `data.total` for `totalPages`.

---

## PHASE 5 — SECRETS ROTATION (Immediate — Separate from Code)

> These are operational steps only. Do NOT commit rotated secrets to git.

| Secret | Action |
|--------|--------|
| `JWT_SECRET` | Generate new 256-bit random string, update in Vercel environment variables |
| `JWT_REFRESH_SECRET` | Same as above |
| `GMAIL_APP_PASSWORD` | Revoke in Google Account → App Passwords, generate new one |
| `PAYSTACK_SECRET_KEY` | Rotate in Paystack Dashboard → Settings → API Keys |
| `PAYSTACK_PUBLIC_KEY` | Rotate in Paystack Dashboard |
| Firebase Service Account | Firebase Console → Project Settings → Service Accounts → Revoke + Generate New Key |

**Check git history:**
```bash
git log --all --full-history -- .env
git log --all --full-history -- firebase-service-account.json
```
If either file appears in git history, rotate ALL secrets — they are permanently readable by anyone with access to the repository.

---

## FILES CHANGED IN BATCH 1

| File | Changes |
|------|---------|
| `controllers/authController.js` | C-1: super admin guard |
| `controllers/adminController.js` | H-1: student update allowlist |
| `controllers/superAdminController.js` | H-1: subject update allowlist, M-7: ticket status validation |
| `controllers/examSetupController.js` | H-4: N+1 fix (batch read), M-3: Fisher-Yates shuffle |
| `models/ExamSetup.js` | H-4: N+1 fix in getQuestionsForExam |
| `models/Question.js` | M-3: Fisher-Yates shuffle |
| `routes/adminRoutes.js` | C-2: removed webhook route |
| `server.js` | C-2: webhook at top-level, C-4: health check, H-2: rate limiting, H-6: eager Firebase init, M-1: CORS tighten |
| `config/firebase.js` | C-4: process.exit(1) on init failure in production |
| `services/emailService.js` | M-2: fixed fallback URL |
| `services/tokenService.js` | L-2: removed redundant ternary |
| `utils/helpers.js` | M-3: created Fisher-Yates shuffle helper |
| `firestore.indexes.json` | M-5: created composite index definitions |
| `routes/examRoutes.js` | L-1: DELETED (dead code) |
| `controllers/subjectController.js` | L-1: DELETED (dead code) |

---

---

## FILES CHANGED IN STUDENT M-6 PAGINATION

| File | Changes |
|------|---------|
| `controllers/examController.js` | M-6: backward-compatible `?limit&page` pagination on `getResults` |
| `controllers/studentController.js` | M-6: backward-compatible `?limit&page` pagination on `getExamHistory` |
| `controllers/practiceController.js` | M-6: backward-compatible `?limit&page` pagination on `getPracticeHistory` |
