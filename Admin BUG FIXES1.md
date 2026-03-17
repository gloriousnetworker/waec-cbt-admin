# Einstein's CBT Admin — Full Application Audit & Bug Fix Plan
**Product:** Einstein's CBT App — Admin Portal
**Company:** Mega Tech Solutions
**Audited:** 2026-03-17
**Auditor:** Claude Code
**Total Issues Found:** 52
**Status:** Pending Implementation

---

## Executive Summary

A full codebase audit of the Einstein's CBT Admin app was performed across all 24 source files.
The app has a solid architectural foundation (Next.js 15, cookie-based auth, protected routes, Framer Motion) but carries a significant number of accumulated issues from an earlier iteration under "Kogi State College of Education" branding that were never fully migrated to the Einstein's CBT / Mega Tech Solutions identity.

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 CRITICAL | 7 | Pending |
| 🟠 HIGH | 12 | Pending |
| 🟡 MEDIUM | 18 | Pending |
| 🔵 LOW | 15 | Pending |
| **TOTAL** | **52** | |

> **Note:** Some fixes from the previous design plan (PLAN.md) have already been partially applied.
> This document supersedes that plan and covers both remaining design fixes and all newly discovered functional bugs.

---

## Part 1 — CRITICAL ISSUES (Fix First)

---

### BUG-01 · Wrong App Identity in layout.jsx
**Severity:** 🔴 CRITICAL — First thing browsers, PWA installers, and search engines read
**File:** `src/app/layout.jsx`

| Element | Current (Wrong) | Target (Correct) |
|---------|----------------|-----------------|
| `<title>` | `School Admin Dashboard` | `Einstein's CBT Admin — Mega Tech Solutions` |
| `<meta name="description">` | `School Admin Dashboard - Manage Students...` | `Einstein's CBT Admin Portal — Manage your school's students, exams and results` |
| `<meta name="theme-color">` | `#2563EB` (wrong blue) | `#1F2A49` (brand navy) |
| `<meta name="apple-mobile-web-app-title">` | `School Admin` | `Einstein's CBT Admin` |
| `<meta name="application-name">` | `School Admin` | `Einstein's CBT Admin` |
| `<meta name="msapplication-TileColor">` | `#2563EB` | `#1F2A49` |
| `<body className>` | `font-playfair` | `font-inter` (or no class) — Playfair is heading-only |

**Also in layout.jsx:**
- `toastOptions.success.style.color`: `#2563EB` → `#1F2A49`
- `toastOptions.success.style.borderLeft`: `4px solid #2563EB` → `4px solid #1F2A49`
- `toastOptions.success.iconTheme.primary`: `#2563EB` → `#1F2A49`
- `toastOptions.style.fontFamily`: `"Playfair Display", serif` → `"Inter", sans-serif`
- `offline/online` event handlers: `console.log` only — no user notification. Should show a toast banner

---

### BUG-02 · Wrong App Identity in manifest.json
**Severity:** 🔴 CRITICAL — PWA installs with wrong name and broken theme color
**File:** `public/manifest.json`

| Field | Current (Wrong) | Target (Correct) |
|-------|----------------|-----------------|
| `name` | `WAEC CBT Simulator - Exam Practice` | `Einstein's CBT Admin` |
| `short_name` | `WAEC CBT` | `CBT Admin` |
| `description` | `Practice WAEC Computer Based Test (CBT) exams offline` | `Admin portal for Einstein's CBT App — Mega Tech Solutions` |
| `theme_color` | `#039994` (teal — completely wrong) | `#1F2A49` |
| `background_color` | `#ffffff` | `#F5F7FB` |
| `start_url` | `/` | `/dashboard` |
| shortcuts `url[0]` | `/dashboard/exams` | `/dashboard?section=exams` |
| shortcuts `url[1]` | `/dashboard/performance` | `/dashboard?section=results` |
| shortcut names | `Start Practice Test` / `View Results` (student language) | `Manage Exams` / `View Results` |

**Also:** All icon `src` paths reference `/icons/icon-*.png` but the `public/` folder has no `icons/` directory. The manifest will silently fail to load icons — the PWA install icon will be blank. Icons need to be generated from `logo.png` and placed in `public/icons/`.

---

### BUG-03 · Body Font Wrong — Playfair Display on All Text
**Severity:** 🔴 CRITICAL — Heavily impacts readability across the entire app
**Files:** `src/app/layout.jsx` line 107, `src/styles/globals.css` body rule

**Problem:** `<body className="... font-playfair">` applies the display serif (Playfair Display) to ALL text in the app — buttons, labels, inputs, metadata, nav items. This is a heading-only font per the design system.

**Fix:**
```jsx
// layout.jsx line 107
// BEFORE:
<body className="bg-white min-h-screen font-playfair antialiased">
// AFTER:
<body className="bg-surface-muted min-h-screen antialiased">
```
```css
/* globals.css */
body {
  font-family: 'Inter', sans-serif; /* NOT Playfair Display */
}
```

