import Link from 'next/link'

import { auth } from '@/auth'
import { getAssignmentDetailById } from '@/modules/assignments'

import { saveStudentExerciseAction } from './actions'
import { StrengthResultForm } from './StrengthResultForm'

function getMetricFieldLabel(metricType: string) {
  switch (metricType) {
    case 'DURATION':
      return 'Duración realizada'
    case 'DISTANCE':
      return 'Distancia realizada'
    case 'STRENGTH':
      return 'Carga realizada'
    default:
      return 'Resultado realizado'
  }
}

function getMetricPlaceholder(metricType: string) {
  switch (metricType) {
    case 'DURATION':
      return 'Ej: 45s / 2 min'
    case 'DISTANCE':
      return 'Ej: 5 km / 1200 m'
    case 'STRENGTH':
      return 'Ej: 3x8 @ 55kg'
    default:
      return 'Ej: completado / observación rápida'
  }
}

function getExpectedLabel(metricType: string) {
  switch (metricType) {
    case 'DURATION':
      return 'Duración esperada'
    case 'DISTANCE':
      return 'Distancia esperada'
    case 'STRENGTH':
      return 'Objetivo del trainer'
    default:
      return 'Indicaciones del trainer'
  }
}

function isStrengthMetric(metricType: string) {
  return metricType === 'STRENGTH'
}

type StudentExercisePageProps = {
  params: Promise<{
    id: string
    exerciseId: string
  }>
  searchParams?: Promise<{
    error?: string
  }>
}

export default async function StudentExercisePage({ params, searchParams }: StudentExercisePageProps) {
  const { id, exerciseId } = await params
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

  const exercise = assignment.sections.flatMap((section) => section.exercises).find((item) => item.id === exerciseId)

  if (!exercise) {
    return (
      <div className="student-shell stack">
        <section className="student-detail-header stack">
          <Link className="pill" href={`/student/block/${assignment.id}`}>
            Volver al bloque
          </Link>
          <h1 className="student-title">Ejercicio no encontrado</h1>
          <p className="student-subtitle">No pudimos encontrar este ejercicio dentro del bloque.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="student-exercise-page">
      <header className="student-mobile-topbar">
        <Link href={`/student/block/${assignment.id}`} className="student-icon-button" aria-label="Volver al bloque">←</Link>
        <h1>FitTrack</h1>
        <span className="student-icon-button student-icon-button--static" aria-hidden="true" />
      </header>

      <main className="student-exercise-page__content">
        {qs.error ? <p className="student-feedback student-feedback--error">{decodeURIComponent(qs.error)}</p> : null}

        <section className="student-exercise-context">
          <span>Ejercicio</span>
          <h2>{exercise.name}</h2>
          {exercise.notes ? <p>{exercise.notes}</p> : null}
          {exercise.videoUrl ? (
            <a
              className="student-exercise-context__video-button"
              href={exercise.videoUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span aria-hidden="true">▶</span>
              Ver ejecución
            </a>
          ) : null}
          <div>
            <b>{assignment.programCode}</b>
            <small>{exercise.status === 'COMPLETED' ? 'Completado' : 'Pendiente'}</small>
          </div>
        </section>

        <section className="student-exercise-goal">
          <h2>🎯 Objetivo del entrenador</h2>
          {isStrengthMetric(exercise.metricType) && exercise.expectedStrength ? (
            <div className="student-exercise-goal__strength">
              <p>Series: <b>{exercise.expectedStrength.series ?? '-'}</b></p>
              <p>Repeticiones: <b>{exercise.expectedStrength.repetitions ?? '-'}</b></p>
              <p>Peso: <b>{exercise.expectedStrength.weight ?? '-'} kg</b></p>
            </div>
          ) : (
            <p>{getExpectedLabel(exercise.metricType)}: <b>{exercise.expectedValue ?? 'Sin prescripción visible'}</b></p>
          )}
          <div className="student-exercise-goal__details">
            {exercise.restLabel ? <p>Descanso: {exercise.restLabel}</p> : null}
            {exercise.methodLabel ? <p>Método: {exercise.methodLabel}</p> : null}
          </div>
        </section>

        {isStrengthMetric(exercise.metricType) ? (
          <StrengthResultForm
            action={saveStudentExerciseAction.bind(null, { assignmentId: assignment.id, exerciseId: exercise.id })}
            assignmentId={assignment.id}
            currentSets={exercise.currentStrengthSets ?? []}
            expectedStrength={exercise.expectedStrength}
          />
        ) : (
          <form action={saveStudentExerciseAction.bind(null, { assignmentId: assignment.id, exerciseId: exercise.id })} className="student-exercise-form">
            <span className="student-exercise-form__kicker">📝 Tu registro de hoy</span>
            <label className="student-exercise-form__field">
              <span>{getMetricFieldLabel(exercise.metricType)}</span>
              <input name="value" type="text" defaultValue={exercise.currentValue ?? ''} placeholder={getMetricPlaceholder(exercise.metricType)} />
            </label>
            <section className="student-exercise-form__actions">
              <Link className="student-exercise-button student-exercise-button--secondary" href={`/student/block/${assignment.id}`}>Cancelar</Link>
              <button className="student-exercise-button student-exercise-button--primary" type="submit">Guardar ejercicio</button>
            </section>
          </form>
        )}
      </main>
    </div>
  )
}
