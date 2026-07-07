'use server'

import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { saveAssignmentExerciseResult } from '@/modules/assignments'

type ActionProps = {
  assignmentId: string
  exerciseId: string
}

export async function saveStudentExerciseAction({ assignmentId, exerciseId }: ActionProps, formData: FormData) {
  const session = await auth()
  const value = String(formData.get('value') ?? '')
  const strengthSeries = String(formData.get('strengthSeries') ?? '')
  const strengthRepetitions = String(formData.get('strengthRepetitions') ?? '')
  const strengthWeight = String(formData.get('strengthWeight') ?? '')

  if (!session?.user?.id || session.user.role !== 'student') {
    redirect('/login?error=auth')
  }

  const result = await saveAssignmentExerciseResult({
    assignmentId,
    assignedExerciseId: exerciseId,
    value,
    strengthSeries,
    strengthRepetitions,
    strengthWeight,
    studentId: session.user.id,
  })

  if (!result.ok) {
    redirect(`/student/block/${assignmentId}/exercise/${exerciseId}?error=${encodeURIComponent(result.message)}`)
  }

  redirect(`/student/block/${assignmentId}?saved=1`)
}