---

### BUG-04 · localStorage Used for Navigation State (Security + Reliability Risk)
**Severity:** 🔴 CRITICAL — XSS-accessible, breaks on private browsing or storage-quota exceeded
**Files:**

| File | Lines | What's Stored |
|------|-------|--------------|
| `src/components/dashboard-content/Students.jsx` | 150–153, 163 | `selected_student`, `student_performance`, `student_exams`, `edit_student` |
| `src/components/dashboard-content/Performance.jsx` | 31–38 | Reads `selected_student`, `student_performance`, `student_exams` |
| `src/components/dashboard-content/Questions.jsx` | 64 | Reads `selected_subject` |
| `src/components/dashboard-content/Subjects.jsx` | 45 | Writes `selected_subject` |
| `src/app/dashboard/student-registration/page.jsx` | 139, 163 | `edit_student` |

**Problem:** Student objects, exam arrays, and performance data are passed between pages via `localStorage`. This is fragile (breaks if storage quota exceeded or in private mode), can contain sensitive school data, and is accessible to any XSS script.

**Fix Plan:** Lift state to a shared `DashboardContext` (or pass via URL params for navigation, and use context for selected objects):
```jsx
// Create src/context/DashboardContext.jsx
// State: selectedStudent, selectedSubject, editStudent
// Consumed by: Performance, Questions, Subjects, student-registration
```
Then replace every `localStorage.setItem/getItem` with context reads/writes.

---

### BUG-05 · Hardcoded "Kogi State" Branding in Settings and Student Registration
**Severity:** 🔴 CRITICAL — Wrong school name displayed to admins
**Files:**

| File | Line | Wrong Text |
|------|------|-----------|
| `src/components/dashboard-content/Settings.jsx` | 27 | `address: 'Kogi State College of Education'` |
| `src/components/dashboard-content/Settings.jsx` | 58–64 | Default `school`, `address` fallback to "Kogi State..." |
| `src/components/dashboard-content/Settings.jsx` | 59 | `email: 'admin@kogistatecollege.edu.ng'` |

**Fix:**
- Remove all hardcoded Kogi State values
- Profile defaults should come from `user.school` and `user.email` from the API
- If API doesn't return school address, leave field empty — do not hardcode a placeholder school

---

### BUG-06 · Offline/Online Events Do Nothing (Broken PWA UX)
**Severity:** 🔴 CRITICAL — Users have no feedback when internet drops
**File:** `src/app/layout.jsx` lines 69–83

**Current:** `console.log('App is offline')` — invisible to users.

**Fix:**
```jsx
const handleOffline = () => {
  toast('You are offline. Some features may be unavailable.', {
    icon: '📡',
    duration: Infinity,
    id: 'offline-toast',
    style: { background: '#FEF3C7', color: '#D97706', borderLeft: '4px solid #F59E0B' }
  })
}
const handleOnline = () => {
  toast.dismiss('offline-toast')
  toast.success('Back online!', { duration: 2000 })
}
```

---

### BUG-07 · PWA Icons Directory Missing
**Severity:** 🔴 CRITICAL — App installs without an icon (shows blank/default)
**File:** `public/manifest.json` (all `icons` entries)

**Problem:** manifest.json references `/icons/icon-72x72.png` through `/icons/icon-512x512.png` but `public/icons/` directory does not exist. The logo.png is available at `public/logo.png`.

**Fix:** Generate all required PWA icon sizes from `logo.png` and place them in `public/icons/`:
- Sizes needed: 72, 96, 128, 144, 152, 180, 192, 384, 512
- Tools: `sharp`, `imagemagick`, or online PWA icon generator
- Also add a maskable icon: `"purpose": "maskable"` for the 192 and 512 sizes

---

## Part 2 — HIGH PRIORITY ISSUES

---

### BUG-08 · No Student Edit UI
**Severity:** 🟠 HIGH — Admin cannot correct student data after creation
**File:** `src/components/dashboard-content/Students.jsx`

**Problem:** The Students page has buttons for View, Edit, and Delete — but clicking "Edit" redirects to `/dashboard/student-registration?edit=true` which reads from `localStorage`. There is no inline edit modal. The registration page works for edits, but:
1. Relies on `localStorage` to pass student data (see BUG-04)
2. No success redirect back to the students list after edit
3. The current `handleEditStudent` stores full student object in localStorage and redirects — fragile

**API Endpoint available:** `PUT /api/admin/students/:studentId` accepts `firstName`, `lastName`, `middleName`, `nin`, `phone`, `dateOfBirth`, `class`, `gender`, `address`

**Fix:** Add an "Edit Student" modal inside Students.jsx with the same fields from the registration form, calling `PUT /api/admin/students/:id` directly without a page redirect.

---

### BUG-09 · No Exam Mode Toggle UI
**Severity:** 🟠 HIGH — Admin cannot put students into exam mode
**File:** `src/components/dashboard-content/Students.jsx`

