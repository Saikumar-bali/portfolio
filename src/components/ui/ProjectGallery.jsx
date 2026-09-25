import { useEffect, useRef, useState } from 'react'
import { featuredProjects, additionalProjects } from '../../config/portfolioContent'
import ProjectDetailDialog from './ProjectDetailDialog'

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const ZOOM_STEP = 0.25

function getProjectImages(project) {
  const images = []

  if (project.image) {
    images.push({ src: project.image, alt: project.imageAlt || `${project.name} screenshot` })
  }

  if (project.overlay) {
    images.push(project.overlay)
  }

  images.push(...(project.gallery || []))
  return images
}

function ImageViewer({ project, initialIndex, trigger, onClose }) {
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const [index, setIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const images = getProjectImages(project)
  const activeImage = images[index]

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    closeButtonRef.current?.focus()

    return () => {
      if (dialog?.open) {
        dialog.close()
      }
      trigger?.focus()
    }
  }, [trigger])

  function showImage(nextIndex) {
    setIndex((nextIndex + images.length) % images.length)
    setZoom(MIN_ZOOM)
  }

  function changeZoom(amount) {
    setZoom((currentZoom) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((currentZoom + amount).toFixed(2)))))
  }

  function resetZoom() {
    setZoom(MIN_ZOOM)
  }

  function handleDialogKeyDown(event) {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      showImage(index + 1)
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      showImage(index - 1)
    }
  }

  function handleClose() {
    onClose()
  }

  function handleCancel(event) {
    event.preventDefault()
    handleClose()
  }

  if (!activeImage) {
    return null
  }

  return (
    <dialog
      ref={dialogRef}
      className="image-viewer"
      aria-labelledby="image-viewer-title"
      onCancel={handleCancel}
      onKeyDown={handleDialogKeyDown}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          handleClose()
        }
      }}
    >
      <div className="image-viewer-shell">
        <header className="image-viewer-header">
          <div>
            <p className="image-viewer-kicker">{project.number} / {project.type.split(' · ')[0]}</p>
            <h2 id="image-viewer-title">{project.name}</h2>
          </div>
          <div className="image-viewer-header-actions">
            <div className="image-viewer-zoom-controls" role="group" aria-label="Image zoom controls">
              <button
                type="button"
                onClick={() => changeZoom(-ZOOM_STEP)}
                disabled={zoom <= MIN_ZOOM}
                aria-label="Zoom out"
              >
                <span aria-hidden="true">&#8722;</span>
              </button>
              <output className="image-viewer-zoom-value" aria-live="polite">
                {Math.round(zoom * 100)}%
              </output>
              <button
                type="button"
                onClick={() => changeZoom(ZOOM_STEP)}
                disabled={zoom >= MAX_ZOOM}
                aria-label="Zoom in"
              >
                <span aria-hidden="true">&#43;</span>
              </button>
              <button
                className="image-viewer-zoom-reset"
                type="button"
                onClick={resetZoom}
                disabled={zoom === MIN_ZOOM}
                aria-label="Reset image zoom"
              >
                Reset
              </button>
            </div>
            <button
              ref={closeButtonRef}
              className="image-viewer-close"
              type="button"
              onClick={handleClose}
              aria-label="Close image viewer"
            >
              <span aria-hidden="true">&#215;</span>
            </button>
          </div>
        </header>

        <div className="image-viewer-stage">
          <button
            className="image-viewer-nav image-viewer-previous"
            type="button"
            onClick={() => showImage(index - 1)}
            aria-label="View previous image"
          >
            <span aria-hidden="true">&#8592;</span>
            <span>Previous</span>
          </button>
          <div className="image-viewer-viewport">
            <div className="image-viewer-canvas" style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}>
              <img className="image-viewer-image" src={activeImage.src} alt={activeImage.alt} />
            </div>
          </div>
          <button
            className="image-viewer-nav image-viewer-next"
            type="button"
            onClick={() => showImage(index + 1)}
            aria-label="View next image"
          >
            <span>Next</span>
            <span aria-hidden="true">&#8594;</span>
          </button>
        </div>

        <footer className="image-viewer-footer">
          <p>{activeImage.alt}</p>
          <p className="image-viewer-counter" aria-live="polite">
            {String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
          </p>
        </footer>
      </div>
    </dialog>
  )
}

function ProjectArtwork({ tone, number }) {
  return (
    <div className={`project-artwork artwork-${tone}`} aria-hidden="true">
      <div className="art-paper"><div className="art-shape art-shape-one"/><div className="art-shape art-shape-two"/><div className="art-hatch art-hatch-one"/><div className="art-hatch art-hatch-two"/><span className="art-caption">project / {number}</span></div>
    </div>
  )
}

