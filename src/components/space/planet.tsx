import { motion } from 'motion/react'

import type { Planet as PlanetData } from '@/data/planets'
import { cn } from '@/lib/utils'

type Props = {
  planet: PlanetData
  // Base diameter as any CSS length; multiplied by the planet's relative size.
  diameter?: string
  spin?: boolean
  className?: string
}

// A planet painted with pure CSS: gradient sphere, drifting cloud bands, glow and optional rings.
export function Planet({ planet, diameter = '10rem', spin = true, className }: Props) {
  const size = `calc(${diameter} * ${0.55 + planet.size * 0.3})`
  return (
    <div className={cn('relative shrink-0', className)} style={{ width: size, height: size }}>
      {planet.hasRings && (
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 z-20 h-[18%] w-[190%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-[6px] border-amber-200/60"
          style={{ rotate: '-18deg', clipPath: 'inset(50% 0 0 0)' }}
        />
      )}
      <div
        className="absolute inset-0 overflow-hidden rounded-full"
        style={{ background: planet.gradient, boxShadow: `0 0 60px ${planet.glow}66, inset -20px -20px 50px #000000aa` }}
      >
        <motion.div
          aria-hidden
          className="absolute inset-0 opacity-40 mix-blend-overlay"
          style={{
            backgroundImage:
              'repeating-linear-gradient(100deg, transparent 0 14%, rgba(255,255,255,.55) 14% 20%, transparent 20% 34%)',
            backgroundSize: '200% 100%',
          }}
          animate={spin ? { backgroundPositionX: ['0%', '-200%'] } : undefined}
          transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
        />
      </div>
      {planet.hasRings && (
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 z-0 h-[18%] w-[190%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-[6px] border-amber-200/60"
          style={{ rotate: '-18deg', clipPath: 'inset(0 0 50% 0)' }}
        />
      )}
    </div>
  )
}
