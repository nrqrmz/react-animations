// GLSL for the solar system.
//
// Performance rule: nothing procedural runs every frame. Each surface is painted ONCE into a texture
// (see bake.ts) with the small "bake" programs below, and the per-frame shader only reads it.
//
// Planet kinds: 0 Sun, 1 Mercury, 2 Venus, 3 Earth, 4 Mars, 5 Jupiter, 6 Saturn, 7 Uranus, 8 Neptune.

const noise = /* glsl */ `
const float PI = 3.14159265;

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}
vec3 hash33(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
  return fract(sin(p) * 43758.5453123);
}
float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash13(i), hash13(i + vec3(1, 0, 0)), f.x), mix(hash13(i + vec3(0, 1, 0)), hash13(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0, 0, 1)), hash13(i + vec3(1, 0, 1)), f.x), mix(hash13(i + vec3(0, 1, 1)), hash13(i + vec3(1, 1, 1)), f.x), f.y),
    f.z
  );
}
float fbm(vec3 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 5; i++) {
    s += a * vnoise(p);
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    a *= 0.5;
  }
  return s;
}
// Worley noise with a single 8-iteration loop (the 2x2x2 block next to p).
// x = distance to the nearest feature point, y = random id of its cell.
vec2 voro(vec3 p) {
  vec3 b = floor(p - 0.5);
  float d = 8.0;
  float id = 0.0;
  for (int k = 0; k < 8; k++) {
    vec3 c = b + vec3(float(k & 1), float((k >> 1) & 1), float((k >> 2) & 1));
    vec3 r = c + hash33(c) * 0.6 + 0.2 - p;
    float dd = dot(r, r);
    if (dd < d) {
      d = dd;
      id = hash13(c + 7.0);
    }
  }
  return vec2(sqrt(d), id);
}
// Crater field: negative bowls with raised rims.
float craters(vec3 p, float scale) {
  vec2 v = voro(p * scale);
  float R = v.y > 0.4 ? 0.12 + 0.3 * v.y : 0.0;
  if (R <= 0.0) return 0.0;
  float d = v.x;
  float bowl = d < R ? -(1.0 - (d * d) / (R * R)) * 0.8 : 0.0;
  float rim = exp(-pow((d - R) / 0.05, 2.0)) * 0.35;
  return bowl + rim;
}
float wrapA(float a) { return mod(a + PI, 2.0 * PI) - PI; }
// Local "east" direction on the unit sphere (same definition when baking and when shading).
vec3 eastOf(vec3 p) { return normalize(vec3(p.z, 0.0, -p.x) + vec3(1e-4, 0.0, 0.0)); }
`

// ---------------------------------------------------------------- baking (runs once per planet)

export const bakeVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const bakeHead = /* glsl */ `
varying vec2 vUv;
${noise}
// Equirectangular texel -> point on the unit sphere. Mirrors sphereUv() in the planet shader.
vec3 dirFromUv(vec2 uv) {
  float lon = (uv.x - 0.5) * 2.0 * PI;
  float lat = (uv.y - 0.5) * PI;
  return vec3(cos(lat) * cos(lon), sin(lat), cos(lat) * sin(lon));
}
// Packs the terrain slope (tangent plane, already scaled by the bump strength) into two 0..1 channels.
vec2 packSlope(float h0, float hx, float hy, float hz, vec3 p, float bump) {
  float e = 0.004;
  vec3 g = vec3(hx - h0, hy - h0, hz - h0) / e;
  vec3 gt = g - dot(g, p) * p;
  vec3 Te = eastOf(p);
  vec3 Tn = cross(p, Te);
  vec2 s = vec2(dot(gt, Te), dot(gt, Tn)) * bump;
  return clamp(s / 4.0, -0.5, 0.5) + 0.5;
}
`

