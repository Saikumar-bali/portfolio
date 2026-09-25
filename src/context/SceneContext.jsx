import { createContext, useCallback, useMemo, useState } from 'react'

export const SceneContext = createContext(null)

export function SceneProvider({ children }) {
  const [activeSection, setActiveSection] = useState('home')
  const [transitioning, setTransitioning] = useState(false)

  const navigateTo = useCallback((sectionId) => {
    const target = document.getElementById(sectionId)
    if (!target) return

    setActiveSection(sectionId)
    setTransitioning(true)
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
    window.setTimeout(() => setTransitioning(false), 560)
  }, [])

  const value = useMemo(() => ({ activeSection, setActiveSection, navigateTo, transitioning }), [activeSection, navigateTo, transitioning])
  return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>
}
