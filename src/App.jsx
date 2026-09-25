import { SceneProvider } from './context/SceneContext'
import NavigationUI from './components/ui/NavigationUI'
import ProjectGallery from './components/ui/ProjectGallery'
import PlatformStrip from './components/ui/PlatformStrip'
import AutomationSection from './components/ui/AutomationSection'
import AboutPanel from './components/ui/AboutPanel'
import ContactPanel from './components/ui/ContactPanel'
import SceneTransition from './components/dom/SceneTransition'
import { useActiveSection } from './hooks/useActiveSection'
import { useScene } from './hooks/useScene'
import ArtworkReveal from './components/dom/ArtworkReveal'
import illustrations from './config/illustrationAssets'
import { profile, stats } from './config/portfolioContent'

function Portfolio() {
  useActiveSection()
  const { navigateTo } = useScene()

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <NavigationUI />
      <main id="main">
        <section className="hero section-frame" id="home" data-section aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="status-dot" /> {profile.title}</p>
            <h1 id="hero-title">I build systems<br /><span>that build themselves.</span></h1>
            <p className="hero-intro">{profile.summary}</p>
            <div className="hero-stats">
              {stats.map((stat) => (
                <div className="hero-stat" key={stat.label}>
                  <span className="hero-stat-value">{stat.value}</span>
                  <span className="hero-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
            <a className="drawn-link" href="#work" onClick={(event) => { event.preventDefault(); navigateTo('work') }}>See featured work <span aria-hidden="true">&#8595;</span></a>
            <p className="margin-note">currently automating<br />something new</p>
          </div>
          <figure className="hero-art">
            <span className="scribble scribble-one" aria-hidden="true">&#10035;</span>
            <ArtworkReveal sources={illustrations.hero} fallback={null} />
            <figcaption>{profile.location}</figcaption>
          </figure>
          <a className="scroll-cue" href="#work" onClick={(event) => { event.preventDefault(); navigateTo('work') }}><span aria-hidden="true">&#8595;</span> Scroll to work</a>
        </section>
        <SceneTransition />
        <ProjectGallery />
        <PlatformStrip />
        <AutomationSection />
        <AboutPanel />
        <ContactPanel />
      </main>
      <footer className="site-footer">
        <span>&#169; {new Date().getFullYear()} {profile.name}</span>
        <a href="#home">Back to the top &#8593;</a>
        <span>{profile.location}</span>
      </footer>
    </div>
  )
}

export default function App() {
  return <SceneProvider><Portfolio /></SceneProvider>
}
