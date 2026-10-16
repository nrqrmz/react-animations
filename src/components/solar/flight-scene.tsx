import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useReducedMotion } from 'motion/react'
import { useRef } from 'react'
import * as THREE from 'three'

import { planets } from '@/data/planets'

import { Dust } from './dust'
import { BASE_FOV, fitDistance, heroLayout, stopLayout, viewOffset } from './layout'
import { PlanetBody } from './planet-body'
import { scrollState } from './scroll-state'

export const SPACING = 50

// The camera swerves sideways while passing a planet so it never flies through it.
const swerve = (i: number) => planets[i].radius * (planets[i].ring ? 2.8 : 2) + 5
const smooth = (x: number) => x * x * (3 - 2 * x)
// The camera lingers on each planet and only travels during the middle of each step.
const dwell = (f: number) => smooth(Math.min(1, Math.max(0, (f - 0.2) / 0.6)))

function Rig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const reduce = useReducedMotion()
  const st = useRef({ hero: 0, journey: 0, intro: 0, kick: 0, z: 0, x: 0, px: 0, py: 0 })

  useFrame((state, dt) => {
    const s = st.current
    const { width: w, height: h } = size
    const aspect = w / h
    s.hero = THREE.MathUtils.damp(s.hero, scrollState.hero, 4, dt)
    s.journey = THREE.MathUtils.damp(s.journey, scrollState.journey, 3.2, dt)
    s.intro = THREE.MathUtils.damp(s.intro, 1, 1.1, dt)

    const n = planets.length
    const t = s.journey * (n - 1)
    const i0 = Math.min(Math.floor(t), n - 2)
    const e = dwell(t - i0)
    const stopZ = (i: number) => -i * SPACING + fitDistance(planets[i], aspect)
    const z0 = THREE.MathUtils.lerp(stopZ(i0), stopZ(i0 + 1), e)
    const x0 = swerve(i0) * Math.sin(Math.PI * e)

    // Title screen: start far away and slowly fall towards the Sun.
    const heroEase = smooth(s.hero)
    const introEase = 1 - Math.pow(1 - s.intro, 3)
    const far = fitDistance(planets[0], aspect)
    const z = z0 + (1 - heroEase) * far * 1.3 + (1 - introEase) * far * 0.9

    const vz = Math.abs(z - s.z) / Math.max(dt, 1e-3)
    s.z = z
    s.kick = THREE.MathUtils.damp(s.kick, reduce ? 0 : Math.min(1, vz / 90) * 16, 6, dt)

    s.px = THREE.MathUtils.damp(s.px, reduce ? 0 : state.pointer.x, 3, dt)
    s.py = THREE.MathUtils.damp(s.py, reduce ? 0 : state.pointer.y, 3, dt)
    camera.position.set(x0 + s.px * 0.8, s.py * 0.5, z)
    camera.rotation.set(s.py * 0.01, -s.px * 0.015, 0)
    camera.fov = BASE_FOV + s.kick

    const a = stopLayout(aspect)
    const b = heroLayout(aspect)
    const cx = THREE.MathUtils.lerp(b.cx, a.cx, heroEase)
    const cy = THREE.MathUtils.lerp(b.cy, a.cy, heroEase)
    const o = viewOffset(w, h, cx, cy)
    camera.setViewOffset(w, h, o.x, o.y, w, h)
  })
  return null
}

export default function FlightScene({ active }: { active: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: BASE_FOV, near: 0.1, far: 900, position: [0, 0, 60] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#000000']} />
      <Rig />
      <SceneContent />
    </Canvas>
  )
}

function SceneContent() {
  const small = useThree((s) => s.size.width < 768)
  const segments = small ? 72 : 128
  const groups = useRef<(THREE.Group | null)[]>([])

  // Only planets near the current stop are drawn: the title screen shows just the Sun.
  useFrame(() => {
    const t = scrollState.journey * (planets.length - 1)
    const onTitle = scrollState.hero < 0.98
    groups.current.forEach((g, i) => {
      if (g) g.visible = onTitle ? i === 0 : Math.abs(i - t) < 1.7
    })
  })

  return (
    <>
      <Dust count={small ? 1500 : 3000} zNear={80} zFar={-(planets.length - 1) * SPACING - 160} radius={110} />
      {planets.map((p, i) => (
        <group
          key={p.id}
          ref={(g) => {
            groups.current[i] = g
          }}
          position={[0, 0, -i * SPACING]}
        >
          <PlanetBody planet={p} segments={segments} />
        </group>
      ))}
    </>
  )
}
