export type UserRole = 'admin' | 'trainer' | 'student'

export type UserSummary = {
  id: string
  name: string
  email: string
  role: UserRole
}

export type StudentSummary = UserSummary & {
  programCodes: string[]
}

export type StudentAssignmentSummary = {
  studentId: string
  trainerId: string
  programCode: string
  active: boolean
}

export type CreateStudentInput = {
  name: string
  email: string
  programCodes: string[]
}

export type CreateStudentResult =
  | {
      ok: true
      studentId: string
    }
  | {
      ok: false
      message: string
    }
