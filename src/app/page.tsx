import type { Metadata } from 'next'
import Landing from '../components/marketing/Landing'

export const metadata: Metadata = {
  title: 'Prep by EVOLW — Interview prep for product-based-company roles and more',
  description:
    'Ten engineering tracks, one plan that fits your calendar. Explanations from zero in the language you code in, worked examples you can run, system design the way interviews ask, AI mock interviews that feel real, and your job hunt in the same tab. Passes from ₹199 for 90 days, no subscription.',
  openGraph: {
    title: 'Prep by EVOLW',
    description: 'Stop collecting resources. Start finishing them. Interview prep for product-based-company roles and more. Passes from ₹199, no subscription.',
    type: 'website',
    images: [{ url: '/screens/today.jpg', width: 1440, height: 900, alt: 'Prep: your action plan for today' }],
  },
}

export default function HomePage() {
  return <Landing />
}
