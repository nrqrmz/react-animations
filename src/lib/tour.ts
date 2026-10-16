// Geometry of the planet tour: where each planet sits in the page scroll.

// Scroll distance between two planets, as a fraction of the screen height. Short on purpose:
// one comfortable swipe or a few wheel notches should be enough to reach the next planet.
export const STEP = 0.7

// Height of the tour section, in svh, for `n` stops.
export const journeyHeightSvh = (n: number) => (n - 1) * STEP * 100 + 100

// Page scroll position (px) at which stop `i` is centred. Stop 0 is where the tour section starts.
export function stopScrollTop(section: HTMLElement, i: number) {
  return section.getBoundingClientRect().top + window.scrollY + i * STEP * window.innerHeight
}

// Position of the page in "stops" (0 = first planet, n - 1 = last), as a decimal. Can be negative
// above the tour (title screen) or larger than n - 1 below it.
export function stopPosition(section: HTMLElement) {
  const top = section.getBoundingClientRect().top + window.scrollY
  return (window.scrollY - top) / (STEP * window.innerHeight)
}
