import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import PaintRevealMaterial from './shaders/PaintRevealMaterial'

class SRGBTextureLoader extends THREE.TextureLoader {
  load(url, onLoad, onProgress, onError) {
    return super.load(url, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace
      onLoad?.(texture)
    }, onProgress, onError)
  }
}

function RevealedArtwork({ sources, progress, reducedMotion, aspectRatio, onMaterial }) {
  const texturePaths = useMemo(() => [sources.sketch, sources.painted], [sources.sketch, sources.painted])
  const textures = useLoader(SRGBTextureLoader, texturePaths)
  const sketch = textures[0]
  const painted = textures[1]
  const targetProgress = useRef(0)
  const materialRef = useRef(null)

  useEffect(() => {
    targetProgress.current = progress
    if (reducedMotion && materialRef.current) materialRef.current.uniforms.uProgress.value = progress
  }, [progress, reducedMotion])

  useFrame((_, delta) => {
    const material = materialRef.current
    if (!material || reducedMotion) return
    const uniform = material.uniforms.uProgress
    uniform.value += (targetProgress.current - uniform.value) * Math.min(delta * 4, 1)
  })

  const registerMaterial = useCallback((material) => {
    materialRef.current = material
    onMaterial(material)
  }, [onMaterial])

  return (
    <mesh>
      <planeGeometry args={[2.45 * aspectRatio, 2.45]} />
      <PaintRevealMaterial sketch={sketch} painted={painted} onMaterial={registerMaterial} />
    </mesh>
  )
}

export default function Experience({ sources, progress, reducedMotion, aspectRatio, onMaterial }) {
  return (
    <Canvas className="art-reveal__canvas" camera={{ position: [0, 0, 3], fov: 42 }} dpr={[1, 1.4]} gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}>
      <Suspense fallback={null}>
        <RevealedArtwork sources={sources} progress={progress} reducedMotion={reducedMotion} aspectRatio={aspectRatio} onMaterial={onMaterial} />
      </Suspense>
    </Canvas>
  )
}