**Problem:** The `handleToggleExamMode` function exists and calls `PATCH /api/admin/students/:id/exam-mode`, but looking at the rendered table (lines 320–329), the "Exam Mode" column shows **just a static pill badge** (`On` / `Off`) that is clickable — but in the actual code it's a `<button>` that calls `handleToggleExamMode`. This is actually working! But:
- No loading state on the toggle button while PATCH request is in flight
- No confirmation before enabling exam mode (locking students out of the dashboard)
- The button has no visual indication it's clickable (looks like a static badge)

**Fix:**
- Add `disabled` + spinner on the button while toggling
- Add a confirmation toast/modal: "Enable exam mode for John Doe? They will be locked to exam view."
- Style the pill as a clearly interactive toggle switch

---

### BUG-10 · Support Tickets — No Reply UI
**Severity:** 🟠 HIGH — Admin can create tickets but cannot reply or view conversation
**File:** `src/components/dashboard-content/Support.jsx`

**API Available:**
- `GET /api/admin/tickets/:ticketId` — full ticket with `messages` array
- `POST /api/admin/tickets/:ticketId/reply` — send `{ message: "string" }`

**Problem:** The Support page shows a list of tickets and a "Create Ticket" modal, but there is no UI to:
1. Click on a ticket to view the full conversation thread
2. Reply to a ticket's messages
3. See the ticket's current `status` as a badge

**Fix:** Add a "Ticket Detail" slide-over or modal with:
- Full `messages` array rendered as a chat thread
- Reply input field + "Send Reply" button calling `POST /api/admin/tickets/:ticketId/reply`
- Status badge (`badge-success` for resolved, `badge-warning` for in_progress, etc.)

---

### BUG-11 · Subscription Page — No Payment Method Selection
**Severity:** 🟠 HIGH — Payment method dropdown state exists but no UI renders it
**File:** `src/components/dashboard-content/Subscription.jsx`

**Problem:** `const [selectedMethod, setSelectedMethod] = useState('card')` exists and is sent in the payment init body, but there is no `<select>` or UI to change it. API also exposes `GET /api/admin/payment/methods` to fetch available methods.

**Fix:** Add a "Payment Method" selector above the plan cards. Fetch available methods on mount and render them as radio buttons or a `<select>`.

---

### BUG-12 · Error States Silently Swallowed Across Multiple Components
**Severity:** 🟠 HIGH — Users see nothing when network calls fail
**Files:**

| File | Line | Issue |
|------|------|-------|
| `src/components/dashboard-components/Navbar.jsx` | ~70 | `catch {}` — completely empty catch block |
| `src/components/dashboard-content/Students.jsx` | 63 | `console.error()` on subject load failure — no toast |
| `src/components/dashboard-content/Results.jsx` | 69 | Per-exam results fetch failure silently skipped |
| `src/components/dashboard-content/Subscription.jsx` | Multiple | Payment errors may not surface to user |

**Fix Pattern (apply everywhere):**
```jsx
} catch (error) {
  console.error('[ComponentName] fetchXxx failed:', error);
  toast.error(error.message || 'Something went wrong. Please try again.');
}
```

---

### BUG-13 · Exam Activation — No Student Selection Confirmation
**Severity:** 🟠 HIGH
**File:** `src/components/dashboard-content/Exams.jsx`

States for `showActivateModal`, `selectedStudents`, and `selectAllInClass` exist, but the activate modal needs verification. The full implementation should:
1. Let admin choose: "All students in class" OR "Select specific students"
2. Show a preview count: "This will assign the exam to 45 students in SS2"
3. Confirmation button calls `POST /api/admin/exam-setups/:id/activate` with optional `{ studentIds: [...] }`

Verify this modal is fully functional end-to-end.

---

### BUG-14 · Settings Page — Wrong Default Profile Values
**Severity:** 🟠 HIGH — Admin sees "Kogi State" data instead of their own
**File:** `src/components/dashboard-content/Settings.jsx` lines 56–65

**Problem:**
```jsx
setProfileData({
  name: user.name || 'Admin User',
  email: user.email || 'admin@kogistatecollege.edu.ng',  // ← WRONG
  school: user.school || 'Kogi State College of Education', // ← WRONG
  address: user.address || 'Kogi State College of Education', // ← WRONG
  ...
})
```
**Fix:** Remove the wrong fallback strings. Empty string is the correct fallback:
```jsx
email: user.email || '',
school: user.schoolName || '',
address: user.address || '',
```
Also fetch school name from `GET /api/admin/profile` which returns full `admin.schoolId` data. Consider also calling `GET /api/super-admin/schools/:schoolId` to get the school name.

---

### BUG-15 · No 403 Handling for Expired Subscriptions
**Severity:** 🟠 HIGH — When subscription expires, API returns 403 but app shows blank/error
**File:** `src/context/AuthContext.jsx`

