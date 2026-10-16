import { createContext, useContext, useMemo, type ReactNode } from 'react'

import { planets } from '@/data/planets'
import { useLocalStorage } from '@/hooks/use-local-storage'

type ExploredValue = {
  explored: string[]
  total: number
  mark: (id: string) => void
  reset: () => void
}

const ExploredContext = createContext<ExploredValue | null>(null)

// Remembers which planets you have visited, saved in localStorage.
export function ExploredProvider({ children }: { children: ReactNode }) {
  const [explored, setExplored] = useLocalStorage<string[]>('solaris:explored', [])
  const value = useMemo<ExploredValue>(
    () => ({
      explored,
      total: planets.length,
      mark: (id) => setExplored((prev) => (prev.includes(id) ? prev : [...prev, id])),
      reset: () => setExplored([]),
    }),
    [explored, setExplored],
  )
  return <ExploredContext.Provider value={value}>{children}</ExploredContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useExplored() {
  const ctx = useContext(ExploredContext)
  if (!ctx) throw new Error('useExplored must be used inside <ExploredProvider>')
  return ctx
}
