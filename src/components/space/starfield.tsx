import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useMemo } from 'react'

// Deterministic pseudo-random so stars do not jump between renders.
function stars(count: number, seed: number) {
  let s = seed
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    r: 0.5 + rand() * 1.5,
    d: rand() * 4,
  }))
}

const LAYERS = [
  { count: 70, seed: 7, depth: 0.05, className: 'opacity-50' },
  { count: 45, seed: 13, depth: 0.12, className: 'opacity-70' },
  { count: 25, seed: 29, depth: 0.25, className: 'opacity-100' },
]

// Fixed multi-layer starfield. Each layer drifts at a different speed while scrolling (parallax).
export function Starfield() {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05060f]">
      <div className="absolute -top-40 -left-40 size-[40rem] rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="absolute -right-40 bottom-0 size-[36rem] rounded-full bg-sky-500/15 blur-[120px]" />
      {LAYERS.map((layer) => (
        <Layer key={layer.seed} {...layer} scrollY={scrollY} reduce={Boolean(reduce)} />
      ))}
    </div>
  )
}

function Layer({
  count,
  seed,
  depth,
  className,
  scrollY,
  reduce,
}: (typeof LAYERS)[number] & { scrollY: ReturnType<typeof useScroll>['scrollY']; reduce: boolean }) {
  const points = useMemo(() => stars(count, seed), [count, seed])
  const y = useTransform(scrollY, (v) => (reduce ? 0 : -v * depth))
  return (
    <motion.div className={`absolute inset-0 h-[200%] ${className}`} style={{ y }}>
      {points.map((p, i) => (
        <span
          key={i}
          className="absolute animate-pulse rounded-full bg-white"
          style={{
            left: `${p.x}%`,
            top: `${p.y / 2}%`,
            width: p.r * 2,
            height: p.r * 2,
            animationDelay: `${p.d}s`,
            animationDuration: `${2 + p.d}s`,
          }}
        />
      ))}
    </motion.div>
  )
}
