import type { ReactNode } from 'react'

type SectionIntroProps = {
  eyebrow?: string
  title: string
  description: string
  actions?: ReactNode
}

export function SectionIntro({ eyebrow, title, description, actions }: SectionIntroProps) {
  return (
    <section className="content-hero">
      <div className="content-hero__body stack" style={{ gap: '0.45rem' }}>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1 className="workspace-title">{title}</h1>
        <p className="muted content-hero__description">{description}</p>
      </div>
      {actions ? <div className="content-hero__actions">{actions}</div> : null}
    </section>
  )
}
