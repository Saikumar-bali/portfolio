import { useScene } from '../../hooks/useScene'

export default function SceneTransition() {
  const { transitioning } = useScene()

  return (
    <div className={`paper-transition${transitioning ? ' is-tearing' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 900 94" preserveAspectRatio="none">
        <path className="tear-shadow" d="M0 47c48-13 81 14 129 2s79-14 131 0 86 14 135 0 83-13 130 0 89 11 137-1 96-15 145 0 69 10 93-1" />
        <path className="tear-line" d="M0 47c48-13 81 14 129 2s79-14 131 0 86 14 135 0 83-13 130 0 89 11 137-1 96-15 145 0 69 10 93-1" />
      </svg>
    </div>
  )
}
