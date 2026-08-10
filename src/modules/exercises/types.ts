export type ExerciseMetricType = 'STRENGTH' | 'DURATION' | 'DISTANCE' | 'CUSTOM'

export type ExerciseSummary = {
  id: string
  name: string
  description?: string | null
  primaryMetricType: ExerciseMetricType
  hasVideo: boolean
  categoryId: string
  categoryPath: string
}

export type ExerciseCategoryNode = {
  id: string
  name: string
  parentId: string | null
  path: string
  children: ExerciseCategoryNode[]
}

export type CreateCategoryInput = {
  name: string
  parentId?: string | null
  createdById?: string
}

export type CreateCategoryResult =
  | { ok: true; categoryId: string }
  | { ok: false; message: string }

export type DeleteCategoryResult =
  | { ok: true }
  | { ok: false; message: string }

export type CreateExerciseInput = {
  name: string
  description?: string
  primaryMetricType: ExerciseMetricType
  videoUrl?: string
  createdById?: string
  categoryId: string
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
