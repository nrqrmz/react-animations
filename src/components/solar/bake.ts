import { useThree } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import * as THREE from 'three'

import type { Planet } from '@/data/planets'

import { bakeFrag, bakeVert, coronaBakeFrag, ringBakeFrag } from './shaders'

// Painting the planets once, into textures, is what keeps this scene light: the expensive procedural
// code runs a single time (a strip per frame, so the page never stalls) and every later frame just
// reads the result. See "Performance rules" in CLAUDE.md.

export type Baked = {
  map: THREE.Texture // rgb = albedo, a = specular mask (Earth)
  aux: THREE.Texture | null // rg = slope, b = night lights, a = clouds (Earth)
  ringTex: THREE.Texture | null // 1D ring profile: rgb colour, a opacity
}

export const RING_RANGE = { saturn: [1.25, 2.35], uranus: [1.55, 2.05] } as const

const STRIPS = 8

type Slot = { chain: Promise<unknown>; busy: number; bodies: Map<string, Promise<Baked>>; corona?: Promise<THREE.Texture> }
const slots = new WeakMap<THREE.WebGLRenderer, Slot>()
const slotOf = (gl: THREE.WebGLRenderer) => {
  let s = slots.get(gl)
  if (!s) slots.set(gl, (s = { chain: Promise.resolve(), busy: 0, bodies: new Map() }))
  return s
}

// True while textures are being painted, so frame-time measurements can ignore that burst.
export const isBaking = (gl: THREE.WebGLRenderer) => slotOf(gl).busy > 0

// Software renderers (SwiftShader, llvmpipe, Microsoft Basic Render Driver) run on the CPU.
export function isSoftwareRenderer(gl: THREE.WebGLRenderer) {
  try {
    const ctx = gl.getContext()
    const info = ctx.getExtension('WEBGL_debug_renderer_info')
    const name = info ? String(ctx.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
    return /swiftshader|llvmpipe|software|basic render/i.test(name)
  } catch {
    return false
  }
}

// Checked once, before the real canvas exists (antialiasing can only be chosen when a canvas is created).
let softwareProbe: boolean | undefined
export function usesSoftwareRendering() {
  if (softwareProbe === undefined) {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2')
      const info = gl?.getExtension('WEBGL_debug_renderer_info')
      const name = gl && info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
      softwareProbe = /swiftshader|llvmpipe|software|basic render/i.test(name)
      gl?.getExtension('WEBGL_lose_context')?.loseContext()
    } catch {
      softwareProbe = false
    }
  }
  return softwareProbe
}

const textureScale = (gl: THREE.WebGLRenderer) =>
  isSoftwareRenderer(gl) || gl.capabilities.maxTextureSize < 4096 ? 0.5 : 1

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()))

// Paints a full-screen program into a texture, one horizontal strip per animation frame.
async function paint(
  gl: THREE.WebGLRenderer,
  fragmentShader: string,
  uniforms: Record<string, THREE.IUniform>,
  w: number,
  h: number,
  mip: boolean,
): Promise<THREE.Texture> {
  const material = new THREE.ShaderMaterial({ vertexShader: bakeVert, fragmentShader, uniforms, depthTest: false, depthWrite: false })
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
  quad.frustumCulled = false
  const scene = new THREE.Scene()
  scene.add(quad)
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const target = new THREE.WebGLRenderTarget(w, h, {
    type: THREE.UnsignedByteType,
    depthBuffer: false,
    generateMipmaps: mip,
    minFilter: mip ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: mip ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping,
    anisotropy: mip ? 4 : 1,
  })

  // Compile on worker threads where the browser supports it, so a big program cannot freeze the page.
  try {
    await gl.compileAsync(scene, camera)
  } catch {
    /* compiled synchronously on first render instead */
  }

  const strips = h > 1 ? STRIPS : 1
  const stripH = Math.ceil(h / strips)
  for (let i = 0; i < strips; i++) {
    await nextFrame()
    if (gl.getContext().isContextLost()) throw new Error('GL context lost')
    const prevTarget = gl.getRenderTarget()
    const prevAuto = gl.autoClear
    gl.autoClear = false
    target.scissorTest = strips > 1
    target.scissor.set(0, i * stripH, w, stripH)
    gl.setRenderTarget(target)
    gl.render(scene, camera)
    gl.setRenderTarget(prevTarget)
    gl.autoClear = prevAuto
  }
  material.dispose()
  quad.geometry.dispose()
  return target.texture
}

function enqueue<T>(gl: THREE.WebGLRenderer, job: () => Promise<T>): Promise<T> {
  const s = slotOf(gl)
  s.busy++
  const run = s.chain.then(job)
  s.chain = run.then(
    () => void s.busy--,
    () => void s.busy--,
  )
  return run
}

function bakeBody(gl: THREE.WebGLRenderer, planet: Planet): Promise<Baked> {
  const s = slotOf(gl)
  let p = s.bodies.get(planet.id)
  if (!p) {
    p = enqueue(gl, async () => {
      const bumpy = planet.kind === 1 || planet.kind === 3 || planet.kind === 4
      const size = Math.round((bumpy ? 2048 : 1024) * textureScale(gl))
      const map = await paint(gl, bakeFrag(planet.kind, 0), {}, size, size / 2, true)
      const aux = bumpy ? await paint(gl, bakeFrag(planet.kind, 1), {}, size, size / 2, true) : null
      let ringTex: THREE.Texture | null = null
      if (planet.ring) {
        const r = RING_RANGE[planet.ring]
        ringTex = await paint(
          gl,
          ringBakeFrag,
          { uRing: { value: new THREE.Vector2(r[0], r[1]) }, uRingKind: { value: planet.ring === 'saturn' ? 1 : 2 } },
          4096,
          1,
          false,
        )
      }
      return { map, aux, ringTex }
    })
    s.bodies.set(planet.id, p)
  }
  return p
}

function bakeCorona(gl: THREE.WebGLRenderer): Promise<THREE.Texture> {
  const s = slotOf(gl)
  s.corona ??= enqueue(gl, () => paint(gl, coronaBakeFrag, {}, Math.round(512 * textureScale(gl) * 2), Math.round(512 * textureScale(gl) * 2), false))
  return s.corona
}

// Returns the painted textures for a planet, or null while they are still being painted.
export function useBaked(planet: Planet): Baked | null {
  const gl = useThree((s) => s.gl)
  const [baked, setBaked] = useState<Baked | null>(null)
  useEffect(() => {
    let live = true
    bakeBody(gl, planet)
      .then((b) => live && setBaked(b))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [gl, planet])
  return baked
}

export function useCoronaTexture(): THREE.Texture | null {
  const gl = useThree((s) => s.gl)
  const [tex, setTex] = useState<THREE.Texture | null>(null)
  useEffect(() => {
    let live = true
    bakeCorona(gl)
      .then((t) => live && setTex(t))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [gl])
  return tex
}
