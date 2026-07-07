'use server'

import { redirect } from 'next/navigation'

import { auth, signOut } from '@/auth'
import { changeStudentPassword } from '@/modules/users'

export async function changeStudentPasswordAction(formData: FormData) {
  const session = await auth()
  const password = String(formData.get('password') ?? '')

  if (!session?.user?.id || session.user.role !== 'student') {
    redirect('/login?error=auth')
  }

  const result = await changeStudentPassword({
    studentId: session.user.id,
    password,
  })

  if (!result.ok) {
    redirect(`/student/change-password?error=${encodeURIComponent(result.message)}`)
  }

  await signOut({ redirectTo: '/login?passwordChanged=1' })
}
