import Link from 'next/link'

import { SectionIntro } from '@/components/ui/section-intro'
import { StatCard } from '@/components/ui/stat-card'
import { TemplateCard } from '@/components/ui/template-card'
import { listTemplates } from '@/modules/templates'

type TrainerTemplatesPageProps = {
  searchParams?: Promise<{
    created?: string
  }>
}

export default async function TrainerTemplatesPage({ searchParams }: TrainerTemplatesPageProps) {
  const params = (await searchParams) ?? {}
  const templates = await listTemplates()
  const totalSections = templates.reduce((acc, template) => acc + template.sections.length, 0)

  return (
    <div className="stack">
      <SectionIntro
        eyebrow="Reutilización"
        title="Plantillas"
        description="Armá rutinas base por programa y reutilizalas para asignar bloques con más velocidad y consistencia."
        actions={
          <>
            <Link className="button button-primary" href="/trainer/templates/new">
              Nueva plantilla
            </Link>
            <Link className="button button-secondary" href="/trainer">
              Volver al dashboard
            </Link>
          </>
        }
      />

      {params.created ? <span className="status status--ok">Plantilla creada correctamente.</span> : null}

      <div className="grid cards">
        <StatCard label="Plantillas activas" value={templates.length} detail="Rutinas listas para reutilizar" />
        <StatCard label="Secciones totales" value={totalSections} detail="Bloques internos configurados" />
        <StatCard label="Promedio" value={templates.length ? (totalSections / templates.length).toFixed(1) : '0'} detail="Secciones por plantilla" />
      </div>

      <section className="stack">
        <div className="section-header">
          <div>
            <h2 className="section-title">Templates cargados</h2>
            <p className="muted">Cada plantilla conserva su estructura, ejercicios e indicaciones para acelerar la planificación.</p>
          </div>
        </div>

        <div className="grid cards">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </section>
    </div>
  )
}
