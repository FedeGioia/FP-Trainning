type StatCardProps = {
  label: string
  value: string | number
  detail?: string
}

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <article className="card stack" style={{ gap: '0.35rem' }}>
      <span className="muted">{label}</span>
      <strong style={{ fontSize: '1.8rem' }}>{value}</strong>
      {detail ? <span className="muted">{detail}</span> : null}
    </article>
  )
}
