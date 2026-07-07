import Link from 'next/link'

import { exerciseMetricOptions } from '@/lib/constants/exercise-metrics'
import { listExercises } from '@/modules/exercises'
import { listProgramCatalog } from '@/modules/programs'
import { listStudents } from '@/modules/users'
import { ExercisePrescriptionGrid } from '@/components/shared/ExercisePrescriptionGrid'

import { createManualAssignmentAction } from './actions'

const SECTION_SLOTS = 3

function ExerciseFields({
  sectionIndex,
  exercises,
}: {
  sectionIndex: number
  exercises: Awaited<ReturnType<typeof listExercises>>
}) {
  return (
    <article className="card stack form-panel form-panel--soft" style={{ gap: '0.9rem' }}>
      <p className="form-kicker">La rutina se arma como una grilla: cada fila es un ejercicio y las columnas cubren técnica, métricas y descanso.</p>
      <ExercisePrescriptionGrid sectionIndex={sectionIndex} exercises={exercises} metricOptions={exerciseMetricOptions} />
    </article>
  )
}

type TrainerManualAssignmentPageProps = {
  searchParams?: Promise<{
    error?: string
    studentId?: string
  }>
}

export default async function TrainerManualAssignmentPage({ searchParams }: TrainerManualAssignmentPageProps) {
  const params = (await searchParams) ?? {}
  const [students, programs, exercises] = await Promise.all([listStudents(), listProgramCatalog(), listExercises()])
  const selectedStudent = params.studentId ? students.find((student) => student.id === params.studentId) : null
  const programOptions = selectedStudent
    ? programs.filter((program) => selectedStudent.programCodes.includes(program.code))
    : programs

  return (
    <div className="stack">
      <section className="section-header">
        <div className="stack" style={{ gap: '0.35rem' }}>
          <h1 className="section-title">Nueva rutina manual</h1>
          <p className="muted">Armá una rutina personalizada ejercicio por ejercicio para un alumno sin depender de una plantilla.</p>
        </div>
        <Link className="pill" href="/trainer/assignments">
          Volver al listado
        </Link>
      </section>

      {params.error ? (
        <section className="card stack">
          <span className="status status--error">{decodeURIComponent(params.error)}</span>
        </section>
      ) : null}

      <form action={createManualAssignmentAction} className="card stack">
        <section className="form-panel stack">
          <div className="stack" style={{ gap: '0.25rem' }}>
            {selectedStudent ? <p className="muted">Alumno seleccionado: {selectedStudent.name} ({selectedStudent.email})</p> : null}
            <h2 className="form-title">Datos base de la rutina</h2>
            <p className="form-kicker">Arrancá por el alumno, el programa y el horario. Después definís la sesión.</p>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Alumno</span>
              <small>Solo aparecen alumnos ya cargados en la plataforma.</small>
              <select name="studentId" defaultValue={params.studentId ?? ''}>
                <option value="" disabled>
                  Elegí un alumno
                </option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} — {student.programCodes.join(', ')}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Programa</span>
              <small>La rutina se guarda asociada a uno de los programas del alumno.</small>
              <select name="programId" defaultValue="">
                <option value="" disabled>
                  Elegí un programa
                </option>
                {programOptions.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
              {selectedStudent && programOptions.length === 0 ? (
                <small className="muted">Ese alumno todavía no tiene programas compatibles cargados.</small>
              ) : null}
            </label>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Fecha y hora</span>
              <small>Cuándo debería aparecerle este bloque al alumno.</small>
              <input name="scheduledAt" type="datetime-local" required />
            </label>

            <label className="field">
              <span>Título opcional</span>
              <small>Si no lo completás, se genera automáticamente.</small>
              <input name="title" type="text" placeholder="Ej: Empuje técnico + accesorios" />
            </label>
          </div>

          <label className="field">
            <span>Notas generales</span>
            <small>Contexto del día, sensaciones a buscar o mensajes generales para el alumno.</small>
            <textarea name="notes" rows={4} placeholder="Contexto del día, foco de la sesión o indicaciones para el alumno." />
          </label>
        </section>

        <details className="card stack reveal-panel" open>
          <summary>Sección 1</summary>
          <div className="stack reveal-panel__body form-panel" style={{ gap: '1rem' }}>
            <p className="muted">Empezá por una sola sección con cuatro ejercicios y sumá más filas si hace falta. Si necesitás más secciones, las agregás después.</p>

            <label className="field">
              <span>Título de la sección</span>
              <small>Nombrala como la leería el alumno: calentamiento, bloque principal, accesorios, etc.</small>
              <input name="sections.0.title" type="text" placeholder="Ej: Bloque principal" />
            </label>

            <ExerciseFields sectionIndex={0} exercises={exercises} />
          </div>
        </details>

        {Array.from({ length: SECTION_SLOTS - 1 }, (_, extraSectionIndex) => {
          const sectionIndex = extraSectionIndex + 1

          return (
            <details key={sectionIndex} className="card stack reveal-panel" style={{ marginTop: '1.5rem' }}>
              <summary>Agregar sección {sectionIndex + 1}</summary>

              <div className="stack reveal-panel__body" style={{ gap: '1rem' }}>
                <p className="muted">Sumá esta sección solo si la rutina realmente la necesita.</p>

                <label className="field">
                  <span>Título de la sección</span>
                  <small>Usá un nombre claro para que el alumno entienda rápido el bloque.</small>
                  <input name={`sections.${sectionIndex}.title`} type="text" placeholder={`Ej: Sección ${sectionIndex + 1} / Accesorios`} />
                </label>

                <ExerciseFields sectionIndex={sectionIndex} exercises={exercises} />
              </div>
            </details>
          )
        })}

        <div className="role-nav">
          <button className="button button-primary" type="submit">
            Crear rutina manual
          </button>
          <Link className="button button-secondary" href="/trainer/assignments">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
