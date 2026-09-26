/**
 * Deployment stage. Development fixtures (ingestion fixture provider, billing
 * fixture provider, AI fixture adapter) are allowed outside production builds
 * and, explicitly, on a staging deployment that sets APP_STAGE=staging. They
 * are never available on production (APP_STAGE unset or "production").
 */
export function isStaging(): boolean {
  return (process.env.APP_STAGE || '').trim().toLowerCase() === 'staging'
}

export function fixturesAllowed(): boolean {
  return process.env.NODE_ENV !== 'production' || isStaging()
}
