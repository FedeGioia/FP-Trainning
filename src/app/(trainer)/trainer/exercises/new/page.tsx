import Link from 'next/link'

import { exerciseMetricOptions } from '@/lib/constants/exercise-metrics'

import { createExerciseAction } from './actions'

type TrainerExerciseNewPageProps = {
  searchParams?: Promise<{
    error?: string
  }>
}

export default async function TrainerExerciseNewPage({ searchParams }: TrainerExerciseNewPageProps) {
  const params = (await searchParams) ?? {}

  return (
    <div className="stack">
      <section className="section-header">
        <div className="stack" style={{ gap: '0.35rem' }}>
          <h1 className="section-title">Nuevo ejercicio</h1>
          <p className="muted">Primer formulario real del trainer para empezar a poblar la biblioteca.</p>
        </div>
        <Link className="pill" href="/trainer/exercises">
          Volver al listado
        </Link>
      </section>

      {params.error ? (
        <section className="card stack">
          <span className="status status--error">{decodeURIComponent(params.error)}</span>
        </section>
      ) : null}

      <form action={createExerciseAction} className="card stack">
        <div className="form-grid">
          <label className="field">
            <span>Nombre</span>
            <input name="name" type="text" placeholder="Ej: Press banca" required />
          </label>

          <label className="field">
            <span>Tipo de métrica</span>
            <select name="primaryMetricType" defaultValue="STRENGTH">
              {exerciseMetricOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>Descripción</span>
          <textarea
            name="description"
            rows={4}
            placeholder="Contexto breve del ejercicio, indicaciones o intención del movimiento."
          />
        </label>

        <label className="field">
          <span>Video URL</span>
          <input name="videoUrl" type="url" placeholder="https://..." />
        </label>

        <div className="grid cards">
          {exerciseMetricOptions.map((option) => (
            <article key={option.value} className="card stack" style={{ gap: '0.35rem', padding: '1rem' }}>
              <strong>{option.label}</strong>
              <p className="muted">{option.hint}</p>
            </article>
          ))}
        </div>

        <div className="role-nav">
          <button className="button button-primary" type="submit">
            Guardar ejercicio
          </button>
          <Link className="button button-secondary" href="/trainer/exercises">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
