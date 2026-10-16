export type Planet = {
  id: string
  name: string
  tagline: string
  description: string
  // Tailwind-free CSS gradient used to paint the planet sphere.
  gradient: string
  glow: string
  size: number // relative size, 1 = Earth-ish
  hasRings?: boolean
  days: number
  price: number
  distance: string
  temp: string
  facts: string[]
}

export const planets: Planet[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    tagline: 'The speedy scorcher',
    description:
      'A tiny, cratered world racing around the Sun. Days are blistering and nights are freezing.',
    gradient: 'radial-gradient(circle at 30% 30%, #d6d3d1, #78716c 60%, #292524)',
    glow: '#a8a29e',
    size: 0.5,
    days: 4,
    price: 1200,
    distance: '77M km',
    temp: '167 °C',
    facts: ['A year lasts only 88 Earth days', 'No atmosphere at all', 'Smallest planet in the system'],
  },
  {
    id: 'venus',
    name: 'Venus',
    tagline: 'The golden furnace',
    description:
      'Wrapped in thick golden clouds, Venus is the hottest planet and a spectacular sight from orbit.',
    gradient: 'radial-gradient(circle at 30% 30%, #fde68a, #f59e0b 55%, #7c2d12)',
    glow: '#f59e0b',
    size: 0.95,
    days: 6,
    price: 1800,
    distance: '41M km',
    temp: '465 °C',
    facts: ['Spins backwards compared to most planets', 'A day is longer than its year', 'Hotter than Mercury'],
  },
  {
    id: 'mars',
    name: 'Mars',
    tagline: 'The red frontier',
    description:
      'Rust-red deserts, giant volcanoes and canyons. The most popular destination for adventurers.',
    gradient: 'radial-gradient(circle at 30% 30%, #fdba74, #ea580c 55%, #431407)',
    glow: '#ea580c',
    size: 0.7,
    days: 9,
    price: 2900,
    distance: '78M km',
    temp: '-63 °C',
    facts: ['Home of Olympus Mons, 22 km tall', 'Two tiny moons: Phobos and Deimos', 'A day lasts 24h 37min'],
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    tagline: 'The giant of storms',
    description:
      'A gas giant with a storm bigger than Earth. Watch swirling bands of colour from a safe distance.',
    gradient:
      'radial-gradient(circle at 30% 30%, #fed7aa, #c2855a 45%, #7c4a2d 75%, #2b1810)',
    glow: '#d97706',
    size: 2.2,
    days: 21,
    price: 5400,
    distance: '628M km',
    temp: '-110 °C',
    facts: ['Has at least 95 moons', 'The Great Red Spot is a 300-year-old storm', 'Twice as massive as all other planets together'],
  },
  {
    id: 'saturn',
    name: 'Saturn',
    tagline: 'The lord of the rings',
    description:
      'The icon of the solar system. Glide through the shadow of its glittering rings of ice.',
    gradient: 'radial-gradient(circle at 30% 30%, #fef3c7, #d4b36a 55%, #5c4a1f)',
    glow: '#eab308',
    size: 1.9,
    hasRings: true,
    days: 28,
    price: 6800,
    distance: '1.2B km',
    temp: '-140 °C',
    facts: ['Less dense than water', 'Rings span 280,000 km but are very thin', 'Moon Titan has real lakes'],
  },
  {
    id: 'neptune',
    name: 'Neptune',
    tagline: 'The deep blue edge',
    description:
      'The farthest planet, a deep-blue world with the fastest winds in the solar system.',
    gradient: 'radial-gradient(circle at 30% 30%, #93c5fd, #2563eb 55%, #172554)',
    glow: '#3b82f6',
    size: 1.2,
    days: 45,
    price: 9900,
    distance: '4.3B km',
    temp: '-200 °C',
    facts: ['Winds reach 2,100 km/h', 'One year equals 165 Earth years', 'Discovered with maths before telescopes'],
  },
]

export const getPlanet = (id: string | undefined) => planets.find((p) => p.id === id)
