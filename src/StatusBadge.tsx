import { type Status } from './types'

const styles: Record<Status, string> = {
  Wishlist: 'bg-slate-100 text-slate-900 border-slate-300',
  Applied: 'bg-sky-100 text-sky-950 border-sky-300',
  'Under Review': 'bg-indigo-100 text-indigo-950 border-indigo-300',
  Assessment: 'bg-amber-100 text-amber-950 border-amber-300',
  Interview: 'bg-teal-100 text-teal-950 border-teal-300',
  'HR Round': 'bg-cyan-100 text-cyan-950 border-cyan-300',
  Offer: 'bg-emerald-100 text-emerald-950 border-emerald-300',
  Rejected: 'bg-rose-100 text-rose-950 border-rose-300',
  Withdrawn: 'bg-stone-100 text-stone-800 border-stone-300',
}

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-sm font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  )
}
