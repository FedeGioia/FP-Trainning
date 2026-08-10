'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export type PickerExercise = {
  id: string
  name: string
  primaryMetricType: string
  categoryId: string | null
  categoryPath: string | null
}

type ExerciseModalPickerProps = {
  exercises: PickerExercise[]
  selectedId: string
  onClose: () => void
  onClear: () => void
  onSelect: (exercise: PickerExercise) => void
}

export function ExerciseModalPicker({ exercises, selectedId, onClose, onClear, onSelect }: ExerciseModalPickerProps) {
  const [query, setQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const normalizedQuery = query.trim().toLocaleLowerCase('es')
  const groupedExercises = useMemo(() => {
    const groups = new Map<string, { category: string; exercises: PickerExercise[] }>()
    for (const exercise of exercises) {
      const searchable = `${exercise.name} ${exercise.primaryMetricType} ${exercise.categoryPath ?? ''}`.toLocaleLowerCase('es')
      if (normalizedQuery && !searchable.includes(normalizedQuery)) continue
      const categoryId = exercise.categoryId ?? 'uncategorized'
      const group = groups.get(categoryId) ?? { category: exercise.categoryPath ?? 'Sin categoría', exercises: [] }
      group.exercises.push(exercise)
      groups.set(categoryId, group)
    }
    return Array.from(groups.entries())
      .map(([categoryId, group]) => ({
        categoryId,
        category: group.category,
        exercises: [...group.exercises].sort((a, b) => a.name.localeCompare(b.name, 'es') || a.id.localeCompare(b.id)),
      }))
      .sort((a, b) => {
        if (a.category === 'Sin categoría') return 1
        if (b.category === 'Sin categoría') return -1
        return a.category.localeCompare(b.category, 'es') || a.categoryId.localeCompare(b.categoryId)
      })
  }, [exercises, normalizedQuery])

  useEffect(() => {
    searchInputRef.current?.focus()
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
          <div className="exercise-picker-modal__actions">
            {selectedId ? <button type="button" className="button button-secondary" onClick={onClear}>Limpiar selección</button> : null}
            <button type="button" className="button button-secondary" onClick={onClose}>Cancelar</button>
          </div>
        </div>
        <label className="field">
          <span className="sr-only">Buscar ejercicio</span>
          <input ref={searchInputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar ejercicio o categoría" />
        </label>
        {exercises.length === 0 ? (
          <p className="status status--muted">No hay ejercicios disponibles. Creá uno en la biblioteca antes de armar la rutina.</p>
        ) : groupedExercises.length === 0 ? (
          <p className="status status--muted">No encontramos ejercicios para esa búsqueda.</p>
        ) : (
          <div className="exercise-picker-modal__groups">
            {groupedExercises.map((group) => (
              <section key={group.categoryId} className="exercise-picker-modal__group">
                <h3>{group.category}</h3>
                {group.exercises.map((exercise) => (
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
