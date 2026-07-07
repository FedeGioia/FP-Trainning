import Link from 'next/link'

import { auth } from '@/auth'
import { PlaceholderPanel } from '@/components/ui/placeholder-panel'
import { ProgramBadge, getProgramToneClass } from '@/components/ui/program-badge'
import { listAssignmentsForStudent } from '@/modules/assignments'
import { isSameCalendarDay } from '@/lib/date'

export default async function StudentTodayPage() {
  const session = await auth()
  const blocks = (await listAssignmentsForStudent(session?.user?.id ?? '')).filter((block) => {
    return isSameCalendarDay(block.scheduledAt, new Date())
  })

  return (
    <div className="student-shell stack">
      <section className="student-day-view stack">
        <div className="student-day-hero stack">
          <span className="eyebrow">Hoy</span>
          <div className="stack" style={{ gap: '0.25rem' }}>
            <h1 className="student-title">Entrenamientos de hoy</h1>
            <p className="student-subtitle">Solo la lista para abrir y cargar los ejercicios.</p>
          </div>
        </div>

        {blocks.length === 0 ? (
          <PlaceholderPanel
            title="No tenés entrenamientos para hoy"
            description="Cuando tu entrenador programe una rutina, la vas a ver acá para entrar y cargar cada ejercicio."
          />
        ) : (
          <div className="student-day-list">
            {blocks.map((block) => (
              <Link
                key={block.id}
                className={`student-day-card program-surface ${getProgramToneClass(block.programCode)}`}
                href={`/student/block/${block.id}`}
              >
                <div className="student-day-card__top">
                  <div className="stack" style={{ gap: '0.25rem' }}>
                    <ProgramBadge code={block.programCode} />
                    <strong>{block.title}</strong>
                  </div>
                  <span className="student-time">
                    {new Date(block.scheduledAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="muted">{block.templateName ?? 'Bloque personalizado'}</p>

                <div className="role-nav">
                  <span className="status status--muted">{block.sectionCount} secciones</span>
                  <span className="status status--ok">{block.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
