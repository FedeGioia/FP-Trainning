import Link from 'next/link'

import { getAssignmentDetailById } from '@/modules/assignments'

import { submitStudentBlockAction } from './actions'

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
  const assignment = await getAssignmentDetailById(id)

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
    <div className="student-shell stack">
      <section className="student-detail-header stack">
        <Link className="pill" href="/student/today">
          Volver a hoy
        </Link>

        <div className="stack" style={{ gap: '0.35rem' }}>
          <span className="eyebrow">Bloque</span>
          <h1 className="student-title">{assignment.title}</h1>
          <p className="student-subtitle">Vista mobile para entender rápido la sesión, entrar en ritmo y después cargar resultados.</p>
        </div>

        <div className="student-block-meta">
          <span className="status status--ok">{assignment.programCode}</span>
          <span className="student-time">{scheduled}</span>
        </div>
      </section>

      {qs.error ? <span className="status status--error">{decodeURIComponent(qs.error)}</span> : null}
      {qs.saved ? <span className="status status--ok">Resultados guardados correctamente.</span> : null}

      <section className="student-progress-card">
        <div>
          <span className="muted">Estado actual</span>
          <strong>{assignment.templateName ?? 'Bloque manual'}</strong>
        </div>
        <span className="status status--ok">{assignment.status}</span>
      </section>

      {assignment.notes ? (
        <section className="student-progress-card">
          <div>
            <span className="muted">Notas del trainer</span>
            <strong>{assignment.notes}</strong>
          </div>
        </section>
      ) : null}

      {assignment.studentNotes ? (
        <section className="student-progress-card">
          <div>
            <span className="muted">Tus notas cargadas</span>
            <strong>{assignment.studentNotes}</strong>
          </div>
        </section>
      ) : null}

      <section className="student-section stack">
        {assignment.sections.map((section, index) => (
          <article key={section.title} className="student-section-card stack">
            <div className="student-section-card__header">
              <span className="student-section-index">0{index + 1}</span>
              <div>
                <strong>{section.title}</strong>
                <p className="muted">{section.exercises.length} ejercicios / indicaciones</p>
              </div>
            </div>

            <ul className="list">
              {section.exercises.map((item) => (
                <li key={item.id} className="student-exercise-row">
                  <span className="student-exercise-dot" />
                  <div className="stack" style={{ gap: '0.2rem' }}>
                    <span>{item.name}</span>
                    <span className="muted">{item.metricType}</span>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <form action={submitStudentBlockAction.bind(null, { assignmentId: assignment.id })} className="student-result-form stack">
        <div className="section-header">
          <div>
            <h2 className="section-title">Cargar resultados</h2>
            <p className="muted">Primera versión simple para registrar cómo te fue en cada ejercicio.</p>
          </div>
        </div>

        <label className="field">
          <span>Estado del bloque</span>
          <select name="status" defaultValue={assignment.status === 'COMPLETED' ? 'SUBMITTED' : 'IN_PROGRESS'}>
            <option value="NOT_STARTED">No empecé</option>
            <option value="IN_PROGRESS">En progreso</option>
            <option value="SUBMITTED">Completado / enviado</option>
          </select>
        </label>

        <label className="field">
          <span>Notas generales</span>
          <textarea
            name="studentNotes"
            rows={4}
            defaultValue={assignment.studentNotes ?? ''}
            placeholder="Cómo te sentiste, qué ajustaste, si hubo dolor, si quedó algo pendiente..."
          />
        </label>

        <div className="stack">
          {assignment.sections.map((section) => (
            <article key={section.id} className="student-section-card stack">
              <strong>{section.title}</strong>
              <div className="stack">
                {section.exercises.map((exercise) => (
                  <label key={exercise.id} className="field">
                    <span>
                      {exercise.name} <small className="muted">({exercise.metricType})</small>
                    </span>
                    <input
                      name={`result:${exercise.id}`}
                      type="text"
                      placeholder="Ej: 3x8 @ 55kg / 6km / 45s / observación rápida"
                    />
                  </label>
                ))}
              </div>
            </article>
          ))}
        </div>

        <section className="student-action-bar">
          <button className="button button-secondary" type="button">
            Ver videos
          </button>
          <button className="button button-primary" type="submit">
            Guardar resultados
          </button>
        </section>
      </form>
    </div>
  )
}
