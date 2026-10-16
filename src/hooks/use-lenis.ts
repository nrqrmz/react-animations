import { useEffect } from 'react'
import Lenis from 'lenis'
import { useReducedMotion } from 'motion/react'

// The running smooth-scroll instance, so other code (planet bar, magnet) can scroll with it.
let current: Lenis | null = null

// Scrolls the page to `y` (px). Uses the smooth-scroll engine when it is running, the browser otherwise.
export function scrollToY(y: number, { duration = 1.1, immediate = false } = {}) {
  // People who prefer reduced motion get an instant jump instead of a long glide.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) immediate = true
  if (current) {
    current.scrollTo(y, { duration, immediate, easing: (t) => 1 - Math.pow(1 - t, 3) })
  } else {
    window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' })
  }
}

// Smooth scrolling for the whole page. Skipped for people who prefer reduced motion.
export function useLenis() {
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) return
    const lenis = new Lenis({ lerp: 0.1 })
    current = lenis
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    })
    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      current = null
    }
  }, [reduce])
}