// Per-kind surface code. Each defines colorPass(p) (rgb = albedo, a = specular mask on Earth)
// and, for the bumpy bodies, auxPass(p) (rg = slope, b = night lights, a = clouds on Earth).
const bodies: Record<number, string> = {
  0: /* glsl */ `
vec4 colorPass(vec3 p) { // Sun granulation and sunspots
  vec2 v = voro(p * 12.0);
  float g = 1.0 - smoothstep(0.0, 1.0, v.x);
  float f = fbm(p * 3.0);
  float spots = smoothstep(0.64, 0.74, fbm(p * 2.3 + 7.0));
  vec3 c = mix(vec3(1.0, 0.3, 0.03), vec3(1.0, 0.68, 0.16), g * 0.35 + f * 0.75);
  c = mix(c, vec3(1.0, 0.92, 0.65), pow(g, 2.0) * 0.22);
  c *= 1.0 - spots * 0.7;
  return vec4(c, 1.0);
}`,
  1: /* glsl */ `
float heightAt(vec3 p) { return fbm(p * 4.0) * 0.35 + craters(p, 5.0) * 0.5 + craters(p, 13.0) * 0.3; }
vec4 colorPass(vec3 p) { // Mercury
  float c13 = craters(p, 13.0);
  float h = fbm(p * 4.0) * 0.35 + craters(p, 5.0) * 0.5 + c13 * 0.3;
  vec3 col = mix(vec3(0.3, 0.28, 0.26), vec3(0.62, 0.58, 0.54), fbm(p * 3.0 + 3.0));
  col *= 0.8 + 0.5 * h;
  col = mix(col, vec3(0.75, 0.72, 0.68), smoothstep(0.25, 0.6, c13) * 0.5);
  return vec4(col, 0.0);
}
vec4 auxPass(vec3 p) {
  float e = 0.004;
  vec2 s = packSlope(heightAt(p), heightAt(p + vec3(e, 0.0, 0.0)), heightAt(p + vec3(0.0, e, 0.0)), heightAt(p + vec3(0.0, 0.0, e)), p, 0.14);
  return vec4(s, 0.0, 0.0);
}`,
  2: /* glsl */ `
vec4 colorPass(vec3 p) { // Venus: swirling sulphuric clouds
  vec3 q = p * 1.6;
  vec3 w = vec3(fbm(q), fbm(q + 5.2), fbm(q + 8.1));
  float f = fbm(q * 2.0 + w * 2.4);
  float bands = sin(p.y * 10.0 + f * 3.5) * 0.5 + 0.5;
  vec3 col = mix(vec3(0.6, 0.36, 0.13), vec3(0.97, 0.86, 0.58), f * 0.8 + bands * 0.35);
  col = mix(col, vec3(1.0, 0.95, 0.8), smoothstep(0.6, 0.9, f) * 0.35);
  return vec4(col, 0.0);
}`,
  3: /* glsl */ `
float landE(vec3 p) { return fbm(p * 2.2 + vec3(3.0, 1.0, 7.0)) + 0.12 * fbm(p * 8.0); }
float heightAt(vec3 p) {
  float e = landE(p);
  return smoothstep(0.5, 0.52, e) * max(e - 0.5, 0.0) * 1.2;
}
float iceAt(vec3 p) { return smoothstep(0.82, 0.9, abs(p.y) + (fbm(p * 6.0) - 0.5) * 0.15); }
vec4 colorPass(vec3 p) { // Earth without clouds
  float e = landE(p);
  float land = smoothstep(0.5, 0.52, e);
  vec3 ocean = mix(vec3(0.01, 0.05, 0.2), vec3(0.03, 0.22, 0.42), smoothstep(0.34, 0.5, e));
  float lat = abs(p.y);
  float moist = fbm(p * 3.0 + 11.0);
  float desert = smoothstep(0.5, 0.65, moist) * (1.0 - abs(lat - 0.3) * 2.0);
  vec3 ground = mix(vec3(0.1, 0.3, 0.07), vec3(0.58, 0.47, 0.26), clamp(desert, 0.0, 1.0));
  ground = mix(ground, vec3(0.42, 0.38, 0.33), smoothstep(0.62, 0.75, e));
  ground = mix(ground, vec3(0.95), smoothstep(0.78, 0.9, e));
  vec3 col = mix(ocean, ground, land);
  float ice = iceAt(p);
  col = mix(col, vec3(0.95, 0.97, 1.0), ice);
  return vec4(col, (1.0 - land) * (1.0 - ice) * 0.9);
}
vec4 auxPass(vec3 p) {
  float e = 0.004;
  vec2 s = packSlope(heightAt(p), heightAt(p + vec3(e, 0.0, 0.0)), heightAt(p + vec3(0.0, e, 0.0)), heightAt(p + vec3(0.0, 0.0, e)), p, 0.5);
  float land = smoothstep(0.5, 0.52, landE(p));
  float night = land * smoothstep(0.55, 0.8, fbm(p * 14.0)) * (1.0 - iceAt(p));
  float cloud = smoothstep(0.5, 0.78, fbm(p * 3.5 + fbm(p * 2.0) * 0.8));
  return vec4(s, night, cloud);
}`,
  4: /* glsl */ `
float heightAt(vec3 p) { return fbm(p * 5.0) * 0.4 + craters(p, 6.0) * 0.35; }
vec4 colorPass(vec3 p) { // Mars
  float m = fbm(p * 2.5);
  float dark = smoothstep(0.45, 0.6, fbm(p * 1.8 + 4.0));
  vec3 col = mix(vec3(0.55, 0.24, 0.1), vec3(0.8, 0.43, 0.2), m);
  col = mix(col, vec3(0.24, 0.1, 0.06), dark * 0.55);
  float lon = atan(p.z, p.x);
  float canyon = smoothstep(0.035, 0.0, abs(p.y + 0.08 + 0.05 * sin(lon * 5.0))) * smoothstep(-0.2, 0.4, sin(lon));
  col = mix(col, vec3(0.2, 0.08, 0.05), canyon * 0.7);
  float cap = smoothstep(0.88, 0.93, abs(p.y) + (fbm(p * 8.0) - 0.5) * 0.06);
  col = mix(col, vec3(0.93, 0.9, 0.87), cap);
  col *= 0.85 + 0.4 * heightAt(p);
  return vec4(col, 0.0);
}
vec4 auxPass(vec3 p) {
  float e = 0.004;
  vec2 s = packSlope(heightAt(p), heightAt(p + vec3(e, 0.0, 0.0)), heightAt(p + vec3(0.0, e, 0.0)), heightAt(p + vec3(0.0, 0.0, e)), p, 0.14);
  return vec4(s, 0.0, 0.0);
}`,
  5: /* glsl */ `
vec4 colorPass(vec3 p) { // Jupiter: bands and the Great Red Spot
  float warp = fbm(p * vec3(2.0, 6.0, 2.0));
  float band = p.y * 9.0 + warp * 1.1;
  float b1 = sin(band * 3.14159) * 0.5 + 0.5;
  float b2 = fbm(vec3(p.x * 6.0, p.y * 30.0 + warp * 3.0, p.z * 6.0));
  vec3 cream = vec3(0.93, 0.84, 0.7);
  vec3 tanC = vec3(0.78, 0.58, 0.38);
  vec3 rust = vec3(0.6, 0.32, 0.2);
  vec3 col = mix(cream, tanC, b1);
  col = mix(col, rust, smoothstep(0.55, 0.8, b2) * 0.5 * (1.0 - b1));
  col = mix(col, vec3(0.96, 0.93, 0.88), smoothstep(0.6, 0.9, fbm(p * vec3(10.0, 40.0, 10.0))) * 0.25);
  float lon = atan(p.z, p.x);
  vec2 g = vec2(wrapA(lon - 2.2) * 0.95 / 0.3, (p.y + 0.28) / 0.1);
  float e = length(g);
  float spot = smoothstep(1.0, 0.55, e);
  float swirl = fbm(vec3(g * 1.5, 0.5));
  col = mix(col, mix(vec3(0.62, 0.2, 0.12), vec3(0.85, 0.42, 0.28), swirl), spot);
  col = mix(col, vec3(0.9, 0.8, 0.7), smoothstep(1.15, 1.0, e) * smoothstep(0.85, 1.05, e) * 0.35);
  return vec4(col, 0.0);
}`,
  6: /* glsl */ `
vec4 colorPass(vec3 p) { // Saturn
  float warp = fbm(p * vec3(2.0, 8.0, 2.0));
  float b = sin(p.y * 22.0 + warp * 2.5) * 0.5 + 0.5;
  vec3 col = mix(vec3(0.8, 0.67, 0.43), vec3(0.94, 0.85, 0.63), b * 0.7 + warp * 0.3);
  col = mix(col, vec3(0.6, 0.5, 0.35), smoothstep(0.82, 1.0, abs(p.y)) * 0.5);
  col *= 0.92 + 0.14 * fbm(p * vec3(8.0, 30.0, 8.0));
  return vec4(col, 0.0);
}`,
  7: /* glsl */ `
vec4 colorPass(vec3 p) { // Uranus
  float f = fbm(vec3(p.x * 2.0, p.y * 8.0, p.z * 2.0));
  vec3 col = mix(vec3(0.52, 0.8, 0.83), vec3(0.72, 0.93, 0.94), f * 0.5 + abs(p.y) * 0.3);
  col = mix(col, vec3(0.8, 0.96, 0.95), smoothstep(0.7, 1.0, abs(p.y)) * 0.4);
  return vec4(col, 0.0);
}`,
  8: /* glsl */ `
vec4 colorPass(vec3 p) { // Neptune
  float warp = fbm(p * vec3(2.0, 7.0, 2.0));
  float b = sin(p.y * 12.0 + warp * 3.0) * 0.5 + 0.5;
  vec3 col = mix(vec3(0.06, 0.16, 0.7), vec3(0.2, 0.42, 0.97), b * 0.6 + warp * 0.4);
  float lon = atan(p.z, p.x);
  vec2 g = vec2(wrapA(lon - 0.6) / 0.35, (p.y + 0.35) / 0.12);
  col = mix(col, vec3(0.02, 0.07, 0.4), smoothstep(1.0, 0.4, length(g)) * 0.85);
  float streak = smoothstep(0.64, 0.82, fbm(p * vec3(6.0, 22.0, 6.0)));
  col = mix(col, vec3(0.85, 0.92, 1.0), streak * 0.6 * smoothstep(0.6, 0.1, abs(p.y + 0.2)));
  return vec4(col, 0.0);
}`,
}

