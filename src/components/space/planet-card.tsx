import { Heart, Plus, Check } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'

import { Planet } from '@/components/space/planet'
import { staggerItem } from '@/components/space/reveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Planet as PlanetData } from '@/data/planets'
import { useTrip } from '@/hooks/use-trip'

export function PlanetCard({ planet }: { planet: PlanetData }) {
  const { favorites, toggleFavorite, itinerary, toggleStop } = useTrip()
  const isFav = favorites.includes(planet.id)
  const inTrip = itinerary.includes(planet.id)

  return (
    <motion.article
      variants={staggerItem}
      whileHover={{ y: -8, rotate: -0.6 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition-colors hover:border-white/25"
    >
      <motion.button
        type="button"
        aria-label={isFav ? `Remove ${planet.name} from favorites` : `Add ${planet.name} to favorites`}
        aria-pressed={isFav}
        onClick={() => toggleFavorite(planet.id)}
        whileTap={{ scale: 0.7 }}
        className="absolute top-4 right-4 z-10 rounded-full p-2 text-white/70 hover:text-white"
      >
        <motion.span
          key={String(isFav)}
          initial={{ scale: 0.4 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 12 }}
          className="block"
        >
          <Heart className={isFav ? 'size-5 fill-rose-500 text-rose-500' : 'size-5'} />
        </motion.span>
      </motion.button>

      <Link to={`/planets/${planet.id}`} className="flex flex-col items-center py-6">
        <motion.div whileHover={{ scale: 1.12, rotate: 8 }} transition={{ type: 'spring', stiffness: 200 }}>
          <Planet planet={planet} diameter="6rem" />
        </motion.div>
      </Link>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xl font-semibold">{planet.name}</h3>
          <Badge variant="secondary">{planet.days} days</Badge>
        </div>
        <p className="text-sm text-white/60">{planet.tagline}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-medium text-amber-300">${planet.price.toLocaleString('en-US')}</span>
          <Button
            size="sm"
            variant={inTrip ? 'secondary' : 'outline'}
            className={inTrip ? '' : 'border-white/20 bg-transparent text-white hover:bg-white/10'}
            onClick={() => toggleStop(planet.id)}
          >
            {inTrip ? <Check /> : <Plus />}
            {inTrip ? 'Added' : 'Add to trip'}
          </Button>
        </div>
      </div>
    </motion.article>
  )
}
