// Real data for the Sun and the eight planets.
// `kind` is the index used by the planet shader (0 = Sun ... 8 = Neptune).

export type Atmosphere = { color: [number, number, number]; power: number; intensity: number }

export type Planet = {
  id: string
  name: string
  kind: number
  tagline: string
  blurb: string
  accent: string
  // Visual radius in scene units (not to scale, but ordered like the real thing).
  radius: number
  ring?: 'saturn' | 'uranus'
  atmosphere: Atmosphere | null
  diameterKm: number
  distanceMkm: number // average distance from the Sun, million km
  rotationHours: number // real sidereal rotation period
  day: { value: number; unit: string }
  year: { value: number; unit: string }
  orbitDays: number
  tiltDeg: number // axial tilt; above 90° the planet spins backwards (retrograde)
  gravity: number // m/s²
  tempC: number
  moons: number
  facts: string[]
}

export const planets: Planet[] = [
  {
    id: 'sun',
    name: 'Sun',
    kind: 0,
    tagline: 'The star that holds everything together',
    blurb: 'A ball of plasma 109 times wider than Earth. It holds 99.86% of all the mass in the solar system.',
    accent: '#ffb02e',
    radius: 3,
    atmosphere: null,
    diameterKm: 1392700,
    distanceMkm: 0,
    rotationHours: 609.12,
    day: { value: 25.4, unit: 'days' },
    year: { value: 230, unit: 'million years' },
    orbitDays: 0,
    tiltDeg: 7.25,
    gravity: 274,
    tempC: 5505,
    moons: 0,
    facts: [
      'It spins faster at the equator (25 days) than at the poles (35 days).',
      'Light from its surface takes 8 minutes and 20 seconds to reach Earth.',
      'About 1.3 million Earths would fit inside it.',
    ],
  },
  {
    id: 'mercury',
    name: 'Mercury',
    kind: 1,
    tagline: 'Fast, scorched and covered in craters',
    blurb: 'The smallest planet and the closest to the Sun. It has almost no atmosphere to hold the heat.',
    accent: '#b8b0a6',
    radius: 0.9,
    atmosphere: null,
    diameterKm: 4879,
    distanceMkm: 57.9,
    rotationHours: 1407.6,
    day: { value: 58.6, unit: 'days' },
    year: { value: 88, unit: 'days' },
    orbitDays: 87.97,
    tiltDeg: 0.03,
    gravity: 3.7,
    tempC: 167,
    moons: 0,
    facts: [
      'One day (sunrise to sunrise) lasts 176 Earth days, twice its year.',
      'Temperatures swing from 430 °C by day to -180 °C at night.',
      'Its axis is almost perfectly upright: it has no seasons.',
    ],
  },
  {
    id: 'venus',
    name: 'Venus',
    kind: 2,
    tagline: 'The planet that spins backwards',
    blurb: 'Wrapped in thick clouds of sulphuric acid, it is the hottest planet in the solar system.',
    accent: '#e8c27a',
    radius: 1.5,
    atmosphere: { color: [1.0, 0.82, 0.5], power: 4.2, intensity: 1.0 },
    diameterKm: 12104,
    distanceMkm: 108.2,
    rotationHours: 5832.5,
    day: { value: 243, unit: 'days' },
    year: { value: 224.7, unit: 'days' },
    orbitDays: 224.7,
    tiltDeg: 177.36,
    gravity: 8.87,
    tempC: 464,
    moons: 0,
    facts: [
      'Retrograde: the Sun rises in the west and sets in the east.',
      'A day on Venus is longer than its year.',
      'Surface pressure is 92 times Earth’s, like being 900 m under the sea.',
    ],
  },
  {
    id: 'earth',
    name: 'Earth',
    kind: 3,
    tagline: 'The only world we know with life',
    blurb: 'The third planet, with liquid water on its surface and an atmosphere that keeps it comfortable.',
    accent: '#5aa2ff',
    radius: 1.6,
    atmosphere: { color: [0.25, 0.55, 1.0], power: 3.0, intensity: 1.4 },
    diameterKm: 12742,
    distanceMkm: 149.6,
    rotationHours: 23.93,
    day: { value: 23.9, unit: 'hours' },
    year: { value: 365.25, unit: 'days' },
    orbitDays: 365.25,
    tiltDeg: 23.44,
    gravity: 9.81,
    tempC: 15,
    moons: 1,
    facts: [
      'It turns west to east at 1,670 km/h at the equator.',
      'About 71% of the surface is covered by ocean.',
      'Its tilt of 23.4° is what gives us the seasons.',
    ],
  },
  {
    id: 'mars',
    name: 'Mars',
    kind: 4,
    tagline: 'The red desert with the biggest volcano',
    blurb: 'A cold, dusty world with polar ice caps, canyons and Olympus Mons, three times taller than Everest.',
    accent: '#e0693a',
    radius: 1.2,
    atmosphere: { color: [0.9, 0.55, 0.35], power: 4.0, intensity: 0.7 },
    diameterKm: 6779,
    distanceMkm: 227.9,
    rotationHours: 24.62,
    day: { value: 24.6, unit: 'hours' },
    year: { value: 687, unit: 'days' },
    orbitDays: 687,
    tiltDeg: 25.19,
    gravity: 3.71,
    tempC: -65,
    moons: 2,
    facts: [
      'A day is almost the same as ours: 24 h 37 min.',
      'Its red colour comes from iron oxide, basically rust.',
      'Its two moons, Phobos and Deimos, are tiny potato-shaped rocks.',
    ],
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    kind: 5,
    tagline: 'The giant with a storm older than the telescope',
    blurb: 'More massive than all the other planets together. Its Great Red Spot is wider than Earth.',
    accent: '#d9a066',
    radius: 3.2,
    atmosphere: { color: [1.0, 0.85, 0.65], power: 4.5, intensity: 0.6 },
    diameterKm: 139820,
    distanceMkm: 778.5,
    rotationHours: 9.93,
    day: { value: 9.9, unit: 'hours' },
    year: { value: 11.9, unit: 'years' },
    orbitDays: 4333,
    tiltDeg: 3.13,
    gravity: 24.79,
    tempC: -110,
    moons: 95,
    facts: [
      'The fastest spinner: a full turn in under 10 hours.',
      'Its Great Red Spot has raged for at least 350 years.',
      'It spins so fast that it bulges at the equator.',
    ],
  },
  {
    id: 'saturn',
    name: 'Saturn',
    kind: 6,
    tagline: 'The lord of the rings',
    blurb: 'Its rings are made of billions of pieces of ice and rock, and are only about 10 metres thick.',
    accent: '#e6cf94',
    radius: 2.7,
    ring: 'saturn',
    atmosphere: { color: [1.0, 0.9, 0.65], power: 4.5, intensity: 0.5 },
    diameterKm: 116460,
    distanceMkm: 1432,
    rotationHours: 10.66,
    day: { value: 10.7, unit: 'hours' },
    year: { value: 29.5, unit: 'years' },
    orbitDays: 10759,
    tiltDeg: 26.73,
    gravity: 10.44,
    tempC: -140,
    moons: 146,
    facts: [
      'It is less dense than water: it would float in a big enough bath.',
      'The rings span 280,000 km but are thinner than a stadium is long.',
      'Its moon Titan has rivers and lakes of liquid methane.',
    ],
  },
  {
    id: 'uranus',
    name: 'Uranus',
    kind: 7,
    tagline: 'The ice giant that rolls on its side',
    blurb: 'Tipped over by almost 98°, it orbits the Sun like a rolling ball and spins backwards.',
    accent: '#8fe0e2',
    radius: 2.0,
    ring: 'uranus',
    atmosphere: { color: [0.55, 0.9, 0.92], power: 3.5, intensity: 0.9 },
    diameterKm: 50724,
    distanceMkm: 2867,
    rotationHours: 17.24,
    day: { value: 17.2, unit: 'hours' },
    year: { value: 84, unit: 'years' },
    orbitDays: 30687,
    tiltDeg: 97.77,
    gravity: 8.87,
    tempC: -195,
    moons: 28,
    facts: [
      'Retrograde and lying on its side: its poles take turns facing the Sun for 42 years.',
      'It has 13 faint, narrow rings.',
      'It is the coldest planet, even though Neptune is farther away.',
    ],
  },
  {
    id: 'neptune',
    name: 'Neptune',
    kind: 8,
    tagline: 'The windiest world, at the edge of the system',
    blurb: 'A deep-blue ice giant with supersonic winds. It was found with mathematics before any telescope saw it.',
    accent: '#4a6dff',
    radius: 1.95,
    atmosphere: { color: [0.2, 0.4, 1.0], power: 3.2, intensity: 1.1 },
    diameterKm: 49244,
    distanceMkm: 4515,
    rotationHours: 16.11,
    day: { value: 16.1, unit: 'hours' },
    year: { value: 164.8, unit: 'years' },
    orbitDays: 60190,
    tiltDeg: 28.32,
    gravity: 11.15,
    tempC: -200,
    moons: 16,
    facts: [
      'Winds reach 2,100 km/h, the fastest in the solar system.',
      'It has completed only one orbit since its discovery in 1846.',
      'Its Great Dark Spot appears and vanishes over the years.',
    ],
  },
]

export const getPlanet = (id: string | undefined) => planets.find((p) => p.id === id)

export const isRetrograde = (p: Planet) => p.tiltDeg > 90

// Compressed visual time: one turn of Earth takes 20 s on screen, other planets keep their order
// (Jupiter fastest, Venus slowest) without Mercury and Venus looking frozen.
export const visualSpinSeconds = (hours: number) => 20 * Math.pow(hours / 24, 0.25)
