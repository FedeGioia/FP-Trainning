'use server'

import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { resetStudentPassword, updateStudentProfile } from '@/modules/users'

export async function updateStudentProfileAction(formData: FormData) {
  const session = await auth()
  const studentId = String(formData.get('studentId') ?? '')
  const name = String(formData.get('name') ?? '')
  const email = String(formData.get('email') ?? '')

  if (!session?.user?.id || (session.user.role !== 'trainer' && session.user.role !== 'admin')) {
    redirect('/login?error=auth')
  }

  const result = await updateStudentProfile({ studentId, name, email })

  if (!result.ok) {
    redirect(`/trainer/students?error=${encodeURIComponent(result.message)}`)
  }

  redirect('/trainer/students?updated=1')
}

export async function resetStudentPasswordAction(formData: FormData) {
  const session = await auth()
  const studentId = String(formData.get('studentId') ?? '')
  const password = String(formData.get('password') ?? '')

  if (!session?.user?.id || (session.user.role !== 'trainer' && session.user.role !== 'admin')) {
    redirect('/login?error=auth')
  }

  const result = await resetStudentPassword({ studentId, password })

  if (!result.ok) {
    redirect(`/trainer/students?error=${encodeURIComponent(result.message)}`)
  }

  redirect('/trainer/students?reset=1')
}
