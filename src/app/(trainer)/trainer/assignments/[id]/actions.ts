'use server'

import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { addTrainerFeedback } from '@/modules/assignments'

type ActionProps = {
  assignmentId: string
}

export async function addTrainerFeedbackAction({ assignmentId }: ActionProps, formData: FormData) {
  const session = await auth()
  const comment = String(formData.get('comment') ?? '')

  if (!session?.user?.id || session.user.role !== 'trainer') {
    redirect('/login?error=auth')
  }

  const result = await addTrainerFeedback({
    assignmentId,
    comment,
    trainerId: session.user.id,
  })

  if (!result.ok) {
    redirect(`/trainer/assignments/${assignmentId}?error=${encodeURIComponent(result.message)}`)
  }

  redirect(`/trainer/assignments/${assignmentId}?saved=1`)
}
