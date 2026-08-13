import { auth } from '@/auth'
import { ProgramBadge } from '@/components/ui/program-badge'
import { TrainerAction, TrainerMetricCard, TrainerNotice, TrainerPageHeader, TrainerStatusBadge, TrainerSurface } from '@/components/trainer-ui'
import type { AssignmentExerciseDetail, AssignmentStatus } from '@/modules/assignments'
import { getAssignmentDetailById } from '@/modules/assignments'

import { addTrainerFeedbackAction } from './actions'

type TrainerAssignmentDetailPageProps = {
  params: Promise<{
    id: string
  }>
  searchParams?: Promise<{
    error?: string
    saved?: string
  }>
}

const assignmentStatusLabels: Record<AssignmentStatus, string> = {
  PLANNED: 'Pendiente',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completado',
  PARTIAL: 'Parcial',
  CANCELLED: 'Cancelada',
}

function getExerciseStatusLabel(status: AssignmentExerciseDetail['status']) {
  return status === 'COMPLETED' ? 'Cargado' : 'Pendiente'
}

function formatScheduledAt(scheduledAt: string) {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(scheduledAt))
}

function formatStrength(strength: AssignmentExerciseDetail['expectedStrength']) {
  if (!strength) return null

  const values = [
    strength.series !== null ? `${strength.series} series` : null,
    strength.repetitions !== null ? `${strength.repetitions} reps` : null,
    strength.weight !== null ? `${strength.weight} kg` : null,
  ].filter(Boolean)

  return values.length > 0 ? values.join(' · ') : null
}

