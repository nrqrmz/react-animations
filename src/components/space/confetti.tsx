import { motion } from 'motion/react'
import { useState } from 'react'

const COLORS = ['#f59e0b', '#38bdf8', '#a78bfa', '#f472b6', '#34d399']

// One-shot burst of confetti from the centre of its parent.
export function Confetti({ count = 60 }: { count?: number }) {
  const [pieces] = useState(() =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 700,
        y: -150 - Math.random() * 350,
        rotate: Math.random() * 720 - 360,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 6,
        delay: Math.random() * 0.15,
      })),
  )
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-[2px]"
          style={{ width: p.size, height: p.size * 0.5, background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 500], opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: 2.2, delay: p.delay, ease: 'easeOut', times: [0, 0.35, 1] }}
        />
      ))}
    </div>
  )
}
