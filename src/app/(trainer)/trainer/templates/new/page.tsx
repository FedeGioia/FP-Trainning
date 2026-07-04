import Link from 'next/link'

import { programCatalog } from '@/lib/constants/programs'
import { templateSectionOptions } from '@/lib/constants/template-sections'
import { exerciseCatalog } from '@/lib/constants/exercises'

import { createTemplateAction } from './actions'

type TrainerTemplateNewPageProps = {
  searchParams?: Promise<{
    error?: string
  }>
}

export default async function TrainerTemplateNewPage({ searchParams }: TrainerTemplateNewPageProps) {
  const params = (await searchParams) ?? {}

  return (
    <div className="stack">
      <section className="section-header">
        <div className="stack" style={{ gap: '0.35rem' }}>
          <h1 className="section-title">Nueva plantilla</h1>
          <p className="muted">Base inicial para crear templates reutilizables por programa.</p>
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

      <form action={createTemplateAction} className="card stack">
        <div className="form-grid">
          <label className="field">
            <span>Nombre</span>
            <input name="name" type="text" placeholder="Ej: Empuje base" required />
          </label>

          <label className="field">
            <span>Programa</span>
            <select name="programCode" defaultValue="FP_TRAINING">
              {programCatalog.map((program) => (
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

        {[1, 2, 3].map((sectionNumber) => (
          <div key={sectionNumber} className="stack" style={{ gap: '1rem', marginTop: '2rem' }}> 
            <h2>Sección {sectionNumber}</h2>

            <div className="form-grid">
              <label className="field">
                <span>Título</span>
                <input name={`section${sectionNumber}Title`} type="text" placeholder={`Título de la sección ${sectionNumber}`} required />
              </label>

              <label className="field">
                <span>Tipo de sección</span>
                <select name={`section${sectionNumber}Type`} defaultValue="MAIN">
                  {templateSectionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {[1, 2, 3, 4].map((exerciseNumber) => (
              <div key={exerciseNumber} className="stack" style={{ gap: '0.5rem', marginTop: '1rem' }}> 
                <h3>Ejercicio {exerciseNumber}</h3>

                <div className="form-grid">
                  <label className="field">
                    <span>Ejercicio</span>
                    <select name={`section${sectionNumber}Exercise${exerciseNumber}Id`} defaultValue="">
                      <option value="">Seleccionar ejercicio</option>
                      {exerciseCatalog.map((exercise) => (
                        <option key={exercise.id} value={exercise.id}>
                          {exercise.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Tipo de métrica</span>
                    <input name={`section${sectionNumber}Exercise${exerciseNumber}MetricType`} type="text" placeholder="Ej: repeticiones" />
                  </label>
                </div>

                <div className="form-grid">
                  <label className="field">
                    <span>Valor de la prescripción</span>
                    <input name={`section${sectionNumber}Exercise${exerciseNumber}PrescriptionValue`} type="text" placeholder="Ej: 3x10" />
                  </label>

                  <label className="field">
                    <span>Descanso</span>
                    <input name={`section${sectionNumber}Exercise${exerciseNumber}RestLabel`} type="text" placeholder="Ej: 60 segundos" />
                  </label>
                </div>

                <div className="form-grid">
                  <label className="field">
                    <span>Método</span>
                    <input name={`section${sectionNumber}Exercise${exerciseNumber}MethodLabel`} type="text" placeholder="Ej: 3x10" />
                  </label>

                  <label className="field">
                    <span>Notas</span>
                    <input name={`section${sectionNumber}Exercise${exerciseNumber}Notes`} type="text" placeholder="Notas adicionales" />
                  </label>
                </div>
              </div>
            ))}
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
