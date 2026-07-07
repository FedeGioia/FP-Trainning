export type ExerciseMetricType = 'STRENGTH' | 'DURATION' | 'DISTANCE' | 'CUSTOM'

export type ExerciseSummary = {
  id: string
  name: string
  description?: string | null
  primaryMetricType: ExerciseMetricType
  hasVideo: boolean
}

export type CreateExerciseInput = {
  name: string
  description?: string
  primaryMetricType: ExerciseMetricType
  videoUrl?: string
  createdById?: string
}

export type CreateExerciseResult =
  | {
      ok: true
      exerciseId: string
    }
  | {
      ok: false
      message: string
    }
