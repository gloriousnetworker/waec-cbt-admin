# CBT Simulator Backend — Full API Context

> Version: 1.0.0
> Base URL (Production): `https://your-api.vercel.app`
> Base URL (Local Dev): `http://localhost:5000`
> Last Updated: 2026-03-17

---

## OVERVIEW

This is a multi-tenant Computer-Based Testing (CBT) simulation platform modelled after WAEC exam format. The system has **three distinct user roles**, each with its own frontend app and authentication flow:

| Role | Frontend App | Auth Method |
|------|-------------|-------------|
| Super Admin | `https://einsteinssuperadmin.vercel.app` | Email + Password + 2FA (optional) |
| Admin (School) | `https://einsteinsadmin.vercel.app` | Email + Password + 2FA (optional) |
| Student | `https://einsteinscbt.vercel.app` | Login ID or NIN + Password |

---

## AUTHENTICATION

### How Auth Works
- On successful login, the server sets **two httpOnly cookies**:
  - `accessToken` — JWT, expires in **15 minutes**
  - `refreshToken` — JWT, expires in **7 days**
- Every subsequent API request must send these cookies automatically.
- **All frontend HTTP clients must be configured with `credentials: 'include'`** (fetch) or `withCredentials: true` (axios). Without this, cookies are not sent and all protected routes return `401`.

### Token Refresh
When the access token expires (15 min), call `POST /api/auth/refresh` or `POST /api/student/refresh-token`. The server issues a new access token cookie. Handle `401` responses on the frontend by attempting a refresh, then retrying.

### Logout
Call the logout endpoint. The server clears both cookies server-side. The frontend should redirect to login.

---

## CORS — Allowed Origins

The following origins are whitelisted. Any other origin will receive a CORS error:
```
http://localhost:3000
http://localhost:3001
https://einsteinscbt.vercel.app
https://einsteinsadmin.vercel.app
https://einsteinssuperadmin.vercel.app
```
To add a new frontend domain, it must be added to `server.js` `allowedOrigins` array.

---

## RATE LIMITING

The following endpoints are rate-limited to **20 requests per 15 minutes** per IP:
- `POST /api/auth/login`
- `POST /api/auth/verify-2fa`
- `POST /api/auth/create-super-admin`
- `POST /api/student/login`

After exceeding the limit, the response is:
```json
{ "message": "Too many attempts, please try again in 15 minutes" }
```

---

## PAYSTACK WEBHOOK

The webhook endpoint is:
```
POST /api/webhooks/paystack
```
This must be set in your Paystack dashboard. It is **not** the same as any admin route. Authentication is via HMAC-SHA512 signature in the `x-paystack-signature` header.

---

---

# PART 1 — SUPER ADMIN API

**Base path:** `/api/super-admin`
**Auth:** All routes require a logged-in `super_admin` user (cookie-based).

The super admin is the platform owner (MegaTech Solutions). There is exactly one super admin account. They manage all schools and all admin accounts from a central dashboard.

---

## Auth Routes (Super Admin uses general auth)

### POST /api/auth/login
Login for both super admin and admin roles.

**Request:**
```json
{ "email": "string", "password": "string" }
```

