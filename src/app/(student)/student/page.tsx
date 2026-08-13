import Link from 'next/link'

import { auth } from '@/auth'
import { PlaceholderPanel } from '@/components/ui/placeholder-panel'
import { StudentWorkoutCard } from '@/components/student/student-workout-card'
import { getStudentWorkoutStreak, listStudentAssignmentsInRange } from '@/modules/assignments'
import { StudentWeekCalendar } from '@/components/student/student-week-calendar'
import { formatLocalDateKey, getWeekDaysFrom, isSameCalendarDay, parseLocalDateKey } from '@/lib/date'

function FireIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M13.5 3.5c.4 2.1-.7 3.6-2 5-.9 1-1.9 2.1-1.9 3.7 0 1.7 1.3 3 3 3 1.2 0 2.1-.6 2.7-1.5.5-.8.8-1.8.8-2.9 1.7 1.5 2.8 3.4 2.8 5.7 0 3.4-2.7 6-6.3 6s-6.5-2.6-6.5-6.2c0-3.4 2-5.6 4.1-7.8 1.7-1.8 3.2-3.4 3.3-5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type StudentDashboardPageProps = {
  searchParams?: Promise<{
    date?: string
  }>
}

export default async function StudentDashboardPage({ searchParams }: StudentDashboardPageProps) {
  const session = await auth()
  const params = (await searchParams) ?? {}
  const studentId = session?.user?.id ?? ''
  const studentName = session?.user?.name ?? 'alumno'
  const streak = await getStudentWorkoutStreak(studentId)
  const selectedDate = parseLocalDateKey(params.date ?? '') ?? new Date()
  const weekDays = getWeekDaysFrom(selectedDate)
  const weekStart = weekDays[0]!
  const weekEnd = new Date(weekDays[weekDays.length - 1]!)
  weekEnd.setDate(weekEnd.getDate() + 1)
  const assignments = await listStudentAssignmentsInRange(studentId, weekStart, weekEnd)
  const selectedDayAssignments = assignments.filter((assignment) => isSameCalendarDay(assignment.scheduledAt, selectedDate))
  const scheduledDays = new Set(assignments.map((assignment) => formatLocalDateKey(new Date(assignment.scheduledAt)))).size
  const selectedDateLabel = selectedDate.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="student-shell stack">
      <section className="student-hero stack">
        <div className="student-hero-top">
          <div className="stack" style={{ gap: '0.35rem' }}>
            <span className="eyebrow">Hola, {studentName}</span>
            <h1 className="student-title">Mi Semana</h1>
          </div>

          <div className="student-score-card">
            <span className="student-score-card__fire" aria-hidden="true">
              <FireIcon />
            </span>
            <span className="muted">Racha</span>
            <strong>{streak} días</strong>
          </div>
        </div>

        <StudentWeekCalendar selectedDate={selectedDate} hrefBase="/student" queryParamName="date" workouts={assignments} />

        <div className="student-week-context">
          <div>
            <span className="student-week-context__label">Semana en curso</span>
            <strong>{assignments.length} bloques en {scheduledDays} {scheduledDays === 1 ? 'día' : 'días'}</strong>
          </div>
          <span className="student-week-context__hint">Tocá un día para ver sus bloques</span>
        </div>
      </section>

      <section className="student-section stack">
        <div className="section-header">
          <div>
            <span className="student-section__eyebrow">Día seleccionado</span>
            <h2 className="section-title">{selectedDateLabel}</h2>
            <p className="muted">{selectedDayAssignments.length === 0 ? 'No hay bloques asignados para este día.' : `${selectedDayAssignments.length} ${selectedDayAssignments.length === 1 ? 'bloque disponible' : 'bloques disponibles'} para abrir cuando quieras.`}</p>
          </div>
          <Link className="student-section__day-link" href={`/student/day/${formatLocalDateKey(selectedDate)}`}>
            Ver día completo
          </Link>
        </div>

        {selectedDayAssignments.length === 0 ? (
          <PlaceholderPanel
            title="Ese día no tenés bloques asignados"
            description="Seleccioná otro día o esperá a que tu entrenador programe una rutina."
          />
        ) : (
          <div className="student-day-list">
            {selectedDayAssignments.map((assignment) => <StudentWorkoutCard key={assignment.id} assignment={assignment} />)}
          </div>
        )}
      </section>
    </div>
  )
}
