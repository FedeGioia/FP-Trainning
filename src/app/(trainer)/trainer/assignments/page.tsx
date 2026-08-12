import Link from 'next/link'

import { listAssignments } from '@/modules/assignments'
import type { AssignmentStatus } from '@/modules/assignments'
import { ProgramBadge } from '@/components/ui/program-badge'

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
      <section className="trainer-assignments__hero">
        <div className="trainer-assignments__hero-copy">
          <span className="trainer-assignments__eyebrow">Agenda</span>
          <h1>Asignaciones de rutinas</h1>
          <p>Gestioná y programá los entrenamientos de tus alumnos.</p>
        </div>
        <div className="trainer-assignments__actions">
          <Link className="trainer-assignments__action trainer-assignments__action--secondary" href="/trainer/assignments/manual">
            Rutina manual
          </Link>
          <Link className="trainer-assignments__action trainer-assignments__action--primary" href="/trainer/assignments/new">
            Desde plantilla
          </Link>
        </div>
      </section>

      {params.created ? <p className="trainer-assignments__notice">Asignación creada correctamente.</p> : null}

      <section className="trainer-assignments__metrics" aria-label="Resumen de asignaciones">
        <article className="trainer-assignments__metric">
          <span>Asignaciones activas</span>
          <strong>{assignments.length}</strong>
          <p>Bloques visibles en agenda</p>
        </article>
        <article className="trainer-assignments__metric">
          <span>Por iniciar</span>
          <strong>{planned}</strong>
          <p>Todavía no arrancadas por el alumno</p>
        </article>
        <article className="trainer-assignments__metric">
          <span>Programadas</span>
          <strong>{assignments.length}</strong>
          <p>Sesiones organizadas por fecha y hora</p>
        </article>
      </section>

      <section className="trainer-assignments__agenda">
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
              <Link className="trainer-assignments__row" href={`/trainer/assignments/${assignment.id}`} key={assignment.id}>
                <ProgramBadge className="trainer-assignments__program" code={assignment.programCode} />
                <div className="trainer-assignments__row-copy">
                  <strong>{assignment.title}</strong>
                  <span>{assignment.studentName}</span>
                </div>
                <div className="trainer-assignments__row-meta">
                  <time dateTime={assignment.scheduledAt}>◷ {formatScheduledAt(assignment.scheduledAt)}</time>
                  <span className={`trainer-assignments__status trainer-assignments__status--${assignment.status.toLowerCase()}`}>
                    {assignmentStatusLabels[assignment.status]}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="trainer-assignments__empty">
              <strong>Todavía no hay asignaciones visibles.</strong>
              <span>Creá una rutina desde una plantilla o cargala manualmente.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
