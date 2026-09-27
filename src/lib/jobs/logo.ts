/**
 * Company logos for Job Discovery. Companies rarely publish a logo URL in
 * their job feeds, so when the catalog has none the company's own favicon is
 * used, fetched through Google's public favicon service from the company's
 * website host. Nothing about the learner is sent: the request carries only
 * the company's domain, and the browser makes it directly.
 */
export function companyDomain(website: string | null | undefined): string | null {
  if (!website) return null
  try {
    const host = new URL(website.startsWith('http') ? website : `https://${website}`).hostname.toLowerCase()
    return host.replace(/^www\./, '') || null
  } catch {
    return null
  }
}

export function companyLogoUrl(company: { logoUrl?: string | null; website?: string | null }, size = 64): string | null {
  if (company.logoUrl && /^https?:\/\//.test(company.logoUrl)) return company.logoUrl
  const domain = companyDomain(company.website)
  return domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}` : null
}

/** Two-letter fallback shown when no logo can be loaded. */
export function companyInitials(name: string): string {
  const words = name.replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return '?'
  return (words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[1][0]).toUpperCase()
}
