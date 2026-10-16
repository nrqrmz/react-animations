import { ArrowRight } from 'lucide-react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { AnimatedNumber } from '@/components/solar/animated-number'
import { Orrery } from '@/components/solar/orrery'
import { PlanetDock } from '@/components/solar/planet-dock'
import { scrollState } from '@/components/solar/scroll-state'
import { SpinIndicator } from '@/components/solar/spin-indicator'
import { Reveal } from '@/components/space/reveal'
import { SplitText } from '@/components/space/split-text'
import { planets, type Planet } from '@/data/planets'
import { useExplored } from '@/hooks/use-explored'
import { scrollToY } from '@/hooks/use-lenis'
import { useTourSnap } from '@/hooks/use-tour-snap'
import { journeyHeightSvh, stopScrollTop } from '@/lib/tour'

// The 3D scene (three.js) is loaded on its own so the page text shows up immediately.
const FlightScene = lazy(() => import('@/components/solar/flight-scene'))

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const N = planets.length
const pad = (n: number) => String(n).padStart(2, '0')

function Hero() {
  return (
    <section className="relative z-10 flex min-h-svh flex-col justify-start px-5 pt-28 pb-12 sm:px-8 lg:justify-center lg:pt-0">
      <div className="mx-auto w-full max-w-7xl">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mb-6 font-mono text-[11px] tracking-[0.3em] text-white/50 uppercase"
        >
          A guided visit · 1 star · 8 planets
        </motion.p>
        <h1 className="text-[clamp(3rem,11vw,8.5rem)] leading-[0.92] font-extralight tracking-tight">
          <SplitText text="Visit the" delay={0.3} className="block" />
          <SplitText text="Solar System" delay={0.55} className="block font-medium" />
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-8 max-w-md text-base text-white/60 sm:text-lg"
        >
          Fly past the Sun and every planet. Each one spins exactly as it does in real life: its real tilt, its real
          direction.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="mt-10 flex items-center gap-6"
        >
          <a
            href="#journey"
            className="group inline-flex h-12 items-center gap-3 rounded-full bg-white px-7 text-sm font-medium text-black transition-transform hover:scale-105 active:scale-95"
          >
            Begin the tour
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </a>
          <span className="hidden items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-white/40 uppercase sm:flex">
            <motion.span
              aria-hidden
              className="block h-px w-10 origin-left bg-white/50"
              animate={{ scaleX: [0.2, 1, 0.2] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            Scroll
          </span>
        </motion.div>
      </div>
    </section>
  )
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.18em] text-white/40 uppercase">{label}</p>
      <p className="mt-1 text-base tabular-nums sm:text-xl">{children}</p>
    </div>
  )
}

