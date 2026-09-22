import { type Status, STATUS_ORDER } from './types'

import { STATUS_CLASS as statusClass } from './StatusBadge.tsx'

interface StatusSelectProps {
  value: Status | ''
  onChange: (status: Status) => void
  ariaLabel: string
  className?: string
  /** Shown as the first, non-selectable option when no status is chosen yet. */
  placeholder?: string
}

export default function StatusSelect({
  value,
  onChange,
  ariaLabel,
  className = '',
  placeholder,
}: StatusSelectProps) {
  return (
    <select
      className={`status-select ${value ? statusClass[value] : 'status-wishlist'} ${className}`}
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => {
        if (e.target.value) onChange(e.target.value as Status)
      }}
    >
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {STATUS_ORDER.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  )
}
