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
        description="Templates reutilizables por programa, con secciones internas listas para crecer."
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
        <StatCard label="Templates visibles" value={templates.length} detail="Catálogo semilla o datos reales" />
        <StatCard label="Secciones totales" value={totalSections} detail="Base para bloques internos" />
        <StatCard label="Promedio" value={templates.length ? (totalSections / templates.length).toFixed(1) : '0'} detail="Secciones por template" />
      </div>

      <section className="stack">
        <div className="section-header">
          <div>
            <h2 className="section-title">Templates cargados</h2>
            <p className="muted">Cada plantilla mantiene su programa y sus secciones internas desde el día uno.</p>
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
