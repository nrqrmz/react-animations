import { GripVertical, Trash2 } from 'lucide-react'
import { AnimatePresence, motion, Reorder } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { BoardingPass } from '@/components/space/boarding-pass'
import { Confetti } from '@/components/space/confetti'
import { Planet } from '@/components/space/planet'
import { Reveal } from '@/components/space/reveal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getPlanet } from '@/data/planets'
import { useTrip, type Ticket } from '@/hooks/use-trip'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function TripPage() {
  const { itinerary, itineraryPlanets, setItinerary, toggleStop, book, tickets } = useTrip()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})
  const [justBooked, setJustBooked] = useState<Ticket | null>(null)

  const total = itineraryPlanets.reduce((s, p) => s + p.price, 0)
  const days = itineraryPlanets.reduce((s, p) => s + p.days, 0)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (name.trim().length < 2) next.name = 'Please enter your full name.'
    if (!EMAIL.test(email)) next.email = 'Please enter a valid email.'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    setJustBooked(book({ name: name.trim(), email }))
    setName('')
    setEmail('')
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pt-28 pb-24 sm:px-6 lg:px-8">
      <Reveal>
        <h1 className="text-4xl font-bold sm:text-5xl">My trip</h1>
        <p className="mt-2 text-white/60">Drag the stops to change the order of your route.</p>
      </Reveal>

      <AnimatePresence>
        {justBooked && (
          <motion.section
            key="ticket"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative mt-8"
          >
            <Confetti />
            <BoardingPass ticket={justBooked} />
            <Button variant="ghost" className="mt-3 text-white/70" onClick={() => setJustBooked(null)}>
              Dismiss
            </Button>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <section aria-label="Itinerary">
          {itineraryPlanets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-dashed border-white/20 p-10 text-center"
            >
              <p className="text-white/70">Your trip is empty. Pick a few worlds to visit.</p>
              <Button asChild className="mt-5 bg-amber-400 text-black hover:bg-amber-300">
                <Link to="/#planets">Browse destinations</Link>
              </Button>
            </motion.div>
          ) : (
            <Reorder.Group axis="y" values={itinerary} onReorder={setItinerary} className="space-y-3">
              <AnimatePresence initial={false}>
                {itinerary.map((id, i) => {
                  const planet = getPlanet(id)
                  if (!planet) return null
                  return (
                    <Reorder.Item
                      key={id}
                      value={id}
                      layout
                      initial={{ opacity: 0, x: -40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 60, scale: 0.9 }}
                      whileDrag={{ scale: 1.03, boxShadow: '0 20px 40px rgba(0,0,0,.5)' }}
                      className="flex cursor-grab items-center gap-3 rounded-2xl border border-white/10 bg-[#0d1020] p-3 active:cursor-grabbing sm:gap-4 sm:p-4"
                    >
                      <GripVertical className="size-5 shrink-0 text-white/40" aria-hidden />
                      <span className="w-5 text-center font-mono text-sm text-white/40">{i + 1}</span>
                      <Planet planet={planet} diameter="2.5rem" spin={false} className="mx-2" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{planet.name}</p>
                        <p className="text-xs text-white/50">
                          {planet.days} days · ${planet.price.toLocaleString('en-US')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${planet.name}`}
                        onClick={() => toggleStop(id)}
                        className="text-white/60 hover:text-rose-400"
                      >
                        <Trash2 />
                      </Button>
                    </Reorder.Item>
                  )
                })}
              </AnimatePresence>
            </Reorder.Group>
          )}
        </section>

        <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-white/60">Stops</dt><dd>{itineraryPlanets.length}</dd></div>
            <div className="flex justify-between"><dt className="text-white/60">Duration</dt><dd>{days} days</dd></div>
            <div className="flex justify-between border-t border-white/10 pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd className="text-amber-300">
                <motion.span key={total} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-block">
                  ${total.toLocaleString('en-US')}
                </motion.span>
              </dd>
            </div>
          </dl>

          <form onSubmit={submit} noValidate className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={Boolean(errors.name)} />
              {errors.name && <p className="text-xs text-rose-400">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={Boolean(errors.email)} />
              {errors.email && <p className="text-xs text-rose-400">{errors.email}</p>}
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={itineraryPlanets.length === 0}
              className="w-full bg-amber-400 text-black hover:bg-amber-300"
            >
              Book my trip
            </Button>
            <p className="text-center text-xs text-white/40">Demo only: no payment is taken.</p>
          </form>
        </aside>
      </div>

      {tickets.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">Past tickets</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {tickets.map((t) => (
              <motion.li
                key={t.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm"
              >
                <div className="flex justify-between">
                  <span className="font-mono text-white/60">{t.id}</span>
                  <span className="text-amber-300">${t.total.toLocaleString('en-US')}</span>
                </div>
                <p className="mt-2">{t.stops.map((id) => getPlanet(id)?.name).join(' → ')}</p>
                <p className="mt-1 text-xs text-white/40">{new Date(t.bookedAt).toLocaleDateString('en-US')} · {t.name}</p>
              </motion.li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
