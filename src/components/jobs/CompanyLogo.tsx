import { useState } from 'react'
import { companyInitials, companyLogoUrl } from '../../lib/jobs/logo'

/** Company logo (catalog logo or the company's favicon), with initials when neither can be loaded. */
export default function CompanyLogo({
  company,
  size = 36,
  className = '',
}: {
  company: { name: string; logoUrl?: string | null; website?: string | null; careersUrl?: string | null }
  size?: number
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const src = failed ? null : companyLogoUrl(company, size >= 48 ? 128 : 64)
  const style = { width: size, height: size, minWidth: size, minHeight: size, fontSize: Math.max(10, Math.round(size * 0.38)) }
  if (!src) {
    return (
      <span className={`company-logo company-logo-fallback ${className}`} style={style} aria-hidden="true">
        {companyInitials(company.name)}
      </span>
    )
  }
  return <img className={`company-logo ${className}`} style={style} src={src} alt="" width={size} height={size} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
}
