import { useReducedMotion } from 'motion/react'
import { useEffect, type RefObject } from 'react'

import { scrollToY } from '@/hooks/use-lenis'
import { holdMagnet, magnetHeldFor, releaseMagnet, STEP, stopScrollTop } from '@/lib/tour'

const IDLE_MS = 140 // how long the scroll must be still before the magnet kicks in
const PUSH = 0.35 // a push of this fraction of a step in the scroll direction is enough to go to the next planet
const TAIL = 0.25 // coming back up from the map, within this fraction of a screen of the last planet, we pull back to it

// "Scroll magnet": when you stop scrolling inside the planet tour, the page settles on the nearest
// planet (or the next one, if you were moving that way). Outside the tour, scrolling stays free.
export function useTourSnap(section: RefObject<HTMLElement | null>, stops: number) {
  const reduce = useReducedMotion()

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    let lastY = window.scrollY
    let dir = 0
    let touching = false

    const settle = () => {
      const el = section.current
      if (!el || touching) return
      const held = magnetHeldFor()
      if (held > 0) {
        timer = setTimeout(settle, held + IDLE_MS)
        return
      }
      const vh = window.innerHeight
      const y = window.scrollY
      // Magnet points, in px: the very top of the page, then every planet.
      const points = [0, ...Array.from({ length: stops }, (_, i) => stopScrollTop(el, i))]
      const last = points[points.length - 1]
      if (y > last + TAIL * vh || y < 0) return // free scrolling below the tour
      if (y > last + 4 && dir > 0) return // heading on to the system map: do not pull back

      let lo = 0
      while (lo < points.length - 2 && y >= points[lo + 1]) lo++
      const seg = points[Math.min(lo + 1, points.length - 1)] - points[lo] || STEP * vh
      const aim = y + dir * PUSH * Math.max(seg, STEP * vh)
      const target = points.reduce((best, p) => (Math.abs(p - aim) < Math.abs(best - aim) ? p : best), points[0])
      const distance = Math.abs(target - y)
      if (distance < 2) return
      const duration = 0.45 + 0.55 * Math.min(1, distance / (STEP * vh))
      holdMagnet(duration * 1000 + 60)
      scrollToY(target, { duration, immediate: Boolean(reduce) })
    }

    const onScroll = () => {
      const y = window.scrollY
      if (y !== lastY) dir = Math.sign(y - lastY)
      lastY = y
      clearTimeout(timer)
      timer = setTimeout(settle, IDLE_MS)
    }
    // Any new input from the person takes over from a magnet animation in progress.
    const onInput = () => releaseMagnet()
    const onTouchStart = () => {
      touching = true
      releaseMagnet()
    }
    const onTouchEnd = () => {
      touching = false
      clearTimeout(timer)
      timer = setTimeout(settle, IDLE_MS)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', onInput, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onInput)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [section, stops, reduce])
}
