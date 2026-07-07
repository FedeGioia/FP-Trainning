import Link from 'next/link'

import { auth } from '@/auth'
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

export default async function TrainerAssignmentDetailPage({ params, searchParams }: TrainerAssignmentDetailPageProps) {
  const { id } = await params
  const qs = (await searchParams) ?? {}
  const session = await auth()
  const assignment = await getAssignmentDetailById(id, { trainerId: session?.user?.id })

  if (!assignment) {
    return (
      <div className="stack">
        <section className="card stack">
          <h1 className="section-title">Asignación no encontrada</h1>
          <p className="muted">No pudimos encontrar esta rutina asignada.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="stack">
      <section className="content-hero">
        <div className="content-hero__body stack" style={{ gap: '0.45rem' }}>
          <span className="eyebrow">Review</span>
          <h1 className="workspace-title">{assignment.title}</h1>
          <p className="muted content-hero__description">
            Alumno: {assignment.studentName} · Programa: {assignment.programCode} · {new Date(assignment.scheduledAt).toLocaleString('es-AR')}
          </p>
        </div>
        <div className="content-hero__actions">
          <Link className="button button-secondary" href="/trainer/assignments">
            Volver a asignaciones
          </Link>
        </div>
      </section>

      {qs.error ? <span className="status status--error">{decodeURIComponent(qs.error)}</span> : null}
      {qs.saved ? <span className="status status--ok">Feedback guardado correctamente.</span> : null}

      <div className="grid cards">
        <article className="card stack">
          <span className="muted">Template</span>
          <strong>{assignment.templateName ?? 'Bloque manual'}</strong>
        </article>
        <article className="card stack">
          <span className="muted">Estado</span>
          <strong>{assignment.status}</strong>
        </article>
        <article className="card stack">
          <span className="muted">Secciones</span>
          <strong>{assignment.sectionCount}</strong>
        </article>
      </div>

      {assignment.studentNotes ? (
        <section className="card stack">
          <h2 className="section-title">Notas del alumno</h2>
          <p className="muted">{assignment.studentNotes}</p>
        </section>
      ) : (
        <section className="card stack">
          <h2 className="section-title">Notas del alumno</h2>
          <p className="muted">Todavía no cargó notas generales para esta sesión.</p>
        </section>
      )}

      <section className="stack">
        <div className="section-header">
          <div>
            <h2 className="section-title">Secciones y ejercicios</h2>
            <p className="muted">Vista rápida de lo asignado y del tipo de resultado esperado.</p>
          </div>
        </div>

        <div className="grid cards">
          {assignment.sections.map((section) => (
            <article key={section.id} className="card stack">
              <div>
                <strong>{section.title}</strong>
                <p className="muted">{section.sectionType}</p>
              </div>
              <ul className="list">
                {section.exercises.map((exercise) => (
                  <li key={exercise.id} className="list-item">
                    <div>
                      <strong>{exercise.name}</strong>
                      <p className="muted">Resultado esperado: {exercise.metricType}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <form action={addTrainerFeedbackAction.bind(null, { assignmentId: assignment.id })} className="card stack">
        <h2 className="section-title">Feedback del trainer</h2>
        <label className="field">
          <span>Comentario</span>
          <textarea
            name="comment"
            rows={4}
            placeholder="Ej: buena sesión, revisar técnica del press inclinado, bajar un poco el peso en la próxima..."
          />
        </label>
        <div className="role-nav">
          <button className="button button-primary" type="submit">
            Guardar feedback
          </button>
        </div>
      </form>
    </div>
  )
}
