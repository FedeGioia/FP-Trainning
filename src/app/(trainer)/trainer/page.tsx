import Link from 'next/link'

import { listAssignments } from '@/modules/assignments'
import { listStudents } from '@/modules/users'
import { getWeekDaysFrom } from '@/lib/date'

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
  const weekDays = getWeekDaysFrom(now)
  const weekStart = weekDays[0] ?? today
  const weekEnd = weekDays[6] ?? today
  weekEnd.setHours(23, 59, 59, 999)
  const planned = assignments.filter((assignment) => assignment.status === 'PLANNED')
  const isThisWeek = (scheduledAt: string) => {
    const date = new Date(scheduledAt)
    return date >= weekStart && date <= weekEnd
  }
  const overdue = planned.filter((assignment) => new Date(assignment.scheduledAt) < today)
  const inProgress = assignments.filter((assignment) => assignment.status === 'IN_PROGRESS')
  const thisWeekAssignments = assignments.filter(
    (assignment) => assignment.status !== 'CANCELLED' && isThisWeek(assignment.scheduledAt),
  )
  const studentsWithoutRoutine = students.filter(
    (student) => !thisWeekAssignments.some((assignment) => assignment.studentId === student.id),
  )
  const upcoming = planned.filter((assignment) => {
    const scheduledAt = new Date(assignment.scheduledAt)
    return scheduledAt >= today && scheduledAt <= weekEnd
  }).slice(0, 4)
  const workQueue = [
    ...overdue.map((assignment) => ({ assignment, signal: 'Vencida' })),
    ...inProgress.map((assignment) => ({ assignment, signal: 'En curso' })),
  ].slice(0, 4)

  return (
    <div className="trainer-dashboard stack">
      <section className="trainer-dashboard__intro">
        <div>
          <span className="eyebrow">Esta semana</span>
          <h1>Resumen operativo</h1>
          <p>Seguimiento de la semana y próximos entrenamientos.</p>
        </div>
      </section>

      <section className="trainer-dashboard__overview" aria-label="Resumen de operación">
        <div className="trainer-dashboard__actions">
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
            <span>Alumnos</span>
            <strong>{students.length}</strong>
          </article>
          <article className="trainer-dashboard__metric trainer-dashboard__metric--attention">
            <span>Sin rutina esta semana</span>
            <strong>{studentsWithoutRoutine.length}</strong>
          </article>
          <article className="trainer-dashboard__metric trainer-dashboard__metric--attention">
            <span>Vencidas sin iniciar</span>
            <strong>{overdue.length}</strong>
          </article>
          <article className="trainer-dashboard__metric">
            <span>En curso</span>
            <strong>{inProgress.length}</strong>
          </article>
          <article className="trainer-dashboard__metric">
            <span>Próximas esta semana</span>
            <strong>{upcoming.length}</strong>
          </article>
        </div>
      </section>

      <section className="trainer-dashboard__work" aria-label="Seguimiento operativo">
        <div className="trainer-dashboard__section-heading">
          <div>
            <span className="eyebrow">Seguimiento</span>
            <h2>Vencidas y en curso</h2>
          </div>
          <Link className="pill" href="/trainer/assignments">
            Ver agenda completa
          </Link>
        </div>

        {workQueue.length > 0 ? (
          <div className="trainer-dashboard__queue">
            {workQueue.map(({ assignment, signal }) => (
              <Link className="trainer-dashboard__assignment" href={`/trainer/assignments/${assignment.id}`} key={assignment.id}>
                <div className="trainer-dashboard__assignment-main">
                  <span className="trainer-dashboard__assignment-status">{signal}</span>
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
            <strong>No hay rutinas vencidas ni en curso.</strong>
            <span>La operación está al día.</span>
          </div>
        )}

        <div className="trainer-dashboard__section-heading trainer-dashboard__section-heading--upcoming">
          <div>
            <h2>Próximas de la semana</h2>
            <p>Incluye las rutinas de hoy y mañana.</p>
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
            <span>No hay rutinas programadas para lo que queda de la semana.</span>
          </div>
        )}
      </section>
    </div>
  )
}