**Response (no 2FA):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "super_admin | admin",
    "schoolId": "string | null",
    "status": "active",
    "twoFactorEnabled": false,
    "subscription": { ... } | null
  },
  "hasSubscription": true,
  "subscription": { ... } | null
}
```
Cookies `accessToken` and `refreshToken` are set automatically.

**Response (2FA required):**
```json
{
  "message": "2FA required",
  "requiresTwoFactor": true,
  "tempToken": "string",
  "userId": "string"
}
```
Frontend must prompt for the 6-digit TOTP code, then call `POST /api/auth/verify-2fa`.

---

### POST /api/auth/verify-2fa
Complete login when 2FA is enabled.

**Request:**
```json
{
  "userId": "string",
  "token": "6-digit TOTP code",
  "tempToken": "string (from login response)"
}
```

**Response:**
```json
{
  "message": "2FA verification successful",
  "user": { ... }
}
```
Cookies set automatically.

---

### POST /api/auth/logout
**Request:** (none)
**Response:** `{ "message": "Logout successful" }`
Clears both cookies.

---

### POST /api/auth/refresh
Refresh the access token using the refresh token cookie.
**Request:** (none — refresh token sent via cookie)
**Response:** `{ "message": "Token refreshed successfully" }`
New `accessToken` cookie is set.

---

### GET /api/auth/me
Get the current logged-in user's profile.
**Response:** `{ "user": { id, email, name, role, schoolId, status, subscription, ... } }`

---

### POST /api/auth/setup-2fa
Initiate 2FA setup for the logged-in admin/super admin.
**Response:**
```json
{
  "message": "2FA setup initiated",
  "qrCode": "data:image/png;base64,..."
}
```
Frontend should display the QR code image for the user to scan with Google Authenticator or Authy. After scanning, call `POST /api/auth/verify-2fa-setup` with the 6-digit code to confirm setup.

---

### POST /api/auth/verify-2fa-setup
Confirm 2FA setup by verifying the first code from the authenticator app.
**Request:** `{ "token": "123456" }`
**Response:** `{ "message": "2FA enabled successfully" }`

---

### POST /api/auth/disable-2fa
Disable 2FA for the currently logged-in user.
**Response:** `{ "message": "2FA disabled successfully" }`

---

## Super Admin — Dashboard

### GET /api/super-admin/dashboard/stats
Returns platform-wide statistics.

**Response:**
```json
{
  "stats": {
    "totalSchools": 10,
    "activeSchools": 8,
    "pendingSchools": 2,
    "totalAdmins": 15,
    "activeAdmins": 12,
    "totalStudents": 430,
    "totalExams": 1200,
    "openTickets": 3,
    "totalRevenue": 500000,
    "activeSubscriptions": 8,
    "expiredSubscriptions": 2
  }
}
```

---

## Super Admin — School Management

### GET /api/super-admin/schools
List all schools with student and admin counts.

**Response:**
```json
{
  "schools": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "address": "string",
      "status": "active | suspended | pending",
      "studentCount": 45,
      "adminCount": 1,
      "createdAt": "timestamp"
    }
  ]
}
```

### POST /api/super-admin/schools
Create a new school.

**Request:**
```json
{ "name": "string", "address": "string", "phone": "string", "email": "string" }
```

### GET /api/super-admin/schools/:schoolId
Get a school with its admins and students.

**Response:**
```json
{
  "school": { ...schoolFields, "studentCount": 45, "adminCount": 1 },
  "admins": [ { id, name, email, status, subscription, ... } ],
  "students": [ { id, firstName, lastName, class, status, ... } ]
}
```

### PUT /api/super-admin/schools/:schoolId
Update school fields: `name`, `address`, `phone`, `email`, `status`.

### DELETE /api/super-admin/schools/:schoolId
Delete a school. **Fails** if the school has existing admins or students.

### PATCH /api/super-admin/schools/:schoolId/status
Toggle school status.
**Request:** `{ "status": "active | suspended" }`
Suspending a school automatically suspends all its admin accounts.

---

## Super Admin — Admin Management

### GET /api/super-admin/admins
List all admin accounts with subscription status.

**Response:**
```json
{
  "admins": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "admin",
      "schoolId": "string",
      "status": "active | suspended | expired",
      "subscription": { "plan": "basic | standard | premium", "active": true, "expiryDate": "..." },
      "subscriptionStatus": { "active": true, "plan": "basic", "daysRemaining": 25 }
    }
  ]
}
```

### POST /api/super-admin/admins
Create a new admin account with immediate subscription.

**Request:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "schoolId": "string",
  "subscription": { "plan": "basic | standard | premium" }
}
```

### GET /api/super-admin/admins/:adminId
Get a single admin with subscription status.

### PUT /api/super-admin/admins/:adminId
Update admin: `name`, `email`, `status`, `subscription`.

### DELETE /api/super-admin/admins/:adminId
Delete an admin account.

### PATCH /api/super-admin/admins/:adminId/status
**Request:** `{ "status": "active | suspended | expired" }`

### POST /api/super-admin/admins/:adminId/subscription/activate
Manually activate/change subscription for an admin.
**Request:** `{ "plan": "basic | standard | premium" }`

### POST /api/super-admin/admins/:adminId/subscription/deactivate
Deactivate an admin's subscription.

