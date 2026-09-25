import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
uniform sampler2D uSketch;
uniform sampler2D uPainted;
uniform float uProgress;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  vec4 sketch = texture2D(uSketch, vUv);
  vec4 painted = texture2D(uPainted, vUv);
  float grain = noise(vUv * 31.0) * 0.13 + noise(vUv * 8.0) * 0.1;
  float fibers = sin(vUv.y * 190.0 + noise(vUv * 10.0) * 5.0) * 0.025;
  float edge = (1.0 - vUv.y) + grain + fibers;
  float cutoff = uProgress * 1.32;
  float reveal = smoothstep(cutoff - 0.038, cutoff + 0.038, edge);
  vec4 color = mix(painted, sketch, reveal);
  float pencilEdge = 1.0 - smoothstep(0.0, 0.04, abs(edge - cutoff));
  color.rgb *= 1.0 - pencilEdge * 0.18 * step(0.001, uProgress) * step(uProgress, 0.999);
  gl_FragColor = color;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

export default function PaintRevealMaterial({ sketch, painted, onMaterial }) {
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uSketch: { value: sketch },
      uPainted: { value: painted },
      uProgress: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
  }), [sketch, painted])

  useEffect(() => {
    onMaterial?.(material)
    return () => material.dispose()
  }, [material, onMaterial])

  return <primitive attach="material" object={material} />
}
