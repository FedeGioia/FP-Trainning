export type WeeklyAdherence = {
  weekStart: string
  scheduledCount: number
  completedCount: number
  pendingCount: number
  goalTarget: number | null
  goalCompletionRate: number | null
}

export type TrainerStudentRosterRow = {
  id: string
  name: string
  email: string
  programCodes: string[]
  expectedWorkoutsPerWeek: number
  assignmentHistoryCount: number
  weekly: WeeklyAdherence
}

export type TrainerStudentDetail = TrainerStudentRosterRow

export type TrainerDashboardAssignmentStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export type TrainerDashboardTraining = {
  id: string
  title: string
  studentId: string
  studentName: string
  scheduledAt: string
  status: TrainerDashboardAssignmentStatus
}

export type TrainerDashboardAttention = {
  id: string
  name: string
  reasons: Array<{
    type: 'INACTIVE' | 'NO_WEEKLY_ROUTINE'
    label: string
  }>
}

export type TrainerDashboardData = {
  studentCount: number
  todayTrainings: TrainerDashboardTraining[]
  week: {
    total: number
    completed: number
    pending: number
    overdue: number
  }
  attention: TrainerDashboardAttention[]
}
