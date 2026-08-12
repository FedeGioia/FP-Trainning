import Link from 'next/link'

import { auth } from '@/auth'
import { getAssignmentDetailById } from '@/modules/assignments'

function getExerciseStatusClass(status: 'PENDING' | 'COMPLETED') {
  return status === 'COMPLETED' ? 'status status--ok' : 'status status--muted'
}

function getExerciseStatusLabel(status: 'PENDING' | 'COMPLETED') {
  return status === 'COMPLETED' ? 'Completado' : 'Pendiente'
}

function getExerciseStatusIcon(status: 'PENDING' | 'COMPLETED') {
  return status === 'COMPLETED' ? '✓' : '◷'
}

type StudentBlockPageProps = {
  params: Promise<{
    id: string
  }>
  searchParams?: Promise<{
    error?: string
    saved?: string
  }>
}

export default async function StudentBlockPage({ params, searchParams }: StudentBlockPageProps) {
  const { id } = await params
  const qs = (await searchParams) ?? {}
  const session = await auth()
  const assignment = await getAssignmentDetailById(id, { studentId: session?.user?.id })

  if (!assignment) {
    return (
      <div className="student-shell stack">
        <section className="student-detail-header stack">
          <h1 className="student-title">Bloque no encontrado</h1>
          <p className="student-subtitle">No pudimos encontrar esta asignación.</p>
        </section>
      </div>
    )
  }

  const scheduled = new Date(assignment.scheduledAt).toLocaleString('es-AR')

  return (
    <div className="student-workout-page">
      <header className="student-mobile-topbar">
        <Link href="/student/today" className="student-icon-button" aria-label="Volver a hoy">←</Link>
        <h1>{assignment.title}</h1>
        <span className="student-icon-button student-icon-button--static" aria-hidden="true">▣</span>
      </header>

      <main className="student-workout-page__content">
        {qs.error ? <p className="student-feedback student-feedback--error">{decodeURIComponent(qs.error)}</p> : null}
        {qs.saved ? <p className="student-feedback student-feedback--success">Resultados guardados correctamente.</p> : null}

        <section className="student-workout-progress" aria-label="Progreso del bloque">
          <div className="student-workout-progress__track">
            <span style={{ width: `${assignment.totalExerciseCount ? (assignment.completedExerciseCount / assignment.totalExerciseCount) * 100 : 0}%` }} />
          </div>
          <div className="student-workout-progress__header">
            <div>
              <h2>Progreso del bloque</h2>
              <p>{assignment.completedExerciseCount} de {assignment.totalExerciseCount} ejercicios cargados</p>
            </div>
            <span>{assignment.totalExerciseCount ? Math.round((assignment.completedExerciseCount / assignment.totalExerciseCount) * 100) : 0}%</span>
          </div>
          <p className="student-workout-progress__hint">ⓘ {assignment.totalExerciseCount} ejercicios / indicaciones en total</p>
        </section>

        {assignment.notes ? <aside className="student-workout-note"><strong>Notas del entrenador</strong><p>{assignment.notes}</p></aside> : null}

        <section className="student-workout-exercises" aria-label="Ejercicios del bloque">
          {assignment.sections.map((section) => (
            <div key={section.id} className="student-workout-section">
              {assignment.sections.length > 1 ? <h2>{section.title}</h2> : null}
              {section.exercises.map((item) => (
                <article key={item.id} className={`student-workout-exercise student-workout-exercise--${item.status.toLowerCase()}`}>
                  <div className="student-workout-exercise__body">
                    <div className="student-workout-exercise__meta">
                      <span className="student-metric-badge">{item.metricType}</span>
                      <span className={`student-exercise-state ${getExerciseStatusClass(item.status)}`}><b>{getExerciseStatusIcon(item.status)}</b> {getExerciseStatusLabel(item.status)}</span>
                    </div>
                    <h3>{item.name}</h3>
                    {item.currentValue ? <p className="student-workout-exercise__value">Último valor: {item.currentValue}</p> : null}
                    <Link className={`student-exercise-link${item.status === 'COMPLETED' ? ' student-exercise-link--outline' : ''}`} href={`/student/block/${assignment.id}/exercise/${item.id}`}>
                      {item.status === 'COMPLETED' ? 'Ver detalles' : 'Cargar ejercicio'}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ))}
        </section>

        {assignment.studentNotes ? <aside className="student-workout-note"><strong>Tus notas cargadas</strong><p>{assignment.studentNotes}</p></aside> : null}
        <p className="student-workout-context">{assignment.templateName ?? 'Bloque manual'} · {scheduled}</p>
      </main>
    </div>
  )
}