**Problem:** `fetchWithAuth` handles `401` (token refresh) but has no special handling for `403`. When an admin's subscription expires:
- `GET /api/admin/students` → `403 Forbidden`
- The Students page receives `null` from `fetchWithAuth` (because the function doesn't return on 403)
- The page shows empty list with no explanation

**Fix:** In `fetchWithAuth`, add 403 handling:
```jsx
if (response.status === 403) {
  // Optionally: redirect to /dashboard?section=subscription
  // or emit a context event that the layout can listen to
  toast.error('Subscription required. Please renew your plan.', { id: 'sub-expired' })
}
return response; // still return so pages can handle it themselves too
```

---

### BUG-16 · Register Page — sessionStorage Used for Email
**Severity:** 🟠 HIGH
**File:** `src/app/register/page.jsx` line ~98

`sessionStorage.setItem('registeredEmail', formData.email)` — passes email to the verify-email page via sessionStorage instead of URL param or context.

**Fix:** Pass email via URL search param:
```jsx
router.push(`/verify-email/pending?email=${encodeURIComponent(formData.email)}`)
```

---

### BUG-17 · No Confirmation Before Removing Subject from Student
**Severity:** 🟠 HIGH — Destructive action with no undo
**File:** `src/components/dashboard-content/Students.jsx` line ~120

`handleRemoveSubject` fires immediately on click with no confirmation dialog. If admin clicks the `×` accidentally, the subject is removed.

**Fix:** Show a small inline confirmation: "Remove Mathematics from John Doe?" with Cancel / Confirm buttons (or at minimum a toast with an "Undo" action).

---

### BUG-18 · Questions Page — Selected Subject from localStorage
**Severity:** 🟠 HIGH
**File:** `src/components/dashboard-content/Questions.jsx` line 64

`const storedSubject = localStorage.getItem('selected_subject')` — pre-selects a subject filter based on a localStorage value set when navigating from Subjects page. This is fragile and can show stale data if the admin navigated away and came back.

**Fix:** Use URL search params or context (see BUG-04 fix plan).

---

### BUG-19 · Subscription Verify Page — No Error Handling for Failed Payments
**Severity:** 🟠 HIGH
**File:** `src/app/dashboard/subscription/verify/page.jsx`

This page is the Paystack callback — it calls `GET /api/admin/subscription/verify/:reference`. If payment failed or reference is invalid, the page must show a clear error and link back to the subscription page.

Verify the page has proper error state handling for:
- Invalid reference (`404`)
- Payment failed on Paystack side
- Already-verified reference (idempotency)

---

## Part 3 — MEDIUM PRIORITY ISSUES

---

### BUG-20 · All Green (#10b981) UI Elements Need Brand Navy
**Severity:** 🟡 MEDIUM — Color inconsistency throughout
**Files and occurrences:**

| File | Element | Fix |
|------|---------|-----|
| `src/components/dashboard-content/Students.jsx` | Avatar `bg-[#10b981]`, border `border-[#10b981]`, action links `text-[#10b981]` | → `bg-gradient-to-br from-brand-primary to-brand-primary-dk` for avatars; `text-brand-primary` for links |
| `src/components/dashboard-content/Subjects.jsx` | `focus:border-[#10b981]`, button `bg-[#10b981]`, spinner | → `focus:border-brand-primary`, `bg-brand-primary`, `border-brand-primary` |
| `src/components/dashboard-content/Settings.jsx` | All buttons, avatar, tab active, toggle `peer-checked:bg-[#10b981]` | → `bg-brand-primary` everywhere |
| `src/components/ProtectedRoute.jsx` | Loading spinner `border-[#10b981]` | → `border-brand-primary` |
| `src/app/dashboard/student-registration/page.jsx` | Success banner `bg-gradient-to-r from-[#10b981]` | → `from-brand-primary` |

---

### BUG-21 · Performance Page — Reads from localStorage Only, No Fallback
**Severity:** 🟡 MEDIUM
**File:** `src/components/dashboard-content/Performance.jsx` lines 31–38

If `selected_student` is missing from localStorage (fresh page load, cleared storage), the Performance page shows nothing with no message. Add empty state: "No student selected. Go to Students and click View on a student."

---

### BUG-22 · Questions Page — Subject Filter Pre-selection from localStorage
**Severity:** 🟡 MEDIUM (part of BUG-04 but noting specific UX impact)
**File:** `src/components/dashboard-content/Questions.jsx`

If admin navigates: Subjects → click "Manage Questions" → Questions page, the subject filter is pre-set via localStorage. But if admin navigates directly to Questions, no pre-selection. Should work both ways gracefully. Consider showing "Showing questions for: Mathematics" with a "Clear" button.

---

### BUG-23 · Subjects Page — No Question Count Visible
**Severity:** 🟡 MEDIUM
**File:** `src/components/dashboard-content/Subjects.jsx`

Subject cards show `examType`, `duration`, `questionCount` from API data — but only if `subject.questionCount` exists. The API returns `questionCount` from the subject object. Verify the count is being displayed and shows `0` rather than blank when no questions exist for that subject.

---

### BUG-24 · Home Dashboard — Stats Never Refresh Automatically
**Severity:** 🟡 MEDIUM
**File:** `src/components/dashboard-content/Home.jsx`

Stats are fetched once on mount. If admin creates a student or activates an exam, the stats counters on the home page won't update until page refresh. Add a "refresh" button to the stats header, and optionally auto-refresh every 60 seconds.

---

### BUG-25 · Home Dashboard — recentExams Shows Exam Sessions, Not Setups
**Severity:** 🟡 MEDIUM
**File:** `src/components/dashboard-content/Home.jsx`

The API's `GET /api/admin/dashboard/stats` returns `recentExams` which are student exam *sessions* (with `score`, `percentage`, `studentId`). The current display shows these as if they're exam setups with just scores — but no student name is shown. Should show `studentId` → look up student name, or at minimum show "Student ID: ..." until the student list is loaded.

---

### BUG-26 · Results Page — Per-Exam Stats Fetched in Serial Loop
**Severity:** 🟡 MEDIUM — Performance issue
**File:** `src/components/dashboard-content/Results.jsx` lines 55–72

```jsx
for (const exam of completedExams) {
  const resultsRes = await fetchWithAuth(...)  // ← Sequential N+1 fetches
}
```
If there are 20 completed exams, this makes 20 sequential API calls. Should use `Promise.all`:
```jsx
await Promise.all(completedExams.map(exam =>
  fetchWithAuth(`/admin/exam-setups/${exam.id}/results`)
    .then(r => r.ok ? r.json() : null)
    .catch(() => null)
))
```

---

### BUG-27 · Register Page — No Admin Self-Registration Possible
**Severity:** 🟡 MEDIUM — Verify this is intentional
**File:** `src/app/register/page.jsx`

The admin is created by the super admin via `POST /api/super-admin/admins`. The register page in the admin app may be unnecessary or may be for email verification only. Verify whether this page is meant to exist — if admins only receive credentials from super admin, this page should redirect to login with a note "Contact your super admin to get access."

---

### BUG-28 · Exams Page — No Form Validation for Question Count
**Severity:** 🟡 MEDIUM
**File:** `src/components/dashboard-content/Exams.jsx`

When creating an exam, the `questionCount` per subject is typed by admin. No validation:
- No check that `questionCount` ≤ questions available for that subject in the school's question bank
- No minimum (could be 0)
- No error message before hitting the API

**Fix:** On subject select, fetch the count of questions for that subject via `GET /api/admin/questions?subjectId=X` and show "X questions available" next to the count input.

---

### BUG-29 · Exam Deactivation — No Warning About Active Students
**Severity:** 🟡 MEDIUM
**File:** `src/components/dashboard-content/Exams.jsx`

Deactivating an exam ends it for all students — even those currently in the middle of it. The deactivate modal should warn: "X students may be in the middle of this exam. Deactivating will force-submit their current answers."

---

### BUG-30 · Questions Bulk Import — No Template Download
**Severity:** 🟡 MEDIUM
**File:** `src/components/dashboard-content/Questions.jsx`

The bulk import feature requires JSON format but there is no "Download Template" button showing the expected structure. Admin has to guess the format. Add a "Download Sample JSON" button that downloads a pre-filled example with 2 questions.

---

### BUG-31 · Student Registration — No Class-Level Student Count Warning
**Severity:** 🟡 MEDIUM
**File:** `src/app/dashboard/student-registration/page.jsx`

When creating a student, no real-time feedback on how many students are left in the subscription quota. The API returns `subscription.remaining` in the `createStudent` response — show this prominently after each creation: "47 student slots remaining."

---

### BUG-32 · No Empty States on Any List Page
**Severity:** 🟡 MEDIUM — Poor first-time user experience
**Files:** Students, Questions, Exams, Results, Support

| Page | Current Empty State | Target Empty State |
|------|--------------------|--------------------|
| Students | Shows empty table | "No students yet. Register your first student →" button |
| Questions | Shows empty table | "No questions yet. Create one or bulk import →" button |
| Exams | Presumably empty grid | "No exams created. Create your first exam →" button |
| Results | Shows "No Results Found" | Add link to Exams page + explanation |
| Support | Unknown | "No tickets yet. Need help? Create a support ticket →" button |

---

### BUG-33 · No Loading State on Subscription Payment Button
**Severity:** 🟡 MEDIUM
**File:** `src/components/dashboard-content/Subscription.jsx`

When admin clicks "Pay Now", the button should disable and show a spinner while the payment init call is in flight. Currently admin could double-click and generate duplicate Paystack payment references.

---

### BUG-34 · Results Page — Individual Student Scores Not Listed
**Severity:** 🟡 MEDIUM
**File:** `src/components/dashboard-content/Results.jsx`

The results modal (shown after clicking an exam) should display the full `results[]` array from `GET /api/admin/exam-setups/:id/results` in a table: Student Name, Class, Score, Percentage, Pass/Fail badge, Submitted At.

Verify the modal renders this table correctly with all columns and badges.

---

### BUG-35 · Settings Page — No Success Feedback on Exam/Notification Settings Save
**Severity:** 🟡 MEDIUM
**File:** `src/components/dashboard-content/Settings.jsx`

`POST /settings/exam` and `POST /settings/notifications` are called but these endpoints do NOT appear in `API_CONTEXT.md`. These may be unimplemented on the backend. Check if these calls succeed or silently fail. If backend doesn't support them, the Save buttons should be disabled or show "Coming soon".

---

### BUG-36 · No Auto-Logout on 403 (Subscription Expired)
**Severity:** 🟡 MEDIUM — Related to BUG-15
**File:** `src/context/AuthContext.jsx`

When subscription expires, API returns 403 on most admin routes. The app should detect this and redirect to `/dashboard?section=subscription` with a banner: "Your subscription has expired. Please renew to continue."

---

### BUG-37 · Navbar Search Bar Has No Functionality
**Severity:** 🟡 MEDIUM
**File:** `src/components/dashboard-components/Navbar.jsx`

There is a search input in the navbar. What does it search? If it's a global search across students, questions, and exams, it needs significant implementation. If it's not implemented, **remove it** — a broken search bar damages trust more than having no search.

Verdict: Either implement global search with a debounced API call or remove the input entirely until it's built.

---

## Part 4 — LOW PRIORITY ISSUES (Polish)

---

### BUG-38 · All Interactive Elements Need min-h-[44px] Touch Targets
**Severity:** 🔵 LOW — WCAG 2.5.5 accessibility
**Files:** Multiple — nav items, badge buttons, small action buttons across all pages

WCAG requires all interactive elements to be at least `44×44px`. Many small buttons (subject remove `×`, table action links "View/Edit/Delete") are smaller.

**Fix:** Add `min-h-[44px] min-w-[44px]` to all clickable elements. For table action links, use `py-2 px-3` at minimum.

---

### BUG-39 · Exam Mode Toggle Has No Accessible Label
**Severity:** 🔵 LOW
**File:** `src/components/dashboard-content/Students.jsx`

Toggle buttons for exam mode (`On`/`Off`) have no `aria-label`. Screen readers cannot determine their purpose.

**Fix:** `<button aria-label={`Toggle exam mode for ${student.firstName} ${student.lastName}`}>`.

---

### BUG-40 · Toast Notifications Use Playfair Font
**Severity:** 🔵 LOW
**File:** `src/app/layout.jsx` line 19

`fontFamily: '"Playfair Display", serif'` on toasts. Should be Inter.

**Fix:**
```jsx
fontFamily: '"Inter", sans-serif',
```

---

### BUG-41 · No Sort Controls on Students Table
**Severity:** 🔵 LOW
**File:** `src/components/dashboard-content/Students.jsx`

The students table cannot be sorted by name, class, status, or registration date. Add column header click-to-sort for at least Name and Class.

---

### BUG-42 · Subject Cards Don't Show Status Badge
**Severity:** 🔵 LOW
**File:** `src/components/dashboard-content/Subjects.jsx`

Each subject has a `status: "active | inactive"` field from the API. Inactive subjects should show a `badge-danger` or `badge-warning` "Inactive" badge. Currently no status is shown.

---

### BUG-43 · Exam Status Filter Missing "Draft" Option
**Severity:** 🔵 LOW
**File:** `src/components/dashboard-content/Exams.jsx`

The API supports `?status=draft|active|completed` filter. Verify the frontend filter dropdown includes "Draft" as an option and uses it correctly.

---

### BUG-44 · No "Back to Dashboard" Button on 404/Error States
**Severity:** 🔵 LOW

When any page loads with an API error (e.g., subscription expired, network timeout), the user is left staring at an empty page or loading spinner with no navigation. Add a "Return to Dashboard" button on all terminal error states.

---

### BUG-45 · Performance Page — No Date Range Filter
**Severity:** 🔵 LOW
**File:** `src/components/dashboard-content/Performance.jsx`

Student performance shows all-time data. For schools that run multiple exam periods, a date range filter would be valuable. The API supports filtering by date on some endpoints.

---

### BUG-46 · Settings — Dark Mode Toggle Does Nothing
**Severity:** 🔵 LOW
**File:** `src/components/dashboard-content/Settings.jsx`

`appearanceSettings.darkMode` state exists and can be toggled, but Tailwind's dark mode (`darkMode: 'class'` in `tailwind.config.js`) is never activated. The toggle is a no-op.

**Fix:** Either implement dark mode (add `document.documentElement.classList.toggle('dark', isDark)`) or **remove the toggle** until dark mode is actually built.

---

### BUG-47 · Results Export CSV — Missing Student Name for Some Records
**Severity:** 🔵 LOW
**File:** `src/components/dashboard-content/Results.jsx`

The CSV export function references `r.correctAnswers` and `r.wrongAnswers` — but the API's `results[]` shape does NOT include these fields. The CSV will have empty columns for these. Either remove them from the CSV or calculate from score/totalMarks.

---

### BUG-48 · Questions Page Filter Dropdowns Have No "Reset All" Button
**Severity:** 🔵 LOW
**File:** `src/components/dashboard-content/Questions.jsx`

When multiple filters are applied, users need to reset each one individually. Add a "Clear Filters" button that resets all filter states at once.

---

### BUG-49 · No Keyboard Shortcut for Sidebar Toggle
**Severity:** 🔵 LOW

Power-admin users on desktop would benefit from `Ctrl+B` or `\` to toggle the sidebar. This is a common pattern in admin dashboards.

---

### BUG-50 · Next.js Config Missing outputFileTracingRoot Warning
**Severity:** 🔵 LOW
**File:** `next.config.js`

The dev server shows: `⚠ Warning: Next.js inferred your workspace root...` because there are multiple `package-lock.json` files. Add to `next.config.js`:
```js
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: require('path').join(__dirname),
}
```

---

### BUG-51 · Missing `NEXT_PUBLIC_API_BASE_URL` Environment Variable
**Severity:** 🔵 LOW
**File:** `src/context/AuthContext.jsx` line 8

```jsx
const BASE_URL = 'https://cbt-simulator-backend.vercel.app';
```

Hardcoded. Should use:
```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://cbt-simulator-backend.vercel.app
```
```jsx
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
```
This allows staging/production environments to point to different API URLs without code changes.

---

### BUG-52 · Support Page — No Ticket Priority Color Coding
**Severity:** 🔵 LOW
**File:** `src/components/dashboard-content/Support.jsx`

Tickets have `priority: "low | medium | high"` but the UI shows no visual differentiation. High priority tickets should have a `badge-danger`, medium `badge-warning`, low `badge-success` indicator.

---

## Implementation Plan — Phases

### PHASE A — Identity & Foundation (Do First — 1–2 days)
These fixes affect every page and must go in before anything else.

| # | Fix | File | Time |
|---|-----|------|------|
| A1 | Fix layout.jsx: title, meta tags, theme-color, body font, offline/online toasts | `layout.jsx` | 30 min |
| A2 | Fix manifest.json: name, theme, start_url, shortcuts | `manifest.json` | 20 min |
| A3 | Fix body font: Inter for body, keep Playfair for headings only | `globals.css`, `layout.jsx` | 15 min |
| A4 | Fix toast styling: Inter font, brand navy for success toasts | `layout.jsx` | 15 min |
| A5 | Fix Settings.jsx: remove all "Kogi State" defaults | `Settings.jsx` | 30 min |
| A6 | Fix env variable: move BASE_URL to .env.local | `AuthContext.jsx`, `.env.local` | 10 min |
| A7 | Generate PWA icons from logo.png → `/public/icons/` | CLI / imagemagick | 30 min |

---

### PHASE B — Security & Data Fixes (Critical Path — 2–3 days)
| # | Fix | File | Time |
|---|-----|------|------|
| B1 | Create DashboardContext for shared UI state | New file `context/DashboardContext.jsx` | 2 hrs |
| B2 | Replace all localStorage navigation state with DashboardContext | Students, Performance, Questions, Subjects, student-registration | 3 hrs |
| B3 | Add 403 handling in fetchWithAuth → redirect to subscription page | `AuthContext.jsx` | 30 min |
| B4 | Fix all swallowed errors → add toast.error in every catch block | Navbar, Students, Results, Subscription | 1 hr |
| B5 | Register page: replace sessionStorage with URL param | `register/page.jsx` | 20 min |

---

### PHASE C — Missing Functionality (High Impact — 3–5 days)
| # | Fix | File | Time |
|---|-----|------|------|
| C1 | Add Student Edit modal inside Students.jsx | `Students.jsx` | 3 hrs |
| C2 | Fix exam mode toggle: loading state + confirmation | `Students.jsx` | 1 hr |
| C3 | Add Ticket Reply UI and conversation thread | `Support.jsx` | 3 hrs |
| C4 | Add Payment Method selector in Subscription | `Subscription.jsx` | 1.5 hrs |
| C5 | Fix empty states on all list pages | Students, Questions, Exams, Results, Support | 1 hr |
| C6 | Verify Exam Activation flow end-to-end | `Exams.jsx` | 1 hr |
| C7 | Fix Results modal — ensure full student table renders | `Results.jsx` | 1 hr |
| C8 | Fix Results fetch to use Promise.all instead of serial loop | `Results.jsx` | 30 min |
| C9 | Add "subject remove" confirmation | `Students.jsx` | 30 min |
| C10 | Add subscription quota remaining counter on student registration | `student-registration/page.jsx` | 30 min |

---

### PHASE D — Consistency & Polish (Medium Impact — 2 days)
| # | Fix | File | Time |
|---|-----|------|------|
| D1 | Replace all `#10b981` with brand-primary tokens | All content pages | 2 hrs |
| D2 | Remove non-functional navbar search or implement it | `Navbar.jsx` | 1 hr |
| D3 | Add dark mode toggle wiring OR remove the toggle | `Settings.jsx` | 30 min |
| D4 | Fix Results CSV export columns | `Results.jsx` | 20 min |
| D5 | Add question count validation on exam create | `Exams.jsx` | 1 hr |
| D6 | Add "active students" warning on exam deactivate | `Exams.jsx` | 30 min |
| D7 | Add NEXT_PUBLIC env var | `AuthContext.jsx`, `.env.local` | 10 min |
| D8 | Fix Next.js workspace root warning | `next.config.js` | 10 min |
| D9 | Add min-h-[44px] to all small action buttons | All pages | 1 hr |
| D10 | Add priority badges to Support tickets | `Support.jsx` | 30 min |

