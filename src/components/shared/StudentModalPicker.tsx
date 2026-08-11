'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type PickerStudent = {
  id: string
  name: string
  email: string
  programCodes: string[]
}

type StudentModalPickerProps = {
  students: PickerStudent[]
  selectedId: string
  onClose: () => void
  onSelect: (student: PickerStudent) => void
}

function StudentModalPicker({ students, selectedId, onClose, onSelect }: StudentModalPickerProps) {
  const [query, setQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const normalizedQuery = query.trim().toLocaleLowerCase('es')
  const visibleStudents = useMemo(() => students
    .filter((student) => !normalizedQuery || `${student.name} ${student.email} ${student.programCodes.join(' ')}`.toLocaleLowerCase('es').includes(normalizedQuery))
    .sort((a, b) => a.name.localeCompare(b.name, 'es') || a.email.localeCompare(b.email, 'es')), [normalizedQuery, students])

  useEffect(() => {
    searchInputRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return createPortal(
    <div className="student-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="card student-picker-modal" role="dialog" aria-modal="true" aria-labelledby="student-picker-title">
        <div className="student-modal__header">
          <div>
            <span className="student-picker-modal__eyebrow">Alumnos</span>
            <h2 id="student-picker-title" className="student-modal__title">Elegí un alumno</h2>
            <p className="muted">Buscá por nombre, email o programa.</p>
          </div>
          <button type="button" className="student-modal__close" onClick={onClose} aria-label="Cerrar selector de alumno" title="Cerrar">×</button>
        </div>
        <label className="field">
          <span className="sr-only">Buscar alumno</span>
          <input ref={searchInputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nombre o email" />
        </label>
        {students.length === 0 ? <p className="status status--muted">No hay alumnos disponibles.</p> : null}
        {students.length > 0 && visibleStudents.length === 0 ? <p className="status status--muted">No encontramos alumnos para esa búsqueda.</p> : null}
        {visibleStudents.length > 0 ? (
          <div className="student-picker-modal__list">
            {visibleStudents.map((student) => (
              <button key={student.id} type="button" className={`student-picker-modal__option${student.id === selectedId ? ' is-selected' : ''}`} onClick={() => onSelect(student)}>
                <span>
                  <strong>{student.name}</strong>
                  <small>{student.email}</small>
                </span>
                <small>{student.programCodes.length > 0 ? student.programCodes.join(' · ') : 'Sin programas'}</small>
              </button>
            ))}
          </div>
        ) : null}
      </section>
    </div>,
    document.body,
  )
}

type StudentModalPickerTriggerProps = {
  students: PickerStudent[]
  fieldName: string
  selectedId: string
  onSelectedIdChange: (studentId: string) => void
  invalid?: boolean
  describedBy?: string
}

export function StudentModalPickerTrigger({ students, fieldName, selectedId, onSelectedIdChange, invalid, describedBy }: StudentModalPickerTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const selectedStudent = students.find((student) => student.id === selectedId)
  const closePicker = () => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <>
      <input name={fieldName} type="hidden" value={selectedId} />
      <button ref={triggerRef} type="button" className={`student-picker-trigger${invalid ? ' is-invalid' : ''}`} aria-describedby={describedBy} onClick={() => setIsOpen(true)}>
        <span>{selectedStudent?.name ?? 'Elegí un alumno'}</span>
        <small>{selectedStudent ? `${selectedStudent.email} · ${selectedStudent.programCodes.join(', ') || 'Sin programas'}` : 'Abrir selector de alumnos'}</small>
      </button>
      {isOpen ? <StudentModalPicker students={students} selectedId={selectedId} onClose={closePicker} onSelect={(student) => { onSelectedIdChange(student.id); closePicker() }} /> : null}
    </>
  )
}