### GET /api/super-admin/admins/:adminId/subscription/status
Get detailed subscription status for an admin.

### GET /api/super-admin/subscription/stats
Get subscription statistics across all admins.

---

## Super Admin — Subject Management

Subjects are global — created by super admin and used by all schools.

### GET /api/super-admin/subjects
List all subjects.

**Response:**
```json
{
  "subjects": [
    {
      "id": "string",
      "name": "Mathematics",
      "code": "MATH",
      "description": "string",
      "examType": "WAEC",
      "duration": 120,
      "questionCount": 50,
      "isGlobal": true,
      "status": "active"
    }
  ]
}
```

### POST /api/super-admin/subjects
**Request:** `{ "name", "code", "description", "examType", "duration", "questionCount" }`

### PUT /api/super-admin/subjects/:subjectId
Updateable fields: `name`, `code`, `description`, `examType`, `duration`, `questionCount`, `status`.

### DELETE /api/super-admin/subjects/:subjectId

---

## Super Admin — Student View

### GET /api/super-admin/students
List all students across all schools (without passwords).

---

## Super Admin — Ticket Management

Tickets are support requests submitted by school admins.

### GET /api/super-admin/tickets
Query param: `?status=open|in_progress|resolved|closed`

**Response:**
```json
{
  "tickets": [
    {
      "id": "string",
      "subject": "string",
      "category": "string",
      "priority": "low | medium | high",
      "description": "string",
      "status": "open | in_progress | resolved | closed",
      "schoolId": "string",
      "createdBy": "string",
      "messages": [
        { "sender": "admin | super_admin", "content": "string", "timestamp": "..." }
      ],
      "createdAt": "timestamp"
    }
  ]
}
```

### GET /api/super-admin/tickets/:ticketId
### POST /api/super-admin/tickets/:ticketId/respond
**Request:** `{ "message": "string" }`

### PATCH /api/super-admin/tickets/:ticketId/status
**Request:** `{ "status": "open | in_progress | resolved | closed" }`
Invalid status values return `400`.

---

## Super Admin — Reports

### POST /api/super-admin/reports/generate
Generate a platform report.

**Request:**
```json
{
  "type": "school | admin | student | performance | revenue",
  "format": "json | csv",
  "startDate": "optional",
  "endDate": "optional"
}
```
Returns JSON report or CSV file download based on `format`.

---

---

# PART 2 — ADMIN (SCHOOL) API

**Base path:** `/api/admin`
**Auth:** All routes require a logged-in `admin` user (cookie-based).

Each admin belongs to exactly one school. They manage their school's students, questions, and exams. Subscription is required for most operations.

---

## Subscription Plans

| Plan | Max Students | Price |
|------|-------------|-------|
| `basic` | 100 | ₦15,000 |
| `standard` | 300 | ₦35,000 |
| `premium` | Unlimited | ₦60,000 |

An admin's subscription is paid via Paystack. Without an active subscription, student/question/exam management endpoints return `403`.

---

## Admin — Profile

### GET /api/admin/profile
**Response:**
```json
{
  "admin": { id, name, email, role, schoolId, status, twoFactorEnabled, ... },
  "subscription": { plan, active, expiryDate, amount, ... } | null,
  "subscriptionStatus": { active, plan, daysRemaining, studentLimit, currentStudents, ... }
}
```

### PUT /api/admin/profile
Update: `name`, `email`.

### POST /api/admin/change-password
**Request:** `{ "currentPassword": "string", "newPassword": "string" }`

---

## Admin — Subscription & Payments

### GET /api/admin/subscription/plans
Returns available plans and current subscription.

**Response:**
```json
{
  "plans": {
    "basic": { "price": 15000, "studentLimit": 100, "duration": 30, "name": "Basic Plan" },
    "standard": { "price": 35000, "studentLimit": 300, "duration": 30, "name": "Standard Plan" },
    "premium": { "price": 60000, "studentLimit": -1, "duration": 30, "name": "Premium Plan" }
  },
  "currentSubscription": { ... } | null
}
```

### POST /api/admin/subscription/initialize
Initialize a Paystack payment.

**Request:** `{ "plan": "basic | standard | premium", "paymentMethod": "card" }`

