import { motion } from 'motion/react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <motion.div
        animate={{ rotate: [0, 12, -12, 0], y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="text-7xl"
        aria-hidden
      >
        🧑‍🚀
      </motion.div>
      <h1 className="mt-6 text-4xl font-bold sm:text-5xl">Lost in space</h1>
      <p className="mt-3 text-white/60">This page drifted away from our orbit.</p>
      <Button asChild className="mt-8 bg-amber-400 text-black hover:bg-amber-300">
        <Link to="/">Back to Earth</Link>
      </Button>
    </div>
  )
}
