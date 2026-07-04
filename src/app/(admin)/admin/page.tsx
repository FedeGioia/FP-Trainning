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
          <h1 className="workspace-title">Dashboard admin</h1>
          <p className="muted">Vista inicial del estado del producto, catálogo base y preparación técnica general.</p>
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
        <StatCard label="Programas cargados" value={programs.length} detail="Semilla o lectura desde base" />
        <StatCard label="Auth" value="Scaffold" detail="Todavía sin integración real" />
        <StatCard label="Base de datos" value="Preparada" detail="Prisma validado, seed listo" />
      </div>

      <section className="card stack">
        <h2 className="section-title">Estado del proyecto</h2>
        <p className="muted">
          Esta base ya permite seguir con programas, ejercicios, templates y auth sin volver a discutir la arquitectura.
        </p>
      </section>

      <section className="grid cards">
        <article className="card stack" style={{ gap: '0.6rem' }}>
          <span className="muted">Infra local</span>
          <strong>Next + Prisma listos</strong>
          <p className="muted">La base técnica ya está preparada; falta que Docker quede arriba para correr migraciones reales.</p>
        </article>
        <article className="card stack" style={{ gap: '0.6rem' }}>
          <span className="muted">Producto</span>
          <strong>Core ya modelado</strong>
          <p className="muted">Programas, ejercicios, templates, alumnos y assignments ya tienen flujos iniciales visibles.</p>
        </article>
      </section>
    </div>
  )
}
