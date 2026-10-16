import { useEffect, type RefObject } from 'react'

import { stopPosition } from '@/lib/tour'

const NEXT = new Set(['ArrowDown', 'ArrowRight', 'PageDown'])
const PREV = new Set(['ArrowUp', 'ArrowLeft', 'PageUp'])

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))

// Keyboard control for the planet tour: arrows and Page keys move one planet, Home/End go to the
// first and last. Only active while the tour is on screen; elsewhere the keys scroll as usual.
export function useTourKeys(section: RefObject<HTMLElement | null>, stops: number, jump: (i: number) => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = section.current
      if (!el || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || isTyping(e.target)) return
      const pos = stopPosition(el)
      const inTour = pos > -1.5 && pos < stops - 1 + 0.25 // title screen, planets and a little past the last one
      if (!inTour) return

      let target: number | null = null
      // Past the last planet the keys scroll as usual, so you can carry on to the system map.
      if (NEXT.has(e.key)) target = Math.floor(pos + 0.02) + 1 > stops - 1 ? null : Math.max(0, Math.floor(pos + 0.02) + 1)
      else if (PREV.has(e.key)) target = pos <= 0.02 ? null : Math.max(0, Math.ceil(pos - 0.02) - 1)
      else if (e.key === 'Home') target = 0
      else if (e.key === 'End') target = stops - 1
      if (target === null) return
      e.preventDefault()
      jump(target)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [section, stops, jump])
}
