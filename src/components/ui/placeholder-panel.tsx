type PlaceholderPanelProps = {
  title: string
  description: string
  titleAs?: 'h1' | 'h2' | 'h3'
}

export function PlaceholderPanel({ title, description, titleAs: Title = 'h2' }: PlaceholderPanelProps) {
  return (
    <section className="card stack">
      <Title className="section-title">{title}</Title>
      <p className="muted">{description}</p>
    </section>
  )
}
