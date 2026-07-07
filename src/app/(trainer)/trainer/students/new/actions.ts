'use server'

import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { createStudent } from '@/modules/users'

export async function createStudentAction(formData: FormData) {
  const session = await auth()
  const name = String(formData.get('name') ?? '')
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const programCodes = formData.getAll('programCodes').map(String)

  if (!session?.user?.id || session.user.role !== 'trainer') {
    redirect('/login?error=auth')
  }

  const result = await createStudent({
    name,
    email,
    password,
    programCodes,
    trainerId: session.user.id,
  })

  if (!result.ok) {
    redirect(`/trainer/students/new?error=${encodeURIComponent(result.message)}`)
  }

  redirect('/trainer/students?created=1')
}
