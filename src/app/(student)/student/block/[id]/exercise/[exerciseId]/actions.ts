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
  const strengthSets = new Map<number, { repetitions: string; weight: string }>()

  for (const [name, entry] of formData.entries()) {
    const match = /^strengthSets\.(\d+)\.(repetitions|weight)$/.exec(name)
    if (!match) continue

    const index = Number(match[1])
    const field = match[2] as 'repetitions' | 'weight'
    const set = strengthSets.get(index) ?? { repetitions: '', weight: '' }
    set[field] = String(entry)
    strengthSets.set(index, set)
  }

  if (!session?.user?.id || session.user.role !== 'student') {
    redirect('/login?error=auth')
  }

  const result = await saveAssignmentExerciseResult({
    assignmentId,
    assignedExerciseId: exerciseId,
    value,
    strengthSets: [...strengthSets.entries()].sort(([left], [right]) => left - right).map(([, set]) => set),
    studentId: session.user.id,
  })

  if (!result.ok) {
    redirect(`/student/block/${assignmentId}/exercise/${exerciseId}?error=${encodeURIComponent(result.message)}`)
  }

  redirect(`/student/block/${assignmentId}?saved=1`)
}
