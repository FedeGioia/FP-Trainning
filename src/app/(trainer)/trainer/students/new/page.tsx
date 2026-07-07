import Link from 'next/link'

import { listProgramCatalog } from '@/modules/programs'

import { createStudentAction } from './actions'

type TrainerStudentNewPageProps = {
  searchParams?: Promise<{
    error?: string
  }>
}

export default async function TrainerStudentNewPage({ searchParams }: TrainerStudentNewPageProps) {
  const params = (await searchParams) ?? {}
  const programs = await listProgramCatalog()

  return (
    <div className="stack">
      <section className="section-header">
        <div className="stack" style={{ gap: '0.35rem' }}>
          <h1 className="section-title">Nuevo alumno</h1>
          <p className="muted">Alta inicial de alumnos con programas y asignación automática al trainer actual por programa.</p>
        </div>
        <Link className="pill" href="/trainer/students">
          Volver al listado
        </Link>
      </section>

      {params.error ? (
        <section className="card stack">
          <span className="status status--error">{decodeURIComponent(params.error)}</span>
        </section>
      ) : null}

      <form action={createStudentAction} className="card stack">
        <div className="stack" style={{ gap: '0.35rem' }}>
          <h2 className="section-title">Datos de acceso</h2>
          <p className="muted">Esto define cómo entra el alumno por primera vez y a qué programas queda asociado.</p>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Nombre</span>
            <input name="name" type="text" placeholder="Ej: Nombre y apellido" required />
          </label>

          <label className="field">
            <span>Email</span>
            <input name="email" type="email" placeholder="alumno@ejemplo.com" required />
          </label>
        </div>

        <label className="field">
          <span>Contraseña inicial</span>
          <input
            name="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            required
            minLength={8}
          />
          <span className="muted">La va a usar el alumno para entrar por primera vez.</span>
        </label>

        <fieldset className="field student-programs-fieldset">
          <legend>Programas</legend>
          <div className="grid cards">
            {programs.map((program) => (
              <label key={program.code} className="check-card">
                <input
                  type="checkbox"
                  name="programCodes"
                  value={program.code}
                  defaultChecked={program.code === 'FP_HOME'}
                />
                <div className="stack" style={{ gap: '0.35rem' }}>
                  <strong>{program.name}</strong>
                  <span className="muted">{program.description}</span>
                </div>
              </label>
            ))}
          </div>
          <span className="muted">
            Si elegís Training, Stretching o Running, se agrega FP-Home automáticamente según la regla actual del negocio.
          </span>
        </fieldset>

        <div className="role-nav">
          <button className="button button-primary" type="submit">
            Guardar alumno
          </button>
          <Link className="button button-secondary" href="/trainer/students">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
