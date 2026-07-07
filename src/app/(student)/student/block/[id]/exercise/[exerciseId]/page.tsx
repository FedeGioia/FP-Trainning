import Link from 'next/link'

import { auth } from '@/auth'
import { ProgramBadge, getProgramToneClass } from '@/components/ui/program-badge'
import { getAssignmentDetailById } from '@/modules/assignments'

import { saveStudentExerciseAction } from './actions'

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
    <div className="student-shell stack">
      <section className={`student-detail-header stack program-surface ${getProgramToneClass(assignment.programCode)}`}>
        <Link className="pill" href={`/student/block/${assignment.id}`}>
          Volver al bloque
        </Link>

        <div className="stack" style={{ gap: '0.35rem' }}>
          <span className="eyebrow">Ejercicio</span>
          <h1 className="student-title">{exercise.name}</h1>
          <p className="student-subtitle">Cargá este ejercicio solo, guardalo y volvés al bloque con el estado actualizado.</p>
        </div>

        <div className="student-block-meta">
          <ProgramBadge code={assignment.programCode} />
          <span className={exercise.status === 'COMPLETED' ? 'status status--ok' : 'status status--muted'}>
            {exercise.status === 'COMPLETED' ? 'Completado' : 'Pendiente'}
          </span>
        </div>
      </section>

      {qs.error ? <span className="status status--error">{decodeURIComponent(qs.error)}</span> : null}

      <section className={`student-progress-card program-surface ${getProgramToneClass(assignment.programCode)} form-panel form-panel--soft`}>
        <div>
          <span className="muted">Tipo de métrica</span>
          <strong>{exercise.metricType}</strong>
        </div>
      </section>

      <section className={`student-progress-card program-surface ${getProgramToneClass(assignment.programCode)} form-panel form-panel--soft`}>
        <div className="stack" style={{ gap: '0.45rem' }}>
          <span className="muted">Lo pedido por el trainer</span>
          <strong>{getExpectedLabel(exercise.metricType)}</strong>
          {isStrengthMetric(exercise.metricType) && exercise.expectedStrength ? (
            <div className="stack" style={{ gap: '0.2rem' }}>
              <span>Series esperadas: {exercise.expectedStrength.series ?? '-'}</span>
              <span>Repeticiones esperadas: {exercise.expectedStrength.repetitions ?? '-'}</span>
              <span>Peso esperado: {exercise.expectedStrength.weight ?? '-'} kg</span>
            </div>
          ) : (
            <span>{exercise.expectedValue ?? 'Sin prescripción visible'}</span>
          )}
          {exercise.restLabel ? <span className="muted">Descanso: {exercise.restLabel}</span> : null}
          {exercise.methodLabel ? <span className="muted">Método: {exercise.methodLabel}</span> : null}
          {exercise.notes ? <span className="muted">Notas: {exercise.notes}</span> : null}
        </div>
      </section>

      <form action={saveStudentExerciseAction.bind(null, { assignmentId: assignment.id, exerciseId: exercise.id })} className="student-result-form stack">
        {isStrengthMetric(exercise.metricType) ? (
          <>
            <div className="stack form-panel form-panel--soft" style={{ gap: '0.35rem' }}>
              <span className="muted">Lo realizado por vos</span>
              <strong>Cargá series, repeticiones y peso por separado.</strong>
              <span className="field-hint">Si cambiaste algo respecto a lo pedido, dejalo reflejado en estos tres campos.</span>
            </div>

            <div className="form-grid">
              <label className="field">
                <span>Series realizadas</span>
                <small>Cuántas series completaste realmente.</small>
                <input
                  name="strengthSeries"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={exercise.currentStrength?.series ?? ''}
                  placeholder="Ej: 3"
                />
              </label>

              <label className="field">
                <span>Repeticiones realizadas</span>
                <small>Las repeticiones reales por serie.</small>
                <input
                  name="strengthRepetitions"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={exercise.currentStrength?.repetitions ?? ''}
                  placeholder="Ej: 8"
                />
              </label>
            </div>

            <label className="field">
              <span>Peso realizado en kg</span>
              <small>Usá el peso que efectivamente moviste.</small>
              <input
                name="strengthWeight"
                type="number"
                min="0"
                step="0.5"
                defaultValue={exercise.currentStrength?.weight ?? ''}
                placeholder="Ej: 60"
              />
            </label>
          </>
        ) : (
          <label className="field">
            <span>{getMetricFieldLabel(exercise.metricType)}</span>
            <small>Registrá el valor real que completaste en este ejercicio.</small>
            <input
              name="value"
              type="text"
              defaultValue={exercise.currentValue ?? ''}
              placeholder={getMetricPlaceholder(exercise.metricType)}
            />
          </label>
        )}

        <section className="student-action-bar">
          <Link className="button button-secondary" href={`/student/block/${assignment.id}`}>
            Cancelar
          </Link>
          <button className="button button-primary" type="submit">
            Guardar ejercicio
          </button>
        </section>
      </form>
    </div>
  )
}
