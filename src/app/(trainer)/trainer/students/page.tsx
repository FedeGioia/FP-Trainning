import Link from 'next/link'

import { PlaceholderPanel } from '@/components/ui/placeholder-panel'
import { listStudents } from '@/modules/users'
import { StudentRosterTable } from '@/components/trainer/student-roster-table'

type TrainerStudentsPageProps = {
  searchParams?: Promise<{
    created?: string
    updated?: string
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
    <div className="trainer-students stack">
      <section className="trainer-students__intro">
        <div>
          <span className="eyebrow">Personas</span>
          <h1>Alumnos</h1>
          <p>Buscá alumnos, asignales rutinas y administrá accesos desde una sola pantalla.</p>
        </div>
        <Link className="trainer-students__new-student" href="/trainer/students/new">
          Nuevo alumno
        </Link>
      </section>

      {params.created || params.updated || params.reset || params.error ? (
        <div className="trainer-students__feedback" aria-live="polite">
          {params.created ? <span className="trainer-students__notice trainer-students__notice--ok">Alumno creado correctamente.</span> : null}
          {params.updated ? <span className="trainer-students__notice trainer-students__notice--ok">Datos del alumno actualizados correctamente.</span> : null}
          {params.reset ? <span className="trainer-students__notice trainer-students__notice--ok">Contraseña actualizada correctamente.</span> : null}
          {params.error ? <span className="trainer-students__notice trainer-students__notice--error">{decodeURIComponent(params.error)}</span> : null}
        </div>
      ) : null}

      <section className="trainer-students__content stack">
        <section className="student-roster-toolbar">
          <form className="student-roster-toolbar__form" action="/trainer/students" method="get">
            <label className="field">
              <span>Buscar alumnos</span>
              <input name="q" type="search" placeholder="Nombre, email o programa" defaultValue={query} />
            </label>

            <div className="student-roster-toolbar__actions">
              <button className="student-roster-toolbar__submit" type="submit">
                Buscar
              </button>
              {query ? (
                <Link className="student-roster-toolbar__clear" href="/trainer/students">
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
