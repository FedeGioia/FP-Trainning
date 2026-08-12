import type { ManualValidationState, ValidationIssue } from '@/modules/assignments/types'

export type ParsedOptionalNumber = {
  raw: string
  parsed: number | null
}

export type ParsedManualExercise = {
  exerciseId: string
  metricType: string
  restLabel: string
  methodLabel: string
  prescriptionValue: string
  strengthSeries: ParsedOptionalNumber
  strengthRepetitions: ParsedOptionalNumber
  strengthWeight: ParsedOptionalNumber
}

export type ParsedManualSection = {
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

export function getInvalidNumericIssues(sections: ParsedManualSection[]): ValidationIssue[] {
  return sections.flatMap((section, sectionIndex) =>
    section.exercises.flatMap((exercise, exerciseIndex) => {
      const numericFields: Array<[string, ParsedOptionalNumber]> = [
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
