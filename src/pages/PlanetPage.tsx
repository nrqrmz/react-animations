import { ArrowLeft, ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { lazy, Suspense, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import { AnimatedNumber } from '@/components/solar/animated-number'
import { SpinIndicator } from '@/components/solar/spin-indicator'
import { SplitText } from '@/components/space/split-text'
import { getPlanet, planets } from '@/data/planets'
import { useExplored } from '@/hooks/use-explored'
import NotFoundPage from '@/pages/NotFoundPage'

const PlanetStage = lazy(() => import('@/components/solar/planet-stage'))

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.5 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
}

export default function PlanetPage() {
  const { id } = useParams()
  const planet = getPlanet(id)
  const { mark } = useExplored()

  useEffect(() => {
    if (!planet) return
    const t = setTimeout(() => mark(planet.id), 1500)
    return () => clearTimeout(t)
  }, [planet, mark])

  if (!planet) return <NotFoundPage />

  const i = planets.indexOf(planet)
  const prev = planets[(i - 1 + planets.length) % planets.length]
  const next = planets[(i + 1) % planets.length]
  const stats: [string, React.ReactNode, string][] = [
    ['Diameter', <AnimatedNumber key="d" value={planet.diameterKm} />, 'km'],
    ['From the Sun', <AnimatedNumber key="s" value={planet.distanceMkm} decimals={planet.distanceMkm % 1 ? 1 : 0} />, 'M km'],
    ['Gravity', <AnimatedNumber key="g" value={planet.gravity} decimals={planet.gravity % 1 ? 2 : 0} />, 'm/s²'],
    ['Surface', <AnimatedNumber key="t" value={planet.tempC} />, '°C'],
    ['Axial tilt', <AnimatedNumber key="a" value={planet.tiltDeg} decimals={1} />, '°'],
    ['Moons', <AnimatedNumber key="m" value={planet.moons} />, ''],
  ]

  return (
    <>
      <div aria-hidden className="fixed inset-0 z-0 bg-black">
        <Suspense fallback={null}>
          <PlanetStage planet={planet} />
        </Suspense>
      </div>

      {/* Content scrolls over the planet. On phones the planet sits in the top half. */}
      <div className="pointer-events-none relative z-10 mx-auto flex min-h-svh max-w-7xl flex-col justify-end px-5 pt-[58svh] pb-10 sm:px-8 lg:justify-center lg:pt-24">
        <motion.div
          key={planet.id}
          variants={list}
          initial="hidden"
          animate="show"
          className="pointer-events-auto max-w-md lg:max-w-lg"
        >
          <motion.div variants={item}>
            <Link to="/#system" className="mb-6 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white">
              <ArrowLeft className="size-4" /> System map
            </Link>
          </motion.div>
          <p className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: planet.accent }}>
            {planet.id === 'sun' ? 'Our star' : `Planet ${i} of 8`}
          </p>
          <h1 className="mt-2 text-[clamp(3.5rem,13vw,7.5rem)] leading-none font-light tracking-tight">
            <SplitText text={planet.name} delay={0.1} />
          </h1>
          <motion.p variants={item} className="mt-4 text-white/70 sm:text-lg">
            {planet.blurb}
          </motion.p>
          <motion.div variants={item} className="mt-6">
            <SpinIndicator planet={planet} />
          </motion.div>
          <motion.dl variants={list} className="mt-6 grid grid-cols-3 gap-x-5 gap-y-5 border-t border-white/10 pt-6">
            {stats.map(([label, value, unit]) => (
              <motion.div key={label} variants={item}>
                <dt className="font-mono text-[10px] tracking-[0.18em] text-white/40 uppercase">{label}</dt>
                <dd className="mt-1 text-lg tabular-nums">
                  {value} <span className="text-xs text-white/40">{unit}</span>
                </dd>
              </motion.div>
            ))}
          </motion.dl>
          <motion.ul variants={list} className="mt-7 space-y-3">
            {planet.facts.map((f) => (
              <motion.li key={f} variants={item} className="flex gap-3 text-sm text-white/70">
                <span className="mt-2 size-1 shrink-0 rounded-full" style={{ background: planet.accent }} />
                {f}
              </motion.li>
            ))}
          </motion.ul>
          <motion.p variants={item} className="mt-5 font-mono text-[10px] tracking-[0.2em] text-white/30 uppercase">
            Drag the planet to look around
          </motion.p>
          <motion.nav variants={item} className="mt-8 flex justify-between border-t border-white/10 pt-5 text-sm">
            <Link to={`/planets/${prev.id}`} className="inline-flex items-center gap-2 text-white/60 hover:text-white">
              <ArrowLeft className="size-4" /> {prev.name}
            </Link>
            <Link to={`/planets/${next.id}`} className="inline-flex items-center gap-2 text-white/60 hover:text-white">
              {next.name} <ArrowRight className="size-4" />
            </Link>
          </motion.nav>
        </motion.div>
      </div>
    </>
  )
}
