import { platforms } from '../../config/platformsContent'

function PlatformCard({ platform }) {
  return (
    <li className={`platform-card platform-card--${platform.id}`}>
      <img
        className="platform-logo"
        src={platform.icon}
        alt=""
        width="28"
        height="28"
        loading="lazy"
        decoding="async"
      />
      <div className="platform-meta">
        <span className="platform-name">{platform.name}</span>
        <span className="platform-proof">{platform.proof}</span>
      </div>
    </li>
  )
}

export default function PlatformStrip() {
  const loop = [...platforms, ...platforms]

  return (
    <section className="platform-strip" aria-labelledby="platforms-title">
      <div className="platform-strip-head">
        <p className="eyebrow">Where I ship</p>
        <h2 id="platforms-title">Platforms in production<span className="heading-period">.</span></h2>
      </div>
      <div className="platform-marquee" aria-hidden="true">
        <ul className="platform-track">
          {loop.map((platform, index) => (
            <PlatformCard
              key={`${platform.id}-${index}`}
              platform={platform}
            />
          ))}
        </ul>
      </div>
      <ul className="platform-fallback">
        {platforms.map((platform) => (
          <PlatformCard key={platform.id} platform={platform} />
        ))}
      </ul>
    </section>
  )
}