// A tiny program that paints one pass (0 = colour, 1 = aux) of one body. Only that body's code is compiled.
export const bakeFrag = (kind: number, pass: 0 | 1) => /* glsl */ `
${bakeHead}
${bodies[kind]}
void main() {
  vec3 p = dirFromUv(vUv);
  gl_FragColor = ${pass === 0 ? 'colorPass(p)' : 'auxPass(p)'};
}
`

// ---------------------------------------------------------------- rings (profile baked into a 1D texture)

const ringProfile = /* glsl */ `
uniform vec2 uRing;
uniform float uRingKind;
// rgb = colour, a = opacity, for a distance rr measured in planet radii.
vec4 ringAt(float rr) {
  float u = (rr - uRing.x) / (uRing.y - uRing.x);
  float n = vnoise(vec3(rr * 90.0, 1.0, 2.0));
  float fine = 0.55 + 0.45 * vnoise(vec3(rr * 320.0, 3.0, 4.0));
  if (uRingKind < 1.5) {
    float c = 0.22 * (1.0 - smoothstep(0.15, 0.2, u)) * smoothstep(0.0, 0.05, u);
    float b = smoothstep(0.17, 0.25, u) * (1.0 - smoothstep(0.58, 0.6, u));
    float a = smoothstep(0.65, 0.67, u) * (1.0 - smoothstep(0.95, 0.98, u));
    float d = (c + b * 0.95 + a * 0.72) * (0.55 + 0.45 * n) * fine;
    d *= 1.0 - 0.9 * smoothstep(0.012, 0.0, abs(u - 0.9));
    vec3 col = mix(vec3(0.5, 0.42, 0.33), vec3(0.93, 0.85, 0.7), vnoise(vec3(rr * 60.0, 5.0, 6.0)));
    return vec4(col, clamp(d, 0.0, 1.0));
  }
  float t = exp(-pow((u - 0.08) / 0.012, 2.0));
  t += exp(-pow((u - 0.22) / 0.01, 2.0));
  t += exp(-pow((u - 0.4) / 0.012, 2.0));
  t += exp(-pow((u - 0.62) / 0.01, 2.0)) * 0.8;
  t += exp(-pow((u - 0.86) / 0.02, 2.0)) * 1.2;
  return vec4(0.55, 0.62, 0.64, clamp(t * 0.4 * fine, 0.0, 1.0));
}
`

