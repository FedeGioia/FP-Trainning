'use server'

import { redirect } from 'next/navigation'

import { addTrainerFeedback } from '@/modules/assignments'

type ActionProps = {
  assignmentId: string
}

export async function addTrainerFeedbackAction({ assignmentId }: ActionProps, formData: FormData) {
  const comment = String(formData.get('comment') ?? '')

  const result = await addTrainerFeedback({
    assignmentId,
    comment,
  })

  if (!result.ok) {
    redirect(`/trainer/assignments/${assignmentId}?error=${encodeURIComponent(result.message)}`)
  }

  redirect(`/trainer/assignments/${assignmentId}?saved=1`)
}