**Response:**
```json
{
  "message": "Payment initialized successfully",
  "payment": {
    "authorizationUrl": "https://checkout.paystack.com/...",
    "reference": "string",
    "accessCode": "string"
  }
}
```
Frontend should redirect to `authorizationUrl` to complete payment on Paystack's hosted page.

### GET /api/admin/subscription/verify/:reference
Verify a payment after Paystack redirect. Call this when Paystack redirects back to your callback URL.

**Response:**
```json
{
  "message": "Payment verified and subscription activated",
  "subscription": { plan, active, startDate, expiryDate, amount, ... }
}
```

### GET /api/admin/subscription/status
Get current subscription status.

### GET /api/admin/subscription/payments
Get payment history.

### GET /api/admin/payment/methods
Get available payment methods and bank list.

---

## Admin — Subjects

### GET /api/admin/subjects
List all global subjects available to use for questions and exams.

### GET /api/admin/subjects/:subjectId

---

## Admin — Student Management

### GET /api/admin/students
List all students in this school.

**Response:**
```json
{
  "students": [
    {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "middleName": "string | null",
      "loginId": "firstname.lastname",
      "email": "firstname.lastname@schooldomain.com",
      "nin": "string | null",
      "phone": "string | null",
      "class": "SS1 | SS2 | SS3",
      "subjects": ["Mathematics", "English"],
      "status": "active | suspended",
      "examMode": false,
      "schoolId": "string",
      "createdAt": "timestamp"
    }
  ]
}
```

### POST /api/admin/students
Create a new student. Requires active subscription and must not exceed student limit.

**Request:**
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "middleName": "string (optional)",
  "class": "SS1 | SS2 | SS3 (required)",
  "nin": "11-digit string (optional)",
  "phone": "string (optional)",
  "dateOfBirth": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Student created successfully",
  "student": { ...studentFields },
  "credentials": {
    "loginId": "john.doe",
    "email": "john.doe@schooldomain.com",
    "password": "123456",
    "nin": "string | null"
  },
  "subscription": {
    "limit": 100,
    "current": 45,
    "remaining": 55
  }
}
```
> **Note:** The `credentials.password` field returns `"123456"` — the default password for all new students. Display this to the admin so they can share it with the student. The student should change it on first login.

### GET /api/admin/students/:studentId
Get student with exam history and performance data.

**Response:**
```json
{
  "student": { ...studentFields },
  "exams": [ { id, title, score, percentage, status, createdAt, ... } ],
  "performance": { ... }
}
```

### PUT /api/admin/students/:studentId
Update a student. Only these fields are accepted: `firstName`, `lastName`, `middleName`, `nin`, `phone`, `dateOfBirth`, `class`, `gender`, `address`.

### DELETE /api/admin/students/:studentId

### PATCH /api/admin/students/:studentId/exam-mode
Enable or disable exam mode for a student.
**Request:** `{ "examMode": true | false }`

### POST /api/admin/students/:studentId/subjects
Add a subject to a student's subject list.
**Request:** `{ "subjectId": "string" }`

### DELETE /api/admin/students/:studentId/subjects
Remove a subject from a student's subject list.
**Request:** `{ "subject": "Mathematics" }`
Note: `Mathematics` and `English` are required subjects and cannot be removed.

---

## Admin — Question Management

Questions belong to a school. They are used in both practice mode and exam mode.

### GET /api/admin/questions
Query params: `?subjectId=&class=&examType=&difficulty=&mode=`

**Response:**
```json
{
  "questions": [
    {
      "id": "string",
      "question": "string",
      "options": { "A": "string", "B": "string", "C": "string", "D": "string" },
      "correctAnswer": "A | B | C | D",
      "explanation": "string (optional)",
      "subject": "string",
      "subjectId": "string",
      "class": "SS1 | SS2 | SS3 | General",
      "examType": "WAEC | NECO | JAMB",
      "difficulty": "easy | medium | hard",
      "mode": "practice | exam | both",
      "marks": 1,
      "schoolId": "string"
    }
  ]
}
```

### POST /api/admin/questions
Create a single question.

**Request:**
```json
{
  "question": "string (required)",
  "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "correctAnswer": "A | B | C | D",
  "explanation": "string (optional)",
  "subjectId": "string (required)",
  "class": "SS1 | SS2 | SS3 | General",
  "examType": "WAEC",
  "difficulty": "easy | medium | hard",
  "mode": "practice | exam | both",
  "marks": 1
}
```

### POST /api/admin/questions/bulk-import
Import multiple questions at once.
**Request:** `{ "questions": [ ...array of question objects ] }`

### GET /api/admin/questions/:questionId
### PUT /api/admin/questions/:questionId
### DELETE /api/admin/questions/:questionId

---

## Admin — Exam Setup Management

An exam setup is a configured exam template that can be activated for students to take.

### GET /api/admin/exam-setups
Query params: `?status=draft|active|completed&class=SS1`

**Response:**
```json
{
  "exams": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "class": "SS1 | SS2 | SS3",
      "subjects": [
        {
          "subjectId": "string",
          "subjectName": "Mathematics",
          "questionCount": 40,
          "totalMarks": 40,
          "questions": ["questionId1", "questionId2", ...]
        }
      ],
      "duration": 120,
      "totalMarks": 100,
      "passMark": 50,
      "startDateTime": "ISO string",
      "endDateTime": "ISO string",
      "status": "draft | active | completed",
      "assignedStudents": ["studentId1", ...],
      "shuffleQuestions": true,
      "showResults": true,
      "allowRetake": false,
      "createdAt": "timestamp"
    }
  ]
}
```

### POST /api/admin/exam-setups
Create a new exam setup. Requires active subscription.

**Request:**
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "class": "SS1 | SS2 | SS3 (required)",
  "subjects": [
    {
      "subjectId": "string (required)",
      "questionCount": 40
    }
  ],
  "duration": 120,
  "passMark": 50,
  "startDate": "YYYY-MM-DD (required)",
  "startTime": "HH:MM (optional, default 00:00)",
  "endDate": "YYYY-MM-DD (required)",
  "endTime": "HH:MM (optional, default 23:59)",
  "instructions": "string (optional)",
  "shuffleQuestions": true,
  "showResults": true,
  "allowRetake": false
}
```

