import Link from 'next/link'

import type { AssignmentSummary } from '@/modules/assignments'
import { ProgramBadge } from './program-badge'

type AssignmentCardProps = {
  assignment: AssignmentSummary
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const scheduled = new Date(assignment.scheduledAt)

  return (
    <article className="card stack" style={{ gap: '0.75rem' }}>
      <div className="stack" style={{ gap: '0.35rem' }}>
        <ProgramBadge code={assignment.programCode} />
        <h2 style={{ margin: 0 }}>{assignment.title}</h2>
      </div>

      <p className="muted" style={{ margin: 0 }}>
        Alumno: {assignment.studentName}
      </p>
      <p className="muted" style={{ margin: 0 }}>
        Template: {assignment.templateName ?? 'Manual'}
      </p>
      <p className="muted" style={{ margin: 0 }}>
        Agenda: {scheduled.toLocaleString('es-AR')}
      </p>

      <div className="role-nav">
        <span className="status status--ok">{assignment.status}</span>
        <span className="status status--muted">{assignment.sectionCount} secciones</span>
        <Link className="pill" href={`/trainer/assignments/${assignment.id}`}>
          Revisar
        </Link>
      </div>
    </article>
  )
}
