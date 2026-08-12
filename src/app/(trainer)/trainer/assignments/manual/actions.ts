'use server'

import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { createManualAssignment } from '@/modules/assignments'
import type { ManualValidationState } from '@/modules/assignments/types'
import { buildManualValidationState, getInvalidNumericIssues, parseOptionalNumber } from './validation'

const SECTION_SLOTS = 3

function getExerciseIndices(formData: FormData, sectionIndex: number) {
  const indices = new Set<number>()
  const pattern = new RegExp(`^sections\\.${sectionIndex}\\.exercises\\.(\\d+)\\.exerciseId$`)

  for (const key of formData.keys()) {
    const match = key.match(pattern)
    if (match) {
      indices.add(Number(match[1]))
    }
  }

  return Array.from(indices).sort((a, b) => a - b)
}

export async function createManualAssignmentAction(
  _previousState: ManualValidationState | null,
  formData: FormData,
): Promise<ManualValidationState | null> {
  const session = await auth()
  const studentId = String(formData.get('studentId') ?? '')
  const programId = String(formData.get('programId') ?? '')
  const scheduledAt = String(formData.get('scheduledAt') ?? '')
  const title = String(formData.get('title') ?? '')
  const notes = String(formData.get('notes') ?? '')

  if (!session?.user?.id || session.user.role !== 'trainer') {
    redirect('/login?error=auth')
  }

  const sections = Array.from({ length: SECTION_SLOTS }, (_, sectionIndex) => {
    const sectionTitle = String(formData.get(`sections.${sectionIndex}.title`) ?? '')
    const exerciseIndices = getExerciseIndices(formData, sectionIndex)

    return {
      title: sectionTitle,
      exercises: exerciseIndices.map((exerciseIndex) => {
        const strengthSeries = parseOptionalNumber(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.strengthSeries`))
        const strengthRepetitions = parseOptionalNumber(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.strengthRepetitions`))
        const strengthWeight = parseOptionalNumber(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.strengthWeight`))

        return {
          exerciseId: String(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.exerciseId`) ?? ''),
          metricType: '',
          restLabel: String(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.restLabel`) ?? ''),
          methodLabel: String(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.methodLabel`) ?? ''),
          prescriptionValue: String(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.prescriptionValue`) ?? ''),
          strengthSeries,
          strengthRepetitions,
          strengthWeight,
        }
      }),
    }
  })

  const invalidNumericIssues = getInvalidNumericIssues(sections)

  if (invalidNumericIssues.length > 0) {
    return buildManualValidationState(
      { studentId, programId, scheduledAt, title, notes },
      sections,
      { message: 'Corregí los campos numéricos inválidos.' },
      invalidNumericIssues,
    )
  }

  const assignmentSections = sections.map((section) => ({
    title: section.title,
    exercises: section.exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      restLabel: exercise.restLabel,
      methodLabel: exercise.methodLabel,
      prescription: {
        value: exercise.prescriptionValue,
        series: exercise.strengthSeries.parsed ?? undefined,
        repetitions: exercise.strengthRepetitions.parsed ?? undefined,
        weight: exercise.strengthWeight.parsed ?? undefined,
      },
    })),
  }))

  const result = await createManualAssignment({
    studentId,
    programId,
    scheduledAt,
    title,
    notes,
    trainerId: session.user.id,
    sections: assignmentSections,
  })

  if (!result.ok) {
    return buildManualValidationState(
      { studentId, programId, scheduledAt, title, notes },
      sections,
      result,
      invalidNumericIssues,
    )
  }

  redirect('/trainer/assignments?created=1')
}
