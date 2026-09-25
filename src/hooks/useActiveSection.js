import { useEffect } from 'react'
import { useScene } from './useScene'

export function useActiveSection() {
  const { setActiveSection } = useScene()

  useEffect(() => {
    const sections = document.querySelectorAll('[data-section]')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id)
      })
    }, { rootMargin: '-38% 0px -48% 0px', threshold: 0 })

    sections.forEach((section) => observer.observe(section))

    const syncHash = () => {
      const sectionId = window.location.hash.slice(1)
      if (sectionId && document.getElementById(sectionId)?.matches('[data-section]')) setActiveSection(sectionId)
    }

    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => {
      observer.disconnect()
      window.removeEventListener('hashchange', syncHash)
    }
  }, [setActiveSection])
}
