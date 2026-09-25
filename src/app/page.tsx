import type { Metadata } from 'next'
import Landing from '../components/marketing/Landing'

export const metadata: Metadata = {
  title: 'Prep by EVOLW — 150+ Engineering Tracks, Interview Prep & Career Roadmaps',
  description:
    '157 structured engineering tracks across 12 disciplines: Generative AI, Full-Stack, Backend, Mobile, Cloud, DevOps, Cybersecurity, Data Science, Systems & DSA. Explanations from zero in the language you code in, runnable worked examples, interactive system design, AI mock interviews, and your job hunt in one tab. Passes from ₹199 for 90 days, no subscription.',
  openGraph: {
    title: 'Prep by EVOLW — 150+ Engineering Tracks & Career Roadmaps',
    description: 'Stop collecting resources. Start finishing them. 157 engineering tracks, 20 career path blueprints, 7,000+ topics, and AI mock interviews. Passes from ₹199, no subscription.',
    type: 'website',
    images: [{ url: '/screens/today.jpg', width: 1440, height: 900, alt: 'Prep: your action plan for today' }],
  },
}

export default function HomePage() {
  return <Landing />
}
