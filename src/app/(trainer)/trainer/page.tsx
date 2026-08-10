import Link from 'next/link'

import { listAssignments } from '@/modules/assignments'
import { listStudents } from '@/modules/users'

const statusLabel = {
  PLANNED: 'Por iniciar',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completada',
  PARTIAL: 'Parcial',
  CANCELLED: 'Cancelada',
} as const

function formatAssignmentDate(scheduledAt: string) {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(scheduledAt))
}

export default async function TrainerDashboardPage() {
  const [assignments, students] = await Promise.all([listAssignments(), listStudents()])
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const planned = assignments.filter((assignment) => assignment.status === 'PLANNED')
  const needsAttention = assignments.filter(
    (assignment) => assignment.status === 'IN_PROGRESS' || (assignment.status === 'PLANNED' && new Date(assignment.scheduledAt) < today),
  )
  const upcoming = planned.filter((assignment) => new Date(assignment.scheduledAt) >= today).slice(0, 4)
  const workQueue = needsAttention.slice(0, 3)

  return (
    <div className="trainer-dashboard stack">
      <section className="trainer-dashboard__intro">
        <div>
          <span className="eyebrow">Operación diaria</span>
          <h1>Todo listo para avanzar</h1>
          <p>Priorizá las rutinas que requieren seguimiento y organizá lo próximo.</p>
        </div>
        <Link className="button button-primary" href="/trainer/assignments/new">
          Asignar rutina
        </Link>
      </section>

      <section className="trainer-dashboard__overview" aria-label="Resumen de operación">
        <div className="trainer-dashboard__actions">
          <Link className="trainer-dashboard__action trainer-dashboard__action--primary" href="/trainer/assignments/new">
            <span>Planificar</span>
            <strong>Asignar una rutina</strong>
            <small>Desde una plantilla existente</small>
          </Link>
          <Link className="trainer-dashboard__action" href="/trainer/students/new">
            <span>Alumnos</span>
            <strong>Nuevo alumno</strong>
            <small>Crear acceso y programas</small>
          </Link>
          <Link className="trainer-dashboard__action" href="/trainer/templates">
            <span>Biblioteca</span>
            <strong>Ver plantillas</strong>
            <small>Preparar la próxima rutina</small>
          </Link>
        </div>

        <div className="trainer-dashboard__metrics">
          <article className="trainer-dashboard__metric">
            <span>Alumnos activos</span>
            <strong>{students.length}</strong>
          </article>
          <article className="trainer-dashboard__metric">
            <span>Por iniciar</span>
            <strong>{planned.length}</strong>
          </article>
          <article className="trainer-dashboard__metric trainer-dashboard__metric--attention">
            <span>Requieren atención</span>
            <strong>{needsAttention.length}</strong>
          </article>
        </div>
      </section>

      <section className="trainer-dashboard__work" aria-label="Trabajo pendiente">
        <div className="trainer-dashboard__section-heading">
          <div>
            <span className="eyebrow">Para revisar</span>
            <h2>Tu foco ahora</h2>
          </div>
          <Link className="pill" href="/trainer/assignments">
            Ver agenda completa
          </Link>
        </div>

        {workQueue.length > 0 ? (
          <div className="trainer-dashboard__queue">
            {workQueue.map((assignment) => (
              <Link className="trainer-dashboard__assignment" href={`/trainer/assignments/${assignment.id}`} key={assignment.id}>
                <div className="trainer-dashboard__assignment-main">
                  <span className="trainer-dashboard__assignment-status">{statusLabel[assignment.status]}</span>
                  <strong>{assignment.title}</strong>
                  <span>{assignment.studentName}</span>
                </div>
                <div className="trainer-dashboard__assignment-meta">
                  <span>{formatAssignmentDate(assignment.scheduledAt)}</span>
                  <span>Revisar →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="trainer-dashboard__empty">
            <strong>No hay rutinas que requieran seguimiento ahora.</strong>
            <span>Podés preparar próximas asignaciones o revisar la agenda.</span>
          </div>
        )}

        <div className="trainer-dashboard__section-heading trainer-dashboard__section-heading--upcoming">
          <div>
            <h2>Próximas asignaciones</h2>
            <p>Rutinas programadas para empezar.</p>
          </div>
        </div>

        {upcoming.length > 0 ? (
          <div className="trainer-dashboard__upcoming-list">
            {upcoming.map((assignment) => (
              <Link className="trainer-dashboard__upcoming-item" href={`/trainer/assignments/${assignment.id}`} key={assignment.id}>
                <div>
                  <strong>{assignment.title}</strong>
                  <span>{assignment.studentName}</span>
                </div>
                <span>{formatAssignmentDate(assignment.scheduledAt)}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="trainer-dashboard__empty trainer-dashboard__empty--compact">
            <span>No hay rutinas próximas. Creá una asignación para organizar la semana.</span>
          </div>
        )}
      </section>
    </div>
  )
}
