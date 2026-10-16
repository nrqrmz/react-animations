import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'

import type { Planet } from '@/data/planets'
import { cn } from '@/lib/utils'

type Props = {
  planets: Planet[]
  index: number
  onJump: (i: number) => void
}

const arrow =
  'grid size-11 shrink-0 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-25'

// Bottom bar of the planet tour. Phones: big prev/next arrows (thumb reach) and a row of dots.
// Larger screens: one chip per body, so any planet is a single click away.
export function PlanetDock({ planets, index, onJump }: Props) {
  return (
    <nav
      aria-label="Planets"
      className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-black/60 p-1 backdrop-blur-xl"
    >
      <button type="button" aria-label="Previous planet" disabled={index === 0} onClick={() => onJump(index - 1)} className={arrow}>
        <ChevronLeft className="size-5" />
      </button>

      {/* Phones and tablets: dots */}
      <ol className="flex items-center gap-1 px-1 lg:hidden">
        {planets.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              aria-label={`Go to ${p.name}`}
              aria-current={i === index}
              onClick={() => onJump(i)}
              className="grid h-11 w-5 place-items-center"
            >
              <motion.span
                className="block h-1.5 rounded-full"
                animate={{ width: i === index ? 18 : 6, backgroundColor: i === index ? p.accent : 'rgba(255,255,255,0.3)' }}
                transition={{ duration: 0.3 }}
              />
            </button>
          </li>
        ))}
      </ol>

      {/* Desktop: named chips */}
      <ol className="hidden items-center lg:flex">
        {planets.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              aria-label={`Go to ${p.name}`}
              aria-current={i === index}
              onClick={() => onJump(i)}
              className={cn(
                'relative flex h-10 items-center gap-2 rounded-full px-3 text-sm transition-colors',
                i === index ? 'text-white' : 'text-white/50 hover:text-white',
              )}
            >
              {i === index && (
                <motion.span
                  layoutId="dock-active"
                  className="absolute inset-0 rounded-full bg-white/10"
                  transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                />
              )}
              <span className="relative size-2 rounded-full" style={{ background: p.accent }} />
              <span className="relative">{p.name}</span>
            </button>
          </li>
        ))}
      </ol>

      <button
        type="button"
        aria-label="Next planet"
        disabled={index === planets.length - 1}
        onClick={() => onJump(index + 1)}
        className={arrow}
      >
        <ChevronRight className="size-5" />
      </button>
    </nav>
  )
}
