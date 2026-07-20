import Link from 'next/link'

import { listTemplates } from '@/modules/templates'
import { listStudents } from '@/modules/users'
import { TemplateAssignmentForm } from './TemplateAssignmentForm'

export default async function TrainerAssignmentNewPage() {
  const [students, templates] = await Promise.all([listStudents(), listTemplates()])

  return (
    <div className="stack">
      <section className="section-header">
        <div className="stack" style={{ gap: '0.35rem' }}>
          <h1 className="section-title">Nueva asignación desde plantilla</h1>
          <p className="muted">Elegí una plantilla cuando quieras reutilizar una estructura ya armada y asignarla rápido a un alumno.</p>
        </div>
        <div className="role-nav"><Link className="pill" href="/trainer/assignments/manual">Crear rutina manual</Link><Link className="pill" href="/trainer/assignments">Volver al listado</Link></div>
      </section>
      <TemplateAssignmentForm students={students} templates={templates} />
    </div>
  )
}
