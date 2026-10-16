import { animate, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'

// Counts from 0 up to `value` every time `value` changes (or the component mounts).
export function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(reduce ? value : 0)

  useEffect(() => {
    if (reduce) return
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: setShown,
    })
    return () => controls.stop()
  }, [value, reduce])

  return <>{(reduce ? value : shown).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>
}
