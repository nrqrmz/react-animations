import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'

import { Header } from '@/components/space/header'
import { Starfield } from '@/components/space/starfield'
import { TripProvider } from '@/hooks/use-trip'
import { useLenis } from '@/hooks/use-lenis'
import LandingPage from '@/pages/LandingPage'
import NotFoundPage from '@/pages/NotFoundPage'
import PlanetPage from '@/pages/PlanetPage'
import TripPage from '@/pages/TripPage'

// Scrolls to the #hash target (or to the top) after each navigation.
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      // Wait a frame so the new page has rendered.
      const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 400)
      return () => clearTimeout(t)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function Layout() {
  useLenis()
  return (
    <div className="dark min-h-svh text-white">
      <Starfield />
      <Header />
      <ScrollManager />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -24 }}
        transition={{ duration: 0.35 }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/planets/:id" element={<PlanetPage />} />
          <Route path="/trip" element={<TripPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <TripProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="*" element={<AnimatedRoutes />} />
        </Route>
      </Routes>
    </TripProvider>
  )
}
