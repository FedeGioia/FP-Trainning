import Link from 'next/link'

import { StatCard } from '@/components/ui/stat-card'
import { listProgramCatalog } from '@/modules/programs'

export default async function AdminDashboardPage() {
  const programs = await listProgramCatalog()

  return (
    <div className="stack">
      <section className="workspace-hero workspace-hero--admin">
        <div className="workspace-hero__content stack" style={{ gap: '0.55rem' }}>
          <span className="eyebrow">Control</span>
          <h1 className="workspace-title">Administración general</h1>
          <p className="muted">Supervisá programas, usuarios y la estructura general de la operación.</p>
        </div>

        <div className="workspace-hero__actions">
          <Link className="button button-primary" href="/admin/programs">
            Ver programas
          </Link>
          <Link className="button button-secondary" href="/admin/users">
            Ver usuarios
          </Link>
        </div>
      </section>

      <div className="grid cards">
        <StatCard label="Programas activos" value={programs.length} detail="Disponibles para organizar la operación" />
        <StatCard label="Usuarios" value="Roles" detail="Admin, trainer y student" />
        <StatCard label="Operación" value="Centralizada" detail="Una sola plataforma para gestionar entrenamiento" />
      </div>

      <section className="card stack">
        <h2 className="section-title">Vista general</h2>
        <p className="muted">
          Desde acá podés ordenar la estructura general del negocio y revisar cómo se distribuyen programas y perfiles.
        </p>
      </section>

      <section className="grid cards">
        <article className="card stack" style={{ gap: '0.6rem' }}>
          <span className="muted">Programas</span>
          <strong>Catálogo central</strong>
          <p className="muted">Mantené las líneas de trabajo ordenadas para que trainers y alumnos operen con claridad.</p>
        </article>
        <article className="card stack" style={{ gap: '0.6rem' }}>
          <span className="muted">Usuarios</span>
          <strong>Roles y acceso</strong>
          <p className="muted">Revisá perfiles y permisos para mantener la operación alineada al crecimiento del equipo.</p>
        </article>
      </section>
    </div>
  )
}
