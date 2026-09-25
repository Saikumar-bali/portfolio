import { useCallback, useEffect, useRef, useState } from 'react'
import Experience from '../canvas/Experience'

export default function ArtworkReveal({ sources, fallback }) {
  const [available, setAvailable] = useState(false)
  const [progress, setProgress] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const materialRef = useRef(null)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    let cancelled = false
    const paths = [sources.sketch, sources.painted]
    Promise.all(paths.map((path) => new Promise((resolve) => {
      const image = new Image()
      image.onload = () => resolve(true)
      image.onerror = () => resolve(false)
      image.src = path
    }))).then((results) => {
      if (!cancelled) setAvailable(results.every(Boolean))
    })

    return () => { cancelled = true }
  }, [sources.sketch, sources.painted])

  const setMaterial = useCallback((material) => {
    materialRef.current = material
  }, [])

  const setReveal = useCallback((value) => {
    setProgress(value ? 1 : 0)
  }, [])

  if (!available) return fallback

  return (
    <div className="art-reveal" style={{ '--art-ratio': sources.aspectRatio ?? 1.5 }} onPointerEnter={(event) => { if (event.pointerType === 'mouse') setReveal(true) }} onPointerLeave={(event) => { if (event.pointerType === 'mouse') setReveal(false) }}>
      <div className="art-reveal__fallback" aria-hidden="true">{fallback}</div>
      <Experience sources={sources} progress={progress} reducedMotion={reducedMotion} aspectRatio={sources.aspectRatio ?? 1.5} onMaterial={setMaterial} />
    </div>
  )
}
