import Link from 'next/link'

import { listAssignmentsForStudent } from '@/modules/assignments'

export default async function StudentTodayPage() {
  const blocks = await listAssignmentsForStudent('Martín')

  return (
    <div className="student-shell stack">
      <section className="student-section stack">
        <div className="stack" style={{ gap: '0.35rem' }}>
          <span className="eyebrow">Hoy</span>
          <h1 className="student-title">Tus bloques del día</h1>
          <p className="student-subtitle">Cada entrenamiento se mantiene separado para que veas claro qué te toca en cada momento.</p>
        </div>

        <div className="student-block-list">
          {blocks.map((block) => (
            <Link key={block.id} className="student-block-card student-block-card--full" href={`/student/block/${block.id}`}>
              <div className="student-block-meta">
                <span className="status status--ok">{block.programCode}</span>
                <span className="student-time">
                  {new Date(block.scheduledAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="stack" style={{ gap: '0.45rem' }}>
                <strong>{block.title}</strong>
                <p className="muted">{block.templateName ?? 'Bloque manual'} · {block.studentName}</p>
              </div>

              <div className="role-nav">
                <span className="status status--muted">{block.sectionCount} secciones</span>
                <span className="status status--ok">{block.status}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
