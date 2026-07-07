import { getMetricTypeLabel } from '@/lib/constants/exercise-metrics'
import { getTemplateSectionLabel } from '@/lib/constants/template-sections'
import type { TemplateSummary } from '@/modules/templates'
import { ProgramBadge } from './program-badge'

type TemplateCardProps = {
  template: TemplateSummary
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <article className="card stack" style={{ gap: '0.75rem' }}>
      <div className="stack" style={{ gap: '0.35rem' }}>
        <ProgramBadge code={template.programCode} />
        <h2 style={{ margin: 0 }}>{template.name}</h2>
      </div>

      <p className="muted">{template.description ?? 'Sin descripción todavía.'}</p>

      <div className="stack" style={{ gap: '0.5rem' }}>
        <strong>Secciones</strong>
        <ul className="list" style={{ gap: '0.5rem' }}>
          {template.sections.map((section) => (
            <li key={section.id} className="list-item" style={{ padding: '0.75rem 1rem' }}>
              <div className="stack" style={{ gap: '0.65rem', width: '100%' }}>
                <div className="role-nav" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong>{section.title}</strong>
                    <p className="muted">Orden {section.order}</p>
                  </div>
                  <span className="status status--muted">{getTemplateSectionLabel(section.sectionType)}</span>
                </div>

                {section.exercises.length > 0 ? (
                  <ul className="list" style={{ gap: '0.5rem' }}>
                    {section.exercises.map((exercise) => (
                      <li key={exercise.id} className="list-item" style={{ padding: '0.5rem 0.75rem' }}>
                        <div>
                          <strong>{exercise.name}</strong>
                          <p className="muted">
                            {getMetricTypeLabel(exercise.metricType)} · {exercise.prescriptionValue}
                          </p>
                          {exercise.restLabel || exercise.methodLabel ? (
                            <p className="muted">
                              {exercise.restLabel ? `Descanso: ${exercise.restLabel}` : null}
                              {exercise.restLabel && exercise.methodLabel ? ' · ' : null}
                              {exercise.methodLabel ? `Método: ${exercise.methodLabel}` : null}
                            </p>
                          ) : null}
                          {exercise.notes ? <p className="muted">Notas: {exercise.notes}</p> : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">Todavía sin ejercicios visibles.</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
