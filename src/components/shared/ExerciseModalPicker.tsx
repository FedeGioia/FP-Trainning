'use client'

import { useEffect, useMemo, useState } from 'react'

export type PickerExercise = {
  id: string
  name: string
  primaryMetricType: string
  categoryPath: string | null
}

type ExerciseModalPickerProps = {
  exercises: PickerExercise[]
  onClose: () => void
  onSelect: (exercise: PickerExercise) => void
}

export function ExerciseModalPicker({ exercises, onClose, onSelect }: ExerciseModalPickerProps) {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLocaleLowerCase('es')
  const groupedExercises = useMemo(() => {
    const groups = new Map<string, PickerExercise[]>()
    for (const exercise of exercises) {
      const searchable = `${exercise.name} ${exercise.primaryMetricType} ${exercise.categoryPath ?? ''}`.toLocaleLowerCase('es')
      if (normalizedQuery && !searchable.includes(normalizedQuery)) continue
      const category = exercise.categoryPath ?? 'Sin categoría'
      groups.set(category, [...(groups.get(category) ?? []), exercise])
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b, 'es'))
  }, [exercises, normalizedQuery])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="student-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="card exercise-picker-modal" role="dialog" aria-modal="true" aria-labelledby="exercise-picker-title">
        <div className="student-modal__header">
          <div>
            <h2 id="exercise-picker-title" className="student-modal__title">Elegir ejercicio</h2>
            <p className="muted">Buscá por nombre o navegá las categorías.</p>
          </div>
          <button type="button" className="button button-secondary" onClick={onClose}>Cancelar</button>
        </div>
        <label className="field">
          <span className="sr-only">Buscar ejercicio</span>
          <input autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar ejercicio o categoría" />
        </label>
        {exercises.length === 0 ? (
          <p className="status status--muted">No hay ejercicios disponibles. Creá uno en la biblioteca antes de armar la rutina.</p>
        ) : groupedExercises.length === 0 ? (
          <p className="status status--muted">No encontramos ejercicios para esa búsqueda.</p>
        ) : (
          <div className="exercise-picker-modal__groups">
            {groupedExercises.map(([category, group]) => (
              <section key={category} className="exercise-picker-modal__group">
                <h3>{category}</h3>
                {group.map((exercise) => (
                  <button key={exercise.id} type="button" className="exercise-picker-modal__option" onClick={() => onSelect(exercise)}>
                    <strong>{exercise.name}</strong>
                    <span>{exercise.primaryMetricType}</span>
                  </button>
                ))}
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
