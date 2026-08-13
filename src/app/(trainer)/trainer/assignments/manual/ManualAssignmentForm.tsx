'use client'

import { useActionState, useState } from 'react'

import { ExercisePrescriptionGrid } from '@/components/shared/ExercisePrescriptionGrid'
import { StudentModalPickerTrigger } from '@/components/shared/StudentModalPicker'
import type { ManualValidationState } from '@/modules/assignments/types'
import { createManualAssignmentAction } from './actions'

const SECTION_SLOTS = 3

type ManualAssignmentFormProps = {
  students: Array<{ id: string; name: string; email: string; programCodes: string[] }>
  programs: Array<{ id: string; name: string; code: string }>
  exercises: Array<{ id: string; name: string; primaryMetricType: string; categoryId: string; categoryPath: string }>
  categories: Parameters<typeof ExercisePrescriptionGrid>[0]['categories']
  initialStudentId?: string
  initialState?: ManualValidationState
}

function fieldErrorsForSection(state: ManualValidationState | undefined, sectionIndex: number) {
  return Object.fromEntries(
    (state?.issues ?? [])
      .filter((issue) => issue.path.startsWith(`sections.${sectionIndex}.`))
      .map((issue) => [issue.path, issue.message]),
  )
}

function sectionsFromState(state: ManualValidationState | undefined) {
  return Array.from({ length: SECTION_SLOTS }, (_, sectionIndex) => state?.sections[sectionIndex] ?? { title: '', exercises: [] })
}

export function ManualAssignmentForm({ students, programs, exercises, categories, initialStudentId = '', initialState }: ManualAssignmentFormProps) {
  const [state, formAction] = useActionState(createManualAssignmentAction, initialState ?? null)
  const values = state ?? initialState
  const errors = new Map(values?.issues.map((issue) => [issue.path, issue.message]))
  const [studentId, setStudentId] = useState(values?.studentId ?? initialStudentId)
  const [programId, setProgramId] = useState(values?.programId ?? '')
  const [scheduledAt, setScheduledAt] = useState(values?.scheduledAt ?? '')
  const [title, setTitle] = useState(values?.title ?? '')
  const [notes, setNotes] = useState(values?.notes ?? '')
  const [sections, setSections] = useState(() => sectionsFromState(values))
  const [previousValues, setPreviousValues] = useState(values)
  const [previousInitialStudentId, setPreviousInitialStudentId] = useState(initialStudentId)

  if (values !== previousValues || initialStudentId !== previousInitialStudentId) {
    setPreviousValues(values)
    setPreviousInitialStudentId(initialStudentId)
    setStudentId(values?.studentId ?? initialStudentId)
    setProgramId(values?.programId ?? '')
    setScheduledAt(values?.scheduledAt ?? '')
    setTitle(values?.title ?? '')
    setNotes(values?.notes ?? '')
    setSections(sectionsFromState(values))
  }

  const selectedStudent = students.find((student) => student.id === studentId)
  const programOptions = selectedStudent ? programs.filter((program) => selectedStudent.programCodes.includes(program.code)) : []

  return (
    <form action={formAction} className="card stack trainer-form">
      {values?.formError ? <p className="status status--error" role="alert">{values.formError}</p> : null}
      <section className="form-panel stack">
        <div className="form-grid">
          <div className="field">
            <span>Alumno</span><small>Solo aparecen alumnos ya cargados en la plataforma.</small>
            <StudentModalPickerTrigger students={students} fieldName="studentId" selectedId={studentId} onSelectedIdChange={(nextStudentId) => { if (nextStudentId !== studentId) setProgramId(''); setStudentId(nextStudentId) }} invalid={Boolean(errors.get('studentId'))} describedBy={errors.get('studentId') ? 'studentId-error' : undefined} />
            {errors.get('studentId') ? <small id="studentId-error" className="field-error">{errors.get('studentId')}</small> : null}
          </div>
          <label className="field">
            <span>Programa</span><small>La rutina se guarda asociada a uno de los programas del alumno.</small>
            <select name="programId" value={programId} onChange={(event) => setProgramId(event.target.value)} disabled={!selectedStudent} aria-invalid={Boolean(errors.get('programId'))}>
              <option value="" disabled>Elegí un programa</option>
              {programOptions.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}
            </select>
            {errors.get('programId') ? <small className="field-error">{errors.get('programId')}</small> : null}
          </label>
        </div>
        <div className="form-grid">
          <label className="field"><span>Fecha y hora</span><input name="scheduledAt" type="datetime-local" required value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} aria-invalid={Boolean(errors.get('scheduledAt'))} />{errors.get('scheduledAt') ? <small className="field-error">{errors.get('scheduledAt')}</small> : null}</label>
          <label className="field"><span>Título opcional</span><input name="title" type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej: Empuje técnico + accesorios" /></label>
        </div>
        <label className="field"><span>Notas generales</span><textarea name="notes" rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Contexto del día, foco de la sesión o indicaciones para el alumno." /></label>
      </section>

      {Array.from({ length: SECTION_SLOTS }, (_, sectionIndex) => {
        const section = sections[sectionIndex]
        const sectionErrors = fieldErrorsForSection(values, sectionIndex)
        return (
          <details key={sectionIndex} className="card stack reveal-panel" open={sectionIndex === 0 || Boolean(section?.title || section?.exercises.length)}>
            <summary>{sectionIndex === 0 ? 'Sección 1' : `Agregar sección ${sectionIndex + 1}`}</summary>
            <div className="stack reveal-panel__body form-panel" style={{ gap: '1rem' }}>
              <label className="field">
                <span>Título de la sección</span>
                <input name={`sections.${sectionIndex}.title`} type="text" value={section.title} onChange={(event) => setSections((current) => current.map((currentSection, currentIndex) => currentIndex === sectionIndex ? { ...currentSection, title: event.target.value } : currentSection))} placeholder={`Ej: Sección ${sectionIndex + 1} / Accesorios`} aria-invalid={Boolean(sectionErrors[`sections.${sectionIndex}.title`])} />
                {sectionErrors[`sections.${sectionIndex}.title`] ? <small className="field-error">{sectionErrors[`sections.${sectionIndex}.title`]}</small> : null}
              </label>
              <ExercisePrescriptionGrid
                sectionIndex={sectionIndex}
                exercises={exercises}
                categories={categories}
                initialValues={section.exercises}
                fieldErrors={sectionErrors}
              />
            </div>
          </details>
        )
      })}
      <button className="button button-primary" type="submit">Crear rutina manual</button>
    </form>
  )
}
