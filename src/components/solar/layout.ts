import type { Planet } from '@/data/planets'

export const BASE_FOV = 40
const TAN = Math.tan((BASE_FOV * Math.PI) / 360)

// Where the planet sits on screen: cx/cy are fractions of the viewport (0.5 = centre).
export function stopLayout(aspect: number) {
  const wide = aspect >= 1.15
  return { cx: wide ? 0.68 : 0.5, cy: wide ? 0.5 : 0.33 }
}

export function heroLayout(aspect: number) {
  const wide = aspect >= 1.15
  return { cx: wide ? 0.74 : 0.5, cy: wide ? 0.62 : 0.74 }
}

// Distance from the planet at which it fills the frame nicely on any aspect ratio.
export function fitDistance(planet: Planet, aspect: number) {
  const { cx } = stopLayout(aspect)
  // Bigger bodies fill a little more of the screen, so scale is hinted without losing the composition.
  const frac = 0.55 * (0.6 + 0.4 * Math.sqrt(Math.min(planet.radius, 3.2) / 3.2))
  const byHeight = planet.radius / (frac * TAN)
  const half = Math.min(cx, 1 - cx) * 0.95
  const wide = planet.ring ? 1.5 : 1
  const byWidth = (planet.radius * wide) / (half * aspect * TAN)
  return Math.max(byHeight, byWidth)
}

// Offsets for camera.setViewOffset: slides the whole picture so the planet lands on (cx, cy).
export function viewOffset(w: number, h: number, cx: number, cy: number) {
  return { x: -(cx - 0.5) * w, y: -(cy - 0.5) * h }
}
