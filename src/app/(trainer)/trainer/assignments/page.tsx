import Link from 'next/link'

import { AssignmentCard } from '@/components/ui/assignment-card'
import { SectionIntro } from '@/components/ui/section-intro'
import { StatCard } from '@/components/ui/stat-card'
import { listAssignments } from '@/modules/assignments'

type TrainerAssignmentsPageProps = {
  searchParams?: Promise<{
    created?: string
  }>
}

export default async function TrainerAssignmentsPage({ searchParams }: TrainerAssignmentsPageProps) {
  const params = (await searchParams) ?? {}
  const assignments = await listAssignments()
  const planned = assignments.filter((assignment) => assignment.status === 'PLANNED').length

  return (
    <div className="stack">
      <SectionIntro
        eyebrow="Agenda"
        title="Asignaciones"
        description="Rutinas programadas por fecha y hora para cada alumno."
        actions={
          <>
            <Link className="button button-primary" href="/trainer/assignments/new">
              Desde plantilla
            </Link>
            <Link className="button button-secondary" href="/trainer/assignments/manual">
              Rutina manual
            </Link>
          </>
        }
      />

      {params.created ? <span className="status status--ok">Asignación creada correctamente.</span> : null}

      <div className="grid cards">
        <StatCard label="Asignaciones activas" value={assignments.length} detail="Bloques visibles en agenda" />
        <StatCard label="Por iniciar" value={planned} detail="Todavía no arrancadas por el alumno" />
        <StatCard label="Programadas" value={assignments.length} detail="Sesiones organizadas por fecha y hora" />
      </div>

      <section className="stack">
        <div className="section-header">
          <div>
            <h2 className="section-title">Agenda visible</h2>
            <p className="muted">Revisá qué tiene cada alumno, cuándo le toca y cómo viene avanzando.</p>
          </div>
        </div>

        <div className="grid cards">
          {assignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      </section>
    </div>
  )
}
