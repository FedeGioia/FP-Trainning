import type { ProgramSummary } from '@/modules/programs'

type ProgramCardProps = {
  program: ProgramSummary
}

export function ProgramCard({ program }: ProgramCardProps) {
  return (
    <article className="card stack" style={{ gap: '0.65rem' }}>
      <div className="stack" style={{ gap: '0.35rem' }}>
        <span className="eyebrow">{program.code}</span>
        <h2 style={{ margin: 0 }}>{program.name}</h2>
      </div>
      <p className="muted">{program.description ?? 'Sin descripción todavía.'}</p>
      <div>
        <span className={program.active ? 'status status--ok' : 'status status--muted'}>
          {program.active ? 'Activo' : 'Inactivo'}
        </span>
      </div>
    </article>
  )
}