---

## Priority Matrix

| Priority | Bugs | Reason |
|----------|------|--------|
| 🔴 P0 — Do Today | BUG-01, BUG-02, BUG-03, BUG-05 | Wrong brand identity — embarrassing in production |
| 🔴 P0 — Do Today | BUG-06, BUG-07 | Broken PWA — app installs with no icon, no offline feedback |
| 🟠 P1 — This Week | BUG-04, BUG-08, BUG-09, BUG-10 | Security + missing core features |
| 🟠 P1 — This Week | BUG-11, BUG-12, BUG-13, BUG-14, BUG-15 | Payment + error UX |
| 🟡 P2 — Next Sprint | BUG-20 through BUG-37 | Consistency, polish, empty states |
| 🔵 P3 — Backlog | BUG-38 through BUG-52 | Accessibility, minor polish |

---

## Files To Be Modified (Full List)

| File | Bugs Fixed |
|------|-----------|
| `src/app/layout.jsx` | BUG-01, BUG-03, BUG-06, BUG-40 |
| `public/manifest.json` | BUG-02, BUG-07 |
| `src/styles/globals.css` | BUG-03 (body font) |
| `src/context/AuthContext.jsx` | BUG-15, BUG-36, BUG-51 |
| `src/context/DashboardContext.jsx` *(new)* | BUG-04 |
| `src/components/dashboard-content/Students.jsx` | BUG-04, BUG-08, BUG-09, BUG-17, BUG-20, BUG-32, BUG-38, BUG-39, BUG-41 |
| `src/components/dashboard-content/Questions.jsx` | BUG-04 (localStorage), BUG-22, BUG-30, BUG-48 |
| `src/components/dashboard-content/Exams.jsx` | BUG-13, BUG-28, BUG-29, BUG-43 |
| `src/components/dashboard-content/Results.jsx` | BUG-12, BUG-26, BUG-34, BUG-47 |
| `src/components/dashboard-content/Performance.jsx` | BUG-04 (localStorage), BUG-21 |
| `src/components/dashboard-content/Subjects.jsx` | BUG-04 (localStorage), BUG-20, BUG-23, BUG-42 |
| `src/components/dashboard-content/Support.jsx` | BUG-10, BUG-52 |
| `src/components/dashboard-content/Subscription.jsx` | BUG-11, BUG-33 |
| `src/components/dashboard-content/Settings.jsx` | BUG-05, BUG-14, BUG-35, BUG-46, BUG-20 |
| `src/components/dashboard-content/Home.jsx` | BUG-24, BUG-25 |
| `src/components/dashboard-components/Navbar.jsx` | BUG-12, BUG-37 |
| `src/components/ProtectedRoute.jsx` | BUG-20 (spinner color) |
| `src/app/register/page.jsx` | BUG-16, BUG-27 |
| `src/app/dashboard/student-registration/page.jsx` | BUG-04, BUG-31 |
| `src/app/dashboard/subscription/verify/page.jsx` | BUG-19 |
| `next.config.js` | BUG-50 |
| `.env.local` *(new)* | BUG-51 |
| `public/icons/` *(new directory)* | BUG-07 |

---

## What's Working Well ✅

To give a fair picture — these things are solid and should not be changed:

- Cookie-based auth with `credentials: 'include'` — correct and secure
- `fetchWithAuth` 401 → refresh → retry — properly implemented
- ProtectedRoute component — guards all dashboard pages correctly
- Framer Motion animations — clean, consistent, performant
- Questions bulk import with CSV parsing — fully functional
- Exam results CSV export — mostly working (see BUG-47 for minor fix)
- Subject filtering and search in Questions — works well
- Support ticket creation — functional
- Subscription payment init → Paystack redirect — working
- Dashboard stats API integration — connected correctly
- Sidebar navigation with active state — correct
- Login page design — matches design system specification

---

*Einstein's CBT Admin — Full Audit Report*
*Mega Tech Solutions © 2026*
*Generated by: Claude Code — 2026-03-17*
