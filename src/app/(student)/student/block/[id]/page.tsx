import Link from 'next/link'

import { auth } from '@/auth'
import { ProgramBadge, getProgramToneClass } from '@/components/ui/program-badge'
import { getAssignmentDetailById } from '@/modules/assignments'

function getExerciseStatusClass(status: 'PENDING' | 'COMPLETED') {
  return status === 'COMPLETED' ? 'status status--ok' : 'status status--muted'
}

function getExerciseStatusLabel(status: 'PENDING' | 'COMPLETED') {
  return status === 'COMPLETED' ? 'Completado' : 'Pendiente'
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
    <div className="student-shell stack">
      <section className={`student-detail-header stack program-surface ${getProgramToneClass(assignment.programCode)}`}>
        <Link className="pill" href="/student/today">
          Volver a hoy
        </Link>

        <div className="stack" style={{ gap: '0.35rem' }}>
          <span className="eyebrow">Bloque</span>
          <h1 className="student-title">{assignment.title}</h1>
          <p className="student-subtitle">Vista mobile para entender rápido la sesión, entrar en ritmo y después cargar resultados.</p>
        </div>

        <div className="student-block-meta">
          <ProgramBadge code={assignment.programCode} />
          <span className="student-time">{scheduled}</span>
        </div>
      </section>

      {qs.error ? <span className="status status--error">{decodeURIComponent(qs.error)}</span> : null}
      {qs.saved ? <span className="status status--ok">Resultados guardados correctamente.</span> : null}

      <section className={`student-progress-card program-surface ${getProgramToneClass(assignment.programCode)}`}>
        <div>
          <span className="muted">Progreso del bloque</span>
          <strong>
            {assignment.completedExerciseCount} de {assignment.totalExerciseCount} ejercicios cargados
          </strong>
        </div>
        <span className="status status--ok">{assignment.status}</span>
      </section>

      <section className={`student-progress-card program-surface ${getProgramToneClass(assignment.programCode)}`}>
        <div>
          <span className="muted">Template base</span>
          <strong>{assignment.templateName ?? 'Bloque manual'}</strong>
        </div>
        <span className="status status--muted">Ejercicio por ejercicio</span>
      </section>

      {assignment.notes ? (
        <section className={`student-progress-card program-surface ${getProgramToneClass(assignment.programCode)}`}>
          <div>
            <span className="muted">Notas del trainer</span>
            <strong>{assignment.notes}</strong>
          </div>
        </section>
      ) : null}

      {assignment.studentNotes ? (
        <section className={`student-progress-card program-surface ${getProgramToneClass(assignment.programCode)}`}>
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
                  <div className="stack" style={{ gap: '0.35rem', width: '100%' }}>
                    <div className="role-nav" style={{ justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="stack" style={{ gap: '0.2rem' }}>
                        <span>{item.name}</span>
                        <span className="muted">{item.metricType}</span>
                        {item.currentValue ? <span className="muted">Último valor: {item.currentValue}</span> : null}
                      </div>
                      <span className={getExerciseStatusClass(item.status)}>{getExerciseStatusLabel(item.status)}</span>
                    </div>

                    <Link className="button button-secondary" href={`/student/block/${assignment.id}/exercise/${item.id}`}>
                      {item.status === 'COMPLETED' ? 'Editar carga' : 'Cargar ejercicio'}
                    </Link>
                  </div>
                 </li>
               ))}
             </ul>
           </article>
         ))}
       </section>

      <section className="student-progress-card">
        <div>
          <span className="muted">Cómo cargar</span>
          <strong>Entrá a cada ejercicio, guardá el resultado y volvés a este bloque.</strong>
        </div>
      </section>
    </div>
  )
}