function ProjectEvidence({ project, onOpenImage }) {
  if (!project.image) {
    return <ProjectArtwork tone={project.tone} number={project.number} />
  }

  return (
    <div className="project-evidence">
      <div className="project-evidence-main">
        <button
          className="project-evidence-image-button"
          type="button"
          onClick={(event) => onOpenImage(0, event.currentTarget)}
          aria-label={`Open full-size image: ${project.imageAlt || `${project.name} screenshot`}`}
        >
          <img src={project.image} alt={project.imageAlt || ''} loading="lazy" decoding="async" />
        </button>
        <span className="project-tape" aria-hidden="true" />
      </div>
      {project.overlay && (
        <div className="project-evidence-overlay">
          <button
            className="project-evidence-image-button"
            type="button"
            onClick={(event) => onOpenImage(1, event.currentTarget)}
            aria-label={`Open full-size image: ${project.overlay.alt || `${project.name} screenshot`}`}
          >
            <img src={project.overlay.src} alt={project.overlay.alt || ''} loading="lazy" decoding="async" />
          </button>
        </div>
      )}
      {project.gallery?.length > 0 && (
        <div className="project-evidence-gallery">
          {project.gallery.map((shot, index) => (
            <button
              className="project-evidence-thumb"
              type="button"
              onClick={(event) => onOpenImage(index + (project.overlay ? 2 : 1), event.currentTarget)}
              key={shot.src}
              aria-label={`Open full-size image: ${shot.alt || `${project.name} screenshot`}`}
            >
              <img src={shot.src} alt={shot.alt || ''} loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
      <span className="project-evidence-caption">{project.number} / evidence</span>
    </div>
  )
}

function FeaturedProject({ project, onOpenImage, onOpenDetails }) {
  return (
    <article className={`project-row project-${project.tone}`}>
      <ProjectEvidence project={project} onOpenImage={onOpenImage} />
      <div className="project-copy">
        <p className="eyebrow">{project.type}</p>
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        {project.metrics && (
          <ul className="project-metrics">
            {project.metrics.map((m) => <li key={m}>{m}</li>)}
          </ul>
        )}
        <div className="project-stack">
          {project.stack.map((tech) => <span className="project-tag" key={tech}>{tech}</span>)}
        </div>
        <div className="project-links">
          {project.links.github && <a className="project-link" href={project.links.github} target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">&#8599;</span></a>}
          {project.links.live && <a className="project-link" href={project.links.live} target="_blank" rel="noopener noreferrer">Live <span aria-hidden="true">&#8599;</span></a>}
          {project.links.apk && <a className="project-link" href={project.links.apk} target="_blank" rel="noopener noreferrer">APK <span aria-hidden="true">&#8599;</span></a>}
        </div>
      </div>
      <span className="project-arrow" aria-hidden="true">
        <button
          type="button"
          className="project-arrow-btn"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onOpenDetails(project);
          }}
          aria-label={`View full details for ${project.name}`}
        >↗</button>
      </span>
    </article>
  )
}

function AdditionalProject({ project }) {
  return (
    <article className="additional-project">
      <h4>{project.name}</h4>
      <p>{project.description}</p>
      <div className="project-stack">
        {project.tech.map((tech) => <span className="project-tag" key={tech}>{tech}</span>)}
      </div>
      <div className="project-links">
        {project.links.github && <a className="project-link" href={project.links.github} target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">&#8599;</span></a>}
        {project.links.live && <a className="project-link" href={project.links.live} target="_blank" rel="noopener noreferrer">Live <span aria-hidden="true">&#8599;</span></a>}
      </div>
    </article>
  )
}

export default function ProjectGallery() {
  const [viewer, setViewer] = useState(null)
  const [detailProject, setDetailProject] = useState(null)

  function openImage(project, index, trigger) {
    setViewer({ project, index, trigger })
  }

  function closeImage() {
    setViewer(null)
  }

  function openDetails(project) {
    setDetailProject(project)
  }

  function closeDetails() {
    setDetailProject(null)
  }

  return (
    <>
      <section className="work-section section-frame" id="work" data-section aria-labelledby="work-title">
        <div className="section-heading">
          <div><p className="eyebrow">Selected case studies</p><h2 id="work-title">Featured work<span className="heading-period">.</span></h2></div>
          <p>Production systems across fintech, AI, mobile, and automation, each built end-to-end.</p>
        </div>
        <div className="project-list">
          {featuredProjects.map((project) => (
            <FeaturedProject
              project={project}
              key={project.number}
              onOpenImage={(index, trigger) => openImage(project, index, trigger)}
              onOpenDetails={openDetails}
            />
          ))}
        </div>
      </section>
      <section className="additional-section section-frame" id="more-work" data-section aria-labelledby="more-work-title">
        <div className="section-heading">
          <div><p className="eyebrow">Additional work</p><h2 id="more-work-title">More projects<span className="heading-period">.</span></h2></div>
        </div>
        <div className="additional-grid">
          {additionalProjects.map((project) => (
            <AdditionalProject project={project} key={project.name} />
          ))}
        </div>
      </section>
      {viewer && (
        <ImageViewer
          project={viewer.project}
          initialIndex={viewer.index}
          trigger={viewer.trigger}
          onClose={closeImage}
        />
      )}
      {detailProject && (
        <ProjectDetailDialog
          project={detailProject}
          isOpen={!!detailProject}
          onClose={closeDetails}
        />
      )}
    </>
  )
}
