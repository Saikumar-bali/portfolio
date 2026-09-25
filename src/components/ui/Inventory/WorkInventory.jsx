import { inventorySections, jobTitles, featuredProjects, additionalProjects, skills, achievements, suggestedBullets } from '../../../config/inventoryContent.js'
import { useState } from 'react'

function CollapsedRow({ number, title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="inventory-block">
      <button className="inventory-heading" type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="inventory-number">{number}</span>
        <span>{title}</span>
        <span className="inventory-toggle" aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="inventory-body">{children}</div>}
    </div>
  )
}

function BulletList({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export default function WorkInventory() {
  return (
    <section className="inventory-section section-frame" id="inventory" data-section aria-labelledby="inventory-title">
      <div className="inventory-frame">
        {inventorySections.map((block) => (
          <div className="inventory-copy" key={block.section ?? block.id}>
            {block.section ? (
              <CollapsedRow number={block.id} title={block.title}>
                <p className="eyebrow">{block.eyebrow}</p>
                <h3>{block.title}</h3>
                <p>{block.intro}</p>
                {block.contact.map((item) => (
                  <p key={item.icon}>{item.icon} {item.text}</p>
                ))}
              </CollapsedRow>
            ) : (
              <>
                <p className="eyebrow">{block.eyebrow}</p>
                <h2 id="inventory-title">{block.title}</h2>
                <p>{block.intro}</p>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="inventory-titles">
        {jobTitles.map((job) => (
          <CollapsedRow key={job.title} number={`0${jobTitles.indexOf(job.title) + 1}`} title={job.title}>
            <BulletList items={job.evidence} />
          </CollapsedRow>
        ))}
      </div>
      <div className="inventory-projects">
        <h3>Featured Projects</h3>
        {featuredProjects.map((project) => (
          <CollapsedRow key={project.name} number={project.metrics.split(' · ')[0]} title={project.name}>
            <p className="eyebrow">{project.type} · {project.proof}</p>
            <p>{project.description}</p>
            <p>{project.metrics}</p>
            <small>{project.stack}</small>
          </CollapsedRow>
        ))}
        <h3>Additional Projects</h3>
        {additionalProjects.map((project) => (
          <CollapsedRow key={project.name} number="—" title={project.name}>
            <p>{project.type}</p>
            <small>{project.proof} · {project.stack}</small>
          </CollapsedRow>
        ))}
      </div>
      <div className="inventory-skills">
        <h3>Technical Skills</h3>
        {Object.entries(skills).map(([domain, items]) => (
          <CollapsedRow key={domain} number="—" title={domain}>
            <p>{items}</p>
          </CollapsedRow>
        ))}
      </div>
      <div className="inventory-achievements">
        <h3>Quantified Achievements</h3>
        <BulletList items={achievements} />
      </div>
      <div className="inventory-bullets">
        <h3>Suggested Bullet Phrasings</h3>
        {Object.entries(suggestedBullets).map(([key, text]) => (
          <CollapsedRow key={key} number="—" title={key}>
            <p>{text}</p>
          </CollapsedRow>
        ))}
      </div>
    </section>
  )
}