import { useCallback, useEffect, useRef, useState } from 'react'
import { achievements, storyBeats, automationStats, featuredAgents } from '../../config/githubContent'

const BEAT_COUNT = storyBeats.length

const KIND_MARK = {
  agent: 'AI',
  watch: '!!',
  ship: '→',
  cron: '⏱',
}

function AchievementsStrip() {
  return (
    <div className="auto-achievements">
      <div className="auto-achievements-head">
        <p className="eyebrow">Earned on GitHub</p>
        <h3 className="auto-achievements-title">Achievements<span className="heading-period">.</span></h3>
      </div>
      <ul className="auto-badge-list">
        {achievements.map((badge) => (
          <li className="auto-badge" key={badge.name}>
            <a href={badge.href} target="_blank" rel="noopener noreferrer">
              <img src={badge.img} alt="" width="64" height="64" loading="lazy" decoding="async" />
              <span className="auto-badge-meta">
                <span className="auto-badge-name">{badge.name}</span>
                <span className="auto-badge-note">{badge.note}</span>
              </span>
              {badge.count > 1 && <span className="auto-badge-count" aria-label={`Earned ${badge.count} times`}>×{badge.count}</span>}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function StageVisual({ beat, isActive }) {
  if (beat.sheet) {
    return (
      <div className="auto-stage-frames" aria-hidden="true">
        <div
          className={`auto-frame${isActive ? ' is-active' : ''}`}
          style={{ '--col': beat.sheet.col, '--row': beat.sheet.row }}
        />
      </div>
    )
  }

  if (beat.img) {
    return (
      <div
        className="auto-stage-img"
        aria-hidden="true"
        style={{ backgroundImage: `url(${beat.img})` }}
      />
    )
  }

  return (
    <div className={`auto-stage-panel${isActive ? ' is-active' : ''}`} aria-hidden="true">
      <span className="auto-stage-kind">{KIND_MARK[beat.kind] || '●'}</span>
      <span className="auto-stage-panel-title">{beat.title}</span>
      <span className="auto-stage-panel-repo">{beat.repo}</span>
    </div>
  )
}

function StoryStage({ activeIndex, onJump }) {
  const beat = storyBeats[activeIndex]

  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      onJump(Math.min(activeIndex + 1, BEAT_COUNT - 1))
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      onJump(Math.max(activeIndex - 1, 0))
    }
    if (event.key === 'Home') {
      event.preventDefault()
      onJump(0)
    }
    if (event.key === 'End') {
      event.preventDefault()
      onJump(BEAT_COUNT - 1)
    }
  }

  return (
    <div className="auto-story" tabIndex={0} onKeyDown={onKeyDown} aria-label="Automation story, use arrow keys to move between beats">
      <div className="auto-stage">
        <div className="auto-stage-visual">
          {storyBeats.map((item, index) => (
            <div key={item.id} className={`auto-visual-slot${index === activeIndex ? ' is-active' : ''}`}>
              <StageVisual beat={item} isActive={index === activeIndex} />
            </div>
          ))}
        </div>
        <div className="auto-stage-copy" aria-live="polite">
          <p className="auto-stage-index"><span>{String(activeIndex + 1).padStart(2, '0')}</span> / {String(BEAT_COUNT).padStart(2, '0')}</p>
          <h3 className="auto-stage-title">{beat.title}</h3>
          <p className="auto-stage-purpose">{beat.purpose}</p>
          <p className="auto-stage-caption">{beat.caption}</p>
          <p className="auto-stage-meta">
            <span className="auto-stage-repo">{beat.repo}</span>
            <span className="auto-stage-sep" aria-hidden="true">·</span>
            <code className="auto-stage-workflow">{beat.workflow}</code>
          </p>
          <a className="drawn-link auto-stage-link" href={beat.href} target="_blank" rel="noopener noreferrer">
            Proof <span aria-hidden="true">&#8599;</span>
          </a>
        </div>
      </div>
      <div className="auto-rail" role="tablist" aria-label="Story beats">
        {storyBeats.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={`Beat ${index + 1}: ${item.title}`}
            className={`auto-rail-tick${index === activeIndex ? ' is-active' : ''}`}
            onClick={() => onJump(index)}
          />
        ))}
      </div>
    </div>
  )
}

function FeaturedAgents() {
  return (
    <ul className="auto-agents">
      {featuredAgents.map((agent) => (
        <li className="auto-agent" key={agent.id}>
          <h4 className="auto-agent-name">{agent.name}</h4>
          <p className="auto-agent-purpose">{agent.purpose}</p>
          <p className="auto-agent-line">{agent.line}</p>
          <a className="drawn-link auto-agent-link" href={agent.href} target="_blank" rel="noopener noreferrer">
            Proof <span aria-hidden="true">&#8599;</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export default function AutomationSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const trackRef = useRef(null)
  const frameRequest = useRef(0)

  const jumpTo = useCallback((index) => {
    const track = trackRef.current
    if (!track) return
    const clamped = Math.max(0, Math.min(index, BEAT_COUNT - 1))
    const rect = track.getBoundingClientRect()
    const trackTop = window.scrollY + rect.top
    const scrollable = track.offsetHeight - window.innerHeight
    if (scrollable <= 0) {
      setActiveIndex(clamped)
      return
    }
    const target = trackTop + (scrollable * clamped) / Math.max(BEAT_COUNT - 1, 1)
    window.scrollTo({ top: target, behavior: 'smooth' })
    setActiveIndex(clamped)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined

    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const update = () => {
      frameRequest.current = 0
      if (reduceQuery.matches) return
      const rect = track.getBoundingClientRect()
      const scrollable = track.offsetHeight - window.innerHeight
      if (scrollable <= 0) return
      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1)
      const next = Math.min(Math.floor(progress * BEAT_COUNT), BEAT_COUNT - 1)
      setActiveIndex((current) => (current === next ? current : next))
    }

    const onScroll = () => {
      if (frameRequest.current) return
      frameRequest.current = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frameRequest.current) window.cancelAnimationFrame(frameRequest.current)
    }
  }, [])

  return (
    <section className="auto-section section-frame" id="automation" data-section aria-labelledby="automation-title">
      <div className="auto-intro">
        <header className="section-heading auto-heading">
          <div>
            <p className="eyebrow">How the work moves without me</p>
            <h2 id="automation-title">Automation log<span className="heading-period">.</span></h2>
          </div>
          <p>Agents that review PRs, bots that judge bots, crashes that file their own issues.</p>
        </header>

        <AchievementsStrip />

        <div className="auto-stats">
          {automationStats.map((stat) => (
            <div className="auto-stat" key={stat.label}>
              <span className="auto-stat-value">{stat.value}</span>
              <span className="auto-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auto-scroll-track" ref={trackRef} style={{ height: `${BEAT_COUNT * 100}vh` }}>
        <div className="auto-sticky">
          <StoryStage activeIndex={activeIndex} onJump={jumpTo} />
        </div>
      </div>

      <div className="auto-outro">
        <FeaturedAgents />
      </div>
    </section>
  )
}
