'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { resetStudentPasswordAction } from '@/app/(trainer)/trainer/students/actions'
import type { StudentSummary } from '@/modules/users'
import { ProgramBadge } from '@/components/ui/program-badge'

type StudentRosterTableProps = {
  students: StudentSummary[]
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

export function StudentRosterTable({ students }: StudentRosterTableProps) {
  const [resetStudent, setResetStudent] = useState<StudentSummary | null>(null)
  const resetTriggerRef = useRef<HTMLButtonElement | null>(null)

  function closeResetModal() {
    setResetStudent(null)
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeResetModal()
      }
    }

    if (resetStudent) {
      window.addEventListener('keydown', onKeyDown)
      return () => window.removeEventListener('keydown', onKeyDown)
    }

    if (resetTriggerRef.current) {
      resetTriggerRef.current.focus()
      resetTriggerRef.current = null
    }

    return undefined
  }, [resetStudent])

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
                    <strong>{student.name}</strong>
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
                          resetTriggerRef.current = event.currentTarget
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

              <button className="pill" type="button" onClick={closeResetModal} aria-label="Cerrar modal">
                Cerrar
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
