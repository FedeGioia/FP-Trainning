type AssignmentAccess = {
  studentId?: string
  trainerId?: string
}

type AssignmentOwners = {
  studentId: string
  trainerId: string
}

export function canAccessAssignment(owners: AssignmentOwners, access?: AssignmentAccess) {
  if (access?.studentId && owners.studentId !== access.studentId) {
    return false
  }

  if (access?.trainerId && owners.trainerId !== access.trainerId) {
    return false
  }

  return true
}
