'use client'

import { useState } from 'react'

type ExercisePrescriptionGridProps = {
  sectionIndex: number
  exercises: Array<{
    id: string
    name: string
    primaryMetricType: string
  }>
  metricOptions: Array<{
    value: string
    label: string
  }>
}

type GridRow = {
  id: string
  metricType: string
}

const INITIAL_EXERCISE_ROWS = 4

function createRow(): GridRow {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `exercise-row-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    metricType: '',
  }
}

function getNonStrengthPlaceholder(metricType: string) {
  switch (metricType) {
    case 'DURATION':
      return 'Ej: 40s / 5 min'
    case 'DISTANCE':
      return 'Ej: 5 km / 400 m'
    case 'CUSTOM':
      return 'Ej: circuito continuo / calidad'
    default:
      return 'Ej: 40s / 5 km / consigna'
  }
}

export function ExercisePrescriptionGrid({ sectionIndex, exercises, metricOptions }: ExercisePrescriptionGridProps) {
  const [rows, setRows] = useState<GridRow[]>(() => Array.from({ length: INITIAL_EXERCISE_ROWS }, createRow))

  const addExercise = () => {
    setRows((current) => [...current, createRow()])
  }

  const removeExercise = (rowId: string) => {
    setRows((current) => current.filter((row) => row.id !== rowId))
  }

  return (
    <div className="exercise-grid">
      <div className="exercise-grid__header">
        <div className="grid-cell exercise-grid__index-header">#</div>
        <div className="grid-cell">Ejercicio</div>
        <div className="grid-cell">Métrica</div>
        <div className="grid-cell">Técnica</div>
        <div className="grid-cell">Series</div>
        <div className="grid-cell">Reps</div>
        <div className="grid-cell">Peso (kg)</div>
        <div className="grid-cell">Descanso</div>
      </div>

      {rows.map((row, exerciseIndex) => {
        const isStrength = row.metricType === 'STRENGTH'

        return (
          <div key={row.id} className="exercise-grid__row">
            <div className="grid-cell exercise-grid__index-cell">
              <span className="exercise-grid__index-badge">{exerciseIndex + 1}</span>
              <button
                type="button"
                className="exercise-grid__remove-button"
                onClick={() => removeExercise(row.id)}
                aria-label={`Eliminar ejercicio ${exerciseIndex + 1}`}
                title="Eliminar ejercicio"
              >
                ×
              </button>
            </div>

            <div className="grid-cell">
              <select name={`sections.${sectionIndex}.exercises.${exerciseIndex}.exerciseId`} defaultValue="" aria-label={`Ejercicio ${exerciseIndex + 1}`}>
                <option value="">Seleccionar ejercicio</option>
                {exercises.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name} · {exercise.primaryMetricType}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid-cell">
              <select
                name={`sections.${sectionIndex}.exercises.${exerciseIndex}.metricType`}
                value={row.metricType}
                aria-label={`Métrica ${exerciseIndex + 1}`}
                onChange={(event) => {
                  const metricType = event.target.value
                  setRows((current) => current.map((currentRow) => (currentRow.id === row.id ? { ...currentRow, metricType } : currentRow)))
                }}
              >
                <option value="">Elegir métrica</option>
                {metricOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid-cell exercise-grid__generic-cell">
              <div className="exercise-grid__generic-inner">
                <input
                  name={
                    isStrength
                      ? `sections.${sectionIndex}.exercises.${exerciseIndex}.methodLabel`
                      : `sections.${sectionIndex}.exercises.${exerciseIndex}.prescriptionValue`
                  }
                  type="text"
                  placeholder={isStrength ? 'Ej: tempo / lineal / circuito' : getNonStrengthPlaceholder(row.metricType)}
                  aria-label={isStrength ? `Técnica ${exerciseIndex + 1}` : `Consigna ${exerciseIndex + 1}`}
                />
              </div>
            </div>

            {isStrength ? (
              <>
                <div className="grid-cell">
                  <input
                    name={`sections.${sectionIndex}.exercises.${exerciseIndex}.strengthSeries`}
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    placeholder="3"
                    aria-label={`Series ${exerciseIndex + 1}`}
                  />
                </div>

                <div className="grid-cell">
                  <input
                    name={`sections.${sectionIndex}.exercises.${exerciseIndex}.strengthRepetitions`}
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    placeholder="8"
                    aria-label={`Repeticiones ${exerciseIndex + 1}`}
                  />
                </div>

                <div className="grid-cell">
                  <input
                    name={`sections.${sectionIndex}.exercises.${exerciseIndex}.strengthWeight`}
                    type="number"
                    min="0"
                    step="0.5"
                    inputMode="decimal"
                    placeholder="60"
                    aria-label={`Peso ${exerciseIndex + 1}`}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid-cell" aria-hidden="true" />
                <div className="grid-cell" aria-hidden="true" />
                <div className="grid-cell" aria-hidden="true" />
              </>
            )}

            <div className="grid-cell">
              <input
                name={`sections.${sectionIndex}.exercises.${exerciseIndex}.restLabel`}
                type="text"
                placeholder="60s"
                aria-label={`Descanso ${exerciseIndex + 1}`}
              />
            </div>
          </div>
        )
      })}

      <div className="exercise-grid__footer">
        <button type="button" onClick={addExercise} className="button button-secondary exercise-grid__add-button">
          Agregar ejercicio
        </button>
      </div>
    </div>
  )
}
