type PlaceholderPanelProps = {
  title: string
  description: string
  titleAs?: 'h1' | 'h2' | 'h3'
  className?: string
}

export function PlaceholderPanel({ title, description, titleAs: Title = 'h2', className }: PlaceholderPanelProps) {
  return (
    <section className={`card stack${className ? ` ${className}` : ''}`}>
      <Title className="section-title">{title}</Title>
      <p className="muted">{description}</p>
    </section>
  )
}
