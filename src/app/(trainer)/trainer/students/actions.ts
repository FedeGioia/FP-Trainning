'use server'

import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { resetStudentPassword, updateStudentProfile } from '@/modules/users'

export async function updateStudentProfileAction(formData: FormData) {
  const session = await auth()
  const studentId = String(formData.get('studentId') ?? '')
  const name = String(formData.get('name') ?? '')
  const email = String(formData.get('email') ?? '')
  const programCodes = formData.getAll('programCodes').map(String)
  const expectedWorkoutsPerWeek = Number(formData.get('expectedWorkoutsPerWeek'))
  const returnTo = String(formData.get('returnTo') ?? '')
  const safeReturnTo = returnTo === `/trainer/students/${studentId}` ? returnTo : '/trainer/students'

  if (!session?.user?.id || session.user.role !== 'trainer') {
    redirect('/login?error=auth')
  }

  const result = await updateStudentProfile({
    studentId,
    name,
    email,
    programCodes,
    trainerId: session.user.id,
    expectedWorkoutsPerWeek,
  })

  if (!result.ok) {
    redirect(`${safeReturnTo}?error=${encodeURIComponent(result.message)}`)
  }

  redirect(`${safeReturnTo}?updated=1`)
}

export async function resetStudentPasswordAction(formData: FormData) {
  const session = await auth()
  const studentId = String(formData.get('studentId') ?? '')
  const password = String(formData.get('password') ?? '')
  const returnTo = String(formData.get('returnTo') ?? '')
  const safeReturnTo = returnTo === `/trainer/students/${studentId}` ? returnTo : '/trainer/students'

  if (!session?.user?.id || session.user.role !== 'trainer') {
    redirect('/login?error=auth')
  }

  const result = await resetStudentPassword({ studentId, password, trainerId: session.user.id })

  if (!result.ok) {
    redirect(`${safeReturnTo}?error=${encodeURIComponent(result.message)}`)
  }

  redirect(`${safeReturnTo}?reset=1`)
}
