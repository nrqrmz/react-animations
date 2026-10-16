import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useReducedMotion } from 'motion/react'
import { useMemo } from 'react'
import * as THREE from 'three'

import type { Planet } from '@/data/planets'

import { Dust } from './dust'
import { BASE_FOV, fitDistance, stopLayout, viewOffset } from './layout'
import { PlanetBody } from './planet-body'

function Rig({ planet }: { planet: Planet }) {
  const size = useThree((s) => s.size)
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const intro = useMemo(() => ({ k: 0 }), [])
  const aspect = size.width / size.height
  const dist = fitDistance(planet, aspect)

  useFrame((_, dt) => {
    intro.k = THREE.MathUtils.damp(intro.k, 1, 2.2, dt)
    // Fly in from afar the first time the planet appears.
    const dir = camera.position.length() > 0.001 ? camera.position.clone().normalize() : new THREE.Vector3(0, 0, 1)
    camera.position.copy(dir.multiplyScalar(dist * (1 + (1 - intro.k) * 1.2)))
    const { cx, cy } = stopLayout(aspect)
    const o = viewOffset(size.width, size.height, cx, cy)
    camera.setViewOffset(size.width, size.height, o.x, o.y, size.width, size.height)
  })
  return null
}

// Full-screen 3D view of a single planet that you can drag to look around.
export default function PlanetStage({ planet }: { planet: Planet }) {
  const reduce = useReducedMotion()
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: BASE_FOV, near: 0.1, far: 900, position: [0, 0.2, 60] }}
      gl={{ antialias: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#000000']} />
      <Dust count={1800} radius={160} sphere />
      <Rig planet={planet} />
      <PlanetBody key={planet.id} planet={planet} segments={160} speed={reduce ? 0.4 : 1} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.6}
        minPolarAngle={Math.PI * 0.25}
        maxPolarAngle={Math.PI * 0.75}
      />
    </Canvas>
  )
}