function StopPanel({ planet, index }: { planet: Planet; index: number }) {
  return (
    <motion.div
      key={planet.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -24, transition: { duration: 0.25 } }}
      className="absolute inset-x-0 bottom-0 flex flex-col justify-end px-5 pb-24 sm:px-8 lg:inset-y-0 lg:justify-center lg:pb-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-md lg:max-w-lg">
          <p className="font-mono text-xs tracking-[0.3em] text-white/50">
            <span style={{ color: planet.accent }}>{pad(index + 1)}</span> / {pad(N)}
          </p>
          <h2 className="mt-2 text-[clamp(3.2rem,12vw,7rem)] leading-none font-light tracking-tight">
            <SplitText text={planet.name} />
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-3 text-sm text-white/60 sm:text-lg"
          >
            {planet.tagline}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-5 sm:mt-7"
          >
            <SpinIndicator planet={planet} />
          </motion.div>
          <motion.dl
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 pt-5 sm:mt-7 sm:grid-cols-4"
          >
            <Stat label="Diameter">
              <AnimatedNumber value={planet.diameterKm} /> <span className="text-xs text-white/40">km</span>
            </Stat>
            <Stat label="Day">
              <AnimatedNumber value={planet.day.value} decimals={planet.day.value % 1 ? 1 : 0} />{' '}
              <span className="text-xs text-white/40">{planet.day.unit}</span>
            </Stat>
            <Stat label="Year">
              <AnimatedNumber value={planet.year.value} decimals={planet.year.value % 1 ? 1 : 0} />{' '}
              <span className="text-xs text-white/40">{planet.year.unit}</span>
            </Stat>
            <Stat label="Surface">
              <AnimatedNumber value={planet.tempC} /> <span className="text-xs text-white/40">°C</span>
            </Stat>
          </motion.dl>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <Link
              to={`/planets/${planet.id}`}
              className="group mt-6 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"
              style={{ textDecorationColor: planet.accent }}
            >
              Explore {planet.name}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  const journeyRef = useRef<HTMLElement>(null)
  const inJourney = useRef(false)
  const [running, setRunning] = useState(true)
  const [index, setIndex] = useState(0)
  const { mark, explored, total } = useExplored()
  const { scrollY } = useScroll()
  const { scrollYProgress } = useScroll({ target: journeyRef, offset: ['start start', 'end end'] })
  useTourSnap(journeyRef, N)

  useMotionValueEvent(scrollY, 'change', (v) => {
    scrollState.hero = clamp(v / window.innerHeight)
    inJourney.current = scrollState.hero >= 0.98
    const el = journeyRef.current
    if (el) setRunning(v < el.offsetTop + el.offsetHeight + 120)
  })
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    scrollState.journey = clamp(p)
    setIndex(Math.round(clamp(p) * (N - 1)))
  })

  // A planet counts as explored once you have stopped at it.
  useEffect(() => {
    if (inJourney.current) mark(planets[index].id)
  }, [index, mark])

  useEffect(() => {
    scrollState.hero = clamp(window.scrollY / window.innerHeight)
    return () => {
      scrollState.hero = 0
      scrollState.journey = 0
    }
  }, [])

  const jumpTo = (i: number) => {
    const el = journeyRef.current
    if (el) scrollToY(stopScrollTop(el, i), { duration: 0.9 + Math.min(1.2, Math.abs(i - index) * 0.25) })
  }

  return (
    <>
      <div aria-hidden className="fixed inset-0 z-0 bg-black">
        <Suspense fallback={null}>
          <FlightScene active={running} />
        </Suspense>
      </div>

      <Hero />

      <section id="journey" ref={journeyRef} className="relative z-10" style={{ height: `${journeyHeightSvh(N)}svh` }}>
        <div className="sticky top-0 h-svh overflow-hidden">
          <AnimatePresence mode="wait">
            <StopPanel key={planets[index].id} planet={planets[index]} index={index} />
          </AnimatePresence>
          <PlanetDock planets={planets} index={index} onJump={jumpTo} />
        </div>
      </section>

      <section id="system" className="relative z-10 scroll-mt-10 bg-black px-5 py-28 sm:px-8 sm:py-36">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">System map</p>
            <h2 className="mt-4 text-4xl font-light tracking-tight sm:text-6xl">The whole system, in motion</h2>
            <p className="mt-5 text-white/50">
              Orbits are drawn with the real order of speeds: Mercury races, Neptune crawls. Tap any world to visit it.
            </p>
          </Reveal>
          <Reveal className="mt-14" from="scale">
            <Orrery />
          </Reveal>
          <Reveal className="mx-auto mt-14 max-w-xl text-center">
            <p className="font-mono text-xs tracking-[0.25em] text-white/50 uppercase">
              {explored.length === total ? 'You have visited every world' : `${explored.length} of ${total} explored`}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {planets.map((p) => (
                <Link
                  key={p.id}
                  to={`/planets/${p.id}`}
                  className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-white/40 hover:text-white"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ background: explored.includes(p.id) ? p.accent : 'transparent', boxShadow: `inset 0 0 0 1px ${p.accent}` }}
                  />
                  {p.name}
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 bg-black py-8 text-center font-mono text-[11px] tracking-[0.2em] text-white/30 uppercase">
        Solaris · A demo built with React, Three.js and Motion
      </footer>
    </>
  )
}
