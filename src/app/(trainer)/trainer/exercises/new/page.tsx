import Link from 'next/link'

import { exerciseMetricOptions } from '@/lib/constants/exercise-metrics'
import { listCategoryTree } from '@/modules/exercises'

import { createExerciseAction } from './actions'

type TrainerExerciseNewPageProps = {
  searchParams?: Promise<{
    error?: string
  }>
}

export default async function TrainerExerciseNewPage({ searchParams }: TrainerExerciseNewPageProps) {
  const params = (await searchParams) ?? {}
  const categoryTree = await listCategoryTree()
  const categories = categoryTree.flatMap(function flatten(category): typeof categoryTree {
    return [category, ...category.children.flatMap(flatten)]
  })

  return (
    <div className="stack">
      <section className="section-header">
        <div className="stack" style={{ gap: '0.35rem' }}>
          <h1 className="section-title">Nuevo ejercicio</h1>
          <p className="muted">Cargá un ejercicio de forma clara y rápida para que después sea fácil reutilizarlo en plantillas y rutinas.</p>
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

      <form action={createExerciseAction} className="card stack" style={{ gap: '1.25rem' }}>
        <section className="form-panel stack">
          <div className="stack" style={{ gap: '0.25rem' }}>
            <h2 className="form-title">Datos base</h2>
            <p className="form-kicker">Definí el nombre y la métrica principal. Eso ordena cómo lo vas a prescribir y cómo luego lo va a cargar el alumno.</p>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Nombre del ejercicio</span>
              <small>Usá el nombre exacto con el que lo reconocen trainer y alumno.</small>
              <input name="name" type="text" placeholder="Ej: Press banca" required />
            </label>

            <label className="field">
              <span>Categoría</span>
              <small>Opcional. Elegí una carpeta para ordenar este ejercicio.</small>
              <select name="categoryId" defaultValue="">
                <option value="">Sin categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.path}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Tipo de métrica principal</span>
              <small>Elegí la métrica que mejor representa el objetivo principal del ejercicio.</small>
              <select name="primaryMetricType" defaultValue="STRENGTH">
                {exerciseMetricOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="form-panel stack form-panel--soft">
          <div className="stack" style={{ gap: '0.25rem' }}>
            <h2 className="form-title">Guía para el uso</h2>
            <p className="form-kicker">Sumá contexto solo si realmente ayuda a ejecutar mejor el movimiento.</p>
          </div>

          <label className="field">
            <span>Descripción</span>
            <small>Podés explicar intención del movimiento, rango, foco técnico o contexto de uso.</small>
            <textarea
              name="description"
              rows={4}
              placeholder="Ej: ejercicio principal de empuje horizontal. Buscar recorrido completo, control en la bajada y estabilidad escapular."
            />
          </label>

          <label className="field">
            <span>Video de referencia</span>
            <small>Opcional. Pegá una URL si querés dejar una guía visual lista para el alumno.</small>
            <input name="videoUrl" type="url" placeholder="https://..." />
          </label>
        </section>

        <details className="card stack reveal-panel">
          <summary>Ver ayuda sobre tipos de métricas</summary>
          <div className="grid cards reveal-panel__body">
            {exerciseMetricOptions.map((option) => (
              <article key={option.value} className="card stack form-panel--soft" style={{ gap: '0.35rem', padding: '1rem' }}>
                <strong>{option.label}</strong>
                <p className="muted">{option.hint}</p>
              </article>
            ))}
          </div>
        </details>

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
