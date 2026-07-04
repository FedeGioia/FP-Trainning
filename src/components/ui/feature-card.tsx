type FeatureCardProps = {
  title: string
  description: string
}

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <article className="card stack">
      <h2>{title}</h2>
      <p className="muted">{description}</p>
    </article>
  )
}
