export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nysc-backend.vercel.app';

export const API_ENDPOINTS = {
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  VERIFY: `${API_BASE_URL}/api/auth/verify`,
  VERIFY_2FA: `${API_BASE_URL}/api/auth/verify-2fa`,
  RESEND_CODE: `${API_BASE_URL}/api/auth/resend-code`,
  ME: `${API_BASE_URL}/api/auth/me`,
  STATUS_CHECK: (email) => `${API_BASE_URL}/api/auth/status/${email}`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  SETUP_2FA: `${API_BASE_URL}/api/auth/setup-2fa`,
  VERIFY_2FA_SETUP: `${API_BASE_URL}/api/auth/verify-2fa-setup`,
  SEND_2FA_CODE: `${API_BASE_URL}/api/auth/send-2fa-code`,
  VERIFY_EMAIL_2FA: `${API_BASE_URL}/api/auth/verify-email-2fa`,
  GENERATE_BACKUP_CODES: `${API_BASE_URL}/api/auth/generate-backup-codes`,
  DISABLE_2FA: `${API_BASE_URL}/api/auth/disable-2fa`,
};