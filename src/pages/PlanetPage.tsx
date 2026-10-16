import { ArrowLeft, ArrowRight, Check, Heart, Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { Link, useParams } from 'react-router-dom'

import { Planet } from '@/components/space/planet'
import { Reveal, staggerItem, staggerParent } from '@/components/space/reveal'
import { Button } from '@/components/ui/button'
import { getPlanet, planets } from '@/data/planets'
import { useTrip } from '@/hooks/use-trip'
import NotFoundPage from '@/pages/NotFoundPage'

export default function PlanetPage() {
  const { id } = useParams()
  const planet = getPlanet(id)
  const { favorites, toggleFavorite, itinerary, toggleStop } = useTrip()
  if (!planet) return <NotFoundPage />

  const index = planets.indexOf(planet)
  const prev = planets[(index - 1 + planets.length) % planets.length]
  const next = planets[(index + 1) % planets.length]
  const isFav = favorites.includes(planet.id)
  const inTrip = itinerary.includes(planet.id)

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-6 lg:px-8">
      <Link to="/#planets" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
        <ArrowLeft className="size-4" /> All destinations
      </Link>

      <div className="mt-8 grid items-center gap-12 lg:grid-cols-2">
        <motion.div
          key={planet.id}
          initial={{ scale: 0.3, rotate: -90, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 70, damping: 14 }}
          className="flex justify-center"
        >
          <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
            <Planet planet={planet} diameter="clamp(11rem, 42vw, 24rem)" />
          </motion.div>
        </motion.div>

        <div>
          <Reveal from="right">
            <p className="text-xs tracking-[0.3em] text-amber-300 uppercase">{planet.tagline}</p>
            <h1 className="mt-2 text-5xl font-bold sm:text-6xl 2xl:text-7xl">{planet.name}</h1>
            <p className="mt-4 text-lg text-white/70">{planet.description}</p>
          </Reveal>

          <motion.dl
            variants={staggerParent}
            initial="hidden"
            animate="show"
            className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {[
              ['Distance', planet.distance],
              ['Temperature', planet.temp],
              ['Duration', `${planet.days} days`],
              ['Price', `$${planet.price.toLocaleString('en-US')}`],
            ].map(([label, value]) => (
              <motion.div
                key={label}
                variants={staggerItem}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <dt className="text-xs text-white/50">{label}</dt>
                <dd className="mt-1 font-semibold">{value}</dd>
              </motion.div>
            ))}
          </motion.dl>

          <motion.ul variants={staggerParent} initial="hidden" animate="show" className="mt-8 space-y-3">
            {planet.facts.map((f) => (
              <motion.li key={f} variants={staggerItem} className="flex gap-3 text-white/80">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400" /> {f}
              </motion.li>
            ))}
          </motion.ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-amber-400 text-black hover:bg-amber-300"
              onClick={() => toggleStop(planet.id)}
            >
              {inTrip ? <Check /> : <Plus />} {inTrip ? 'In my trip' : 'Add to my trip'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
              onClick={() => toggleFavorite(planet.id)}
              aria-pressed={isFav}
            >
              <Heart className={isFav ? 'fill-rose-500 text-rose-500' : ''} /> {isFav ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-20 flex justify-between border-t border-white/10 pt-6 text-sm">
        <Link to={`/planets/${prev.id}`} className="flex items-center gap-2 text-white/70 hover:text-white">
          <ArrowLeft className="size-4" /> {prev.name}
        </Link>
        <Link to={`/planets/${next.id}`} className="flex items-center gap-2 text-white/70 hover:text-white">
          {next.name} <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}
