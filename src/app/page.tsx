'use client'

import dynamic from 'next/dynamic'

// Dynamically import the App to prevent SSR issues with IndexedDB, window, Mermaid, TipTap, etc.
const App = dynamic(() => import('../App'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen text-muted-foreground">
      Loading JobAppy Career OS...
    </div>
  )
})

export default function Page() {
  return <App />
}
