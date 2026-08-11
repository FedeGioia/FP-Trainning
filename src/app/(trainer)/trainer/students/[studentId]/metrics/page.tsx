import Link from 'next/link'

import { PlaceholderPanel } from '@/components/ui/placeholder-panel'

export default function TrainerStudentMetricsPage() {
  return (
    <div className="trainer-students stack">
      <section className="trainer-students__intro">
        <div>
          <span className="eyebrow">Seguimiento</span>
          <h1>Métricas del alumno</h1>
          <p>Esta vista reunirá el progreso, la asistencia y los indicadores de rendimiento del alumno.</p>
        </div>
        <Link className="student-roster-toolbar__clear" href="/trainer/students">
          Volver a alumnos
        </Link>
      </section>

      <PlaceholderPanel title="Métricas próximamente" description="Estamos preparando este espacio para que puedas hacer seguimiento del progreso de cada alumno." titleAs="h2" />
    </div>
  )
}
