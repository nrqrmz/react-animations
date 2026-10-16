import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'

import { Header } from '@/components/space/header'
import { useLenis } from '@/hooks/use-lenis'
import { ExploredProvider } from '@/hooks/use-explored'
import LandingPage from '@/pages/LandingPage'
import NotFoundPage from '@/pages/NotFoundPage'
import PlanetPage from '@/pages/PlanetPage'

// Scrolls to the #hash target (or to the top) after each navigation.
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 500)
      return () => clearTimeout(t)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function Layout() {
  useLenis()
  return (
    <div className="dark min-h-svh overflow-x-clip bg-black text-white">
      <Header />
      <ScrollManager />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

// Only opacity is animated: a transform here would break the fixed 3D canvas inside the pages.
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/planets/:id" element={<PlanetPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ExploredProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="*" element={<AnimatedRoutes />} />
        </Route>
      </Routes>
    </ExploredProvider>
  )
}
