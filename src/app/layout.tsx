import '../style.css'
import '../careerOs.css'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Providers } from './providers'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://prep.evolw.in'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Prep by EVOLW — 150+ Engineering Tracks, Interview Prep & Career Roadmaps',
    template: '%s · Prep by EVOLW',
  },
  description:
    '157 structured engineering tracks across 12 disciplines: Generative AI, Full-Stack, Backend, Mobile, Cloud, DevOps, Cybersecurity, Data Science, Systems & DSA. Explanations from zero in the language you code in, runnable worked examples, interactive system design, AI mock interviews, and your job hunt in one tab.',
  applicationName: 'Prep by EVOLW',
  keywords: [
    'software engineering interview prep',
    'system design interview',
    'dsa coding practice',
    'mock interview ai',
    'career roadmaps for developers',
    'full stack developer roadmap',
    'generative ai engineer roadmap',
    'tech interview preparation India',
    'job application tracker',
    'coding interview questions',
    'leetcode alternative',
    'faang interview prep',
    'backend developer roadmap',
    'cloud and devops roadmap',
  ],
  authors: [{ name: 'EVOLW', url: 'https://www.evolw.in' }],
  creator: 'Evolw',
  publisher: 'Evolw',
  category: 'education',
  alternates: {
    canonical: './',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'Prep by EVOLW',
    title: 'Prep by EVOLW — 150+ Engineering Tracks, Interview Prep & Career Roadmaps',
    description:
      'Stop collecting resources. Start finishing them. 157 engineering tracks, 20 career path blueprints, 7,000+ topics, and AI mock interviews. Passes from ₹299, no subscription.',
    images: [
      {
        url: '/screens/today.jpg',
        width: 1440,
        height: 900,
        alt: 'Prep by EVOLW: Action plan and daily interview preparation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prep by EVOLW — 150+ Engineering Tracks, Interview Prep & Career Roadmaps',
    description:
      'Stop collecting resources. Start finishing them. 157 engineering tracks, 20 career path blueprints, 7,000+ topics, and AI mock interviews.',
    images: ['/screens/today.jpg'],
    creator: '@evolw',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0f' },
  ],
}

// One family everywhere (Inter, close to Instagram's system stack) plus a matching mono for code.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

// Applies the saved theme before hydration so dark-mode users never see a light flash.
const themeScript = `(function(){try{var t=localStorage.getItem('job-app-theme');var d=t?t==='dark':true;if(d)document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){document.documentElement.classList.add('dark');}})();`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} dark`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
