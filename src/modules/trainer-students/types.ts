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
