import { type Status, STATUS_ORDER } from './types'

const statusClass: Record<Status, string> = {
  Wishlist: 'status-wishlist',
  Applied: 'status-applied',
  'Under Review': 'status-under-review',
  Assessment: 'status-assessment',
  Interview: 'status-interview',
  'HR Round': 'status-hr-round',
  Offer: 'status-offer',
  Rejected: 'status-rejected',
  Withdrawn: 'status-withdrawn',
}

interface StatusSelectProps {
  value: Status
  onChange: (status: Status) => void
  ariaLabel: string
  className?: string
}

export default function StatusSelect({
  value,
  onChange,
  ariaLabel,
  className = '',
}: StatusSelectProps) {
  return (
    <select
      className={`status-select ${statusClass[value]} ${className}`}
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value as Status)}
    >
      {STATUS_ORDER.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  )
}
