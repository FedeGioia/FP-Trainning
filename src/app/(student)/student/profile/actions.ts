'use server'

import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { changeStudentPasswordWithCurrent, updateStudentProfile } from '@/modules/users'

export async function updateStudentProfileAction(formData: FormData) {
  const session = await auth()
  const name = String(formData.get('name') ?? '')
  const email = String(formData.get('email') ?? '')
  const redirectTo = String(formData.get('redirectTo') ?? '/student/profile/edit')

  if (!session?.user?.id || session.user.role !== 'student') {
    redirect('/login?error=auth')
  }

  const result = await updateStudentProfile({
    studentId: session.user.id,
    name,
    email,
  })

  if (!result.ok) {
    redirect(`${redirectTo}?error=${encodeURIComponent(result.message)}`)
  }

  redirect('/student/profile?profile=1')
}

export async function changeStudentPasswordAction(formData: FormData) {
  const session = await auth()
  const currentPassword = String(formData.get('currentPassword') ?? '')
  const newPassword = String(formData.get('newPassword') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')
  const redirectTo = String(formData.get('redirectTo') ?? '/student/profile/password')

  if (!session?.user?.id || session.user.role !== 'student') {
    redirect('/login?error=auth')
  }

  if (newPassword !== confirmPassword) {
    redirect(`${redirectTo}?error=Las contraseñas nuevas no coinciden.`)
  }

  const result = await changeStudentPasswordWithCurrent({
    studentId: session.user.id,
    currentPassword,
    newPassword,
  })

  if (!result.ok) {
    redirect(`${redirectTo}?error=${encodeURIComponent(result.message)}`)
  }

  redirect('/student/profile?password=1')
}
