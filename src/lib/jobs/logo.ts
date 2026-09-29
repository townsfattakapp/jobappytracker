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
    const raw = website.trim()
    const host = new URL(raw.startsWith('http') ? raw : `https://${raw}`).hostname.toLowerCase()
    return host.replace(/^www\./, '') || null
  } catch {
    return null
  }
}

export function companyLogoUrl(company: { logoUrl?: string | null; website?: string | null; careersUrl?: string | null }, size = 64): string | null {
  if (company.logoUrl && /^https?:\/\//.test(company.logoUrl)) return company.logoUrl
  const rawDomain = companyDomain(company.website) || companyDomain(company.careersUrl)
  if (!rawDomain) return null

  let domain = rawDomain
  // If subdomain is jobs.*, careers.*, etc. on the company's own site, extract main domain for higher favicon match
  if (!/(greenhouse\.io|lever\.co|ashbyhq\.com|workday\.com|myworkdayjobs\.com|smartrecruiters\.com|brassring\.com|ttcportals\.com|ripplehire\.com|klimb\.io|oraclecloud\.com)/i.test(rawDomain)) {
    domain = rawDomain.replace(/^(jobs|careers|jobsearch|apply|employment|indcareers|earlycareers|experiencedcareers)\./i, '')
  } else {
    // If it's a known hosted ATS, try to extract company name prefix
    const match = rawDomain.match(/^([a-z0-9-]+)\.(?:wd\d+\.myworkdayjobs\.com|icims\.com|klimb\.io|ttcportals\.com)$/i)
    if (match && match[1]) {
      const clean = match[1].replace(/^(indcareers-|jobs-|careers-)/, '')
      domain = `${clean}.com`
    }
  }

  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`
}

/** Two-letter fallback shown when no logo can be loaded. */
export function companyInitials(name: string): string {
  const words = name.replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return '?'
  return (words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[1][0]).toUpperCase()
}
