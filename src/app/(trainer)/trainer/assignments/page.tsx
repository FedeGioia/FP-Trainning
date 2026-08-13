import Link from 'next/link'

import { listAssignments } from '@/modules/assignments'
import type { AssignmentStatus } from '@/modules/assignments'
import { ProgramBadge } from '@/components/ui/program-badge'
import { TrainerAction, TrainerEmptyState, TrainerMetricCard, TrainerNotice, TrainerPageHeader, TrainerStatusBadge, TrainerSurface } from '@/components/trainer-ui'

type TrainerAssignmentsPageProps = {
  searchParams?: Promise<{
    created?: string
  }>
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

export default async function TrainerAssignmentsPage({ searchParams }: TrainerAssignmentsPageProps) {
  const params = (await searchParams) ?? {}
  const assignments = await listAssignments()
  const planned = assignments.filter((assignment) => assignment.status === 'PLANNED').length

  return (
    <div className="trainer-assignments">
      <TrainerSurface className="trainer-assignments__hero" aria-label="Asignaciones de rutinas">
        <TrainerPageHeader
          className="trainer-assignments__hero-copy"
          eyebrow="Agenda"
          title="Asignaciones de rutinas"
          description="Gestioná y programá los entrenamientos de tus alumnos."
          actions={<><TrainerAction className="trainer-assignments__action trainer-assignments__action--secondary" href="/trainer/assignments/manual">Rutina manual</TrainerAction><TrainerAction className="trainer-assignments__action trainer-assignments__action--primary" href="/trainer/assignments/new" variant="primary">Desde plantilla</TrainerAction></>}
        />
      </TrainerSurface>

      {params.created ? <TrainerNotice className="trainer-assignments__notice" role="status">Asignación creada correctamente.</TrainerNotice> : null}

      <section className="trainer-assignments__metrics" aria-label="Resumen de asignaciones">
          <TrainerMetricCard className="trainer-assignments__metric">
          <span>Asignaciones activas</span>
          <strong>{assignments.length}</strong>
          <p>Bloques visibles en agenda</p>
        </TrainerMetricCard>
          <TrainerMetricCard className="trainer-assignments__metric">
          <span>Por iniciar</span>
          <strong>{planned}</strong>
          <p>Todavía no arrancadas por el alumno</p>
        </TrainerMetricCard>
          <TrainerMetricCard className="trainer-assignments__metric">
          <span>Programadas</span>
          <strong>{assignments.length}</strong>
          <p>Sesiones organizadas por fecha y hora</p>
        </TrainerMetricCard>
      </section>

      <TrainerSurface className="trainer-assignments__agenda">
        <header className="trainer-assignments__agenda-header">
          <h2>Agenda visible</h2>
          <p>Revisá qué tiene cada alumno, cuándo le toca y cómo viene avanzando.</p>
        </header>

        <label className="trainer-assignments__search">
          <span aria-hidden="true">⌕</span>
          <input aria-label="Buscar por alumno o rutina" placeholder="Buscar por alumno o rutina..." type="search" />
        </label>

        <div className="trainer-assignments__list">
          {assignments.length > 0 ? (
            assignments.map((assignment) => (
              <Link className="trainer-assignments__row trainer-list-row" href={`/trainer/assignments/${assignment.id}`} key={assignment.id}>
                <ProgramBadge className="trainer-assignments__program" code={assignment.programCode} />
                <div className="trainer-assignments__row-copy">
                  <strong>{assignment.title}</strong>
                  <span>{assignment.studentName}</span>
                </div>
                <div className="trainer-assignments__row-meta">
                  <time dateTime={assignment.scheduledAt}>◷ {formatScheduledAt(assignment.scheduledAt)}</time>
                  <TrainerStatusBadge className={`trainer-assignments__status trainer-assignments__status--${assignment.status.toLowerCase()}`}>
                    {assignmentStatusLabels[assignment.status]}
                  </TrainerStatusBadge>
                </div>
              </Link>
            ))
          ) : (
            <TrainerEmptyState className="trainer-assignments__empty">
              <strong>Todavía no hay asignaciones visibles.</strong>
              <span>Creá una rutina desde una plantilla o cargala manualmente.</span>
            </TrainerEmptyState>
          )}
        </div>
      </TrainerSurface>
    </div>
  )
}
