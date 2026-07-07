'use server'

import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { submitAssignmentResults } from '@/modules/assignments'

type ActionProps = {
  assignmentId: string
}

export async function submitStudentBlockAction({ assignmentId }: ActionProps, formData: FormData) {
  const session = await auth()
  const studentNotes = String(formData.get('studentNotes') ?? '')
  const status = String(formData.get('status') ?? 'IN_PROGRESS') as 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED'

  if (!session?.user?.id || session.user.role !== 'student') {
    redirect('/login?error=auth')
  }

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
    studentId: session.user.id,
    exerciseResults,
  })

  if (!result.ok) {
    redirect(`/student/block/${assignmentId}?error=${encodeURIComponent(result.message)}`)
  }

  redirect(`/student/block/${assignmentId}?saved=1`)
}
