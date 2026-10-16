import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { useExplored } from '@/hooks/use-explored'
import { cn } from '@/lib/utils'

// Minimal header: wordmark, navigation and your exploration progress. Hides while scrolling down.
export function Header() {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [solid, setSolid] = useState(false)
  const { explored, total } = useExplored()

  useMotionValueEvent(scrollY, 'change', (v) => {
    setHidden(v > (scrollY.getPrevious() ?? 0) && v > 160)
    setSolid(v > 40)
  })

  const pct = explored.length / total
  const C = 2 * Math.PI * 9

  return (
    <motion.header
      animate={{ y: hidden ? '-100%' : 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-colors duration-300',
        solid ? 'bg-black/60 backdrop-blur-xl' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="text-sm font-medium tracking-[0.32em] text-white uppercase">
          Solaris
        </Link>
        <nav className="flex items-center gap-6 sm:gap-8">
          <NavLink to="/" end className="hidden text-sm text-white/60 transition-colors hover:text-white sm:block">
            Tour
          </NavLink>
          <Link
            to="/#system"
            className="hidden text-sm text-white/60 transition-colors hover:text-white sm:block"
          >
            System map
          </Link>
          <div
            className="flex items-center gap-2.5"
            title={`${explored.length} of ${total} explored`}
            aria-label={`${explored.length} of ${total} explored`}
          >
            <svg viewBox="0 0 24 24" className="size-6 -rotate-90" aria-hidden>
              <circle cx="12" cy="12" r="9" fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="2" />
              <motion.circle
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={C}
                animate={{ strokeDashoffset: C * (1 - pct) }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </svg>
            <span className="font-mono text-xs text-white/70 tabular-nums">
              {explored.length}/{total}
            </span>
          </div>
        </nav>
      </div>
    </motion.header>
  )
}
