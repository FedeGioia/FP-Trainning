'use server'

import { redirect } from 'next/navigation'

import { createStudent } from '@/modules/users'

export async function createStudentAction(formData: FormData) {
  const name = String(formData.get('name') ?? '')
  const email = String(formData.get('email') ?? '')
  const programCodes = formData.getAll('programCodes').map(String)

  const result = await createStudent({
    name,
    email,
    programCodes,
  })

  if (!result.ok) {
    redirect(`/trainer/students/new?error=${encodeURIComponent(result.message)}`)
  }

  redirect('/trainer/students?created=1')
}
