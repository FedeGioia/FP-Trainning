'use client'

import { useState } from 'react'

import { ExerciseModalPicker, type PickerExercise } from './ExerciseModalPicker'

type ExerciseModalPickerTriggerProps = {
  exercises: PickerExercise[]
  fieldName: string
  initialSelectedId?: string
  ariaLabel: string
  invalid?: boolean
}

export function ExerciseModalPickerTrigger({ exercises, fieldName, initialSelectedId = '', ariaLabel, invalid }: ExerciseModalPickerTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(initialSelectedId)
  const selectedExercise = exercises.find((exercise) => exercise.id === selectedId)

  return (
    <>
      <input name={fieldName} type="hidden" value={selectedId} />
      <button type="button" className={`exercise-picker-trigger${invalid ? ' is-invalid' : ''}`} aria-label={ariaLabel} onClick={() => setIsOpen(true)}>
        <span>{selectedExercise?.name ?? 'Seleccionar ejercicio'}</span>
        <small>{selectedExercise ? `${selectedExercise.categoryPath ?? 'Sin categoría'} · ${selectedExercise.primaryMetricType}` : 'Abrir catálogo'}</small>
      </button>
      {isOpen ? (
        <ExerciseModalPicker
          exercises={exercises}
          onClose={() => setIsOpen(false)}
          onSelect={(exercise) => {
            setSelectedId(exercise.id)
            setIsOpen(false)
          }}
        />
      ) : null}
    </>
  )
}
