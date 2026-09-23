/** Shared between the server credentials provider and the browser sign-in form. */
export const MIN_PASSWORD_LENGTH = 8

/** Thrown by sign-up when a confirmation email was sent instead of a session. */
export const VERIFY_EMAIL_SENT = 'verify_email_sent'
/** Thrown by sign-in when the account has not confirmed its email yet. */
export const EMAIL_NOT_VERIFIED = 'email_not_verified'

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_email: 'Enter a valid email address.',
  weak_password: `Use a password with at least ${MIN_PASSWORD_LENGTH} characters.`,
  account_exists: 'An account with this email already exists. Sign in instead.',
  no_account: 'No account found for this email. Create one first.',
  password_not_set: 'This account signed up with Google. Continue with Google, or create a password by choosing “Create account” with this email.',
  bad_credentials: 'Incorrect email or password.',
  [EMAIL_NOT_VERIFIED]: 'Confirm your email first. Check your inbox for the link, or resend it below.',
  [VERIFY_EMAIL_SENT]: 'Check your inbox to confirm your email.',
}

export function authErrorMessage(code: string | null | undefined, fallback = 'Sign-in failed. Try again.'): string {
  if (!code) return fallback
  return AUTH_ERROR_MESSAGES[code] || (code === 'CredentialsSignin' ? AUTH_ERROR_MESSAGES.bad_credentials : fallback)
}
