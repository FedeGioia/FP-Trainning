import Link from 'next/link'

import { auth } from '@/auth'
import { PlaceholderPanel } from '@/components/ui/placeholder-panel'
import { ProgramBadge, getProgramToneClass } from '@/components/ui/program-badge'
import { listAssignmentsForStudent } from '@/modules/assignments'
import { isSameCalendarDay, parseLocalDateKey } from '@/lib/date'

type StudentDayPageProps = {
  params: Promise<{
    date: string
  }>
}

export default async function StudentDayPage({ params }: StudentDayPageProps) {
  const session = await auth()
  const { date } = await params
  const selectedDate = parseLocalDateKey(date) ?? new Date()
  const blocks = (await listAssignmentsForStudent(session?.user?.id ?? '')).filter((block) => {
    return isSameCalendarDay(block.scheduledAt, selectedDate)
  })
  const selectedDateLabel = selectedDate.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="student-shell stack">
      <section className="student-day-view stack">
        <div className="student-day-hero stack">
          <Link className="pill" href="/student">
            Volver a la semana
          </Link>

          <span className="eyebrow">Día</span>
          <div className="stack" style={{ gap: '0.25rem' }}>
            <h1 className="student-title">Entrenamientos asignados</h1>
            <p className="student-subtitle">{selectedDateLabel}</p>
          </div>

          <div className="student-day-summary">
            <div>
              <span className="muted">Bloques del día</span>
              <strong>{blocks.length}</strong>
            </div>
            <div>
              <span className="muted">Estado</span>
              <strong>{blocks.length > 0 ? 'Listos para abrir' : 'Sin bloques'}</strong>
            </div>
          </div>
        </div>

        {blocks.length === 0 ? (
          <PlaceholderPanel
            title="No tenés entrenamientos para este día"
            description="Cuando tu entrenador programe una rutina, va a aparecer acá para que entres directo a entrenar."
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
