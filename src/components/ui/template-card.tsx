import { getTemplateSectionLabel } from '@/lib/constants/template-sections'
import type { TemplateSummary } from '@/modules/templates'

type TemplateCardProps = {
  template: TemplateSummary
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <article className="card stack" style={{ gap: '0.75rem' }}>
      <div className="stack" style={{ gap: '0.35rem' }}>
        <span className="eyebrow">{template.programCode}</span>
        <h2 style={{ margin: 0 }}>{template.name}</h2>
      </div>

      <p className="muted">{template.description ?? 'Sin descripción todavía.'}</p>

      <div className="stack" style={{ gap: '0.5rem' }}>
        <strong>Secciones</strong>
        <ul className="list" style={{ gap: '0.5rem' }}>
          {template.sections.map((section) => (
            <li key={section.id} className="list-item" style={{ padding: '0.75rem 1rem' }}>
              <div>
                <strong>{section.title}</strong>
                <p className="muted">Orden {section.order}</p>
              </div>
              <span className="status status--muted">{getTemplateSectionLabel(section.sectionType)}</span>

              {section.exercises && section.exercises.length > 0 && (
                <div className="stack" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
                  <strong>Ejercicios</strong>
                  <ul className="list" style={{ gap: '0.5rem' }}>
                    {section.exercises.map((exercise) => (
                      <li key={exercise.id} className="list-item" style={{ padding: '0.5rem 1rem' }}>
                        <div>
                          <strong>{exercise.name}</strong>
                          <p className="muted">
                            {exercise.metricType}: {exercise.prescriptionPayload.value}
                            {exercise.restLabel && ` | Descanso: ${exercise.restLabel}`}
                            {exercise.methodLabel && ` | Método: ${exercise.methodLabel}`}
                          </p>
                          {exercise.notes && <p className="muted">Notas: {exercise.notes}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
