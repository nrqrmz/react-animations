import { motion } from 'motion/react'

import { isRetrograde, visualSpinSeconds, type Planet } from '@/data/planets'

// A tiny ring with a dot that turns the same way the planet does, seen from above its north pole.
// Counter-clockwise = prograde (west to east); clockwise = retrograde (east to west).
export function SpinIndicator({ planet }: { planet: Planet }) {
  const retro = isRetrograde(planet)
  const seconds = Math.min(20, Math.max(3, visualSpinSeconds(planet.rotationHours) / 4))
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 48 48" className="size-11 shrink-0" aria-hidden>
        <circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" strokeOpacity="0.2" />
        <motion.g
          animate={{ rotate: retro ? 360 : -360 }}
          transition={{ duration: seconds, ease: 'linear', repeat: Infinity }}
          style={{ transformOrigin: '24px 24px' }}
        >
          <circle cx="24" cy="6" r="3.2" fill={planet.accent} />
          <path d="M24 6 L30 6" stroke={planet.accent} strokeOpacity="0.5" strokeWidth="1.5" />
        </motion.g>
        <circle cx="24" cy="24" r="2" fill="currentColor" fillOpacity="0.5" />
      </svg>
      <div className="leading-tight">
        <p className="font-mono text-[11px] tracking-[0.18em] uppercase" style={{ color: planet.accent }}>
          {retro ? 'Retrograde spin' : 'Prograde spin'}
        </p>
        <p className="mt-1 text-sm text-white/60">
          {retro ? 'East to west' : 'West to east'} · one turn in {planet.day.value} {planet.day.unit}
        </p>
      </div>
    </div>
  )
}
