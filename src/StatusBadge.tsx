import { type Status } from './types'

export const STATUS_CLASS: Record<Status, string> = {
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

export default function StatusBadge({ status }: { status: Status }) {
  return <span className={`status-chip ${STATUS_CLASS[status]}`}>{status}</span>
}
