import { ProgramCard } from '@/components/ui/program-card'
import { StatCard } from '@/components/ui/stat-card'
import { listProgramCatalog } from '@/modules/programs'

export default async function AdminProgramsPage() {
  const programs = await listProgramCatalog()
  const activePrograms = programs.filter((program) => program.active).length

  return (
    <div className="stack">
      <section className="section-header">
        <div className="stack" style={{ gap: '0.35rem' }}>
          <h1 className="section-title">Programas</h1>
          <p className="muted">Administrá los programas que estructuran la oferta de entrenamiento y el seguimiento de alumnos.</p>
        </div>
      </section>

      <div className="grid cards">
        <StatCard label="Programas totales" value={programs.length} detail="Líneas disponibles en la plataforma" />
        <StatCard label="Programas activos" value={activePrograms} detail="Disponibles para nuevas asignaciones" />
      </div>

      <div className="grid cards">
        {programs.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>
    </div>
  )
}
