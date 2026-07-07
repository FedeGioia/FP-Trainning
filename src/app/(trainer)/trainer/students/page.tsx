import Link from 'next/link'

import { SectionIntro } from '@/components/ui/section-intro'
import { PlaceholderPanel } from '@/components/ui/placeholder-panel'
import { listStudents } from '@/modules/users'
import { StudentRosterTable } from '@/components/trainer/student-roster-table'

type TrainerStudentsPageProps = {
  searchParams?: Promise<{
    created?: string
    reset?: string
    error?: string
    q?: string
  }>
}

export default async function TrainerStudentsPage({ searchParams }: TrainerStudentsPageProps) {
  const params = (await searchParams) ?? {}
  const query = params.q?.trim() ?? ''
  const students = await listStudents(query)

  return (
    <div className="stack">
      <SectionIntro
        eyebrow="People"
        title="Alumnos"
        description="Buscá alumnos, asignales rutinas y administrá accesos desde una sola pantalla."
        actions={
          <>
            <Link className="button button-primary" href="/trainer/students/new">
              Nuevo alumno
            </Link>
            <Link className="button button-secondary" href="/trainer">
              Volver al dashboard
            </Link>
          </>
        }
      />

      {params.created ? <span className="status status--ok">Alumno creado correctamente.</span> : null}
      {params.reset ? <span className="status status--ok">Contraseña actualizada correctamente.</span> : null}
      {params.error ? <span className="status status--error">{decodeURIComponent(params.error)}</span> : null}

      <section className="stack">
        <section className="card stack student-roster-toolbar">
          <form className="student-roster-toolbar__form" action="/trainer/students" method="get">
            <label className="field">
              <span>Buscar alumnos</span>
              <input name="q" type="search" placeholder="Nombre, email o programa" defaultValue={query} />
            </label>

            <div className="role-nav student-roster-toolbar__actions">
              <button className="button button-primary" type="submit">
                Buscar
              </button>
              {query ? (
                <Link className="button button-secondary" href="/trainer/students">
                  Limpiar
                </Link>
              ) : null}
            </div>
          </form>

          <span className="muted">
            {query ? `Mostrando ${students.length} resultado${students.length === 1 ? '' : 's'} para “${query}”.` : 'Buscá por nombre, email o programa para administrar más rápido.'}
          </span>
        </section>

        {students.length === 0 ? (
          <PlaceholderPanel
            title={query ? 'No encontramos alumnos' : 'Todavía no hay alumnos cargados'}
            description={query ? 'Probá con otro nombre, email o programa para encontrar al alumno que buscás.' : 'Creá el primer alumno para empezar a asignar rutinas, programas y accesos desde esta pantalla.'}
          />
        ) : (
          <StudentRosterTable students={students} />
        )}
      </section>
    </div>
  )
}
