import type { ProgramSummary } from '@/modules/programs'
import { ProgramBadge } from './program-badge'

type ProgramCardProps = {
  program: ProgramSummary
}

export function ProgramCard({ program }: ProgramCardProps) {
  return (
    <article className="card stack" style={{ gap: '0.65rem' }}>
      <div className="stack" style={{ gap: '0.35rem' }}>
        <ProgramBadge code={program.code} />
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
