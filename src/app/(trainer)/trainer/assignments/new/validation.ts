import type { CreateAssignmentResult, TemplateValidationState } from '@/modules/assignments/types'

type TemplateFormValues = Pick<TemplateValidationState, 'studentId' | 'templateId' | 'scheduledAt' | 'title' | 'notes'>

export function buildTemplateValidationState(
  values: TemplateFormValues,
  result: Extract<CreateAssignmentResult, { ok: false }>,
): TemplateValidationState {
  return {
    ...values,
    issues: result.issues ?? [],
    formError: result.message,
  }
}