export default async function TrainerAssignmentDetailPage({ params, searchParams }: TrainerAssignmentDetailPageProps) {
  const { id } = await params
  const qs = (await searchParams) ?? {}
  const session = await auth()
  const assignment = await getAssignmentDetailById(id, { trainerId: session?.user?.id })

  if (!assignment) {
    return (
      <div className="trainer-assignment-detail">
        <TrainerSurface className="trainer-assignment-detail__empty">
          <h1>Asignación no encontrada</h1>
          <p>No pudimos encontrar esta rutina asignada.</p>
          <TrainerAction href="/trainer/assignments" variant="secondary">Volver a asignaciones</TrainerAction>
        </TrainerSurface>
      </div>
    )
  }

  const progress = assignment.totalExerciseCount > 0
    ? Math.round((assignment.completedExerciseCount / assignment.totalExerciseCount) * 100)
    : 0
  const scheduledAt = formatScheduledAt(assignment.scheduledAt)

  return (
    <div className="trainer-assignment-detail">
      <TrainerSurface className="trainer-assignment-detail__hero" aria-label="Detalle de asignación">
        <TrainerPageHeader
          eyebrow="Revisión de entrenamiento"
          title={assignment.title}
          description={`${assignment.studentName} · ${scheduledAt}`}
          actions={<TrainerAction href="/trainer/assignments" variant="secondary">Volver a asignaciones</TrainerAction>}
        />
        <div className="trainer-assignment-detail__hero-meta">
          <ProgramBadge code={assignment.programCode} />
          <TrainerStatusBadge className={`trainer-assignment-detail__status trainer-assignment-detail__status--${assignment.status.toLowerCase()}`}>
            {assignmentStatusLabels[assignment.status]}
          </TrainerStatusBadge>
          <span>{assignment.templateName ?? 'Bloque manual'}</span>
        </div>
      </TrainerSurface>

      {qs.error ? <TrainerNotice variant="error">{decodeURIComponent(qs.error)}</TrainerNotice> : null}
      {qs.saved ? <TrainerNotice>Feedback guardado correctamente.</TrainerNotice> : null}

      <section className="trainer-assignment-detail__metrics" aria-label="Resumen de la asignación">
        <TrainerMetricCard className="trainer-assignment-detail__metric">
          <span>Progreso</span>
          <strong>{progress}%</strong>
          <p>{assignment.completedExerciseCount} de {assignment.totalExerciseCount} ejercicios cargados</p>
        </TrainerMetricCard>
        <TrainerMetricCard className="trainer-assignment-detail__metric">
          <span>Secciones</span>
          <strong>{assignment.sectionCount}</strong>
          <p>Bloques que componen la sesión</p>
        </TrainerMetricCard>
        <TrainerMetricCard className="trainer-assignment-detail__metric">
          <span>Estado</span>
          <strong className="trainer-assignment-detail__metric-status">{assignmentStatusLabels[assignment.status]}</strong>
          <p>Estado general informado por el alumno</p>
        </TrainerMetricCard>
      </section>

      <TrainerSurface className="trainer-assignment-detail__progress" aria-label="Avance del entrenamiento">
        <div>
          <span>Avance de la sesión</span>
          <strong>{assignment.completedExerciseCount} / {assignment.totalExerciseCount}</strong>
        </div>
        <div className="trainer-assignment-detail__progress-track" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
        <p>{progress === 100 ? 'Todos los ejercicios tienen un resultado cargado.' : 'Los resultados cargados se muestran en el detalle de cada ejercicio.'}</p>
      </TrainerSurface>

      <div className="trainer-assignment-detail__context-grid">
        <TrainerSurface className="trainer-assignment-detail__note" as="aside">
          <span className="trainer-assignment-detail__label">Indicaciones del trainer</span>
          <p>{assignment.notes ?? 'No se agregaron indicaciones generales para esta sesión.'}</p>
        </TrainerSurface>
        <TrainerSurface className="trainer-assignment-detail__note" as="aside">
          <span className="trainer-assignment-detail__label">Notas del alumno</span>
          <p>{assignment.studentNotes ?? 'Todavía no cargó notas generales para esta sesión.'}</p>
        </TrainerSurface>
      </div>

      <section className="trainer-assignment-detail__workout" aria-labelledby="assignment-exercises-title">
        <header className="trainer-assignment-detail__section-heading">
          <div>
            <span className="trainer-assignment-detail__label">Plan de trabajo</span>
            <h2 id="assignment-exercises-title">Secciones y ejercicios</h2>
            <p>Compará la prescripción con los resultados que el alumno registró.</p>
          </div>
        </header>

        <div className="trainer-assignment-detail__sections">
          {assignment.sections.map((section) => (
            <TrainerSurface className="trainer-assignment-detail__section" key={section.id}>
              <header className="trainer-assignment-detail__section-header">
                <div>
                  <span className="trainer-assignment-detail__label">Sección {section.order + 1}</span>
                  <h3>{section.title}</h3>
                </div>
                <span className="trainer-assignment-detail__section-type">{section.sectionType}</span>
              </header>

              <div className="trainer-assignment-detail__exercise-list">
                {section.exercises.map((exercise, exerciseIndex) => {
                  const expectedStrength = formatStrength(exercise.expectedStrength)
                  const currentStrength = formatStrength(exercise.currentStrength)

                  return (
                    <article className="trainer-assignment-detail__exercise" key={exercise.id}>
                      <header className="trainer-assignment-detail__exercise-header">
                        <div className="trainer-assignment-detail__exercise-title">
                          <span>{String(exerciseIndex + 1).padStart(2, '0')}</span>
                          <div>
                            <h4>{exercise.name}</h4>
                            <p>{exercise.metricType}</p>
                          </div>
                        </div>
                        <TrainerStatusBadge className={`trainer-assignment-detail__exercise-status trainer-assignment-detail__exercise-status--${exercise.status.toLowerCase()}`}>
                          {getExerciseStatusLabel(exercise.status)}
                        </TrainerStatusBadge>
                      </header>

                      <dl className="trainer-assignment-detail__exercise-results">
                        <div>
                          <dt>Prescripción esperada</dt>
                          <dd>{expectedStrength ?? exercise.expectedValue ?? 'Sin prescripción cargada'}</dd>
                        </div>
                        <div>
                          <dt>Resultado actual</dt>
                          <dd>{currentStrength ?? exercise.currentValue ?? 'Sin resultado cargado'}</dd>
                        </div>
                      </dl>

                      {exercise.currentStrengthSets && exercise.currentStrengthSets.length > 0 ? (
                        <div className="trainer-assignment-detail__sets">
                          <span>Series registradas</span>
                          <ol>
                            {exercise.currentStrengthSets.map((set, setIndex) => <li key={`${exercise.id}-${setIndex}`}>Serie {setIndex + 1}: {set.repetitions} reps × {set.weight} kg</li>)}
                          </ol>
                        </div>
                      ) : null}

                      {(exercise.restLabel || exercise.methodLabel || exercise.notes) ? (
                        <div className="trainer-assignment-detail__exercise-details">
                          {exercise.methodLabel ? <p><span>Método</span>{exercise.methodLabel}</p> : null}
                          {exercise.restLabel ? <p><span>Descanso</span>{exercise.restLabel}</p> : null}
                          {exercise.notes ? <p className="trainer-assignment-detail__exercise-notes"><span>Notas</span>{exercise.notes}</p> : null}
                        </div>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            </TrainerSurface>
          ))}
        </div>
      </section>

      <form action={addTrainerFeedbackAction.bind(null, { assignmentId: assignment.id })} className="trainer-surface trainer-assignment-detail__feedback trainer-form">
        <div>
          <span className="trainer-assignment-detail__label">Seguimiento</span>
          <h2>Feedback del trainer</h2>
          <p>Dejá una devolución para que quede asociada a esta asignación.</p>
        </div>
        <label className="field">
          <span>Comentario</span>
          <textarea name="comment" rows={4} placeholder="Ej: buena sesión, revisar técnica del press inclinado, bajar un poco el peso en la próxima..." />
        </label>
        <div className="trainer-assignment-detail__feedback-action">
          <TrainerAction type="submit" variant="primary">Guardar feedback</TrainerAction>
        </div>
      </form>
    </div>
  )
}