export const ringBakeFrag = /* glsl */ `
varying vec2 vUv;
${noise}
${ringProfile}
void main() {
  gl_FragColor = ringAt(mix(uRing.x, uRing.y, vUv.x));
}
`

export const coronaBakeFrag = /* glsl */ `
varying vec2 vUv;
${noise}
void main() {
  vec2 q = vUv - 0.5;
  float r = length(q) * 2.0;
  float a = atan(q.y, q.x);
  float glow = exp(-r * 3.2) * 0.9;
  float rays = pow(vnoise(vec3(a * 5.0, 1.0, 0.0)), 2.0) * exp(-r * 2.0);
  rays += pow(vnoise(vec3(a * 13.0 + 3.0, 2.0, 1.0)), 3.0) * exp(-r * 3.0) * 0.8;
  float v = (glow + rays * 0.9) * (1.0 - smoothstep(0.85, 1.0, r));
  vec3 c = mix(vec3(1.0, 0.35, 0.05), vec3(1.0, 0.85, 0.5), exp(-r * 4.0));
  gl_FragColor = vec4(c * v, 1.0);
}
`

// ---------------------------------------------------------------- per frame (cheap: texture reads + lighting)

export const planetVert = /* glsl */ `
varying vec3 vPos;
varying vec3 vNormalW;
varying vec3 vPosW;
varying mat3 vRot;
void main() {
  vRot = mat3(modelMatrix);
  vPos = normalize(position);
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vPosW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`

