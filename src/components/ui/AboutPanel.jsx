import ArtworkReveal from '../dom/ArtworkReveal'
import illustrations from '../../config/illustrationAssets'
import { skills } from '../../config/portfolioContent'

export default function AboutPanel() {
  return (
    <section className="about-section section-frame" id="about" data-section aria-labelledby="about-title">
      <div className="about-page">
        <div className="page-tape" />
        <div className="page-number">04 / 12</div>
        <ArtworkReveal sources={illustrations.about} fallback={<div className="about-sketch-fallback" role="img" aria-label={illustrations.about.alt}><svg viewBox="0 0 350 390"><path d="M45 333c76-4 176-1 262 3m-249 9c71-2 155-1 236 2M120 123c-4-47 17-81 58-86 45-5 75 25 77 66 2 42-22 72-65 75-43 3-68-15-70-55Zm23-7c10-7 20-7 29-1m31 0c9-7 19-6 28 1m-75 26c12 7 25 7 38 2m16 0c8-1 14-3 20-7m-59 28c15 3 29 1 40-6M122 187c-19 18-30 43-29 76l6 64m149-128c22 22 29 48 31 78l3 54m-140-137c-8 31-4 67 17 100l34 29m40-127c-5 38-4 70 8 98l20 30M159 192c14 9 31 13 48 12 19-1 34-7 47-17M87 305c25-11 47-11 67-1m83 11c23-10 46-9 67 1m-185 36c-14 5-28 7-44 6m185-4c16 4 30 4 45 2"/></svg></div>} />
        <span className="page-caption">independent practice, since 2022</span>
      </div>
      <div className="about-copy">
        <p className="eyebrow">The person behind the systems</p>
        <h2 id="about-title">Saikumar Bali<br /><span>Automation Architect.</span></h2>
        <p>I build production systems that eliminate manual work, from millisecond-precision ERP automation to crash-proof trading engines and AI-powered bots. Every project is built end-to-end: scoping, architecture, implementation, deployment, and monitoring.</p>
        <p>3+ years of independent delivery across Fintech, AI integration, mobile development, DevOps, and cloud infrastructure. 15+ independent freelance deliveries since 2022.</p>
        <div className="scribbled-rule" aria-hidden="true" />
        <div className="skills-grid">
          {Object.entries(skills).map(([category, items]) => (
            <div className="skill-group" key={category}>
              <h3 className="skill-category">{category}</h3>
              <div className="skill-tags">
                {items.map((skill) => <span className="skill-tag" key={skill}>{skill}</span>)}
              </div>
            </div>
          ))}
        </div>
        <p className="hand-note">Currently expanding: systems at scale <span aria-hidden="true">&#8599;</span></p>
      </div>
    </section>
  )
}
