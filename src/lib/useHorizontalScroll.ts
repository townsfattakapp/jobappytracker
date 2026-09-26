import { useEffect, useRef } from 'react'

/**
 * Global horizontal wheel listener.
 * Automatically translates vertical mouse wheel scrolling (deltaY) into horizontal
 * scroll (scrollLeft) for containers with horizontal overflow, eliminating the need
 * for desktop mouse users to hold Shift.
 */
export function initGlobalHorizontalScroll(): () => void {
  if (typeof window === 'undefined') return () => {}

  const handleWheel = (e: WheelEvent) => {
    // If user is already holding shift or using a trackpad horizontal delta, let native handling take over
    if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return

    // Normalize delta across different browsers and mouse driver modes (pixel, line, page)
    let delta = e.deltaY
    if (e.deltaMode === 1) {
      delta *= 33
    } else if (e.deltaMode === 2) {
      delta *= 300
    }

    // Search upwards from target for a horizontally scrollable container
    let current = e.target as HTMLElement | null

    while (current && current !== document.body && current !== document.documentElement) {
      // Don't hijack text inputs or full textareas
      if (current.tagName === 'TEXTAREA' || current.tagName === 'INPUT') return

      const style = window.getComputedStyle(current)
      const isHorizontalScrollable =
        (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
        current.scrollWidth > current.clientWidth + 2

      const isVerticalScrollable =
        (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
        current.scrollHeight > current.clientHeight + 2

      // Only convert wheel if container is strictly or primarily horizontal
      if (isHorizontalScrollable && !isVerticalScrollable) {
        const canScrollLeft = current.scrollLeft > 0 && delta < 0
        const canScrollRight =
          current.scrollLeft < current.scrollWidth - current.clientWidth - 1 && delta > 0

        if (canScrollLeft || canScrollRight) {
          e.preventDefault()
          current.scrollLeft += delta * 0.9
          return
        }
      }

      current = current.parentElement
    }
  }

  window.addEventListener('wheel', handleWheel, { passive: false })
  return () => {
    window.removeEventListener('wheel', handleWheel)
  }
}

/**
 * Hook to attach smooth horizontal mouse wheel scrolling to a specific container ref.
 */
export function useHorizontalWheel<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      if (el.scrollWidth <= el.clientWidth) return

      let delta = e.deltaY
      if (e.deltaMode === 1) delta *= 33
      else if (e.deltaMode === 2) delta *= 300

      const canScrollLeft = el.scrollLeft > 0 && delta < 0
      const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 1 && delta > 0

      if (canScrollLeft || canScrollRight) {
        e.preventDefault()
        el.scrollLeft += delta * 0.9
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
    }
  }, [])

  return ref
}
