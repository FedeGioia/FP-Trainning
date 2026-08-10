import type { ExerciseMetricType } from '@/modules/exercises'

export type TemplateExerciseSummary = {
  id: string
  name: string
  metricType: ExerciseMetricType
  prescriptionValue: string
  restLabel?: string | null
  methodLabel?: string | null
  notes?: string | null
  order: number
}

export type TemplateSectionSummary = {
  id: string
  title: string
  sectionType: string
  order: number
  exercises: TemplateExerciseSummary[]
}

export type TemplateSummary = {
  id: string
  name: string
  description?: string | null
  programCode: string
  sections: TemplateSectionSummary[]
}

export type CreateTemplateInput = {
  name: string
  description?: string
  programCode: string
  createdById: string
  sections: CreateTemplateSectionInput[]
}

export type CreateTemplateSectionInput = {
  title: string
  type: string
  exercises: CreateTemplateExerciseInput[]
}

export type CreateTemplateExerciseInput = {
  exerciseId: string
  /** @deprecated Derived server-side from the exercise; ignored when supplied. */
  metricType?: string
  prescriptionValue: string
  strengthSeries?: string
  strengthRepetitions?: string
  strengthWeight?: string
  restLabel?: string
  methodLabel?: string
  notes?: string
}

export type CreateTemplateResult =
  | {
      ok: true
      templateId: string
    }
  | {
      ok: false
      message: string
    }