export const planetFrag = /* glsl */ `
uniform int uKind;
uniform float uTime;
uniform float uFade;
uniform vec3 uLight;
uniform vec3 uCenter;
uniform vec3 uRingN;
uniform vec2 uRing;
uniform float uRingKind;
uniform float uRadius;
uniform sampler2D uMap;
uniform sampler2D uAux;
uniform sampler2D uRingTex;
varying vec3 vPos;
varying vec3 vNormalW;
varying vec3 vPosW;
varying mat3 vRot;

const float PI = 3.14159265;
vec3 eastOf(vec3 p) { return normalize(vec3(p.z, 0.0, -p.x) + vec3(1e-4, 0.0, 0.0)); }

void main() {
  vec3 p = normalize(vPos);
  vec3 Ng = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vPosW);

  // Equirectangular lookup. Derivatives are taken from whichever of two wrapped u coordinates is
  // continuous here, so there is no seam line where longitude wraps around.
  vec2 uv = vec2(atan(p.z, p.x) / (2.0 * PI) + 0.5, asin(clamp(p.y, -1.0, 1.0)) / PI + 0.5);
  vec2 dx = dFdx(uv);
  vec2 dy = dFdy(uv);
  vec2 uvb = vec2(fract(uv.x + 0.5), uv.y);
  vec2 dxb = dFdx(uvb);
  vec2 dyb = dFdy(uvb);
  if (abs(dxb.x) + abs(dyb.x) < abs(dx.x) + abs(dy.x)) {
    dx.x = dxb.x;
    dy.x = dyb.x;
  }
  vec4 m = textureGrad(uMap, uv, dx, dy);

  // ---- Sun: self-lit; two shifted reads cross-fade so the surface seems to boil ----
  if (uKind == 0) {
    vec4 m2 = textureGrad(uMap, uv + vec2(0.5 + uTime * 0.004, 0.0), dx, dy);
    vec3 c = mix(m.rgb, m2.rgb, 0.5 + 0.5 * sin(uTime * 0.7));
    float mu = clamp(dot(Ng, V), 0.0, 1.0);
    c *= pow(mu, 0.45) * 1.3;
    gl_FragColor = vec4(c * uFade, 1.0);
    return;
  }

  vec3 col = m.rgb;
  float spec = 0.0;
  float night = 0.0;
  vec3 N = Ng;
  if (uKind == 1 || uKind == 3 || uKind == 4) {
    vec4 a = textureGrad(uAux, uv, dx, dy);
    vec3 Te = eastOf(p);
    vec3 Tn = cross(p, Te);
    vec2 s = (a.rg - 0.5) * 4.0;
    N = normalize(vRot * (p - (s.x * Te + s.y * Tn)));
    if (uKind == 3) {
      float cl = textureGrad(uAux, vec2(uv.x + uTime * 0.0015, uv.y), dx, dy).a;
      col = mix(col, vec3(1.0), cl * 0.88);
      spec = m.a * (1.0 - cl);
      night = a.b * (1.0 - cl * 0.8);
    }
  }

  vec3 L = normalize(uLight);
  float facing = dot(Ng, L);
  float term = smoothstep(-0.06, 0.22, facing);
  float diff = max(dot(N, L), 0.0) * term;

  // Shadow of the rings falling on the planet.
  float shadow = 0.0;
  if (uRingKind > 0.5) {
    float dn = dot(L, uRingN);
    if (abs(dn) > 0.01) {
      vec3 rel = vPosW - uCenter;
      float t = -dot(rel, uRingN) / dn;
      if (t > 0.0) {
        float u = (length(rel + t * L) / uRadius - uRing.x) / (uRing.y - uRing.x);
        if (u > 0.0 && u < 1.0) shadow = texture(uRingTex, vec2(u, 0.5)).a * 0.9;
      }
    }
  }
  diff *= 1.0 - shadow;

  vec3 H = normalize(L + V);
  float sp = pow(max(dot(N, H), 0.0), 90.0) * spec * term * (1.0 - shadow);
  vec3 c = col * (diff * 1.12 + 0.03) + vec3(sp) * 0.9;
  c += night * vec3(1.0, 0.72, 0.35) * (1.0 - smoothstep(-0.02, 0.18, facing)) * 1.4;
  gl_FragColor = vec4(pow(c, vec3(0.92)) * uFade, 1.0);
}
`

