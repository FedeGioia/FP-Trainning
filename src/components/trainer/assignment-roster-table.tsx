import Link from 'next/link'

import type { AssignmentStatus, AssignmentSummary } from '@/modules/assignments'
import { ProgramBadge } from '@/components/ui/program-badge'
import { TrainerStatusBadge } from '@/components/trainer-ui'

type AssignmentRosterTableProps = {
  assignments: AssignmentSummary[]
}

const assignmentStatusLabels: Record<AssignmentStatus, string> = {
  PLANNED: 'Pendiente',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completado',
  PARTIAL: 'Parcial',
  CANCELLED: 'Cancelada',
}

function formatScheduledAt(scheduledAt: string) {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(scheduledAt))
}

function DetailsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function AssignmentRosterTable({ assignments }: AssignmentRosterTableProps) {
  return (
    <div className="assignment-roster">
      <div className="assignment-roster-table-wrap">
        <table className="assignment-roster-table">
          <thead>
            <tr>
              <th className="assignment-roster-table__assignment-column">Rutina</th>
              <th className="assignment-roster-table__program-column">Programa</th>
              <th className="assignment-roster-table__scheduled-column">Programada</th>
              <th className="assignment-roster-table__status-column">Estado</th>
              <th className="assignment-roster-table__actions-column">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.id}>
                <td className="assignment-roster-table__assignment assignment-roster-table__assignment-column">
                  <Link className="assignment-roster-table__assignment-trigger" href={`/trainer/assignments/${assignment.id}`}>
                    <strong>{assignment.title}</strong>
                    <span>{assignment.studentName}</span>
                  </Link>
                </td>
                <td className="assignment-roster-table__program-column">
                  <ProgramBadge code={assignment.programCode} />
                </td>
                <td className="assignment-roster-table__scheduled-column">
                  <time dateTime={assignment.scheduledAt}>{formatScheduledAt(assignment.scheduledAt)}</time>
                </td>
                <td className="assignment-roster-table__status-column">
                  <TrainerStatusBadge className={`assignment-roster-table__status assignment-roster-table__status--${assignment.status.toLowerCase()}`}>
                    {assignmentStatusLabels[assignment.status]}
                  </TrainerStatusBadge>
                </td>
                <td className="assignment-roster-table__actions-column">
                  <Link
                    className="assignment-roster-table__action"
                    href={`/trainer/assignments/${assignment.id}`}
                    aria-label={`Ver asignación ${assignment.title}`}
                    title="Ver asignación"
                  >
                    <DetailsIcon />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
