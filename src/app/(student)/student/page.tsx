import Link from 'next/link'

import { listAssignmentsForStudent } from '@/modules/assignments'

export default async function StudentDashboardPage() {
  const assignments = await listAssignmentsForStudent('Martín')
  const nextAssignment = assignments[0]
  const nextTime = nextAssignment ? new Date(nextAssignment.scheduledAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '--:--'

  return (
    <div className="student-shell stack">
      <section className="student-hero stack">
        <div className="student-hero-top">
          <div className="stack" style={{ gap: '0.35rem' }}>
            <span className="eyebrow">Hola, Martín</span>
            <h1 className="student-title">Tu día está listo</h1>
            <p className="student-subtitle">Tenés 2 bloques programados. Empezá por el de la mañana y cargá tus resultados al terminar.</p>
            <p className="student-subtitle">Tenés {assignments.length} bloques visibles para hoy o próximos turnos.</p>
          </div>

          <div className="student-score-card">
            <span className="muted">Racha</span>
            <strong>5 días</strong>
            <span className="muted">cumpliendo</span>
          </div>
        </div>

        <div className="student-quick-grid">
          <article className="student-quick-card">
            <span className="muted">Próximo bloque</span>
            <strong>{nextAssignment?.title ?? 'Sin bloque'}</strong>
            <span>{nextTime} hs</span>
          </article>
          <article className="student-quick-card">
            <span className="muted">Pendientes</span>
            <strong>{assignments.length}</strong>
            <span>por completar hoy</span>
          </article>
        </div>
      </section>

      <section className="student-section stack">
        <div className="section-header">
          <div>
            <h2 className="section-title">Agenda de hoy</h2>
            <p className="muted">Bloques separados por programa y horario.</p>
          </div>
          <Link className="pill" href="/student/today">
            Ver todo
          </Link>
        </div>

        <div className="student-block-list">
          {assignments.slice(0, 2).map((assignment) => {
            const time = new Date(assignment.scheduledAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

            return (
              <Link key={assignment.id} className="student-block-card" href={`/student/block/${assignment.id}`}>
                <div className="student-block-meta">
                  <span className="status status--ok">{assignment.programCode}</span>
                  <span className="student-time">{time}</span>
                </div>
                <div className="stack" style={{ gap: '0.35rem' }}>
                  <strong>{assignment.title}</strong>
                  <p className="muted">{assignment.templateName ?? 'Bloque manual'} · {assignment.sectionCount} secciones</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
