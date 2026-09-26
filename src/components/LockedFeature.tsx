import type { ReactNode } from 'react'

interface LockedFeatureProps {
  title: string
  description: string
  /** Called when the learner wants to see plans; undefined hides the button (guest users see a sign-in prompt instead). */
  onUpgrade?: () => void
  onSignIn?: () => void
  signedIn: boolean
  compact?: boolean
  children?: ReactNode
}

/**
 * Standard presentation of a Prep Pro capability the current tier does not
 * include. Copy stays factual: what the feature does and how to unlock it.
 */
export default function LockedFeature({ title, description, onUpgrade, onSignIn, signedIn, compact, children }: LockedFeatureProps) {
  return (
    <div className={`locked-feature${compact ? ' is-compact' : ''}`} role="region" aria-label={`${title} (Prep Pro)`}>
      <div className="locked-feature-head">
        <span className="locked-feature-badge">Prep Pro</span>
        <span className="locked-feature-title">{title}</span>
      </div>
      <p className="locked-feature-text">{description}</p>
      {children}
      <div className="locked-feature-actions">
        {signedIn ? (
          onUpgrade && (
            <button type="button" className="btn btn-primary btn-sm" onClick={onUpgrade}>
              See Prep Pro plans
            </button>
          )
        ) : (
          onSignIn && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onSignIn}>
              Sign in
            </button>
          )
        )}
      </div>
    </div>
  )
}
