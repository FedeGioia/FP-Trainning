'use server'

import { redirect } from 'next/navigation'

import { submitAssignmentResults } from '@/modules/assignments'

type ActionProps = {
  assignmentId: string
}

export async function submitStudentBlockAction({ assignmentId }: ActionProps, formData: FormData) {
  const studentNotes = String(formData.get('studentNotes') ?? '')
  const status = String(formData.get('status') ?? 'IN_PROGRESS') as 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED'

  const exerciseResults = Array.from(formData.entries())
    .filter(([key]) => key.startsWith('result:'))
    .map(([key, value]) => ({
      assignedExerciseId: key.replace('result:', ''),
      value: String(value ?? ''),
    }))

  const result = await submitAssignmentResults({
    assignmentId,
    studentNotes,
    status,
    exerciseResults,
  })

  if (!result.ok) {
    redirect(`/student/block/${assignmentId}?error=${encodeURIComponent(result.message)}`)
  }

  redirect(`/student/block/${assignmentId}?saved=1`)
}
