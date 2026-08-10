'use client'

import { useEffect, useState } from 'react'

import type { ManualExerciseValidationValues } from '@/modules/assignments/types'
import { type PickerCategory, type PickerExercise } from './ExerciseModalPicker'
import { ExerciseModalPickerTrigger } from './ExerciseModalPickerTrigger'

type ExercisePrescriptionGridProps = {
  sectionIndex: number
  exercises: PickerExercise[]
  categories: PickerCategory[]
  initialRows?: Array<{ exerciseId: string }>
  initialValues?: ManualExerciseValidationValues[]
  fieldErrors?: Record<string, string>
}

type GridRow = { id: string; exerciseId: string }

const INITIAL_EXERCISE_ROWS = 4
const createRow = (): GridRow => ({ id: globalThis.crypto?.randomUUID?.() ?? `exercise-row-${Date.now()}-${Math.random().toString(16).slice(2)}`, exerciseId: '' })

function getNonStrengthPlaceholder(metricType: string) {
  switch (metricType) {
    case 'DURATION': return 'Ej: 40s / 5 min'
    case 'DISTANCE': return 'Ej: 5 km / 400 m'
    case 'CUSTOM': return 'Ej: circuito continuo / calidad'
    default: return 'Elegí un ejercicio primero'
  }
}

export function ExercisePrescriptionGrid({ sectionIndex, exercises, categories, initialRows, initialValues, fieldErrors = {} }: ExercisePrescriptionGridProps) {
  const [rows, setRows] = useState<GridRow[]>(() => initialRows?.length ? initialRows.map((row) => ({ ...createRow(), exerciseId: row.exerciseId })) : Array.from({ length: INITIAL_EXERCISE_ROWS }, createRow))

  useEffect(() => {
    if (initialRows?.length) setRows(initialRows.map((row) => ({ ...createRow(), exerciseId: row.exerciseId })))
  }, [initialRows])

  return (
    <div className="exercise-grid">
      <div className="exercise-grid__header">
        <div className="grid-cell exercise-grid__index-header">#</div><div className="grid-cell">Ejercicio</div><div className="grid-cell">Métrica</div><div className="grid-cell">Técnica</div><div className="grid-cell">Series</div><div className="grid-cell">Reps</div><div className="grid-cell">Peso (kg)</div><div className="grid-cell">Descanso</div>
      </div>
      {rows.map((row, exerciseIndex) => {
        const selectedExercise = exercises.find((exercise) => exercise.id === row.exerciseId)
        const metricType = selectedExercise?.primaryMetricType ?? ''
        const isStrength = metricType === 'STRENGTH'
        const values = initialValues?.[exerciseIndex]
        const fieldName = (field: string) => `sections.${sectionIndex}.exercises.${exerciseIndex}.${field}`
        const errorFor = (field: string) => fieldErrors[fieldName(field)]
        return <div key={row.id} className="exercise-grid__row">
          <div className="grid-cell exercise-grid__index-cell"><span className="exercise-grid__index-badge">{exerciseIndex + 1}</span><button type="button" className="exercise-grid__remove-button" onClick={() => setRows((current) => current.filter((currentRow) => currentRow.id !== row.id))} aria-label={`Eliminar ejercicio ${exerciseIndex + 1}`} title="Eliminar ejercicio">×</button></div>
          <div className="grid-cell"><ExerciseModalPickerTrigger exercises={exercises} categories={categories} fieldName={fieldName('exerciseId')} selectedId={row.exerciseId} onSelectedIdChange={(exerciseId) => setRows((current) => current.map((currentRow) => currentRow.id === row.id ? { ...currentRow, exerciseId } : currentRow))} ariaLabel={`Ejercicio ${exerciseIndex + 1}`} invalid={Boolean(errorFor('exerciseId'))} />{errorFor('exerciseId') ? <small className="field-error">{errorFor('exerciseId')}</small> : null}</div>
          <div className="grid-cell"><span className="exercise-grid__metric">{selectedExercise?.primaryMetricType ?? 'Elegí un ejercicio'}</span></div>
          <div className="grid-cell exercise-grid__generic-cell"><div className="exercise-grid__generic-inner"><input name={isStrength ? fieldName('methodLabel') : fieldName('prescriptionValue')} type="text" placeholder={isStrength ? 'Ej: tempo / lineal / circuito' : getNonStrengthPlaceholder(metricType)} aria-label={isStrength ? `Técnica ${exerciseIndex + 1}` : `Consigna ${exerciseIndex + 1}`} defaultValue={isStrength ? values?.methodLabel ?? '' : values?.prescriptionValue ?? ''} />{errorFor(isStrength ? 'methodLabel' : 'prescriptionValue') ? <small className="field-error">{errorFor(isStrength ? 'methodLabel' : 'prescriptionValue')}</small> : null}</div></div>
          {isStrength ? <><div className="grid-cell"><input name={fieldName('strengthSeries')} type="text" inputMode="numeric" placeholder="3" aria-label={`Series ${exerciseIndex + 1}`} defaultValue={values?.strengthSeries ?? ''} />{errorFor('strengthSeries') ? <small className="field-error">{errorFor('strengthSeries')}</small> : null}</div><div className="grid-cell"><input name={fieldName('strengthRepetitions')} type="text" inputMode="numeric" placeholder="8" aria-label={`Repeticiones ${exerciseIndex + 1}`} defaultValue={values?.strengthRepetitions ?? ''} />{errorFor('strengthRepetitions') ? <small className="field-error">{errorFor('strengthRepetitions')}</small> : null}</div><div className="grid-cell"><input name={fieldName('strengthWeight')} type="text" inputMode="decimal" placeholder="60" aria-label={`Peso ${exerciseIndex + 1}`} defaultValue={values?.strengthWeight ?? ''} />{errorFor('strengthWeight') ? <small className="field-error">{errorFor('strengthWeight')}</small> : null}</div></> : <><div className="grid-cell" aria-hidden="true" /><div className="grid-cell" aria-hidden="true" /><div className="grid-cell" aria-hidden="true" /></>}
          <div className="grid-cell"><input name={fieldName('restLabel')} type="text" placeholder="60s" aria-label={`Descanso ${exerciseIndex + 1}`} defaultValue={values?.restLabel ?? ''} />{errorFor('restLabel') ? <small className="field-error">{errorFor('restLabel')}</small> : null}</div>
        </div>
      })}
      <div className="exercise-grid__footer"><button type="button" onClick={() => setRows((current) => [...current, createRow()])} className="button button-secondary exercise-grid__add-button">Agregar ejercicio</button></div>
    </div>
  )
}
