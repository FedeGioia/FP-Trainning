import Link from 'next/link'

import { StatCard } from '@/components/ui/stat-card'
import { listExercises } from '@/modules/exercises'
import { listProgramCatalog } from '@/modules/programs'

export default async function TrainerDashboardPage() {
  const [programs, exercises] = await Promise.all([listProgramCatalog(), listExercises()])

  return (
    <div className="stack">
      <section className="workspace-hero workspace-hero--trainer">
        <div className="workspace-hero__content stack" style={{ gap: '0.55rem' }}>
          <span className="eyebrow">Operación</span>
          <h1 className="workspace-title">Dashboard trainer</h1>
          <p className="muted">Base de operación inicial para ejercicios, programas, templates, alumnos y asignaciones.</p>
        </div>

        <div className="workspace-hero__actions">
          <Link className="button button-primary" href="/trainer/assignments/new">
            Asignar rutina
          </Link>
          <Link className="button button-secondary" href="/trainer/exercises/new">
            Nuevo ejercicio
          </Link>
        </div>
      </section>

      <div className="grid cards">
        <StatCard label="Programas base" value={programs.length} detail="Training, Stretching, Running y Home" />
        <StatCard label="Ejercicios visibles" value={exercises.length} detail="Semilla o datos reales desde Prisma" />
        <StatCard label="Estado" value="Bootstrap" detail="Listo para implementar features reales" />
      </div>

      <section className="card stack">
        <h2 className="section-title">Siguiente tranche sugerida</h2>
        <ul className="list">
          <li className="list-item">
            <div>
              <strong>CRUD de ejercicios</strong>
              <p className="muted">Alta, edición, video y tipo de métrica.</p>
            </div>
            <span className="status status--ok">Listo para arrancar</span>
          </li>
          <li className="list-item">
            <div>
              <strong>Catálogo de programas</strong>
              <p className="muted">Ya existe semilla y vista inicial.</p>
            </div>
            <span className="status status--ok">Semilla preparada</span>
          </li>
          <li className="list-item">
            <div>
              <strong>Plantillas y secciones</strong>
              <p className="muted">Siguiente bloque de negocio fuerte después de ejercicios.</p>
            </div>
            <span className="status status--muted">Pendiente</span>
          </li>
        </ul>
      </section>

      <section className="grid cards">
        <article className="card stack" style={{ gap: '0.6rem' }}>
          <span className="muted">Vista rápida</span>
          <strong>Alumno → Template → Assignment</strong>
          <p className="muted">El corazón del producto ya está modelado. Falta conectar mejor el lado student con resultados reales.</p>
        </article>
        <article className="card stack" style={{ gap: '0.6rem' }}>
          <span className="muted">Foco visual</span>
          <strong>Desktop claro y rápido</strong>
          <p className="muted">Seguimos subiendo la consistencia visual mientras metemos negocio real, sin dejar la UI para el final.</p>
        </article>
      </section>
    </div>
  )
}
