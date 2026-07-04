export type TemplateSectionSummary = {
  id: string
  title: string
  sectionType: string
  order: number
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
  sections: {
    title: string
    type: string
    exercises: {
      exerciseId: string
      metricType: string
      prescriptionPayload: { value: string }
      restLabel: string
      methodLabel: string
      notes: string
    }[]
  }[]
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
