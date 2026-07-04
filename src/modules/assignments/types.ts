export type AssignmentStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'PARTIAL' | 'CANCELLED'

export type AssignmentSummary = {
  id: string
  title: string
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
}

export type AssignmentDetail = AssignmentSummary & {
  notes?: string | null
  studentNotes?: string | null
  sections: AssignmentSectionDetail[]
}

export type CreateAssignmentInput = {
  studentId: string
  templateId: string
  scheduledAt: string
  title?: string
  notes?: string
}

export type CreateAssignmentResult =
  | {
      ok: true
      assignmentId: string
    }
  | {
      ok: false
      message: string
    }

export type SubmitAssignmentResultInput = {
  assignmentId: string
  studentNotes?: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED'
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
}

export type AddTrainerFeedbackResult =
  | {
      ok: true
    }
  | {
      ok: false
      message: string
    }
