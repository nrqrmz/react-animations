import { Rocket } from 'lucide-react'
import { motion } from 'motion/react'

import { getPlanet } from '@/data/planets'
import type { Ticket } from '@/hooks/use-trip'

export function BoardingPass({ ticket }: { ticket: Ticket }) {
  const names = ticket.stops.map((id) => getPlanet(id)?.name ?? id)
  return (
    <motion.div
      initial={{ rotateX: -90, opacity: 0, y: 30 }}
      animate={{ rotateX: 0, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
      style={{ transformPerspective: 900 }}
      className="overflow-hidden rounded-3xl border border-amber-300/40 bg-gradient-to-br from-amber-300/20 via-white/5 to-violet-500/20 backdrop-blur"
    >
      <div className="flex items-center justify-between border-b border-dashed border-white/20 p-5">
        <div className="flex items-center gap-2 font-semibold tracking-wide">
          <Rocket className="size-5 text-amber-300" /> ORBIT BOARDING PASS
        </div>
        <span className="font-mono text-sm text-white/70">{ticket.id}</span>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-3">
        <Field label="Passenger" value={ticket.name} />
        <Field label="Duration" value={`${ticket.days} days`} />
        <Field label="Total" value={`$${ticket.total.toLocaleString('en-US')}`} />
        <div className="sm:col-span-3">
          <Field label="Route" value={['Earth', ...names].join('  →  ')} />
        </div>
      </div>
    </motion.div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs tracking-widest text-white/50 uppercase">{label}</p>
      <p className="mt-1 text-lg font-medium break-words">{value}</p>
    </div>
  )
}
