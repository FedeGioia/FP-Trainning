import { auth } from '@/auth'
import { PlaceholderPanel } from '@/components/ui/placeholder-panel'
import { StudentWorkoutCard } from '@/components/student/student-workout-card'
import { listStudentAssignmentsInRange } from '@/modules/assignments'
import { getCalendarDayRange } from '@/lib/date'

export default async function StudentTodayPage() {
  const session = await auth()
  const { start, end } = getCalendarDayRange(new Date())
  const blocks = await listStudentAssignmentsInRange(session?.user?.id, start, end)

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
            {blocks.map((block) => <StudentWorkoutCard key={block.id} assignment={block} />)}
          </div>
        )}
      </section>
    </div>
  )
}
