import { useEffect, useState } from 'react'

function readIsDark(): boolean {
  if (typeof document === 'undefined') return true
  return document.documentElement.classList.contains('dark')
}

/** Tracks the app theme (the `dark` class on <html>) so embedded editors can match it. */
export function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(readIsDark)
  useEffect(() => {
    const el = document.documentElement
    const observer = new MutationObserver(() => setIsDark(el.classList.contains('dark')))
    observer.observe(el, { attributes: true, attributeFilter: ['class'] })
    setIsDark(el.classList.contains('dark'))
    return () => observer.disconnect()
  }, [])
  return isDark
}
