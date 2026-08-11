'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { resetStudentPasswordAction, updateStudentProfileAction } from '@/app/(trainer)/trainer/students/actions'
import type { ProgramSummary } from '@/modules/programs'
import type { StudentSummary } from '@/modules/users'
import { ProgramBadge } from '@/components/ui/program-badge'

type StudentRosterTableProps = {
  students: StudentSummary[]
  programs: ProgramSummary[]
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function MetricsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 19V10M12 19V5M19 19v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ManualAssignmentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function TemplateAssignmentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8" y="7" width="11" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ResetAccessIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 11a8 8 0 1 0 1 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 5v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function StudentRosterTable({ students, programs }: StudentRosterTableProps) {
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null)
  const [resetStudent, setResetStudent] = useState<StudentSummary | null>(null)
  const modalTriggerRef = useRef<HTMLButtonElement | null>(null)

  const activeStudent = selectedStudent ?? resetStudent

  function closeStudentModal() {
    setSelectedStudent(null)
  }

  function closeResetModal() {
    setResetStudent(null)
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSelectedStudent(null)
        setResetStudent(null)
      }
    }

      if (activeStudent) {
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
      }

    if (modalTriggerRef.current) {
      modalTriggerRef.current.focus()
      modalTriggerRef.current = null
    }

    return undefined
  }, [activeStudent])

  return (
    <div className="student-roster">
      <div className="student-roster-table-wrap">
        <table className="student-roster-table">
          <thead>
            <tr>
              <th className="student-roster-table__name-column">Alumno</th>
              <th className="student-roster-table__email-column">Email</th>
              <th className="student-roster-table__programs-column">Programas</th>
              <th className="student-roster-table__actions-column">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              return (
                <tr key={student.id}>
                  <td className="student-roster-table__student student-roster-table__name-column">
                    <button
                      className="student-roster-table__student-trigger"
                      type="button"
                      onClick={(event) => {
                        modalTriggerRef.current = event.currentTarget
                        setSelectedStudent(student)
                      }}
                    >
                      {student.name}
                    </button>
                  </td>
                  <td className="muted student-roster-table__email-column">{student.email}</td>
                  <td className="student-roster-table__programs-column">
                    <div className="student-roster-table__badges">
                      {student.programCodes.map((programCode) => (
                        <ProgramBadge key={programCode} code={programCode} />
                      ))}
                    </div>
                  </td>
                  <td className="student-roster-table__actions-column">
                    <div className="student-roster-table__actions">
                      <Link
                        className="student-roster-table__action"
                        href={`/trainer/students/${student.id}/metrics`}
                        aria-label={`Ver métricas de ${student.name}`}
                        title="Ver métricas"
                      >
                        <MetricsIcon />
                      </Link>
                      <Link
                        className="student-roster-table__action student-roster-table__action--primary"
                        href={`/trainer/assignments/manual?studentId=${student.id}`}
                        aria-label={`Asignar rutina manualmente a ${student.name}`}
                        title="Asignar manualmente"
                      >
                        <ManualAssignmentIcon />
                      </Link>
                      <Link
                        className="student-roster-table__action"
                        href={`/trainer/assignments/new?studentId=${student.id}`}
                        aria-label={`Asignar plantilla a ${student.name}`}
                        title="Usar plantilla"
                      >
                        <TemplateAssignmentIcon />
                      </Link>

                      <button
                        className="student-roster-table__action student-roster-table__action--reset"
                        type="button"
                        aria-label={`Resetear acceso de ${student.name}`}
                        title="Resetear acceso"
                        onClick={(event) => {
                          modalTriggerRef.current = event.currentTarget
                          setResetStudent(student)
                        }}
                      >
                        <ResetAccessIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedStudent ? (
        <div className="student-modal-backdrop" role="presentation" onClick={closeStudentModal}>
          <div className="card stack student-modal" role="dialog" aria-modal="true" aria-labelledby="student-detail-title" onClick={(event) => event.stopPropagation()}>
            <div className="student-modal__header">
              <div className="stack" style={{ gap: '0.2rem' }}>
                <span className="muted">Datos del alumno</span>
                <h3 id="student-detail-title" className="student-modal__title">
                  {selectedStudent.name}
                </h3>
              </div>

              <button className="student-modal__close" type="button" onClick={closeStudentModal} aria-label="Cerrar datos del alumno" title="Cerrar">
                <CloseIcon />
              </button>
            </div>

            <form className="stack" action={updateStudentProfileAction} style={{ gap: '0.85rem' }}>
              <input type="hidden" name="studentId" value={selectedStudent.id} />

              <label className="field">
                <span>Nombre</span>
                <input name="name" type="text" defaultValue={selectedStudent.name} required autoFocus />
              </label>

              <label className="field">
                <span>Email</span>
                <input name="email" type="email" defaultValue={selectedStudent.email} required />
              </label>

              <fieldset className="student-modal__programs" aria-describedby="student-programs-help">
                <legend>Programas</legend>
                <div className="student-modal__program-grid">
                  {programs.map((program) => (
                    <label key={program.code} className="check-card student-modal__program-option">
                      <input
                        type="checkbox"
                        name="programCodes"
                        value={program.code}
                        defaultChecked={selectedStudent.programCodes.includes(program.code)}
                      />
                      <span className="stack" style={{ gap: '0.2rem' }}>
                        <strong>{program.name}</strong>
                        {program.description ? <span className="muted">{program.description}</span> : null}
                      </span>
                    </label>
                  ))}
                </div>
                <span id="student-programs-help" className="muted">
                  Si elegís Training, Stretching o Running, se agrega FP-Home automáticamente según la regla actual del negocio.
                </span>
              </fieldset>

              <div className="role-nav student-modal__actions">
                <button className="button button-primary" type="submit">
                  Guardar cambios
                </button>
                <button className="button button-secondary" type="button" onClick={closeStudentModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {resetStudent ? (
        <div className="student-modal-backdrop" role="presentation" onClick={closeResetModal}>
          <div className="card stack student-modal" role="dialog" aria-modal="true" aria-labelledby="student-reset-title" onClick={(event) => event.stopPropagation()}>
            <div className="student-modal__header">
              <div className="stack" style={{ gap: '0.2rem' }}>
                <span className="muted">Reset de contraseña</span>
                <h3 id="student-reset-title" className="student-modal__title">
                  {resetStudent.name}
                </h3>
                <p className="muted" style={{ margin: 0 }}>
                  {resetStudent.email}
                </p>
              </div>

              <button className="student-modal__close" type="button" onClick={closeResetModal} aria-label="Cerrar reset de contraseña" title="Cerrar">
                <CloseIcon />
              </button>
            </div>

            <form className="stack" action={resetStudentPasswordAction} style={{ gap: '0.85rem' }}>
              <input type="hidden" name="studentId" value={resetStudent.id} />

              <label className="field">
                <span>Nueva contraseña</span>
                <input name="password" type="password" placeholder="Mínimo 8 caracteres" minLength={8} required autoFocus />
              </label>

              <div className="role-nav student-modal__actions">
                <button className="button button-primary" type="submit">
                  Resetear y forzar cambio
                </button>
                <button className="button button-secondary" type="button" onClick={closeResetModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
