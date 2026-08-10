import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { FeatureCard } from '@/components/ui/feature-card'
import { ProgramCard } from '@/components/ui/program-card'
import { canAccessAssignment } from '@/modules/assignments/ownership'
import { calculateCurrentStreakFromDates } from '@/lib/streak'
import { isSameCalendarDay } from '@/lib/date'
import { getWeekDaysFrom, formatLocalDateKey } from '@/lib/date'
import { createAssignment, createManualAssignment } from '@/modules/assignments/service'
import { buildManualValidationState, parseOptionalNumber } from '@/app/(trainer)/trainer/assignments/manual/actions'
import { buildTemplateValidationState } from '@/app/(trainer)/trainer/assignments/new/actions'
import { buildCategoryTree, normalizeCategoryName } from '@/modules/exercises'

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn()
    console.log(`✓ ${name}`)
  } catch (error) {
    console.error(`✗ ${name}`)
    throw error
  }
}

async function main() {
await test('FeatureCard renders a fallback for null description', () => {
  const html = renderToStaticMarkup(createElement(FeatureCard, { title: 'Card', description: null }))
  assert.match(html, /Sin descripción/i)
})

await test('ProgramCard renders a fallback for null description', () => {
  const html = renderToStaticMarkup(
    createElement(ProgramCard, {
      program: {
        id: 'p1',
        code: 'FP_TRAINING',
        name: 'FP-Training',
        description: null,
        active: true,
      },
    }),
  )
  assert.match(html, /Sin descripción todavía\./i)
})

await test('isSameCalendarDay matches equal calendar days and rejects different ones', () => {
  assert.equal(isSameCalendarDay(new Date(2026, 6, 5, 10, 0, 0), new Date(2026, 6, 5, 23, 59, 59)), true)
  assert.equal(isSameCalendarDay(new Date(2026, 6, 5, 23, 59, 59), new Date(2026, 6, 6, 0, 0, 0)), false)
})

await test('canAccessAssignment enforces ownership for student and trainer', () => {
  const owners = { studentId: 'student-1', trainerId: 'trainer-1' }

  assert.equal(canAccessAssignment(owners, { studentId: 'student-1' }), true)
  assert.equal(canAccessAssignment(owners, { studentId: 'student-2' }), false)
  assert.equal(canAccessAssignment(owners, { trainerId: 'trainer-1' }), true)
  assert.equal(canAccessAssignment(owners, { trainerId: 'trainer-2' }), false)
})

await test('calculateCurrentStreakFromDates counts consecutive completed workout days', () => {
  const now = new Date('2026-07-06T12:00:00Z')

  assert.equal(
    calculateCurrentStreakFromDates(
      [
        '2026-07-06T08:00:00Z',
        '2026-07-05T19:00:00Z',
        '2026-07-04T07:00:00Z',
        '2026-07-02T07:00:00Z',
      ],
      now,
      'UTC',
    ),
    3,
  )
})

await test('getWeekDaysFrom returns a Sunday-to-Saturday range', () => {
  const week = getWeekDaysFrom(new Date('2026-07-08T12:00:00Z'))

  assert.equal(week.length, 7)
  assert.equal(formatLocalDateKey(week[0]), '2026-07-05')
  assert.equal(formatLocalDateKey(week[6]), '2026-07-11')
})

await test('buildCategoryTree creates nested paths in parent-to-child order', () => {
  const tree = buildCategoryTree([
    { id: 'child', name: 'Tren superior', parentId: 'root' },
    { id: 'root', name: 'Fuerza', parentId: null },
  ])

  assert.equal(tree[0]?.path, 'Fuerza')
  assert.equal(tree[0]?.children[0]?.path, 'Fuerza / Tren superior')
})

await test('category helpers normalize duplicate names and sort siblings deterministically', () => {
  assert.equal(normalizeCategoryName('  FUERZA  '), normalizeCategoryName('fuerza'))
  assert.equal(normalizeCategoryName(' cafe\u0301 '), normalizeCategoryName('café'))

  const tree = buildCategoryTree([
    { id: 'z', name: 'Zancadas', parentId: null },
    { id: 'a', name: 'Abdominales', parentId: null },
    { id: 'b', name: 'Bíceps', parentId: 'a' },
    { id: 'c', name: 'Core', parentId: 'a' },
  ])

  assert.deepEqual(tree.map((category) => category.name), ['Abdominales', 'Zancadas'])
  assert.deepEqual(tree[0]?.children.map((category) => category.name), ['Bíceps', 'Core'])
})

await test('createAssignment returns stable structured issues for invalid template submissions', async () => {
  const base = { trainerId: 'trainer-1', title: 'Mi rutina', notes: 'Sin cambios' }

  const missingStudent = await createAssignment({ ...base, studentId: '', templateId: 'template-1', scheduledAt: '2026-07-20T10:00' })
  const missingTemplate = await createAssignment({ ...base, studentId: 'student-1', templateId: '', scheduledAt: '2026-07-20T10:00' })
  const invalidDate = await createAssignment({ ...base, studentId: 'student-1', templateId: 'template-1', scheduledAt: 'not-a-date' })

  assert.deepEqual(missingStudent, { ok: false, message: 'Tenés que elegir un alumno.', issues: [{ path: 'studentId', message: 'Tenés que elegir un alumno.', kind: 'required' }] })
  assert.deepEqual(missingTemplate, { ok: false, message: 'Tenés que elegir una plantilla.', issues: [{ path: 'templateId', message: 'Tenés que elegir una plantilla.', kind: 'required' }] })
  assert.deepEqual(invalidDate, { ok: false, message: 'La fecha y hora elegidas no son válidas.', issues: [{ path: 'scheduledAt', message: 'La fecha y hora elegidas no son válidas.', kind: 'invalid' }] })
})

await test('createManualAssignment returns nested issues for invalid section and exercise fields', async () => {
  const base = { studentId: 'student-1', programId: 'program-1', scheduledAt: '2026-07-20T10:00', trainerId: 'trainer-1' }
  const result = await createManualAssignment({
    ...base,
    sections: [
      { title: '', exercises: [{ exerciseId: 'exercise-1', metricType: 'STRENGTH', prescription: { series: 3, repetitions: 8, weight: 60 } }] },
      { title: 'Bloque', exercises: [
        { exerciseId: '', metricType: 'CUSTOM', prescription: { value: 'Completar' } },
        { exerciseId: 'exercise-2', metricType: 'INVALID', prescription: { value: 'Completar' } },
        { exerciseId: 'exercise-3', metricType: 'STRENGTH', prescription: {} },
        { exerciseId: 'exercise-4', metricType: 'DURATION', prescription: {} },
      ] },
    ],
  })

  assert.equal(result.ok, false)
  if (result.ok) return
  assert.deepEqual(result.issues, [
    { path: 'sections.0.title', message: 'La sección 1 necesita un título.', kind: 'required' },
    { path: 'sections.1.exercises.0.exerciseId', message: 'Tenés que elegir un ejercicio.', kind: 'required' },
    { path: 'sections.1.exercises.1.metricType', message: 'Elegí una métrica válida.', kind: 'invalid' },
    { path: 'sections.1.exercises.2.strengthSeries', message: 'El series es obligatorio.', kind: 'required' },
    { path: 'sections.1.exercises.2.strengthRepetitions', message: 'El repeticiones es obligatorio.', kind: 'required' },
    { path: 'sections.1.exercises.2.strengthWeight', message: 'El peso es obligatorio.', kind: 'required' },
    { path: 'sections.1.exercises.3.prescriptionValue', message: 'La prescripción es obligatoria.', kind: 'required' },
  ])
})

await test('parseOptionalNumber distinguishes blank, invalid, valid, and comma-decimal values', () => {
  assert.deepEqual(parseOptionalNumber(''), { raw: '', parsed: null })
  assert.deepEqual(parseOptionalNumber('abc'), { raw: 'abc', parsed: null })
  assert.deepEqual(parseOptionalNumber('60'), { raw: '60', parsed: 60 })
  assert.deepEqual(parseOptionalNumber('62,5'), { raw: '62,5', parsed: 62.5 })
})

await test('validation state builders preserve submitted template and manual form values', () => {
  const templateState = buildTemplateValidationState(
    { studentId: 'student-1', templateId: '', scheduledAt: '2026-07-20T10:00', title: 'Rutina', notes: 'Notas' },
    { ok: false, message: 'Tenés que elegir una plantilla.', issues: [{ path: 'templateId', message: 'Tenés que elegir una plantilla.', kind: 'required' }] },
  )
  assert.deepEqual(templateState, {
    studentId: 'student-1', templateId: '', scheduledAt: '2026-07-20T10:00', title: 'Rutina', notes: 'Notas',
    issues: [{ path: 'templateId', message: 'Tenés que elegir una plantilla.', kind: 'required' }], formError: 'Tenés que elegir una plantilla.',
  })

  const manualState = buildManualValidationState(
    { studentId: 'student-1', programId: 'program-1', scheduledAt: '2026-07-20T10:00', title: 'Piernas', notes: 'Controlar técnica' },
    [{
      title: 'Fuerza',
      exercises: [
        { exerciseId: 'squat', metricType: 'STRENGTH', prescriptionValue: '', strengthSeries: parseOptionalNumber('3'), strengthRepetitions: parseOptionalNumber('8'), strengthWeight: parseOptionalNumber('sesenta y dos'), restLabel: '90s', methodLabel: 'Tempo 3-1-1' },
        { exerciseId: 'run', metricType: 'DISTANCE', prescriptionValue: '400 m', strengthSeries: parseOptionalNumber(''), strengthRepetitions: parseOptionalNumber(''), strengthWeight: parseOptionalNumber(''), restLabel: '60s', methodLabel: '' },
      ],
    }],
    { message: 'Ingresá un número válido.', issues: [{ path: 'sections.0.exercises.0.strengthWeight', message: 'El peso es obligatorio.', kind: 'required' }] },
    [{ path: 'sections.0.exercises.0.strengthWeight', message: 'Ingresá un número válido.', kind: 'invalid' }],
  )

  assert.equal(manualState.title, 'Piernas')
  assert.deepEqual(manualState.sections.map((section) => section.exercises.map((exercise) => exercise.exerciseId)), [['squat', 'run']])
  assert.equal(manualState.sections[0].exercises[0].strengthWeight, 'sesenta y dos')
  assert.equal(manualState.sections[0].exercises[1].prescriptionValue, '400 m')
  assert.deepEqual(manualState.issues, [{ path: 'sections.0.exercises.0.strengthWeight', message: 'Ingresá un número válido.', kind: 'invalid' }])
})

console.log('All tests passed')

}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
