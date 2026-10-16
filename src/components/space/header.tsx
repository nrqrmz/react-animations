import { Menu, Rocket, X } from 'lucide-react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useTrip } from '@/hooks/use-trip'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/#planets', label: 'Destinations' },
  { to: '/trip', label: 'My trip' },
]

// Sticky header: hides when scrolling down, comes back when scrolling up. Drawer menu on mobile.
export function Header() {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { itinerary } = useTrip()
  const { pathname } = useLocation()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(latest > prev && latest > 120 && !open)
    setScrolled(latest > 20)
  })

  // Close the drawer whenever the route changes.
  useEffect(() => setOpen(false), [pathname])

  return (
    <>
      <motion.header
        animate={{ y: hidden ? '-100%' : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-colors',
          scrolled ? 'border-b border-white/10 bg-black/40 backdrop-blur-lg' : 'bg-transparent',
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-wide">
            <Rocket className="size-5 text-amber-400" />
            ORBIT
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className="text-sm text-white/70 transition-colors hover:text-white"
              >
                {l.label}
              </NavLink>
            ))}
            <Button asChild size="sm" className="bg-amber-400 text-black hover:bg-amber-300">
              <Link to="/trip">
                Book trip{itinerary.length > 0 && ` (${itinerary.length})`}
              </Link>
            </Button>
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="drawer"
            className="fixed inset-0 z-30 flex flex-col justify-center gap-6 bg-[#05060f]/95 px-8 backdrop-blur-xl md:hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          >
            {[...links, { to: '/trip', label: `Book trip${itinerary.length ? ` (${itinerary.length})` : ''}` }].map(
              (l, i) => (
                <motion.div
                  key={l.label}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                >
                  <Link to={l.to} className="text-3xl font-semibold text-white">
                    {l.label}
                  </Link>
                </motion.div>
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
