import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

import { isRetrograde, visualSpinSeconds, type Planet } from '@/data/planets'

import {
  atmosphereFrag,
  atmosphereVert,
  coronaFrag,
  coronaVert,
  planetFrag,
  planetVert,
  ringFrag,
  ringVert,
} from './shaders'

// Direction towards the light, in world space: it hits the planet from the upper left.
export const LIGHT = new THREE.Vector3(-0.85, 0.32, 0.5).normalize()

// A gentle viewing angle (pitch toward the viewer, small yaw) so rings open up instead of showing edge-on.
const VIEW_PITCH = 0.42
const VIEW_YAW = -0.6

const RING_RANGE = { saturn: [1.25, 2.35], uranus: [1.55, 2.05] } as const

type Props = {
  planet: Planet
  segments?: number
  // Multiplier on the spin speed (1 = the compressed real-time speed).
  speed?: number
}

// A procedural planet: tilted axis, real spin direction, atmosphere glow and rings.
export function PlanetBody({ planet, segments = 128, speed = 1 }: Props) {
  const tilt = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Mesh>(null)
  const R = planet.radius

  const material = useMemo(() => {
    const ring = planet.ring ? RING_RANGE[planet.ring] : [0, 0]
    return new THREE.ShaderMaterial({
      vertexShader: planetVert,
      fragmentShader: planetFrag,
      uniforms: {
        uKind: { value: planet.kind },
        uTime: { value: 0 },
        uLight: { value: LIGHT },
        uCenter: { value: new THREE.Vector3() },
        uRingN: { value: new THREE.Vector3(0, 1, 0) },
        uRing: { value: new THREE.Vector2(ring[0], ring[1]) },
        uRingKind: { value: planet.ring === 'saturn' ? 1 : planet.ring === 'uranus' ? 2 : 0 },
        uRadius: { value: R },
      },
    })
  }, [planet, R])

  const atmosphere = useMemo(() => {
    if (!planet.atmosphere) return null
    const { color, power, intensity } = planet.atmosphere
    return new THREE.ShaderMaterial({
      vertexShader: atmosphereVert,
      fragmentShader: atmosphereFrag,
      uniforms: {
        uColor: { value: new THREE.Vector3(...color) },
        uLight: { value: LIGHT },
        uPower: { value: power },
        uIntensity: { value: intensity },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }, [planet])

  const ringMaterial = useMemo(() => {
    if (!planet.ring) return null
    const range = RING_RANGE[planet.ring]
    return new THREE.ShaderMaterial({
      vertexShader: ringVert,
      fragmentShader: ringFrag,
      uniforms: {
        uLight: { value: new THREE.Vector3() },
        uRing: { value: new THREE.Vector2(range[0], range[1]) },
        uRingKind: { value: planet.ring === 'saturn' ? 1 : 2 },
        uRadius: { value: R },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  }, [planet, R])

  const ringGeometry = useMemo(() => {
    if (!planet.ring) return null
    const range = RING_RANGE[planet.ring]
    const g = new THREE.RingGeometry(range[0] * R, range[1] * R, 192, 1)
    g.rotateX(-Math.PI / 2) // lay the ring in the planet's equatorial plane
    return g
  }, [planet, R])

  const tmp = useMemo(() => ({ q: new THREE.Quaternion(), v: new THREE.Vector3() }), [])
  // Spinning about the tilted axis gives the real direction: above 90° of tilt the planet is retrograde.
  const omega = (Math.PI * 2) / visualSpinSeconds(planet.rotationHours)

  useFrame((state, dt) => {
    if (spin.current) spin.current.rotation.y += omega * dt * speed
    material.uniforms.uTime.value = state.clock.elapsedTime
    if (tilt.current) {
      tilt.current.getWorldPosition(material.uniforms.uCenter.value)
      tilt.current.getWorldQuaternion(tmp.q)
      material.uniforms.uRingN.value.set(0, 1, 0).applyQuaternion(tmp.q)
      if (ringMaterial) {
        tmp.q.invert()
        ringMaterial.uniforms.uLight.value.copy(LIGHT).applyQuaternion(tmp.q)
      }
    }
  })

  return (
    <>
      {planet.kind === 0 && <Corona radius={R} />}
      <group ref={tilt} rotation={[VIEW_PITCH, VIEW_YAW, (planet.tiltDeg * Math.PI) / 180]}>
        <mesh ref={spin} material={material}>
          <sphereGeometry args={[R, segments, segments]} />
        </mesh>
        {atmosphere && (
          <mesh material={atmosphere}>
            <sphereGeometry args={[R * 1.045, 64, 64]} />
          </mesh>
        )}
        {ringMaterial && ringGeometry && <mesh geometry={ringGeometry} material={ringMaterial} />}
      </group>
    </>
  )
}

export { isRetrograde }

// Soft glow and rays around the Sun; always faces the camera.
function Corona({ radius }: { radius: number }) {
  const mesh = useRef<THREE.Mesh>(null)
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: coronaVert,
        fragmentShader: coronaFrag,
        uniforms: { uTime: { value: 0 } },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  )
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
    mesh.current?.quaternion.copy(state.camera.quaternion)
  })
  return (
    <mesh ref={mesh} material={material} scale={radius * 7}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  )
}
