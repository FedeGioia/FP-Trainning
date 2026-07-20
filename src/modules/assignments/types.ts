export type AssignmentStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'PARTIAL' | 'CANCELLED'

export type AssignmentSummary = {
  id: string
  title: string
  studentId: string
  studentName: string
  templateName?: string | null
  programCode: string
  scheduledAt: string
  status: AssignmentStatus
  sectionCount: number
}

export type AssignmentSectionDetail = {
  id: string
  title: string
  sectionType: string
  order: number
  exercises: AssignmentExerciseDetail[]
}

export type AssignmentExerciseDetail = {
  id: string
  name: string
  metricType: string
  status: 'PENDING' | 'COMPLETED'
  currentValue?: string | null
  expectedValue?: string | null
  expectedStrength?: {
    series: number | null
    repetitions: number | null
    weight: number | null
  } | null
  currentStrength?: {
    series: number | null
    repetitions: number | null
    weight: number | null
  } | null
  restLabel?: string | null
  methodLabel?: string | null
  notes?: string | null
}

export type AssignmentDetail = AssignmentSummary & {
  notes?: string | null
  studentNotes?: string | null
  completedExerciseCount: number
  totalExerciseCount: number
  sections: AssignmentSectionDetail[]
}

export type SaveAssignmentExerciseResultInput = {
  assignmentId: string
  assignedExerciseId: string
  value: string
  strengthSeries?: string
  strengthRepetitions?: string
  strengthWeight?: string
  studentId?: string
}

export type SaveAssignmentExerciseResultResult =
  | {
      ok: true
    }
  | {
      ok: false
      message: string
    }

export type CreateManualAssignmentInput = {
  studentId: string
  programId: string
  scheduledAt: string
  title?: string
  notes?: string
  trainerId: string
  sections: Array<{
    title: string
    exercises: Array<{
      exerciseId: string
      metricType: string
      restLabel?: string
      methodLabel?: string
      notes?: string
      prescription: {
        series?: number
        repetitions?: number
        weight?: number
        value?: string
      }
    }>
  }>
}

export type ValidationIssue = {
  path: string
  message: string
  kind: 'required' | 'invalid'
}

export type TemplateValidationState = {
  studentId: string
  templateId: string
  scheduledAt: string
  title: string
  notes: string
  issues: ValidationIssue[]
  formError: string
}

export type ManualExerciseValidationValues = {
  exerciseId: string
  metricType: string
  prescriptionValue: string
  strengthSeries: string
  strengthRepetitions: string
  strengthWeight: string
  restLabel: string
  methodLabel: string
}

export type ManualValidationState = {
  studentId: string
  programId: string
  scheduledAt: string
  title: string
  notes: string
  sections: Array<{
    title: string
    exercises: ManualExerciseValidationValues[]
  }>
  issues: ValidationIssue[]
  formError: string
}

export type CreateAssignmentInput = {
  studentId: string
  templateId: string
  scheduledAt: string
  title?: string
  notes?: string
  trainerId: string
}

export type CreateManualAssignmentResult = CreateAssignmentResult
export type CreateAssignmentResult =
  | {
      ok: true
      assignmentId: string
    }
  | {
      ok: false
      message: string
      issues?: ValidationIssue[]
    }

export type SubmitAssignmentResultInput = {
  assignmentId: string
  studentNotes?: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED'
  studentId?: string
  exerciseResults: Array<{
    assignedExerciseId: string
    value: string
  }>
}

export type SubmitAssignmentResultResult =
  | {
      ok: true
    }
  | {
      ok: false
      message: string
    }

export type AddTrainerFeedbackInput = {
  assignmentId: string
  comment: string
  trainerId: string
}

export type AddTrainerFeedbackResult =
  | {
      ok: true
    }
  | {
      ok: false
      message: string
    }
