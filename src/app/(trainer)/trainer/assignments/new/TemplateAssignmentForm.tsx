'use client'

import { useActionState, useState } from 'react'

import { createAssignmentAction } from './actions'
import type { TemplateValidationState } from '@/modules/assignments/types'
import { StudentModalPickerTrigger } from '@/components/shared/StudentModalPicker'

type TemplateAssignmentFormProps = {
  students: Array<{ id: string; name: string; email: string; programCodes: string[] }>
  templates: Array<{ id: string; name: string; programCode: string }>
  initialStudentId?: string
  initialState?: TemplateValidationState
}

export function TemplateAssignmentForm({ students, templates, initialStudentId = '', initialState }: TemplateAssignmentFormProps) {
  const [state, formAction] = useActionState(createAssignmentAction, initialState ?? null)
  const values = state ?? initialState
  const errors = new Map(values?.issues.map((issue) => [issue.path, issue.message]))
  const [studentId, setStudentId] = useState(values?.studentId ?? initialStudentId)
  const [templateId, setTemplateId] = useState(values?.templateId ?? '')
  const [scheduledAt, setScheduledAt] = useState(values?.scheduledAt ?? '')
  const [title, setTitle] = useState(values?.title ?? '')
  const [notes, setNotes] = useState(values?.notes ?? '')
  const [previousValues, setPreviousValues] = useState(values)
  const [previousInitialStudentId, setPreviousInitialStudentId] = useState(initialStudentId)

  if (values !== previousValues || initialStudentId !== previousInitialStudentId) {
    setPreviousValues(values)
    setPreviousInitialStudentId(initialStudentId)
    setStudentId(values?.studentId ?? initialStudentId)
    setTemplateId(values?.templateId ?? '')
    setScheduledAt(values?.scheduledAt ?? '')
    setTitle(values?.title ?? '')
    setNotes(values?.notes ?? '')
  }
  const selectedStudent = students.find((student) => student.id === studentId)
  const filteredTemplates = selectedStudent
    ? templates.filter((template) => selectedStudent.programCodes.includes(template.programCode))
    : templates

  return (
    <form action={formAction} className="card stack trainer-form">
      {values?.formError ? <p className="status status--error" role="alert">{values.formError}</p> : null}
      {selectedStudent ? <p className="muted">Alumno seleccionado: {selectedStudent.name} · Plantillas compatibles con sus programas</p> : null}

      <div className="form-grid">
        <div className="field">
          <span>Alumno</span>
          <StudentModalPickerTrigger students={students} fieldName="studentId" selectedId={studentId} onSelectedIdChange={(nextStudentId) => { if (nextStudentId !== studentId) setTemplateId(''); setStudentId(nextStudentId) }} invalid={Boolean(errors.get('studentId'))} describedBy={errors.get('studentId') ? 'studentId-error' : undefined} />
          {errors.get('studentId') ? <small id="studentId-error" className="field-error">{errors.get('studentId')}</small> : null}
        </div>

        <label className="field">
          <span>Template</span>
          <select name="templateId" value={templateId} onChange={(event) => setTemplateId(event.target.value)} aria-invalid={Boolean(errors.get('templateId'))} aria-describedby={errors.get('templateId') ? 'templateId-error' : undefined}>
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
          <input name="scheduledAt" type="datetime-local" required value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} aria-invalid={Boolean(errors.get('scheduledAt'))} aria-describedby={errors.get('scheduledAt') ? 'scheduledAt-error' : undefined} />
          {errors.get('scheduledAt') ? <small id="scheduledAt-error" className="field-error">{errors.get('scheduledAt')}</small> : null}
        </label>
        <label className="field"><span>Título opcional</span><input name="title" type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Si no lo completás, se genera automático" /></label>
      </div>

      <label className="field"><span>Notas</span><textarea name="notes" rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Aclaraciones para el alumno o contexto del día." /></label>
      <button className="button button-primary" type="submit">Crear asignación</button>
    </form>
  )
}
