import ArtworkReveal from '../dom/ArtworkReveal'
import illustrations from '../../config/illustrationAssets'
import { profile } from '../../config/portfolioContent'

export default function ContactPanel() {
  return (
    <section className="contact-section section-frame" id="contact" data-section aria-labelledby="contact-title">
      <div className="contact-copy">
        <p className="eyebrow">Have a project in mind?</p>
        <h2 id="contact-title">Let's build<br /><span>something great.</span></h2>
        <p>I'm always interested in hearing about new projects, especially ones involving automation, AI integration, fintech, or full-stack engineering. Let's talk.</p>
        <div className="contact-details">
          <a className="contact-link" href={`mailto:${profile.email}`}>{profile.email} <span aria-hidden="true">&#8599;</span></a>
          <a className="contact-link" href={`https://wa.me/${profile.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">{profile.phone} (WhatsApp) <span aria-hidden="true">&#8599;</span></a>
          <a className="contact-link" href={profile.github} target="_blank" rel="noopener noreferrer">github.com/saikumar-bali <span aria-hidden="true">&#8599;</span></a>
          <a className="contact-link" href={profile.website} target="_blank" rel="noopener noreferrer">Portfolio website <span aria-hidden="true">&#8599;</span></a>
        </div>
      </div>
      <div className="contact-illustration">
        <ArtworkReveal sources={illustrations.contact} fallback={<div className="contact-sketch-fallback" role="img" aria-label={illustrations.contact.alt}><svg viewBox="0 0 360 280"><path d="M44 220c92-6 181-5 276 0m-260 8c81-3 162-3 241 1M82 193c0-19 10-36 29-48m23 48c-1-20-3-38-9-54m-12 56c16-6 29-16 39-29m83 36c0-21 11-38 27-50m20 52c-1-17-2-35-9-52m-9 56c18-5 31-16 42-31M88 152c16 7 30 7 44 1m108 4c14 7 27 6 40-1m-183 84-4 19m175-20 8 19m-174-164 18 18 36-43m-22 13 5 15m-9 18 12 1"/></svg></div>} />
      </div>
    </section>
  )
}
