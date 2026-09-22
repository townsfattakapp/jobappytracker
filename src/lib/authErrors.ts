/** Shared between the server credentials provider and the browser sign-in form. */
export const MIN_PASSWORD_LENGTH = 8

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_email: 'Enter a valid email address.',
  weak_password: `Use a password with at least ${MIN_PASSWORD_LENGTH} characters.`,
  account_exists: 'An account with this email already exists. Sign in instead.',
  no_account: 'No account found for this email. Create one first.',
  password_not_set: 'This account has no password yet. Choose “Create account” with this email to set one.',
  bad_credentials: 'Incorrect email or password.',
}

export function authErrorMessage(code: string | null | undefined, fallback = 'Sign-in failed. Try again.'): string {
  if (!code) return fallback
  return AUTH_ERROR_MESSAGES[code] || (code === 'CredentialsSignin' ? AUTH_ERROR_MESSAGES.bad_credentials : fallback)
}
