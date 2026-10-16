import { useAnimationFrame, useReducedMotion } from 'motion/react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'

import { planets } from '@/data/planets'
import { useExplored } from '@/hooks/use-explored'
import { cn } from '@/lib/utils'

const ORBITERS = planets.slice(1)
const radiusPct = (i: number) => 13 + (i / (ORBITERS.length - 1)) * 36 // % of the box

// Top-down map of the system. Planets orbit with the real relative order of periods (time compressed).
export function Orrery() {
  const { explored } = useExplored()
  const reduce = useReducedMotion()
  const refs = useRef<(HTMLAnchorElement | null)[]>([])

  useAnimationFrame((t) => {
    ORBITERS.forEach((p, i) => {
      const el = refs.current[i]
      if (!el) return
      const period = 14 * Math.pow(p.orbitDays / 88, 0.45) // seconds per orbit on screen
      const a = (reduce ? 0.6 * i : (t / 1000 / period) * Math.PI * 2) + i * 1.7
      const r = radiusPct(i)
      el.style.left = `${50 + Math.cos(a) * r}%`
      el.style.top = `${50 + Math.sin(a) * r}%`
    })
  })

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[40rem]">
      {ORBITERS.map((_, i) => (
        <div
          key={i}
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
          style={{ width: `${radiusPct(i) * 2}%`, height: `${radiusPct(i) * 2}%` }}
        />
      ))}
      <Link
        to="/planets/sun"
        aria-label="Sun"
        className="absolute top-1/2 left-1/2 size-[7%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#fff6d6,#ffb02e_55%,#ff5a00)] shadow-[0_0_50px_10px_rgba(255,140,30,0.45)]"
      />
      {ORBITERS.map((p, i) => {
        const done = explored.includes(p.id)
        const size = 1.6 + Math.sqrt(p.radius) * 1.1 // %
        return (
          <Link
            key={p.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            to={`/planets/${p.id}`}
            aria-label={p.name}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: '50%', top: '50%' }}
          >
            <span
              className={cn(
                'block rounded-full transition-transform duration-300 group-hover:scale-150 group-focus-visible:scale-150',
                done ? 'ring-2 ring-white/70 ring-offset-2 ring-offset-black' : '',
              )}
              style={{
                width: `calc(${size} * min(40rem, 90vw) / 100)`,
                height: `calc(${size} * min(40rem, 90vw) / 100)`,
                background: p.accent,
              }}
            />
            <span className="pointer-events-none absolute top-full left-1/2 mt-1 -translate-x-1/2 font-mono text-[10px] tracking-[0.15em] whitespace-nowrap text-white/0 uppercase transition-colors group-hover:text-white group-focus-visible:text-white sm:text-white/50">
              {p.name}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
