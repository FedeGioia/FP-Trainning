'use server'

import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { createManualAssignment } from '@/modules/assignments'
import type { ManualValidationState, ValidationIssue } from '@/modules/assignments/types'

const SECTION_SLOTS = 3

export type ParsedOptionalNumber = {
  raw: string
  parsed: number | null
}

type ParsedManualExercise = {
  exerciseId: string
  metricType: string
  restLabel: string
  methodLabel: string
  prescriptionValue: string
  strengthSeries: ParsedOptionalNumber
  strengthRepetitions: ParsedOptionalNumber
  strengthWeight: ParsedOptionalNumber
}

type ParsedManualSection = {
  title: string
  exercises: ParsedManualExercise[]
}

type ManualFormValues = Pick<ManualValidationState, 'studentId' | 'programId' | 'scheduledAt' | 'title' | 'notes'>

export function parseOptionalNumber(value: FormDataEntryValue | null): ParsedOptionalNumber {
  const raw = String(value ?? '')
  const normalized = raw.trim()

  if (!normalized) {
    return { raw, parsed: null }
  }

  const parsed = Number(normalized.replace(',', '.'))
  return { raw, parsed: Number.isFinite(parsed) ? parsed : null }
}

export function buildManualValidationState(
  values: ManualFormValues,
  sections: ParsedManualSection[],
  result: { message: string; issues?: ValidationIssue[] },
  invalidNumericIssues: ValidationIssue[],
): ManualValidationState {
  const issueByPath = new Map((result.issues ?? []).map((issue) => [issue.path, issue]))
  invalidNumericIssues.forEach((issue) => issueByPath.set(issue.path, issue))

  return {
    ...values,
    sections: sections.map((section) => ({
      title: section.title,
      exercises: section.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        metricType: exercise.metricType,
        prescriptionValue: exercise.prescriptionValue,
        strengthSeries: exercise.strengthSeries.raw,
        strengthRepetitions: exercise.strengthRepetitions.raw,
        strengthWeight: exercise.strengthWeight.raw,
        restLabel: exercise.restLabel,
        methodLabel: exercise.methodLabel,
      })),
    })),
    issues: Array.from(issueByPath.values()),
    formError: result.message,
  }
}

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
          metricType: String(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.metricType`) ?? ''),
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

  const invalidNumericIssues: ValidationIssue[] = sections.flatMap((section, sectionIndex) =>
    section.exercises.flatMap((exercise, exerciseIndex) => {
      const numericFields: Array<[string, { raw: string; parsed: number | null }]> = [
        ['strengthSeries', exercise.strengthSeries],
        ['strengthRepetitions', exercise.strengthRepetitions],
        ['strengthWeight', exercise.strengthWeight],
      ]

      return numericFields.flatMap(([field, value]) =>
        value.raw.trim() && value.parsed === null
          ? [{ path: `sections.${sectionIndex}.exercises.${exerciseIndex}.${field}`, message: 'Ingresá un número válido.', kind: 'invalid' as const }]
          : [],
      )
    }),
  )

  const assignmentSections = sections.map((section) => ({
    title: section.title,
    exercises: section.exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      metricType: exercise.metricType,
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
