import { useEffect, useRef, useState, useCallback, useMemo } from 'react'

function ProseSection({ section }) {
  return (
    <div className="page-prose">
      {section.intro && <p className="page-intro">{section.intro}</p>}
      {section.paragraphs?.map((para, i) => (
        <p key={i} className="page-para">{para}</p>
      ))}
      {section.items && (
        <ul className="page-list">
          {section.items.map((item, i) => (
            <li key={i} className="page-list-item">
              <span className="page-item-name">{item.name}</span>
              <p className="page-item-detail">{item.detail}</p>
            </li>
          ))}
        </ul>
      )}
      {section.meta && (
        <dl className="page-meta">
          {section.meta.map((entry, i) => (
            <div key={i} className="page-meta-item">
              <dt>{entry.label}</dt>
              <dd>
                {entry.href ? (
                  <a href={entry.href} target="_blank" rel="noopener noreferrer">{entry.value}</a>
                ) : entry.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {section.metrics && (
        <ul className="page-metrics">
          {section.metrics.map((m, i) => (
            <li key={i} className="page-metric">{m}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ListSection({ section }) {
  return (
    <ul className="page-list">
      {(section.items || []).map((item, i) => (
        <li key={i} className="page-list-item">
          <span className="page-item-name">{item.name}</span>
          <p className="page-item-detail">{item.detail}</p>
        </li>
      ))}
    </ul>
  )
}

function AppsSection({ section }) {
  return (
    <ul className="page-apps">
      {(section.apps || []).map((app, i) => (
        <li key={i} className="page-app">
          <h4 className="page-app-name">{app.name}</h4>
          <p className="page-app-desc">{app.description}</p>
          {app.stack && (
            <div className="page-app-stack">
              {app.stack.map((tech, j) => <span key={j} className="page-tag">{tech}</span>)}
            </div>
          )}
          {app.features && (
            <ul className="page-app-features">
              {app.features.map((feat, j) => <li key={j}>{feat}</li>)}
            </ul>
          )}
        </li>
      ))}
    </ul>
  )
}

function BulletsSection({ section }) {
  return (
    <ul className="page-bullets">
      {(section.bullets || []).map((b, i) => <li key={i}>{b}</li>)}
    </ul>
  )
}

function PageContent({ section }) {
  if (!section) return null
  switch (section.kind) {
    case 'list': return <ListSection section={section} />
    case 'apps': return <AppsSection section={section} />
    case 'bullets': return <BulletsSection section={section} />
    default: return <ProseSection section={section} />
  }
}

export default function ProjectDetailDialog({ project, isOpen, onClose }) {
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const sections = useMemo(() => project?.details || [], [project])
  const totalPages = sections.length

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      document.body.style.overflow = 'hidden'
      requestAnimationFrame(() => {
        setIsVisible(true)
        setIsClosing(false)
        dialogRef.current?.showModal()
        closeButtonRef.current?.focus()
      })
    }
    return () => {
      setIsClosing(true)
      document.body.style.overflow = ''
      if (dialogRef.current?.open) dialogRef.current.close()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setIsVisible(false)
      setIsClosing(false)
      setPageIndex(0)
      setDirection(1)
    }
  }, [isOpen])

  useEffect(() => {
    setPageIndex(0)
    setDirection(1)
  }, [project?.number])

  const goTo = useCallback((nextIndex) => {
    if (nextIndex < 0 || nextIndex >= totalPages || nextIndex === pageIndex) return
    setDirection(nextIndex > pageIndex ? 1 : -1)
    setPageIndex(nextIndex)
  }, [pageIndex, totalPages])

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      onClose()
      return
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      setPageIndex((i) => {
        if (i + 1 < totalPages) { setDirection(1); return i + 1 }
        return i
      })
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      setPageIndex((i) => {
        if (i - 1 >= 0) { setDirection(-1); return i - 1 }
        return i
      })
    }
    if (event.key === 'Tab' && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
  }, [onClose, totalPages])

  const handleOverlayClick = useCallback((event) => {
    if (event.target === event.currentTarget) onClose()
  }, [onClose])

  if (!isOpen || !project) return null

  const current = sections[pageIndex]

  return (
    <dialog
      ref={dialogRef}
      className={`book-overlay${isVisible ? ' is-visible' : ''}${isClosing ? ' closing' : ''}`}
      onCancel={onClose}
      onKeyDown={handleKeyDown}
      onClick={handleOverlayClick}
      aria-labelledby="book-title"
      aria-modal="true"
    >
      <div className="book">
        <header className="book-header">
          <div className="book-heading">
            <p className="book-kicker">{project.number} / {project.type}</p>
            <h2 id="book-title">{project.name}</h2>
          </div>
          <button
            ref={closeButtonRef}
            className="book-close"
            type="button"
            onClick={onClose}
            aria-label="Close book"
          >
            <span aria-hidden="true">&#215;</span>
          </button>
        </header>

        {totalPages > 0 && (
          <nav className="book-toc" aria-label="Chapters">
            {sections.map((section, i) => (
              <button
                key={section.id || i}
                type="button"
                className={`book-chapter${i === pageIndex ? ' is-active' : ''}`}
                onClick={() => goTo(i)}
                aria-current={i === pageIndex ? 'page' : undefined}
              >
                <span className="book-chapter-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="book-chapter-name">{section.title}</span>
              </button>
            ))}
          </nav>
        )}

        <div className="book-viewport">
          <article
            key={pageIndex}
            className={`book-page ${direction > 0 ? 'turn-forward' : 'turn-back'}`}
          >
            <h3 className="book-page-title">
              <span className="book-page-chapter">{String(pageIndex + 1).padStart(2, '0')}</span>
              {current?.title}
            </h3>
            <PageContent section={current} />
          </article>
        </div>

        <footer className="book-footer">
          <button
            className="book-page-btn"
            type="button"
            onClick={() => goTo(pageIndex - 1)}
            disabled={pageIndex === 0}
            aria-label="Previous chapter"
          >
            <span aria-hidden="true">&#8592;</span> Previous
          </button>
          <p className="book-page-count" aria-live="polite">
            Page {pageIndex + 1} of {totalPages}
            <span className="book-page-name"> · {current?.title}</span>
          </p>
          <button
            className="book-page-btn"
            type="button"
            onClick={() => goTo(pageIndex + 1)}
            disabled={pageIndex >= totalPages - 1}
            aria-label="Next chapter"
          >
            Next <span aria-hidden="true">&#8594;</span>
          </button>
        </footer>

        <div className="book-links">
          {project.links?.live && (
            <a className="book-link" href={project.links.live} target="_blank" rel="noopener noreferrer">
              Live Site ↗
            </a>
          )}
          {project.links?.github && (
            <a className="book-link" href={project.links.github} target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </a>
          )}
          {project.links?.apk && (
            <a className="book-link" href={project.links.apk} target="_blank" rel="noopener noreferrer">
              APK ↗
            </a>
          )}
        </div>
      </div>
    </dialog>
  )
}
