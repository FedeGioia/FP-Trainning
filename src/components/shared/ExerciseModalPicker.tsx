'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type PickerExercise = {
  id: string
  name: string
  primaryMetricType: string
  categoryId: string
  categoryPath: string
}

export type PickerCategory = {
  id: string
  name: string
  path: string
  children: PickerCategory[]
}

type ExerciseModalPickerProps = {
  exercises: PickerExercise[]
  categories: PickerCategory[]
  selectedId: string
  onClose: () => void
  onClear: () => void
  onSelect: (exercise: PickerExercise) => void
}

export function ExerciseModalPicker({ exercises, categories, selectedId, onClose, onClear, onSelect }: ExerciseModalPickerProps) {
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const normalizedQuery = query.trim().toLocaleLowerCase('es')
  const categoryIndex = useMemo(() => {
    const index = new Map<string, PickerCategory>()
    const visit = (items: PickerCategory[]) => items.forEach((category) => {
      index.set(category.id, category)
      visit(category.children)
    })
    visit(categories)
    return index
  }, [categories])
  const currentCategory = categoryId ? categoryIndex.get(categoryId) : undefined
  const visibleExercises = useMemo(() => exercises
    .filter((exercise) => normalizedQuery
      ? `${exercise.name} ${exercise.primaryMetricType} ${exercise.categoryPath}`.toLocaleLowerCase('es').includes(normalizedQuery)
      : exercise.categoryId === categoryId)
    .sort((a, b) => a.name.localeCompare(b.name, 'es') || a.id.localeCompare(b.id)), [categoryId, exercises, normalizedQuery])

  useEffect(() => {
    searchInputRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return createPortal(
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
        {exercises.length === 0 ? <p className="status status--muted">No hay ejercicios disponibles. Creá uno en la biblioteca antes de armar la rutina.</p> : null}
        {exercises.length > 0 && normalizedQuery && visibleExercises.length === 0 ? <p className="status status--muted">No encontramos ejercicios para esa búsqueda.</p> : null}
        {exercises.length > 0 && (!normalizedQuery || visibleExercises.length > 0) ? (
          <div className="exercise-picker-modal__groups">
            {!normalizedQuery && currentCategory ? <button type="button" className="exercise-picker-modal__back" onClick={() => setCategoryId(null)}>← Volver a categorías</button> : null}
            {!normalizedQuery && (currentCategory?.children ?? categories).map((category) => (
              <button key={category.id} type="button" className="exercise-picker-modal__folder" onClick={() => setCategoryId(category.id)}>
                <strong>{category.name}</strong><span>{category.path}</span>
              </button>
            ))}
            {visibleExercises.map((exercise) => (
              <button key={exercise.id} type="button" className="exercise-picker-modal__option" onClick={() => onSelect(exercise)}>
                <strong>{exercise.name}</strong>
                <span>{normalizedQuery ? `${exercise.categoryPath} · ${exercise.primaryMetricType}` : exercise.primaryMetricType}</span>
              </button>
            ))}
          </div>
        ) : null}
      </section>
    </div>,
    document.body,
  )
}
