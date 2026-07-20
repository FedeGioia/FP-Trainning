'use server'

import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { createExercise, isValidMetricType } from '@/modules/exercises'

export async function createExerciseAction(formData: FormData) {
  const session = await auth()
  const name = String(formData.get('name') ?? '')
  const description = String(formData.get('description') ?? '')
  const primaryMetricType = String(formData.get('primaryMetricType') ?? '')
  const videoUrl = String(formData.get('videoUrl') ?? '')
  const categoryId = String(formData.get('categoryId') ?? '')

  if (!session?.user?.id || session.user.role !== 'trainer') {
    redirect('/login?error=auth')
  }

  if (!isValidMetricType(primaryMetricType)) {
    redirect('/trainer/exercises/new?error=metric')
  }

  const result = await createExercise({
    name,
    description,
    primaryMetricType,
    videoUrl,
    createdById: session.user.id,
    categoryId: categoryId || null,
  })

  if (!result.ok) {
    redirect(`/trainer/exercises/new?error=${encodeURIComponent(result.message)}`)
  }

  redirect('/trainer/exercises?created=1')
}
