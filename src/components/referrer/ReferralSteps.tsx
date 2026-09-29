import { Check, ArrowRight } from 'lucide-react'

/** A readable journey on both narrow and wide screens. Current is zero-based. */
export default function ReferralSteps({ steps, current }: { steps: { title: string; detail: string }[]; current?: number }) {
  return <ol className="referral-steps" aria-label="Referral journey">
    {steps.map((step, index) => <li key={step.title} aria-current={current === index ? 'step' : undefined} data-done={current !== undefined && index < current}>
      <span className="referral-step-number" aria-hidden="true">{current !== undefined && index < current ? <Check size={16} /> : index + 1}</span>
      <div><strong>{step.title}</strong><p>{step.detail}</p></div>
      {index < steps.length - 1 && <ArrowRight className="referral-step-arrow" size={16} aria-hidden="true" />}
    </li>)}
  </ol>
}
