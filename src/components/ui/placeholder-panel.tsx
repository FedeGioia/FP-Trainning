type PlaceholderPanelProps = {
  title: string
  description: string
}

export function PlaceholderPanel({ title, description }: PlaceholderPanelProps) {
  return (
    <section className="card stack">
      <h1 className="section-title">{title}</h1>
      <p className="muted">{description}</p>
    </section>
  )
}
