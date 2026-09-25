import { useState, useEffect, useRef } from 'react'

function StickManGif({ alt, width = 200, height = 200 }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const containerRef = useRef(null)
  const imgRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imgRef.current = img
      setLoaded(true)
    }
    img.onerror = () => setError(true)
    img.src = '/stickman-funny.gif'
    return () => {
      if (container.querySelector('canvas')) {
        container.querySelector('canvas').remove()
      }
    }
  }, [])

  useEffect(() => {
    if (!loaded) return
    const container = containerRef.current
    if (!container) return

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    container.appendChild(canvas)
    const ctx = canvas.getContext('2d')

    let animId
    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      const img = imgRef.current
      if (img) ctx.drawImage(img, 0, 0, width, height)
      animId = requestAnimationFrame(draw)
    }
    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      if (canvas.parentNode) canvas.remove()
    }
  }, [loaded, width, height])

  if (error) return <img src="/stickman-funny.gif" alt={alt} width={width} height={height} loading="lazy" />
  return <div ref={containerRef} className="stickman-gif-wrapper" style={{ width, height }} aria-label={alt} />
}

export default StickManGif