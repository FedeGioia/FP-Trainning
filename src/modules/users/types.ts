export type UserRole = 'admin' | 'trainer' | 'student'

export type UserSummary = {
  id: string
  name: string
  email: string
  role: UserRole
}

export type AdminUserSummary = UserSummary & {
  status: 'ACTIVE' | 'INACTIVE'
  mustChangePassword: boolean
  createdAt: Date
  programCodes: string[]
}

export type StudentSummary = UserSummary & {
  programCodes: string[]
  assignedWorkoutCount: number
  expectedWorkoutsPerWeek: number
}

export type StudentProfileSummary = {
  id: string
  name: string
  email: string
  programCodes: string[]
}

export type UpdateStudentProfileInput = {
  studentId: string
  name: string
  email: string
  programCodes?: string[]
  trainerId?: string
  expectedWorkoutsPerWeek?: number
}

export type UpdateStudentProfileResult =
  | {
      ok: true
    }
  | {
      ok: false
      message: string
    }

export type ChangeStudentPasswordWithCurrentInput = {
  studentId: string
  currentPassword: string
  newPassword: string
}

export type ChangeStudentPasswordWithCurrentResult =
  | {
      ok: true
    }
  | {
      ok: false
      message: string
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
  password: string
  programCodes: string[]
  trainerId: string
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

export type ResetStudentPasswordInput = {
  studentId: string
  password: string
}

export type ResetStudentPasswordResult =
  | {
      ok: true
    }
  | {
      ok: false
      message: string
    }

export type ChangeStudentPasswordInput = {
  studentId: string
  password: string
}

export type ChangeStudentPasswordResult =
  | {
      ok: true
    }
  | {
      ok: false
      message: string
    }

export type ToggleUserStatusInput = {
  userId: string
  actorId: string
}

export type ToggleUserStatusResult =
  | {
      ok: true
      nextStatus: 'ACTIVE' | 'INACTIVE'
    }
  | {
      ok: false
      message: string
    }
