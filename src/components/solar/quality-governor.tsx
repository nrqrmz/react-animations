import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'

import { isBaking, isSoftwareRenderer } from './bake'

const MAX_DPR = 1.25
const SLOW_FRAME = 0.028 // seconds (about 36 fps)

// Keeps the page responsive on weak graphics: starts at a modest resolution and, if frames
// stay slow, keeps lowering the resolution instead of freezing the browser.
export function QualityGovernor() {
  const gl = useThree((s) => s.gl)
  const setDpr = useThree((s) => s.setDpr)
  const s = useRef({ dpr: Math.min(window.devicePixelRatio, MAX_DPR), acc: 0, n: 0, skip: 90 })

  useEffect(() => {
    if (isSoftwareRenderer(gl)) s.current.dpr = 0.5
    setDpr(s.current.dpr)
  }, [gl, setDpr])

  useFrame((_, dt) => {
    const q = s.current
    // Ignore the burst of work while planets are being painted, and the first frames after a change.
    if (isBaking(gl) || q.skip > 0) {
      q.skip = Math.max(0, q.skip - 1)
      q.acc = 0
      q.n = 0
      return
    }
    q.acc += dt
    if (++q.n < 45) return
    const avg = q.acc / q.n
    q.acc = 0
    q.n = 0
    if (avg > SLOW_FRAME && q.dpr > 0.6) {
      q.dpr = Math.max(0.6, q.dpr - 0.2)
      setDpr(q.dpr)
      q.skip = 60
    }
  })
  return null
}
