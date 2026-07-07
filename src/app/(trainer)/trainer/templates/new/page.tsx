import Link from 'next/link'

import { exerciseMetricOptions } from '@/lib/constants/exercise-metrics'
import { templateSectionOptions } from '@/lib/constants/template-sections'
import { listExercises } from '@/modules/exercises'
import { listProgramCatalog } from '@/modules/programs'
import { ExercisePrescriptionGrid } from '@/components/shared/ExercisePrescriptionGrid'

import { createTemplateAction } from './actions'

const SECTION_SLOTS = 3

type TrainerTemplateNewPageProps = {
  searchParams?: Promise<{
    error?: string
  }>
}

export default async function TrainerTemplateNewPage({ searchParams }: TrainerTemplateNewPageProps) {
  const params = (await searchParams) ?? {}
  const exercises = await listExercises()
  const programs = await listProgramCatalog()
  const noExercises = exercises.length === 0

  return (
    <div className="stack">
      <section className="section-header">
        <div className="stack" style={{ gap: '0.35rem' }}>
          <h1 className="section-title">Nueva plantilla</h1>
          <p className="muted">Armá una plantilla real con hasta 3 secciones y empezá con 4 ejercicios por bloque. Podés sumar más filas si la plantilla lo necesita; los bloques vacíos se ignoran al guardar.</p>
        </div>
        <Link className="pill" href="/trainer/templates">
          Volver al listado
        </Link>
      </section>

      {params.error ? (
        <section className="card stack">
          <span className="status status--error">{decodeURIComponent(params.error)}</span>
        </section>
      ) : null}

      {noExercises ? (
        <section className="card stack">
          <span className="status status--muted">Primero cargá ejercicios en tu biblioteca para poder armar plantillas completas.</span>
        </section>
      ) : null}

      <form action={createTemplateAction} className="card stack">
        <div className="form-grid">
          <label className="field">
            <span>Nombre</span>
            <input name="name" type="text" placeholder="Ej: Empuje base" required />
          </label>

          <label className="field">
            <span>Programa</span>
            <select name="programCode" defaultValue="FP_TRAINING">
              {programs.map((program) => (
                <option key={program.code} value={program.code}>
                  {program.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>Descripción</span>
          <textarea name="description" rows={4} placeholder="Qué resuelve esta plantilla y en qué contexto usarla." />
        </label>

        {Array.from({ length: SECTION_SLOTS }, (_, sectionIndex) => (
          <div key={sectionIndex} className="stack" style={{ gap: '1rem', marginTop: '2rem' }}>
            <div className="stack" style={{ gap: '0.35rem' }}>
              <h2 style={{ margin: 0 }}>Sección {sectionIndex + 1}</h2>
              <p className="muted">Completala solo si la vas a usar. Si queda vacía, se ignora.</p>
            </div>

            <div className="form-grid">
              <label className="field">
                <span>Título</span>
                <input name={`sections.${sectionIndex}.title`} type="text" placeholder={`Ej: Bloque ${sectionIndex + 1} / Calentamiento`} />
              </label>

              <label className="field">
                <span>Tipo de sección</span>
                <select name={`sections.${sectionIndex}.type`} defaultValue="MAIN">
                  {templateSectionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <ExercisePrescriptionGrid sectionIndex={sectionIndex} exercises={exercises} metricOptions={exerciseMetricOptions} />
          </div>
        ))}

        <div className="role-nav">
          <button className="button button-primary" type="submit">
            Guardar plantilla
          </button>
          <Link className="button button-secondary" href="/trainer/templates">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
