import Link from 'next/link'

import { StatCard } from '@/components/ui/stat-card'
import { listExercises } from '@/modules/exercises'
import { listProgramCatalog } from '@/modules/programs'
import { listStudents } from '@/modules/users'
import { programCodes } from '@/lib/domain/program-codes'

export default async function TrainerDashboardPage() {
  const [programs, exercises, students] = await Promise.all([listProgramCatalog(), listExercises(), listStudents()])
  const nonHomeProgramCodes = programCodes.filter((program) => program.code !== 'FP_HOME')
  const membershipCounts = programCodes.reduce<Record<string, number>>((acc, program) => {
    acc[program.code] = students.reduce((count, student) => count + (student.programCodes.includes(program.code) ? 1 : 0), 0)
    return acc
  }, {})
  const realMemberships = nonHomeProgramCodes.reduce((acc, program) => acc + (membershipCounts[program.code] ?? 0), 0)
  const homeMemberships = membershipCounts.FP_HOME ?? 0

  return (
    <div className="stack">
      <section className="workspace-hero workspace-hero--trainer">
        <div className="workspace-hero__content stack" style={{ gap: '0.55rem' }}>
          <span className="eyebrow">Panel trainer</span>
          <h1 className="workspace-title">Planificá y seguí a tus alumnos</h1>
          <p className="muted">Gestioná ejercicios, armá plantillas, asigná bloques y revisá el avance de cada alumno.</p>
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
        <StatCard label="Programas activos" value={programs.length} detail="Líneas de trabajo disponibles" />
        <StatCard label="Ejercicios cargados" value={exercises.length} detail="Biblioteca disponible para planificar" />
        <StatCard label="Flujo principal" value="Operativo" detail="Ejercicios, templates y asignaciones conectados" />
      </div>

      <section className="stack">
        <div className="section-header">
          <div>
            <h2 className="section-title">Alumnos y membresías</h2>
            <p className="muted">Resumen real de alumnos activos y programas, dejando FP-Home aparte.</p>
          </div>
          <Link className="pill" href="/trainer/students">
            Ir a alumnos
          </Link>
        </div>

        <div className="grid cards">
          <StatCard label="Alumnos visibles" value={students.length} detail="Base actual cargada" />
          <StatCard label="Membresías reales" value={realMemberships} detail="Sin contar FP-Home" />
          <StatCard label="FP-Home" value={homeMemberships} detail="Base complementaria" />
          <StatCard label="Promedio" value={students.length ? (realMemberships / students.length).toFixed(1) : '0'} detail="Programas reales por alumno" />
        </div>

        <div className="grid cards">
          {nonHomeProgramCodes.map((program) => (
            <StatCard key={program.code} label={program.name} value={membershipCounts[program.code] ?? 0} detail={program.description ?? 'Programa'} />
          ))}
        </div>
      </section>

      <section className="card stack">
        <h2 className="section-title">Tu día como trainer</h2>
        <ul className="list">
          <li className="list-item">
            <div>
              <strong>Biblioteca de ejercicios</strong>
              <p className="muted">Mantené el catálogo listo para reutilizar en cualquier programa.</p>
            </div>
            <span className="status status--ok">Disponible</span>
          </li>
          <li className="list-item">
            <div>
              <strong>Plantillas por objetivo</strong>
              <p className="muted">Armá rutinas base y adaptalas según el alumno o el programa.</p>
            </div>
            <span className="status status--ok">Disponible</span>
          </li>
          <li className="list-item">
            <div>
              <strong>Asignaciones y seguimiento</strong>
              <p className="muted">Programá bloques y revisá lo que cada alumno fue cargando.</p>
            </div>
            <span className="status status--ok">Disponible</span>
          </li>
        </ul>
      </section>

      <section className="grid cards">
        <article className="card stack" style={{ gap: '0.6rem' }}>
          <span className="muted">Planificación</span>
          <strong>Alumno → plantilla → bloque</strong>
          <p className="muted">Todo el flujo principal vive acá: crear, adaptar y asignar sesiones con claridad.</p>
        </article>
        <article className="card stack" style={{ gap: '0.6rem' }}>
          <span className="muted">Seguimiento</span>
          <strong>Revisión simple y directa</strong>
          <p className="muted">Entrá a las asignaciones para ver resultados, dejar feedback y sostener la continuidad del alumno.</p>
        </article>
      </section>
    </div>
  )
}
