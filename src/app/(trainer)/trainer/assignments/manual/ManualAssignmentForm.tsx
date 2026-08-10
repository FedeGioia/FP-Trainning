'use client'

import { useActionState } from 'react'

import { ExercisePrescriptionGrid } from '@/components/shared/ExercisePrescriptionGrid'
import type { ManualValidationState } from '@/modules/assignments/types'
import { createManualAssignmentAction } from './actions'

const SECTION_SLOTS = 3

type ManualAssignmentFormProps = {
  students: Array<{ id: string; name: string; programCodes: string[] }>
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

export function ManualAssignmentForm({ students, programs, exercises, categories, initialStudentId = '', initialState }: ManualAssignmentFormProps) {
  const [state, formAction] = useActionState(createManualAssignmentAction, initialState ?? null)
  const values = state ?? initialState
  const errors = new Map(values?.issues.map((issue) => [issue.path, issue.message]))
  const studentId = values?.studentId ?? initialStudentId
  const selectedStudent = students.find((student) => student.id === studentId)
  const programOptions = selectedStudent ? programs.filter((program) => selectedStudent.programCodes.includes(program.code)) : programs

  return (
    <form action={formAction} className="card stack">
      {values?.formError ? <p className="status status--error" role="alert">{values.formError}</p> : null}
      <section className="form-panel stack">
        <div className="form-grid">
          <label className="field">
            <span>Alumno</span><small>Solo aparecen alumnos ya cargados en la plataforma.</small>
            <select name="studentId" defaultValue={studentId} aria-invalid={Boolean(errors.get('studentId'))}>
              <option value="" disabled>Elegí un alumno</option>
              {students.map((student) => <option key={student.id} value={student.id}>{student.name} — {student.programCodes.join(', ')}</option>)}
            </select>
            {errors.get('studentId') ? <small className="field-error">{errors.get('studentId')}</small> : null}
          </label>
          <label className="field">
            <span>Programa</span><small>La rutina se guarda asociada a uno de los programas del alumno.</small>
            <select name="programId" defaultValue={values?.programId ?? ''} aria-invalid={Boolean(errors.get('programId'))}>
              <option value="" disabled>Elegí un programa</option>
              {programOptions.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}
            </select>
            {errors.get('programId') ? <small className="field-error">{errors.get('programId')}</small> : null}
          </label>
        </div>
        <div className="form-grid">
          <label className="field"><span>Fecha y hora</span><input name="scheduledAt" type="datetime-local" required defaultValue={values?.scheduledAt ?? ''} aria-invalid={Boolean(errors.get('scheduledAt'))} />{errors.get('scheduledAt') ? <small className="field-error">{errors.get('scheduledAt')}</small> : null}</label>
          <label className="field"><span>Título opcional</span><input name="title" type="text" defaultValue={values?.title ?? ''} placeholder="Ej: Empuje técnico + accesorios" /></label>
        </div>
        <label className="field"><span>Notas generales</span><textarea name="notes" rows={4} defaultValue={values?.notes ?? ''} placeholder="Contexto del día, foco de la sesión o indicaciones para el alumno." /></label>
      </section>

      {Array.from({ length: SECTION_SLOTS }, (_, sectionIndex) => {
        const section = values?.sections[sectionIndex]
        const sectionErrors = fieldErrorsForSection(values, sectionIndex)
        return (
          <details key={sectionIndex} className="card stack reveal-panel" open={sectionIndex === 0 || Boolean(section?.title || section?.exercises.length)}>
            <summary>{sectionIndex === 0 ? 'Sección 1' : `Agregar sección ${sectionIndex + 1}`}</summary>
            <div className="stack reveal-panel__body form-panel" style={{ gap: '1rem' }}>
              <label className="field">
                <span>Título de la sección</span>
                <input name={`sections.${sectionIndex}.title`} type="text" defaultValue={section?.title ?? ''} placeholder={`Ej: Sección ${sectionIndex + 1} / Accesorios`} aria-invalid={Boolean(sectionErrors[`sections.${sectionIndex}.title`])} />
                {sectionErrors[`sections.${sectionIndex}.title`] ? <small className="field-error">{sectionErrors[`sections.${sectionIndex}.title`]}</small> : null}
              </label>
              <ExercisePrescriptionGrid
                sectionIndex={sectionIndex}
                exercises={exercises}
                categories={categories}
                initialRows={section?.exercises.map((exercise) => ({ exerciseId: exercise.exerciseId }))}
                initialValues={section?.exercises}
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
