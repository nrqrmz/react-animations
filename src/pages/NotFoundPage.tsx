import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { SplitText } from '@/components/space/split-text'

export default function NotFoundPage() {
  return (
    <div className="relative z-10 flex min-h-svh flex-col items-center justify-center px-5 text-center">
      <p className="font-mono text-xs tracking-[0.3em] text-white/40 uppercase">Error 404</p>
      <h1 className="mt-4 text-5xl font-light tracking-tight sm:text-7xl">
        <SplitText text="Nothing out here" />
      </h1>
      <p className="mt-4 text-white/50">This page is not on any orbit we know.</p>
      <Link
        to="/"
        className="group mt-10 inline-flex h-12 items-center gap-3 rounded-full bg-white px-7 text-sm font-medium text-black transition-transform hover:scale-105"
      >
        Back to the tour <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  )
}
