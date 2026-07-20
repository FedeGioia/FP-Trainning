'use server'

import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { createAssignment } from '@/modules/assignments'
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

export async function createAssignmentAction(
  _previousState: TemplateValidationState | null,
  formData: FormData,
): Promise<TemplateValidationState | null> {
  const session = await auth()
  const studentId = String(formData.get('studentId') ?? '')
  const templateId = String(formData.get('templateId') ?? '')
  const scheduledAt = String(formData.get('scheduledAt') ?? '')
  const title = String(formData.get('title') ?? '')
  const notes = String(formData.get('notes') ?? '')

  if (!session?.user?.id || session.user.role !== 'trainer') {
    redirect('/login?error=auth')
  }

  const result = await createAssignment({
    studentId,
    templateId,
    scheduledAt,
    title,
    notes,
    trainerId: session.user.id,
  })

  if (!result.ok) {
    return buildTemplateValidationState({ studentId, templateId, scheduledAt, title, notes }, result)
  }

  redirect('/trainer/assignments?created=1')
}
