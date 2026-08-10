'use client'

import { useRef, useState } from 'react'

import { ExerciseModalPicker, type PickerCategory, type PickerExercise } from './ExerciseModalPicker'

type ExerciseModalPickerTriggerProps = {
  exercises: PickerExercise[]
  categories: PickerCategory[]
  fieldName: string
  selectedId: string
  onSelectedIdChange: (exerciseId: string) => void
  ariaLabel: string
  invalid?: boolean
}

export function ExerciseModalPickerTrigger({ exercises, categories, fieldName, selectedId, onSelectedIdChange, ariaLabel, invalid }: ExerciseModalPickerTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const selectedExercise = exercises.find((exercise) => exercise.id === selectedId)
  const closePicker = () => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <>
      <input name={fieldName} type="hidden" value={selectedId} />
      <button ref={triggerRef} type="button" className={`exercise-picker-trigger${invalid ? ' is-invalid' : ''}`} aria-label={ariaLabel} onClick={() => setIsOpen(true)}>
        <span>{selectedExercise?.name ?? 'Seleccionar ejercicio'}</span>
        <small>{selectedExercise ? `${selectedExercise.categoryPath} · ${selectedExercise.primaryMetricType}` : 'Abrir catálogo'}</small>
      </button>
      {isOpen ? (
        <ExerciseModalPicker
          exercises={exercises}
          categories={categories}
          selectedId={selectedId}
          onClose={closePicker}
          onClear={() => {
            onSelectedIdChange('')
            closePicker()
          }}
          onSelect={(exercise) => {
            onSelectedIdChange(exercise.id)
            closePicker()
          }}
        />
      ) : null}
    </>
  )
}
