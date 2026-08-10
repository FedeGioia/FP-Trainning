'use client'

import { useActionState } from 'react'

import { createAssignmentAction } from './actions'
import type { TemplateValidationState } from '@/modules/assignments/types'

type TemplateAssignmentFormProps = {
  students: Array<{ id: string; name: string; programCodes: string[] }>
  templates: Array<{ id: string; name: string; programCode: string }>
  initialStudentId?: string
  initialState?: TemplateValidationState
}

export function TemplateAssignmentForm({ students, templates, initialStudentId = '', initialState }: TemplateAssignmentFormProps) {
  const [state, formAction] = useActionState(createAssignmentAction, initialState ?? null)
  const values = state ?? initialState
  const errors = new Map(values?.issues.map((issue) => [issue.path, issue.message]))
  const studentId = values?.studentId ?? initialStudentId
  const selectedStudent = students.find((student) => student.id === studentId)
  const filteredTemplates = selectedStudent
    ? templates.filter((template) => selectedStudent.programCodes.includes(template.programCode))
    : templates

  return (
    <form action={formAction} className="card stack">
      {values?.formError ? <p className="status status--error" role="alert">{values.formError}</p> : null}
      {selectedStudent ? <p className="muted">Alumno seleccionado: {selectedStudent.name} · Plantillas compatibles con sus programas</p> : null}

      <div className="form-grid">
        <label className="field">
          <span>Alumno</span>
            <select name="studentId" defaultValue={studentId} aria-invalid={Boolean(errors.get('studentId'))} aria-describedby={errors.get('studentId') ? 'studentId-error' : undefined}>
            <option value="" disabled>Elegí un alumno</option>
            {students.map((student) => <option key={student.id} value={student.id}>{student.name} — {student.programCodes.join(', ')}</option>)}
          </select>
          {errors.get('studentId') ? <small id="studentId-error" className="field-error">{errors.get('studentId')}</small> : null}
        </label>

        <label className="field">
          <span>Template</span>
          <select name="templateId" defaultValue={values?.templateId ?? ''} aria-invalid={Boolean(errors.get('templateId'))} aria-describedby={errors.get('templateId') ? 'templateId-error' : undefined}>
            <option value="" disabled>Elegí una plantilla</option>
            {filteredTemplates.map((template) => <option key={template.id} value={template.id}>{template.name} — {template.programCode}</option>)}
          </select>
          {errors.get('templateId') ? <small id="templateId-error" className="field-error">{errors.get('templateId')}</small> : null}
          {selectedStudent && filteredTemplates.length === 0 ? <small className="muted">Ese alumno todavía no tiene plantillas compatibles cargadas.</small> : null}
        </label>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Fecha y hora</span>
          <input name="scheduledAt" type="datetime-local" required defaultValue={values?.scheduledAt ?? ''} aria-invalid={Boolean(errors.get('scheduledAt'))} aria-describedby={errors.get('scheduledAt') ? 'scheduledAt-error' : undefined} />
          {errors.get('scheduledAt') ? <small id="scheduledAt-error" className="field-error">{errors.get('scheduledAt')}</small> : null}
        </label>
        <label className="field"><span>Título opcional</span><input name="title" type="text" defaultValue={values?.title ?? ''} placeholder="Si no lo completás, se genera automático" /></label>
      </div>

      <label className="field"><span>Notas</span><textarea name="notes" rows={4} defaultValue={values?.notes ?? ''} placeholder="Aclaraciones para el alumno o contexto del día." /></label>
      <button className="button button-primary" type="submit">Crear asignación</button>
    </form>
  )
}
