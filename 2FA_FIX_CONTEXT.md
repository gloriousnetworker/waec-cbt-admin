# 2FA Fix — Frontend Context for Admin & Super Admin

> Backend version: post-2FA-fix
> Date: 2026-03-18
> Affects: Admin frontend (`waec-cbt-admin.vercel.app`) + Super Admin frontend (`mts-waec-super-admin.vercel.app`)

---

## What Was Wrong (Background)

The old 2FA implementation had a critical bug: the backend was setting `twoFactorEnabled = true` the moment a user called the setup endpoint — **before** they ever confirmed their authenticator app was working. This meant:

- If the QR code didn't scan correctly, or the user closed the browser mid-setup, they were **permanently locked out** — login required 2FA, but 2FA wasn't properly configured.
- Users with a broken setup had no way to log in or self-recover.

---

## What Changed on the Backend

### 1. 2FA setup is now a two-step process

| Step | Endpoint | What happens |
|---|---|---|
| Step 1 | `POST /api/auth/setup-2fa` | Generates secret, returns QR code. **2FA is NOT active yet.** |
| Step 2 | `POST /api/auth/verify-2fa-setup` | User enters code from authenticator. **2FA activates only if the code is correct.** |

Previously Step 1 immediately activated 2FA. Now it does not. **2FA is only active after Step 2 succeeds.**

### 2. Login only challenges 2FA when fully confirmed

Login will only redirect to the 2FA screen if the user's account has **both** `twoFactorEnabled: true` AND `twoFactorVerified: true`. A user who started but never finished setup will log in normally (as if 2FA is not enabled) and can restart the setup process.

### 3. Re-setup is now allowed for incomplete setups

If a user previously started setup but never completed `verify-2fa-setup`, they are no longer blocked. They can call `setup-2fa` again to get a fresh QR code and start over.

### 4. New super admin recovery endpoint

If an admin is already locked out due to the old broken flow, the super admin can reset their 2FA:

```
POST /api/super-admin/admins/:adminId/reset-2fa
```

This clears the admin's 2FA state completely. They can then log in with password alone and redo setup cleanly.

---

## Admin Frontend — Required Changes

### 2FA Setup Page

The setup flow is two distinct steps. Ensure your UI reflects this.

**Step 1 — Request setup**

```js
// Request: authenticated (access token cookie must be present)
POST /api/auth/setup-2fa

// Response (200):
{
  "message": "2FA setup initiated",
  "secret": "F5HEOXRQLBXGCLRBH5VX...",      // base32 string — show as fallback for manual entry
  "qrCode": "data:image/png;base64,...",    // base64 PNG — render as <img src={qrCode} />
  "otpauthUrl": "otpauth://totp/CBT%20Simulator%20(user%40email.com)?secret=..."
}

// Error (400) — already fully enabled:
{ "message": "2FA is already enabled" }
```

- Show the QR code to the user. Render it as `<img src={qrCode} />`.
- **Also display the `secret` value** as a copyable text field below the QR code. Label it something like: *"Can't scan? Enter this key manually in your authenticator app."*
- Tell them to scan it (or enter the secret) with Google Authenticator, Authy, or any TOTP app.
- Do NOT consider 2FA active at this point. Show a message like: *"Scan this QR code or enter the key manually, then enter the 6-digit code below to confirm."*

**Step 2 — Confirm the code**

```js
// Request: authenticated
POST /api/auth/verify-2fa-setup
Content-Type: application/json

{
  "token": "123456"   // IMPORTANT: must be a STRING, not a number
}

// Response (200) — 2FA is now active:
{ "message": "2FA enabled successfully" }

// Error (401) — wrong code:
{ "message": "Invalid 2FA token" }
```

- Only show "2FA enabled successfully" to the user **after this step succeeds**.
- If the code is wrong, let them try again (the secret has not changed).
- The `token` field must always be sent as a **6-character string**. If your input is `type="number"`, leading zeros will be stripped (e.g., `012345` becomes `12345`) and verification will fail. Use `type="text"` with `inputMode="numeric"` and `maxLength={6}`.

