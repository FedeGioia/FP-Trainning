'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

import { resetStudentPasswordAction } from '@/app/(trainer)/trainer/students/actions'
import type { StudentSummary } from '@/modules/users'
import { ProgramBadge } from '@/components/ui/program-badge'

type StudentRosterTableProps = {
  students: StudentSummary[]
}

export function StudentRosterTable({ students }: StudentRosterTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [resetStudent, setResetStudent] = useState<StudentSummary | null>(null)
  const resetTriggerRef = useRef<HTMLButtonElement | null>(null)

  const visibleSelectedIds = useMemo(
    () => selectedIds.filter((studentId) => students.some((student) => student.id === studentId)),
    [selectedIds, students],
  )
  const allSelected = students.length > 0 && visibleSelectedIds.length === students.length

  function toggleSelection(studentId: string) {
    setSelectedIds((current) => (current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId]))
  }

  function toggleSelectAll() {
    setSelectedIds((current) => (current.length === students.length ? [] : students.map((student) => student.id)))
  }

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
    <div className="stack">
      <div className="student-roster-table-wrap">
        <table className="student-roster-table">
          <thead>
            <tr>
              <th className="student-roster-table__check-col">
                <button type="button" className="student-roster-table__check-all" onClick={toggleSelectAll} aria-label="Seleccionar todos los alumnos">
                  {allSelected ? '☑' : '☐'}
                </button>
              </th>
              <th>Alumno</th>
              <th>Email</th>
              <th>Programas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const isSelected = selectedIds.includes(student.id)

              return (
                <tr key={student.id} className={isSelected ? 'is-selected' : ''}>
                  <td className="student-roster-table__check-col">
                    <label className="student-roster-table__check">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelection(student.id)} aria-label={`Seleccionar ${student.name}`} />
                    </label>
                  </td>
                  <td>
                    <strong>{student.name}</strong>
                  </td>
                  <td className="muted">{student.email}</td>
                  <td>
                    <div className="student-roster-table__badges">
                      {student.programCodes.map((programCode) => (
                        <ProgramBadge key={programCode} code={programCode} />
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="student-roster-table__actions">
                      <Link className="pill" href={`/trainer/assignments/manual?studentId=${student.id}`}>
                        Manual
                      </Link>
                      <Link className="pill" href={`/trainer/assignments/new?studentId=${student.id}`}>
                        Plantilla
                      </Link>

                      <button
                        className="pill"
                        type="button"
                        onClick={(event) => {
                          resetTriggerRef.current = event.currentTarget
                          setResetStudent(student)
                        }}
                      >
                        Reset
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
