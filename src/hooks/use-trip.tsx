import { createContext, useContext, useMemo, type ReactNode } from 'react'

import { getPlanet, type Planet } from '@/data/planets'
import { useLocalStorage } from '@/hooks/use-local-storage'

export type Ticket = {
  id: string
  name: string
  email: string
  stops: string[] // planet ids
  total: number
  days: number
  bookedAt: string
}

type TripContextValue = {
  favorites: string[]
  toggleFavorite: (id: string) => void
  itinerary: string[]
  itineraryPlanets: Planet[]
  setItinerary: (ids: string[]) => void
  toggleStop: (id: string) => void
  tickets: Ticket[]
  book: (data: { name: string; email: string }) => Ticket
}

const TripContext = createContext<TripContextValue | null>(null)

// Single source of truth for favorites, itinerary and tickets, persisted in localStorage.
export function TripProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useLocalStorage<string[]>('orbit:favorites', [])
  const [itinerary, setItinerary] = useLocalStorage<string[]>('orbit:itinerary', [])
  const [tickets, setTickets] = useLocalStorage<Ticket[]>('orbit:tickets', [])

  const value = useMemo<TripContextValue>(() => {
    const itineraryPlanets = itinerary.map(getPlanet).filter((p): p is Planet => Boolean(p))
    return {
      favorites,
      toggleFavorite: (id) =>
        setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      itinerary,
      itineraryPlanets,
      setItinerary,
      toggleStop: (id) =>
        setItinerary((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      tickets,
      book: ({ name, email }) => {
        const ticket: Ticket = {
          id: `ORB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          name,
          email,
          stops: itinerary,
          total: itineraryPlanets.reduce((sum, p) => sum + p.price, 0),
          days: itineraryPlanets.reduce((sum, p) => sum + p.days, 0),
          bookedAt: new Date().toISOString(),
        }
        setTickets((prev) => [ticket, ...prev])
        setItinerary([])
        return ticket
      },
    }
  }, [favorites, itinerary, tickets, setFavorites, setItinerary, setTickets])

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTrip() {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTrip must be used inside <TripProvider>')
  return ctx
}
