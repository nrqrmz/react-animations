import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

import { visualSpinSeconds, type Planet } from '@/data/planets'

import { RING_RANGE, useBaked, useCoronaTexture, type Baked } from './bake'
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

type Props = {
  planet: Planet
  segments?: number
  // Multiplier on the spin speed (1 = the compressed real-time speed).
  speed?: number
}

// A planet: its surface is painted once into textures (bake.ts); here we only light and spin it.
// Tilted axis, real spin direction, atmosphere glow and rings. Fades in when its textures are ready.
export function PlanetBody({ planet, segments = 96, speed = 1 }: Props) {
  const baked = useBaked(planet)
  const corona = useCoronaTexture()
  if (!baked) return null
  return <Ready planet={planet} baked={baked} corona={planet.kind === 0 ? corona : null} segments={segments} speed={speed} />
}

type ReadyProps = Props & { baked: Baked; corona: THREE.Texture | null }

function Ready({ planet, baked, corona, segments = 96, speed = 1 }: ReadyProps) {
  const tilt = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Mesh>(null)
  const R = planet.radius
  const fade = useMemo(() => ({ value: 0 }), [])

  const material = useMemo(() => {
    const ring = planet.ring ? RING_RANGE[planet.ring] : [0, 0]
    return new THREE.ShaderMaterial({
      vertexShader: planetVert,
      fragmentShader: planetFrag,
      uniforms: {
        uKind: { value: planet.kind },
        uTime: { value: 0 },
        uFade: fade,
        uLight: { value: LIGHT },
        uCenter: { value: new THREE.Vector3() },
        uRingN: { value: new THREE.Vector3(0, 1, 0) },
        uRing: { value: new THREE.Vector2(ring[0], ring[1]) },
        uRingKind: { value: planet.ring === 'saturn' ? 1 : planet.ring === 'uranus' ? 2 : 0 },
        uRadius: { value: R },
        uMap: { value: baked.map },
        uAux: { value: baked.aux ?? baked.map },
        uRingTex: { value: baked.ringTex ?? baked.map },
      },
    })
  }, [planet, R, baked, fade])

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
        uFade: fade,
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }, [planet, fade])

  const ringMaterial = useMemo(() => {
    if (!planet.ring || !baked.ringTex) return null
    const range = RING_RANGE[planet.ring]
    return new THREE.ShaderMaterial({
      vertexShader: ringVert,
      fragmentShader: ringFrag,
      uniforms: {
        uLight: { value: new THREE.Vector3() },
        uRing: { value: new THREE.Vector2(range[0], range[1]) },
        uRadius: { value: R },
        uFade: fade,
        uRingTex: { value: baked.ringTex },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  }, [planet, R, baked, fade])

  const ringGeometry = useMemo(() => {
    if (!planet.ring) return null
    const range = RING_RANGE[planet.ring]
    const g = new THREE.RingGeometry(range[0] * R, range[1] * R, 128, 1)
    g.rotateX(-Math.PI / 2) // lay the ring in the planet's equatorial plane
    return g
  }, [planet, R])

  const tmp = useMemo(() => ({ q: new THREE.Quaternion() }), [])
  // Spinning about the tilted axis gives the real direction: above 90° of tilt the planet is retrograde.
  const omega = (Math.PI * 2) / visualSpinSeconds(planet.rotationHours)

  useFrame((state, dt) => {
    fade.value = Math.min(1, fade.value + dt / 0.9)
    if (spin.current) spin.current.rotation.y += omega * dt * speed
    material.uniforms.uTime.value = state.clock.elapsedTime
    if (tilt.current && planet.ring) {
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
      {corona && <Corona radius={R} texture={corona} fade={fade} />}
      <group ref={tilt} rotation={[VIEW_PITCH, VIEW_YAW, (planet.tiltDeg * Math.PI) / 180]}>
        <mesh ref={spin} material={material}>
          <sphereGeometry args={[R, segments, segments]} />
        </mesh>
        {atmosphere && (
          <mesh material={atmosphere}>
            <sphereGeometry args={[R * 1.045, 48, 48]} />
          </mesh>
        )}
        {ringMaterial && ringGeometry && <mesh geometry={ringGeometry} material={ringMaterial} />}
      </group>
    </>
  )
}

// Soft glow and rays around the Sun (painted once); always faces the camera and turns slowly.
function Corona({ radius, texture, fade }: { radius: number; texture: THREE.Texture; fade: { value: number } }) {
  const mesh = useRef<THREE.Mesh>(null)
  const spinQ = useMemo(() => new THREE.Quaternion(), [])
  const axis = useMemo(() => new THREE.Vector3(0, 0, 1), [])
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: coronaVert,
        fragmentShader: coronaFrag,
        uniforms: { uMap: { value: texture }, uFade: fade },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [texture, fade],
  )
  useFrame((state) => {
    if (!mesh.current) return
    mesh.current.quaternion.copy(state.camera.quaternion)
    mesh.current.quaternion.multiply(spinQ.setFromAxisAngle(axis, state.clock.elapsedTime * 0.03))
  })
  return (
    <mesh ref={mesh} material={material} scale={radius * 7}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  )
}