export const atmosphereVert = /* glsl */ `
varying vec3 vN;
varying vec3 vP;
void main() {
  vN = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vP = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`

export const atmosphereFrag = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uLight;
uniform float uPower;
uniform float uIntensity;
uniform float uFade;
varying vec3 vN;
varying vec3 vP;
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(cameraPosition - vP);
  float f = pow(1.0 - max(dot(n, v), 0.0), uPower);
  float lit = smoothstep(-0.25, 0.5, dot(n, normalize(uLight)));
  gl_FragColor = vec4(uColor * f * lit * uIntensity * uFade, 1.0);
}
`

export const ringVert = /* glsl */ `
varying vec3 vLocal;
void main() {
  vLocal = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const ringFrag = /* glsl */ `
uniform vec3 uLight; // light direction in the planet's local (tilted) space
uniform vec2 uRing;
uniform float uRadius;
uniform float uFade;
uniform sampler2D uRingTex;
varying vec3 vLocal;
void main() {
  vec3 P = vLocal / uRadius; // planet radius = 1
  float rr = length(P);
  vec4 r = texture(uRingTex, vec2((rr - uRing.x) / (uRing.y - uRing.x), 0.5));
  if (r.a < 0.01) discard;
  // Planet shadow cast onto the rings.
  vec3 L = normalize(uLight);
  float b = dot(P, L);
  float disc = b * b - (dot(P, P) - 1.0);
  float shade = (disc > 0.0 && b < 0.0) ? 0.06 : 1.0;
  gl_FragColor = vec4(r.rgb * shade * 0.95, r.a * 0.92 * uFade);
}
`

export const coronaVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const coronaFrag = /* glsl */ `
uniform sampler2D uMap;
uniform float uFade;
varying vec2 vUv;
void main() {
  gl_FragColor = vec4(texture(uMap, vUv).rgb * uFade, 1.0);
}
`

export const dustVert = /* glsl */ `
attribute float aSize;
attribute float aSeed;
uniform float uTime;
uniform float uPx;
varying float vA;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float tw = 0.75 + 0.25 * sin(uTime * (0.6 + aSeed * 2.0) + aSeed * 40.0);
  vA = tw * (0.35 + 0.65 * aSeed);
  gl_PointSize = clamp(aSize * uPx * (70.0 / -mv.z), 1.0, 7.0 * uPx);
  gl_Position = projectionMatrix * mv;
}
`

export const dustFrag = /* glsl */ `
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = (1.0 - smoothstep(0.2, 1.0, d)) * vA;
  gl_FragColor = vec4(vec3(1.0, 0.97, 0.93) * a, 1.0);
}
`
