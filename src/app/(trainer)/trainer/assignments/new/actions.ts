'use server'

import { redirect } from 'next/navigation'

import { createAssignment } from '@/modules/assignments'

export async function createAssignmentAction(formData: FormData) {
  const studentId = String(formData.get('studentId') ?? '')
  const templateId = String(formData.get('templateId') ?? '')
  const scheduledAt = String(formData.get('scheduledAt') ?? '')
  const title = String(formData.get('title') ?? '')
  const notes = String(formData.get('notes') ?? '')

  const result = await createAssignment({
    studentId,
    templateId,
    scheduledAt,
    title,
    notes,
  })

  if (!result.ok) {
    redirect(`/trainer/assignments/new?error=${encodeURIComponent(result.message)}`)
  }

  redirect('/trainer/assignments?created=1')
}
