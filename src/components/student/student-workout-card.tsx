import Link from 'next/link'

import { ProgramBadge, getProgramToneClass } from '@/components/ui/program-badge'
import type { AssignmentSummary } from '@/modules/assignments'

type StudentWorkoutCardProps = {
  assignment: AssignmentSummary
}

const statusLabels = {
  PLANNED: 'Planificado',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completado',
  PARTIAL: 'Parcial',
  CANCELLED: 'Cancelado',
} as const

function getStatusClass(status: AssignmentSummary['status']) {
  return `student-workout-card__status--${status.toLowerCase()}`
}

export function StudentWorkoutCard({ assignment }: StudentWorkoutCardProps) {
  const time = new Date(assignment.scheduledAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  return (
    <Link
      className={`student-day-card student-workout-card program-surface ${getProgramToneClass(assignment.programCode)}`}
      href={`/student/block/${assignment.id}`}
    >
      <div className="student-day-card__top">
        <div className="stack" style={{ gap: '0.25rem' }}>
          <ProgramBadge code={assignment.programCode} />
          <strong>{assignment.title}</strong>
        </div>
        <span className="student-time">{time}</span>
      </div>

      <p className="muted">{assignment.templateName ?? 'Bloque personalizado'}</p>

      <div className="student-workout-card__meta">
        <span className="status status--muted">{assignment.sectionCount} secciones</span>
        <span className={`status student-workout-card__status ${getStatusClass(assignment.status)}`}>
          {statusLabels[assignment.status]}
        </span>
      </div>
    </Link>
  )
}
