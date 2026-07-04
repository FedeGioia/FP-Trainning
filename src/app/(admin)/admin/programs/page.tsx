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
          <p className="muted">Catálogo base del sistema y punto de entrada para memberships y ownership.</p>
        </div>
      </section>

      <div className="grid cards">
        <StatCard label="Programas totales" value={programs.length} detail="Base compartida del producto" />
        <StatCard label="Programas activos" value={activePrograms} detail="Listos para asignarse" />
      </div>

      <div className="grid cards">
        {programs.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>
    </div>
  )
}
