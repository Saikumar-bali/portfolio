import { navigation } from '../../config/portfolioContent'
import { useScene } from '../../hooks/useScene'

export default function NavigationUI() {
  const { activeSection, navigateTo } = useScene()

  return (
    <header className="site-header">
      <a className="wordmark" href="#home" aria-label="Saikumar Bali, home" onClick={(event) => { event.preventDefault(); navigateTo('home') }}><span className="wordmark-mark" aria-hidden="true">S.</span><span>Saikumar Bali<br /><small>automation architect</small></span></a>
      <nav aria-label="Main navigation">
        {navigation.slice(1).map((item, index) => (
          <a key={item.id} href={`#${item.id}`} className={activeSection === item.id ? 'is-active' : ''} aria-current={activeSection === item.id ? 'location' : undefined} onClick={(event) => { event.preventDefault(); navigateTo(item.id) }}>
            <span className="nav-index">0{index + 1}</span>{item.label}
          </a>
        ))}
      </nav>
      <a className="availability" href="#contact" onClick={(event) => { event.preventDefault(); navigateTo('contact') }}><span className="status-dot" /> Open to work</a>
    </header>
  )
}
