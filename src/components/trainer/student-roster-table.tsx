'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { resetStudentPasswordAction } from '@/app/(trainer)/trainer/students/actions'
import type { StudentSummary } from '@/modules/users'
import { ProgramBadge } from '@/components/ui/program-badge'

type StudentRosterTableProps = {
  students: StudentSummary[]
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
                      <Link className="student-roster-table__action student-roster-table__action--primary" href={`/trainer/assignments/manual?studentId=${student.id}`}>
                        Asignar manualmente
                      </Link>
                      <Link className="student-roster-table__action" href={`/trainer/assignments/new?studentId=${student.id}`}>
                        Usar plantilla
                      </Link>

                      <button
                        className="student-roster-table__action student-roster-table__action--reset"
                        type="button"
                        onClick={(event) => {
                          resetTriggerRef.current = event.currentTarget
                          setResetStudent(student)
                        }}
                      >
                        Resetear acceso
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
