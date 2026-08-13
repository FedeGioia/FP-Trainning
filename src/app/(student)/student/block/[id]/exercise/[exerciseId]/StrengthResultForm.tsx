'use client'

import Link from 'next/link'
import { useState } from 'react'

type StrengthSet = {
  repetitions: number
  weight: number
}

type StrengthResultFormProps = {
  action: (formData: FormData) => void | Promise<void>
  saveAndNextAction: (formData: FormData) => void | Promise<void>
  assignmentId: string
  currentSets: StrengthSet[]
  expectedStrength: {
    series: number | null
    repetitions: number | null
    weight: number | null
  } | null | undefined
}

function getInitialSets(currentSets: StrengthSet[], expectedStrength: StrengthResultFormProps['expectedStrength']) {
  if (currentSets.length > 0) {
    return currentSets
  }

  const count = expectedStrength?.series && expectedStrength.series > 0 ? expectedStrength.series : 1
  return Array.from({ length: count }, () => ({
    repetitions: expectedStrength?.repetitions ?? 0,
    weight: expectedStrength?.weight ?? 0,
  }))
}

export function StrengthResultForm({ action, saveAndNextAction, assignmentId, currentSets, expectedStrength }: StrengthResultFormProps) {
  const [sets, setSets] = useState(() => getInitialSets(currentSets, expectedStrength))

  const updateSet = (index: number, field: keyof StrengthSet, value: number) => {
    setSets((current) => current.map((set, setIndex) => setIndex === index ? { ...set, [field]: value } : set))
  }

  return (
    <form action={action} className="student-exercise-form">
      <span className="student-exercise-form__kicker">📝 Tu registro de hoy</span>
      <div className="student-strength-sets" aria-label="Series realizadas">
        {sets.map((set, index) => (
          <fieldset className="student-strength-set" key={index}>
            <legend>Serie {index + 1}</legend>
            <label>
              <span>Repeticiones</span>
              <input
                name={`strengthSets.${index}.repetitions`}
                type="number"
                min="0"
                step="1"
                value={set.repetitions || ''}
                onChange={(event) => updateSet(index, 'repetitions', Number(event.target.value))}
                placeholder="Ej: 8"
              />
            </label>
            <label>
              <span>Peso (kg)</span>
              <input
                name={`strengthSets.${index}.weight`}
                type="number"
                min="0"
                step="0.5"
                value={set.weight || ''}
                onChange={(event) => updateSet(index, 'weight', Number(event.target.value))}
                placeholder="Ej: 60"
              />
            </label>
          </fieldset>
        ))}
      </div>
      <button
        className="student-strength-sets__add"
        type="button"
        onClick={() => setSets((current) => [...current, { repetitions: expectedStrength?.repetitions ?? 0, weight: expectedStrength?.weight ?? 0 }])}
      >
        + Agregar serie
      </button>
      <section className="student-exercise-form__actions">
        <Link className="student-exercise-button student-exercise-button--secondary" href={`/student/block/${assignmentId}`}>
          Cancelar
        </Link>
        <button className="student-exercise-button student-exercise-button--primary" type="submit">
          Guardar ejercicio
        </button>
        <button className="student-exercise-button student-exercise-button--primary" formAction={saveAndNextAction} type="submit">
          Guardar y siguiente ejercicio
        </button>
      </section>
    </form>
  )
}