**Disable 2FA**

```js
// Request: authenticated
POST /api/auth/disable-2fa

// Response (200):
{ "message": "2FA disabled successfully" }
```

---

### Login Flow (2FA Challenge Screen)

When login returns `requiresTwoFactor: true`, show the 2FA code entry screen.

```js
// Step 1 — Normal login
POST /api/auth/login
{ "email": "...", "password": "..." }

// Response when 2FA is required:
{
  "message": "2FA required",
  "requiresTwoFactor": true,
  "tempToken": "<short-lived JWT string>",
  "userId": "<user id string>"
}
```

Store `tempToken` and `userId` in component state (NOT localStorage). The temp token expires in **5 minutes**. If the user takes longer, they must log in again.

```js
// Step 2 — Submit 2FA code
POST /api/auth/verify-2fa
Content-Type: application/json

{
  "userId": "<from login response>",
  "token": "123456",         // 6-character STRING
  "tempToken": "<from login response>"
}

// Success (200) — auth cookies are set, user is logged in:
{
  "message": "2FA verification successful",
  "user": { ...userObject }
}

// Error (401):
{ "message": "Invalid 2FA token" }
// or
{ "message": "Invalid or expired temporary token" }
```

On success, proceed exactly as you would after a normal login — the auth cookies are set by the server.

**Important note on the token field:** Always send the code as a string. Use `String(code).padStart(6, '0')` before sending if you are reading from a number input.

---

## Super Admin Frontend — Required Changes

### 1. Resetting a Locked-Out Admin's 2FA

Add a "Reset 2FA" action to the admin detail/management page.

```js
// Request: authenticated as super_admin
POST /api/super-admin/admins/:adminId/reset-2fa

// No request body needed.

// Response (200):
{ "message": "2FA has been reset for this admin. They can set it up again on next login." }

// Error (404):
{ "message": "Admin not found" }

// Error (400):
{ "message": "Target user is not an admin" }
```

After a successful reset, the admin can log in with their password alone and start the 2FA setup process from scratch.

Suggested UI placement: inside the admin's detail modal or settings panel, alongside "Toggle Status" and other admin actions. Only show this button if the admin has 2FA enabled (`twoFactorEnabled: true` in the admin data object).

---

### 2. Super Admin's Own 2FA Setup

The super admin uses the exact same setup endpoints as admin (`/api/auth/setup-2fa` and `/api/auth/verify-2fa-setup`). The same two-step flow and string-token rules apply.

---

## TOTP Input — Important Rule for Both Frontends

**Always use a text input for the 6-digit code, never a number input.**

```jsx
// Correct
<input
  type="text"
  inputMode="numeric"
  maxLength={6}
  pattern="[0-9]{6}"
  value={code}
  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
/>

// Wrong — will strip leading zeros
<input type="number" value={code} onChange={...} />
```

Send the value as-is (string). Do not parse it to an integer before sending.

---

## Summary of All 2FA Endpoints

| Method | Endpoint | Auth Required | Who Uses It |
|---|---|---|---|
| `POST` | `/api/auth/setup-2fa` | Yes (access cookie) | Admin, Super Admin |
| `POST` | `/api/auth/verify-2fa-setup` | Yes (access cookie) | Admin, Super Admin |
| `POST` | `/api/auth/disable-2fa` | Yes (access cookie) | Admin, Super Admin |
| `POST` | `/api/auth/verify-2fa` | No (uses tempToken) | Admin, Super Admin (login flow) |
| `POST` | `/api/super-admin/admins/:adminId/reset-2fa` | Yes (super_admin only) | Super Admin |

---

## Currently Locked-Out Admins — Recovery Steps

If any admin was locked out by the old broken flow:

1. Super admin logs into the super admin dashboard.
2. Goes to the admin management page and finds the affected admin.
3. Clicks "Reset 2FA" (calls `POST /api/super-admin/admins/:adminId/reset-2fa`).
4. Admin can now log in with password alone.
5. Admin goes to settings and sets up 2FA again properly using the two-step flow above.
