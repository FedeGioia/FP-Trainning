import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getTrainerDashboardData } from '@/modules/trainer-students'

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
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'trainer') {
    redirect('/login?error=auth')
  }

  const dashboard = await getTrainerDashboardData(session.user.id)
  const completedPercent = dashboard.week.total === 0 ? 0 : Math.round((dashboard.week.completed / dashboard.week.total) * 100)
  const pendingPercent = dashboard.week.total === 0 ? 0 : Math.round((dashboard.week.pending / dashboard.week.total) * 100)
  const overduePercent = dashboard.week.total === 0 ? 0 : Math.round((dashboard.week.overdue / dashboard.week.total) * 100)

  return (
    <div className="trainer-dashboard stack">
      <section className="trainer-dashboard__intro">
        <div>
          <span className="eyebrow">Panel de control</span>
          <h1>Resumen operativo</h1>
          <p>Visión general del rendimiento y estado de tus alumnos hoy.</p>
        </div>
        <div className="trainer-dashboard__header-actions">
          <Link className="trainer-dashboard__header-action" href="/trainer/templates">Plantillas</Link>
          <Link className="trainer-dashboard__header-action trainer-dashboard__header-action--primary" href="/trainer/students/new">+ Nuevo alumno</Link>
        </div>
      </section>

      <section className="trainer-dashboard__metrics" aria-label="Resumen de operación">
          <article className="trainer-dashboard__metric">
            <span>Entrenan hoy</span>
            <strong>{dashboard.todayTrainings.length}<small>/ {dashboard.studentCount} activos</small></strong>
          </article>
          <article className="trainer-dashboard__metric trainer-dashboard__metric--attention">
            <span>Atención requerida</span>
            <strong>{dashboard.attention.length}<small> alumnos</small></strong>
          </article>
          <article className="trainer-dashboard__metric trainer-dashboard__metric--attention">
            <span>Cargas pendientes</span>
            <strong>{dashboard.attention.filter((student) => student.reasons.some((reason) => reason.type === 'NO_WEEKLY_ROUTINE')).length}<small> sin rutina</small></strong>
          </article>
      </section>

      <div className="trainer-dashboard__content-grid">
        <section className="trainer-dashboard__work trainer-dashboard__work--primary" aria-label="Entrenamientos de hoy">
          <div className="trainer-dashboard__section-heading">
            <div><span className="eyebrow">Seguimiento</span><h2>Entrenamientos de hoy</h2></div>
            <Link className="trainer-dashboard__view-all" href="/trainer/assignments">Ver todos</Link>
          </div>
          {dashboard.todayTrainings.length > 0 ? <div className="trainer-dashboard__queue">
            {dashboard.todayTrainings.map((training) => (
              <Link className="trainer-dashboard__assignment" href={`/trainer/assignments/${training.id}`} key={training.id}>
                <span className="trainer-dashboard__avatar" aria-hidden="true">{training.studentName.slice(0, 1)}</span>
                <div className="trainer-dashboard__assignment-main"><strong>{training.studentName}</strong><span>{training.title}</span></div>
                <div className="trainer-dashboard__assignment-meta"><span className={`trainer-dashboard__status trainer-dashboard__status--${training.status.toLowerCase()}`}>{training.status === 'COMPLETED' ? 'Completado' : training.status === 'IN_PROGRESS' ? 'En curso' : formatAssignmentDate(training.scheduledAt)}</span><span>Ver rutina →</span></div>
              </Link>
            ))}
          </div> : <div className="trainer-dashboard__empty"><strong>No hay entrenamientos para hoy.</strong><span>Podés preparar las rutinas de los próximos días.</span></div>}
        </section>

        <aside className="trainer-dashboard__sidebar">
          <section className="trainer-dashboard__attention" aria-labelledby="attention-title">
            <div className="trainer-dashboard__attention-heading"><span aria-hidden="true">⚠</span><h2 id="attention-title">Atención requerida</h2></div>
            {dashboard.attention.length > 0 ? <div className="trainer-dashboard__attention-list">{dashboard.attention.map((student) => <Link href={`/trainer/students/${student.id}`} key={student.id} className="trainer-dashboard__attention-item"><span className="trainer-dashboard__avatar" aria-hidden="true">{student.name.slice(0, 1)}</span><span><strong>{student.name}</strong>{student.reasons.map((reason) => <small key={reason.type}>{reason.label}</small>)}</span><b aria-hidden="true">→</b></Link>)}</div> : <div className="trainer-dashboard__empty trainer-dashboard__empty--compact"><span>Todos los alumnos tienen seguimiento al día.</span></div>}
          </section>
          <section className="trainer-dashboard__week-summary" aria-labelledby="week-status-title">
            <h2 id="week-status-title">Estado de la semana</h2>
            <div className="trainer-dashboard__progress"><span>Completados <b>{completedPercent}%</b></span><i><em style={{ width: `${completedPercent}%` }} /></i></div>
            <div className="trainer-dashboard__progress trainer-dashboard__progress--pending"><span>Pendientes <b>{pendingPercent}%</b></span><i><em style={{ width: `${pendingPercent}%` }} /></i></div>
            <div className="trainer-dashboard__progress trainer-dashboard__progress--overdue"><span>Vencidos sin iniciar <b>{overduePercent}%</b></span><i><em style={{ width: `${overduePercent}%` }} /></i></div>
            <p>Basado en {dashboard.week.total} rutina{dashboard.week.total === 1 ? '' : 's'} asignada{dashboard.week.total === 1 ? '' : 's'} esta semana.</p>
          </section>
        </aside>
      </div>
    </div>
  )
}
