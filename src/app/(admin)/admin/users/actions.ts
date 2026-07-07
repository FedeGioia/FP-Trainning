'use server'

import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { resetStudentPassword, toggleUserStatus } from '@/modules/users'

export async function adminResetStudentPasswordAction(formData: FormData) {
  const session = await auth()
  const studentId = String(formData.get('studentId') ?? '')
  const password = String(formData.get('password') ?? '')

  if (!session?.user?.id || session.user.role !== 'admin') {
    redirect('/login?error=auth')
  }

  const result = await resetStudentPassword({ studentId, password })

  if (!result.ok) {
    redirect(`/admin/users?error=${encodeURIComponent(result.message)}`)
  }

  redirect('/admin/users?reset=1')
}

export async function adminToggleUserStatusAction(formData: FormData) {
  const session = await auth()
  const userId = String(formData.get('userId') ?? '')

  if (!session?.user?.id || session.user.role !== 'admin') {
    redirect('/login?error=auth')
  }

  const result = await toggleUserStatus({
    userId,
    actorId: session.user.id,
  })

  if (!result.ok) {
    redirect(`/admin/users?error=${encodeURIComponent(result.message)}`)
  }

  redirect('/admin/users?status=1')
}