The backend automatically selects the specified number of questions per subject from the school's question bank.

### GET /api/admin/exam-setups/:examId
### PUT /api/admin/exam-setups/:examId
Only `draft` exams can be updated.

### DELETE /api/admin/exam-setups/:examId
Cannot delete `active` exams.

### POST /api/admin/exam-setups/:examId/activate
Activate an exam to make it available to students.

**Request:** `{ "studentIds": ["id1", "id2"] }` (optional — if omitted, all students in the exam's class are assigned)

**Response:**
```json
{ "message": "Exam activated successfully for 45 students", "exam": { ... } }
```

### POST /api/admin/exam-setups/:examId/deactivate
Ends the exam (moves to `completed` status).

### GET /api/admin/exam-setups/:examId/results
Get all student results for this exam.

**Response:**
```json
{
  "exam": { "id", "title", "totalMarks", "passMark" },
  "summary": {
    "totalStudents": 45,
    "submittedCount": 40,
    "averageScore": 62.5,
    "passRate": 75.0,
    "distinctionRate": 20.0
  },
  "results": [
    {
      "studentId": "string",
      "studentName": "John Doe",
      "studentClass": "SS2",
      "score": 75,
      "totalMarks": 100,
      "percentage": 75.0,
      "submitted": true,
      "submittedAt": "timestamp"
    }
  ]
}
```

### POST /api/admin/exam-setups/:examId/assign-students
Assign specific students to an exam.
**Request:** `{ "studentIds": ["id1", "id2"] }`

---

## Admin — Tickets

### GET /api/admin/tickets
List tickets submitted by this school.

### POST /api/admin/tickets
Create a support ticket.

**Request:**
```json
{
  "subject": "string",
  "category": "string",
  "priority": "low | medium | high",
  "description": "string"
}
```

### POST /api/admin/tickets/:ticketId/reply
**Request:** `{ "message": "string" }`

---

## Admin — Dashboard

### GET /api/admin/dashboard/stats
**Response:**
```json
{
  "subscription": { active, plan, daysRemaining, studentLimit, currentStudents },
  "stats": {
    "totalStudents": 45,
    "studentsInExamMode": 5,
    "totalExams": 120,
    "averageScore": 62.5,
    "openTickets": 2
  },
  "recentExams": [ { id, title, score, percentage, studentId, createdAt, ... } ],
  "subjectPerformance": {
    "Mathematics": { "total": 3200, "count": 50, "average": 64.0 },
    "English": { "total": 3500, "count": 50, "average": 70.0 }
  }
}
```

---

---

# PART 3 — STUDENT API

**Base path:** `/api/student`
**Auth:** All protected routes require a logged-in student (cookie-based).

Students use a separate login endpoint from admins. They can take exams and practice questions assigned to them by their school admin.

---

## Student — Login

### POST /api/student/login
Students can log in with either their `loginId` or `nin`, combined with their password.

**Request (option A — loginId):**
```json
{ "loginId": "john.doe", "password": "123456" }
```

**Request (option B — NIN):**
```json
{ "nin": "12345678901", "password": "123456" }
```

**Response:**
```json
{
  "message": "Login successful",
  "student": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "loginId": "string",
    "email": "string",
    "class": "SS1 | SS2 | SS3",
    "subjects": ["Mathematics", "English"],
    "schoolId": "string",
    "examMode": false,
    "currentExam": null
  }
}
```
Cookies `accessToken` and `refreshToken` are set automatically.

---

## Student — Profile

### GET /api/student/profile
Returns student profile.

### PUT /api/student/profile
Update: `firstName`, `lastName`, `phone`, `dateOfBirth`.

### POST /api/student/change-password
**Request:** `{ "currentPassword": "string", "newPassword": "string" }`

### GET /api/student/subjects
Returns the list of subjects assigned to the student.

---

## Student — Available Exams

### GET /api/student/available-exams
Returns exams that:
- Are `active`
- Belong to the student's school
- Match the student's class
- Are within the start/end datetime window
- The student hasn't already completed (unless `allowRetake` is true)
- The student is assigned to (or exam is open to all)

**Response:**
```json
{
  "exams": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "class": "SS2",
      "subjects": [ { "subjectName": "Math", "questionCount": 40 } ],
      "duration": 120,
      "totalMarks": 100,
      "passMark": 50,
      "startDateTime": "ISO string",
      "endDateTime": "ISO string",
      "shuffleQuestions": true,
      "showResults": true,
      "allowRetake": false
    }
  ]
}
```

---

## Student — Exam Flow

### POST /api/student/exams/start
Start an exam. If the student has an in-progress exam for the same setup, it resumes automatically.

**Request:**
```json
{ "examSetupId": "string" }
```

**Response (new exam):**
```json
{
  "message": "Exam started",
  "exam": {
    "id": "string",
    "examSetupId": "string",
    "title": "string",
    "subjects": [ ... ],
    "duration": 120,
    "questionCount": 80,
    "questions": [
      {
        "id": "string",
        "question": "string",
        "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
        "marks": 1,
        "difficulty": "medium",
        "topic": "Algebra",
        "subjectId": "string",
        "subjectName": "Mathematics"
      }
    ],
    "startTime": "ISO string",
    "endTime": "ISO string",
    "status": "in_progress",
    "instructions": "string"
  }
}
```
> **Note:** `correctAnswer` is **never** included in questions sent to students.

**Response (resuming):**
Same shape plus `"answers": { "questionId": "A", ... }` and `"timeSpent": 1234` (seconds).

---

### POST /api/student/exams/:examId/save-answer
Save a single answer during the exam (auto-save on answer selection).

**Request:**
```json
{ "questionId": "string", "answer": "A | B | C | D" }
```

**Response:** `{ "message": "Answer saved" }`

---

### POST /api/student/exams/:examId/tab-switch
Record a tab-switch/focus-loss event (anti-cheat).

**Response:** `{ "message": "Tab switch recorded", "tabSwitches": 3 }`

---

### POST /api/student/exams/:examId/submit
Submit the exam for scoring.

**Response:**
```json
{
  "message": "Exam submitted successfully",
  "exam": {
    "id": "string",
    "examSetupId": "string",
    "score": 75,
    "totalMarks": 100,
    "percentage": 75.0,
    "endTime": "ISO string"
  }
}
```

---

### GET /api/student/exams/:examId
Get details of a specific exam (including results if completed).

---

## Student — Results & Performance

### GET /api/student/results
Get all completed exam results for this student.

**Query params (optional):** `?limit=20&page=1`

**Response (unpaginated — no params sent):**
```json
{
  "results": [
    {
      "id": "string",
      "examSetupId": "string",
      "title": "string",
      "subjects": [ ... ],
      "score": 75,
      "totalMarks": 100,
      "percentage": 75.0,
      "correctAnswers": 15,
      "wrongAnswers": 3,
      "unanswered": 2,
      "totalQuestions": 20,
      "date": "timestamp",
      "duration": 3600,
      "status": "completed"
    }
  ]
}
```

**Response (paginated — `?limit=20&page=1`):**
```json
{
  "results": [ ... ],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

> **Note:** Response key is `results`, not `exams`. Frontend should read `data.results`.

### GET /api/student/performance
Get aggregated performance summary per subject.

---

## Student — Practice Mode

Practice is self-directed — students can practice questions outside of a formal exam.

### GET /api/student/practice
Get practice questions for a subject.
Query params: `?subjectId=string&count=20&mode=practice`

**Response:**
```json
{
  "questions": [
    {
      "id": "string",
      "question": "string",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correctAnswer": "A",
      "explanation": "string | null",
      "subject": "string",
      "difficulty": "medium"
    }
  ]
}
```
> **Note:** Unlike exam mode, `correctAnswer` IS included in practice questions.

### POST /api/student/practice/save
Save a completed practice session.

**Request:**
```json
{
  "subjectId": "string",
  "subjectName": "string",
  "questions": [ { "id", "question", "correctAnswer", "userAnswer", "isCorrect" } ],
  "score": 15,
  "totalQuestions": 20,
  "timeTaken": 300
}
```

### GET /api/student/practice/history
Get past practice sessions.

**Query params (optional):** `?subjectId=string&limit=20&page=1`
- `subjectId` — filter by subject (optional)
- Without `page`: returns up to `limit` records (default 50) directly from DB
- With `?limit=N&page=N`: returns paginated shape

**Response (unpaginated):**
```json
{
  "practices": [
    {
      "id": "string",
      "subjectId": "string",
      "subjectName": "string",
      "totalQuestions": 20,
      "correct": 15,
      "wrong": 3,
      "unanswered": 2,
      "percentage": 75.0,
      "duration": 300,
      "difficulty": "all",
      "isTimedTest": false,
      "date": "timestamp",
      "studentClass": "string"
    }
  ]
}
```

**Response (paginated — `?limit=20&page=1`):**
```json
{
  "practices": [ ... ],
  "total": 80,
  "page": 1,
  "limit": 20
}
```

### GET /api/student/practice/stats
Get practice statistics per subject.

### DELETE /api/student/practice/:practiceId
Delete a practice session record.

---

## Student — Exam History

### GET /api/student/history
Get the student's completed exam history (same data set as `/results`, different shape).

**Query params (optional):** `?limit=20&page=1`

**Response (unpaginated):**
```json
{
  "exams": [
    {
      "id": "string",
      "examSetupId": "string",
      "subject": "string",
      "subjects": [ ... ],
      "score": 75,
      "totalMarks": 100,
      "percentage": 75.0,
      "date": "timestamp",
      "duration": 3600,
      "questionCount": 20,
      "status": "completed"
    }
  ]
}
```

**Response (paginated — `?limit=20&page=1`):**
```json
{
  "exams": [ ... ],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

---

---

# COMMON ERROR RESPONSES

| Status | Meaning |
|--------|---------|
| `400` | Bad request — missing or invalid fields |
| `401` | Unauthorized — not logged in or token expired |
| `403` | Forbidden — logged in but insufficient permissions or no subscription |
| `404` | Resource not found |
| `429` | Too many requests — rate limit exceeded |
| `500` | Internal server error |
| `503` | Service unavailable — database not connected |

All error responses have this shape:
```json
{ "message": "Human-readable error description" }
```

---

# DATA MODELS (Summary)

## User (Admin / Super Admin)
```
id, email, password (hashed), name, role (admin|super_admin),
schoolId, status (active|suspended|expired|pending),
emailVerified, twoFactorEnabled, twoFactorSecret (never returned in API),
subscription { plan, active, startDate, expiryDate, amount, activatedBy },
verificationToken, createdAt, updatedAt
```

## Student
```
id, firstName, lastName, middleName, loginId, email, password (hashed),
nin, phone, dateOfBirth, class (SS1|SS2|SS3), gender, address,
schoolId, createdBy, subjects (array of subject names),
status (active|suspended), examMode (bool), currentExam (examId|null),
createdAt, updatedAt
```

## School
```
id, name, email, phone, address, status (active|suspended|pending), createdAt
```

## Subject
```
id, name, code, description, examType (WAEC|NECO|JAMB),
duration (minutes), questionCount, isGlobal (true),
createdBy (super_admin id), status (active|inactive), createdAt
```

## Question
```
id, question, options { A, B, C, D }, correctAnswer (A|B|C|D),
explanation, subject (name), subjectId, subjectName,
class (SS1|SS2|SS3|General), examType, difficulty (easy|medium|hard),
mode (practice|exam|both), marks (int), schoolId, createdBy,
createdAt, updatedAt
```

## ExamSetup
```
id, title, description, schoolId, createdBy, class,
subjects [ { subjectId, subjectName, questionCount, totalMarks, questions [ids] } ],
duration (minutes), totalMarks, passMark (percentage),
startDateTime, endDateTime, status (draft|active|completed),
assignedStudents [ids], results { studentId: { score, percentage, submittedAt } },
shuffleQuestions, showResults, allowRetake, instructions, createdAt
```

## Exam (Student's active/completed exam instance)
```
id, studentId, schoolId, examSetupId, title, subjects,
duration, questionCount, questions (full objects with correctAnswer — stored server-side only),
answers { questionId: "A" }, score, totalMarks, percentage,
status (in_progress|completed), startTime, endTime, tabSwitches, timeSpent, createdAt
```

## Ticket
```
id, subject, category, priority (low|medium|high),
description, status (open|in_progress|resolved|closed),
schoolId, createdBy, createdByType (admin),
messages [ { sender, senderId, content, timestamp } ], createdAt
```

## Payment
```
id, adminId, schoolId, reference, amount, plan, status, method,
paystackData, createdAt
```

---

# SUBSCRIPTION FLOW (Admin)

```
1. Admin logs in → checks subscription status from GET /api/admin/profile
2. No/expired subscription → redirect to subscription page
3. Admin selects plan → POST /api/admin/subscription/initialize
4. Frontend receives authorizationUrl → redirect to Paystack checkout
5. Student pays on Paystack → Paystack calls POST /api/webhooks/paystack (automatic)
6. Paystack also redirects to your callback_url → GET /api/admin/subscription/verify/:reference
7. Subscription is now active → admin can create students, questions, exams
```

---

# EXAM FLOW (Student)

```
1. Student logs in → POST /api/student/login
2. Student sees available exams → GET /api/student/available-exams
3. Student starts exam → POST /api/student/exams/start (body: { examSetupId })
4. Frontend displays questions (no correctAnswer in response)
5. Student selects answer → POST /api/student/exams/:examId/save-answer (auto-save)
6. Tab switch detected → POST /api/student/exams/:examId/tab-switch
7. Student submits OR timer runs out → POST /api/student/exams/:examId/submit
8. Score returned → frontend displays result
9. Result also viewable later → GET /api/student/results
```

---

# ENVIRONMENT VARIABLES REQUIRED

```env
# Server
NODE_ENV=production
PORT=5000

# Auth
JWT_SECRET=<256-bit random string>
JWT_REFRESH_SECRET=<different 256-bit random string>

# Firebase (production)
FIREBASE_PROJECT_ID=<from Firebase console>
FIREBASE_PRIVATE_KEY=<service account private key>
FIREBASE_CLIENT_EMAIL=<service account email>

# Email
GMAIL_USER=<gmail address>
GMAIL_APP_PASSWORD=<Google App Password>
EMAIL_SERVICE=gmail
FRONTEND_URL=https://einsteinsadmin.vercel.app

# Paystack
PAYSTACK_SECRET_KEY=<sk_live_...>
PAYSTACK_PUBLIC_KEY=<pk_live_...>
```
