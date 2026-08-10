'use client'

import { useRef, useState } from 'react'

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
        <small>{selectedExercise ? `${selectedExercise.categoryPath ?? 'Sin categoría'} · ${selectedExercise.primaryMetricType}` : 'Abrir catálogo'}</small>
      </button>
      {isOpen ? (
        <ExerciseModalPicker
          exercises={exercises}
          selectedId={selectedId}
          onClose={closePicker}
          onClear={() => {
            setSelectedId('')
            closePicker()
          }}
          onSelect={(exercise) => {
            setSelectedId(exercise.id)
            closePicker()
          }}
        />
      ) : null}
    </>
  )
}
