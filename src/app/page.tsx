import type { Metadata } from 'next'
import Landing from '../components/marketing/Landing'

export const metadata: Metadata = {
  title: 'Prep by EVOLW — a day-by-day plan for product-company interviews',
  description:
    'Ten engineering tracks, one plan that fits your calendar. Explanations from zero in the language you code in, worked examples you can run, system design the way interviews ask, and your job hunt in the same tab. Seven days free, then ₹199 a month.',
  openGraph: {
    title: 'Prep by EVOLW',
    description: 'Stop collecting resources. Start finishing them. Interview prep with a plan, from ₹199 a month.',
    type: 'website',
    images: [{ url: '/screens/today.jpg', width: 1440, height: 900, alt: 'Prep: your action plan for today' }],
  },
}

export default function HomePage() {
  return <Landing />
}
