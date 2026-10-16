import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'

import { dustFrag, dustVert } from './shaders'

type Props = {
  count?: number
  // Stars fill a cylinder around the z axis, from zFar (negative) to zNear.
  zNear?: number
  zFar?: number
  radius?: number
  // Spread the stars on a sphere around the origin instead of along the flight corridor.
  sphere?: boolean
}

// Star field with real depth, so stars slide past at different speeds while the camera flies by.
export function Dust({ count = 2500, zNear = 80, zFar = -320, radius = 90, sphere = false }: Props) {
  const { geometry, material } = useMemo(() => {
    let s = 12345
    const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647)
    const pos = new Float32Array(count * 3)
    const size = new Float32Array(count)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2
      if (sphere) {
        const u = rand() * 2 - 1
        const k = Math.sqrt(1 - u * u)
        const r = radius * (0.5 + rand() * 0.5)
        pos[i * 3] = Math.cos(a) * k * r
        pos[i * 3 + 1] = u * r
        pos[i * 3 + 2] = Math.sin(a) * k * r
      } else {
        const r = 4 + Math.sqrt(rand()) * radius
        pos[i * 3] = Math.cos(a) * r
        pos[i * 3 + 1] = Math.sin(a) * r
        pos[i * 3 + 2] = zFar + rand() * (zNear - zFar)
      }
      size[i] = 0.5 + rand() * rand() * 2.4
      seed[i] = rand()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    const m = new THREE.ShaderMaterial({
      vertexShader: dustVert,
      fragmentShader: dustFrag,
      uniforms: { uTime: { value: 0 }, uPx: { value: Math.min(window.devicePixelRatio, 2) } },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    return { geometry: g, material: m }
  }, [count, zNear, zFar, radius, sphere])

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
  })

  return <points geometry={geometry} material={material} frustumCulled={false} />
}
