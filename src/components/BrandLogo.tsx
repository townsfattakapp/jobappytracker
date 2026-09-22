import { useId } from 'react'

interface BrandLogoProps {
  /** Pixel size of the square mark. */
  size?: number
  /** Show the "Prep / by EVOLW" wordmark next to the mark. */
  wordmark?: boolean
  className?: string
}

/**
 * The Prep by EVOLW mark: a gradient tile with a bold "P" and a spark.
 * Inline SVG so it scales crisply anywhere (sidebar, footer, welcome screens).
 * The same artwork lives in /public/favicon.svg and /public/logo.svg.
 */
export function BrandMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#833ab4" />
          <stop offset="0.55" stopColor="#c13584" />
          <stop offset="1" stopColor="#f77737" />
        </linearGradient>
        <linearGradient id={`${id}-s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${id}-g)`} />
      <rect x="2" y="2" width="60" height="30" rx="14" fill={`url(#${id}-s)`} />
      <path d="M23 48V17h12.5a10.5 10.5 0 0 1 0 21H23" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M48 9l1.9 5.1L55 16l-5.1 1.9L48 23l-1.9-5.1L41 16l5.1-1.9z" fill="#fff" />
    </svg>
  )
}

export default function BrandLogo({ size = 32, wordmark = true, className = '' }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandMark size={size} className="shrink-0 drop-shadow-[0_6px_14px_rgba(193,53,132,0.35)]" />
      {wordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display font-extrabold tracking-tight text-xl text-gradient">Prep</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">by EVOLW</span>
        </span>
      )}
    </span>
  )
}
