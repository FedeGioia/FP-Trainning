import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { PlaceholderPanel } from '@/components/ui/placeholder-panel'
import { listTrainerStudentRoster } from '@/modules/trainer-students'
import { StudentRosterTable } from '@/components/trainer/student-roster-table'

const programFilters = [
  { value: '', label: 'Filtrar por programa' },
  { value: 'FP_TRAINING', label: 'Training' },
  { value: 'FP_HOME', label: 'Home' },
  { value: 'FP_STRETCHING', label: 'Stretching' },
  { value: 'FP_RUNNING', label: 'Running' },
]

type TrainerStudentsPageProps = {
  searchParams?: Promise<{
    created?: string
    updated?: string
    reset?: string
    error?: string
    q?: string
    program?: string
  }>
}

export default async function TrainerStudentsPage({ searchParams }: TrainerStudentsPageProps) {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'trainer') {
    redirect('/login?error=auth')
  }

  const params = (await searchParams) ?? {}
  const query = params.q?.trim() ?? ''
  const program = params.program?.trim() ?? ''
  const students = await listTrainerStudentRoster(session.user.id, query, program)

  return (
    <div className="trainer-students stack">
      {params.created || params.updated || params.reset || params.error ? (
        <div className="trainer-students__feedback" aria-live="polite">
          {params.created ? <span className="trainer-students__notice trainer-students__notice--ok">Alumno creado correctamente.</span> : null}
          {params.updated ? <span className="trainer-students__notice trainer-students__notice--ok">Datos del alumno actualizados correctamente.</span> : null}
          {params.reset ? <span className="trainer-students__notice trainer-students__notice--ok">Contraseña actualizada correctamente.</span> : null}
          {params.error ? <span className="trainer-students__notice trainer-students__notice--error">{decodeURIComponent(params.error)}</span> : null}
        </div>
      ) : null}

      <section className="trainer-students__content stack">
        <section className="trainer-students__intro">
          <h1>Gestión de alumnos</h1>
        </section>

        <section className="student-roster-toolbar">
          <form className="student-roster-toolbar__form" action="/trainer/students" method="get">
            <label className="field student-roster-toolbar__field">
              <span className="sr-only">Buscar alumnos</span>
              <span className="student-roster-toolbar__search-icon" aria-hidden="true" />
              <input name="q" type="search" placeholder="Buscar" defaultValue={query} />
            </label>

            <label className="student-roster-toolbar__filter">
              <span className="sr-only">Filtrar por programa</span>
              <select name="program" defaultValue={program}>
                {programFilters.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
              </select>
            </label>

            <div className="student-roster-toolbar__actions">
              <button className="student-roster-toolbar__submit" type="submit">Buscar</button>
              {query ? (
                <Link className="student-roster-toolbar__clear" href="/trainer/students">
                  Limpiar
                </Link>
              ) : null}
              <Link className="trainer-students__new-student" href="/trainer/students/new">
                <span aria-hidden="true">+</span> Agregar alumno
              </Link>
            </div>
          </form>

          <span className="muted student-roster-toolbar__helper">
            {query || program ? `Mostrando ${students.length} resultado${students.length === 1 ? '' : 's'}.` : 'Buscá o filtrá a tus alumnos para administrar sus rutinas.'}
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
