import { useEffect, useRef, useState } from 'react'

const FONT_PATH = `${import.meta.env.BASE_URL}fonts/SatisfySL.json`

export default function HandwrittenNote({ text }) {
  const container = useRef(null)
  const [animated, setAnimated] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const element = container.current
    const updatePreference = () => setReducedMotion(query.matches)
    updatePreference()
    query.addEventListener('change', updatePreference)
    if (query.matches || !element) return () => query.removeEventListener('change', updatePreference)

    let vara
    let cancelled = false
    import('vara').then(({ default: VaraClass }) => {
      if (cancelled) return
      element.replaceChildren()
      vara = new VaraClass(element, FONT_PATH, [{ text, id: 'caption', autoAnimation: true, duration: 1250, strokeWidth: 1.2, color: '#55534b', fontSize: 18 }], { textAlign: 'center', autoAnimation: true, queued: false })
      vara.ready(() => {
        if (!cancelled) setAnimated(true)
      })
    }).catch(() => setAnimated(false))

    return () => {
      cancelled = true
      vara = null
      query.removeEventListener('change', updatePreference)
      element.replaceChildren()
    }
  }, [text])

  return <span className="handwritten-note-wrap"><span id="handwritten-note" ref={container} aria-hidden="true" />{(!animated || reducedMotion) && <span className="handwritten-note-static">{text}</span>}</span>
}
