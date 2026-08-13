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
  const exercises = assignment.sections.flatMap((section) => section.exercises)
  const nextPendingExercise = exercises.find((item) => item.status === 'PENDING')
  const progressPercent = assignment.totalExerciseCount
    ? Math.round((assignment.completedExerciseCount / assignment.totalExerciseCount) * 100)
    : 0
  const isComplete = assignment.totalExerciseCount > 0 && assignment.completedExerciseCount === assignment.totalExerciseCount

  return (
    <div className="student-workout-page">
      <header className="student-mobile-topbar">
        <Link href="/student/today" className="student-icon-button" aria-label="Volver a hoy">←</Link>
        <span aria-hidden="true" />
        <span className="student-icon-button student-icon-button--static" aria-hidden="true">▣</span>
      </header>

      <main className="student-workout-page__content">
        <section className="student-workout-heading">
          <span>Checklist de entrenamiento</span>
          <h1>{assignment.title}</h1>
        </section>

        {qs.error ? <p className="student-feedback student-feedback--error">{decodeURIComponent(qs.error)}</p> : null}
        {qs.saved ? <p className="student-feedback student-feedback--success">Resultados guardados correctamente.</p> : null}

        <section className="student-workout-progress" aria-label="Progreso del bloque">
          <div className="student-workout-progress__track">
            <span style={{ width: `${assignment.totalExerciseCount ? (assignment.completedExerciseCount / assignment.totalExerciseCount) * 100 : 0}%` }} />
          </div>
          <div className="student-workout-progress__header">
            <div>
              <span className="student-workout-progress__eyebrow">Tu avance</span>
              <h2>{isComplete ? 'Bloque completado' : 'Seguí con tu checklist'}</h2>
              <p>{assignment.completedExerciseCount} de {assignment.totalExerciseCount} ejercicios registrados</p>
            </div>
            <span>{progressPercent}%</span>
          </div>
          {nextPendingExercise ? (
            <Link className="student-workout-progress__next" href={`/student/block/${assignment.id}/exercise/${nextPendingExercise.id}`}>
              <span>Próximo ejercicio</span>
              <strong>{nextPendingExercise.name}</strong>
              <b aria-hidden="true">→</b>
            </Link>
          ) : (
            <p className="student-workout-progress__complete">✓ Ya registraste todos los ejercicios de este bloque.</p>
          )}
        </section>

        {assignment.notes ? <aside className="student-workout-note"><strong>Notas del entrenador</strong><p>{assignment.notes}</p></aside> : null}

        <section className="student-workout-exercises" aria-label="Ejercicios del bloque">
          {assignment.sections.map((section) => (
            <div key={section.id} className="student-workout-section">
              {assignment.sections.length > 1 ? <h2>{section.title}</h2> : null}
              <ol className="student-workout-checklist">
              {section.exercises.map((item) => {
                const exerciseNumber = exercises.findIndex((exercise) => exercise.id === item.id) + 1
                const isNext = item.id === nextPendingExercise?.id

                return (
                  <li key={item.id}>
                    <article className={`student-workout-exercise student-workout-exercise--${item.status.toLowerCase()}`}>
                      <div className="student-workout-exercise__body">
                        <div className="student-workout-exercise__header">
                          <span className={`student-workout-exercise__marker${item.status === 'COMPLETED' ? ' student-workout-exercise__marker--completed' : ''}`} aria-label={`Ejercicio ${exerciseNumber}: ${getExerciseStatusLabel(item.status)}`}>
                            {item.status === 'COMPLETED' ? '✓' : exerciseNumber}
                          </span>
                          <div className="student-workout-exercise__meta">
                            <span className="student-metric-badge">{item.metricType}</span>
                            <span className={`student-exercise-state ${getExerciseStatusClass(item.status)}`}><b>{getExerciseStatusIcon(item.status)}</b> {isNext ? 'Siguiente' : getExerciseStatusLabel(item.status)}</span>
                          </div>
                        </div>
                        <h3>{item.name}</h3>
                        {item.currentValue ? <p className="student-workout-exercise__value">Último valor: {item.currentValue}</p> : null}
                        <Link className={`student-exercise-link${item.status === 'COMPLETED' ? ' student-exercise-link--outline' : ''}`} href={`/student/block/${assignment.id}/exercise/${item.id}`}>
                          {item.status === 'COMPLETED' ? 'Ver o actualizar registro' : isNext ? 'Empezar ejercicio' : 'Abrir ejercicio'} <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </article>
                  </li>
                )
              })}
              </ol>
            </div>
          ))}
        </section>

        {assignment.studentNotes ? <aside className="student-workout-note"><strong>Tus notas cargadas</strong><p>{assignment.studentNotes}</p></aside> : null}
        <p className="student-workout-context">{assignment.templateName ?? 'Bloque manual'} · {scheduled}</p>
      </main>
    </div>
  )
}
