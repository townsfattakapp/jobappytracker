import '../style.css'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Prep by EVOLW',
  description: 'Track job applications, sync recruiting emails, and run a daily interview-prep plan.',
  applicationName: 'Prep',
  icons: { icon: '/favicon.svg' },
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
