import { ArrowDown, Rocket } from 'lucide-react'
import {
  motion,
  transform,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'

import { CountUp } from '@/components/space/count-up'
import { Planet } from '@/components/space/planet'
import { PlanetCard } from '@/components/space/planet-card'
import { Reveal, staggerParent } from '@/components/space/reveal'
import { Button } from '@/components/ui/button'
import { planets, type Planet as PlanetData } from '@/data/planets'

const HEADLINE = 'Your next holiday is out of this world'.split(' ')

function Hero() {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const planetY = useTransform(scrollY, [0, 600], [0, reduce ? 0 : 160])
  const planetScale = useTransform(scrollY, [0, 600], [1, reduce ? 1 : 1.35])
  const hero = planets[2]

  return (
    <section className="relative flex min-h-svh items-center overflow-hidden px-4 pt-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-2">
        <div className="z-10 text-center lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs tracking-widest text-amber-300 uppercase"
          >
            <Rocket className="size-3.5" /> Now boarding · 2090 season
          </motion.p>
          <motion.h1
            variants={staggerParent}
            initial="hidden"
            animate="show"
            className="text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl 2xl:text-7xl"
          >
            {HEADLINE.map((word, i) => (
              <span key={i} className="mr-[0.25em] inline-block overflow-hidden align-bottom">
                <motion.span
                  className="inline-block"
                  variants={{
                    hidden: { y: '110%', rotate: 8 },
                    show: { y: 0, rotate: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
                  }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mx-auto mt-6 max-w-xl text-base text-white/70 sm:text-lg lg:mx-0"
          >
            Scroll to fly across the solar system, save your favourite worlds and build a trip that nobody
            else on Earth has taken.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, type: 'spring' }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
          >
            <Button asChild size="lg" className="w-full bg-amber-400 text-black hover:bg-amber-300 sm:w-auto">
              <a href="#journey">Start the journey <ArrowDown /></a>
            </Button>
            <Button asChild size="lg" variant="ghost" className="w-full text-white sm:w-auto">
              <Link to="/trip">Plan my trip</Link>
            </Button>
          </motion.div>
        </div>

        <motion.div style={{ y: planetY, scale: planetScale }} className="relative flex items-center justify-center">
          <motion.div
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <Planet planet={hero} diameter="clamp(10rem, 38vw, 20rem)" />
            {/* Orbiting moon */}
            <motion.div
              aria-hidden
              className="absolute inset-[-25%]"
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute top-0 left-1/2 size-6 -translate-x-1/2 rounded-full bg-gradient-to-br from-white to-zinc-500 shadow-[0_0_20px_rgba(255,255,255,0.5)] sm:size-8" />
            </motion.div>
            {/* Dashed orbit ring */}
            <motion.div
              aria-hidden
              className="absolute inset-[-25%] rounded-full border border-dashed border-white/20"
              animate={{ rotate: -360 }}
              transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        aria-hidden
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-white/50 sm:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        <ArrowDown />
      </motion.div>
    </section>
  )
}

// One stop of the scroll journey: the planet flies in, grows, spins and flies past.
function JourneyStop({
  planet,
  index,
  total,
  progress,
}: {
  planet: PlanetData
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const reduce = useReducedMotion()
  const c = (index + 0.5) / total
  const w = 1 / total
  const range = [c - 0.62 * w, c - 0.3 * w, c + 0.3 * w, c + 0.62 * w]

  // Function-form transforms run in JS, so input ranges may go outside 0..1 (first and last stops).
  const map = <T extends number | string>(out: T[]) => (v: number) => transform(v, range, out as never) as T
  const opacity = useTransform(progress, map([0, 1, 1, 0]))
  const scale = useTransform(progress, map(reduce ? [1, 1, 1, 1] : [0.2, 1, 1.25, 3.5]))
  const rotate = useTransform(progress, map(reduce ? [0, 0, 0, 0] : [-40, 0, 10, 40]))
  const y = useTransform(progress, map(reduce ? ['0vh', '0vh', '0vh', '0vh'] : ['30vh', '0vh', '-4vh', '-30vh']))
  const textY = useTransform(progress, map(['40px', '0px', '0px', '-40px']))

  return (
    <motion.div style={{ opacity }} className="absolute inset-0 flex flex-col items-center justify-center">
      <motion.div style={{ scale, rotate, y }} className="will-change-transform">
        <Planet planet={planet} diameter="clamp(8rem, 34vw, 18rem)" />
      </motion.div>
      <motion.div style={{ y: textY }} className="absolute inset-x-0 bottom-[12vh] px-6 text-center">
        <p className="text-xs tracking-[0.3em] text-amber-300 uppercase">
          Stop {index + 1} · {planet.distance} from the Sun
        </p>
        <h3 className="mt-2 text-4xl font-bold sm:text-5xl lg:text-6xl">{planet.name}</h3>
        <p className="mx-auto mt-2 max-w-md text-white/70">{planet.tagline}</p>
      </motion.div>
    </motion.div>
  )
}

function Journey() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const barWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section id="journey" ref={ref} className="relative h-[500vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        {planets.map((p, i) => (
          <JourneyStop key={p.id} planet={p} index={i} total={planets.length} progress={scrollYProgress} />
        ))}
        <div className="absolute inset-x-6 bottom-6 mx-auto h-1 max-w-md overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full rounded-full bg-amber-400" style={{ width: barWidth }} />
        </div>
      </div>
    </section>
  )
}

const stats = [
  { value: 6, suffix: '', label: 'Destinations' },
  { value: 12400, suffix: '+', label: 'Happy travellers' },
  { value: 4300000000, suffix: ' km', label: 'Farthest trip' },
  { value: 99, suffix: '%', label: 'Safe landings' },
]

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Journey />

      <section id="planets" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="mb-12 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">Pick your destinations</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            Tap the heart to save a world, or add it to your trip and we will plan the route.
          </p>
        </Reveal>
        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:gap-8"
        >
          {planets.map((p) => (
            <PlanetCard key={p.id} planet={p} />
          ))}
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 rounded-3xl border border-white/10 bg-white/[0.03] p-8 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} from="scale" className="text-center">
              <p className="text-2xl font-bold text-amber-300 sm:text-4xl">
                <CountUp to={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-1 text-sm text-white/60">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <Reveal>
          <h2 className="text-3xl font-bold sm:text-5xl">Ready for lift-off?</h2>
          <p className="mx-auto mt-4 max-w-lg text-white/60">
            Build your itinerary, drag the stops into the order you like and get your boarding pass in seconds.
          </p>
          <Button asChild size="lg" className="mt-8 bg-amber-400 text-black hover:bg-amber-300">
            <Link to="/trip">Build my trip <Rocket /></Link>
          </Button>
        </Reveal>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
        Orbit · A demo project built with React, Tailwind and Motion.
      </footer>
    </>
  )
}
