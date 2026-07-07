import Link from 'next/link'

import { createAssignmentAction } from './actions'
import { listStudents } from '@/modules/users'
import { listTemplates } from '@/modules/templates'

type TrainerAssignmentNewPageProps = {
  searchParams?: Promise<{
    error?: string
    studentId?: string
  }>
}

export default async function TrainerAssignmentNewPage({ searchParams }: TrainerAssignmentNewPageProps) {
  const params = (await searchParams) ?? {}
  const [students, templates] = await Promise.all([listStudents(), listTemplates()])
  const selectedStudent = params.studentId ? students.find((student) => student.id === params.studentId) : null
  const filteredTemplates = selectedStudent
    ? templates.filter((template) => selectedStudent.programCodes.includes(template.programCode))
    : templates

  return (
    <div className="stack">
      <section className="section-header">
        <div className="stack" style={{ gap: '0.35rem' }}>
          <h1 className="section-title">Nueva asignación desde plantilla</h1>
          <p className="muted">Elegí una plantilla cuando quieras reutilizar una estructura ya armada y asignarla rápido a un alumno.</p>
        </div>
        <div className="role-nav">
          <Link className="pill" href="/trainer/assignments/manual">
            Crear rutina manual
          </Link>
          <Link className="pill" href="/trainer/assignments">
            Volver al listado
          </Link>
        </div>
      </section>

      {params.error ? (
        <section className="card stack">
          <span className="status status--error">{decodeURIComponent(params.error)}</span>
        </section>
      ) : null}

      <form action={createAssignmentAction} className="card stack">
        {selectedStudent ? (
          <p className="muted">
            Alumno seleccionado: {selectedStudent.name} ({selectedStudent.email}) · Plantillas compatibles con sus programas
          </p>
        ) : null}

        <div className="form-grid">
          <label className="field">
            <span>Alumno</span>
            <select name="studentId" defaultValue={params.studentId ?? ''}>
              <option value="" disabled>
                Elegí un alumno
              </option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} — {student.programCodes.join(', ')}
                </option>
              ))}
            </select>
          </label>

            <label className="field">
              <span>Template</span>
              <select name="templateId" defaultValue="">
                <option value="" disabled>
                  Elegí una plantilla
                </option>
                {filteredTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} — {template.programCode}
                  </option>
                ))}
              </select>
              {selectedStudent && filteredTemplates.length === 0 ? (
                <small className="muted">Ese alumno todavía no tiene plantillas compatibles cargadas.</small>
              ) : null}
            </label>
          </div>

        <div className="form-grid">
          <label className="field">
            <span>Fecha y hora</span>
            <input name="scheduledAt" type="datetime-local" required />
          </label>

          <label className="field">
            <span>Título opcional</span>
            <input name="title" type="text" placeholder="Si no lo completás, se genera automático" />
          </label>
        </div>

        <label className="field">
          <span>Notas</span>
          <textarea name="notes" rows={4} placeholder="Aclaraciones para el alumno o contexto del día." />
        </label>

        <div className="role-nav">
          <button className="button button-primary" type="submit">
            Crear asignación
          </button>
          <Link className="button button-secondary" href="/trainer/assignments">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
