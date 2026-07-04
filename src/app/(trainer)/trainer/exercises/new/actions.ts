'use server'

import { redirect } from 'next/navigation'

import { createExercise, isValidMetricType } from '@/modules/exercises'

export async function createExerciseAction(formData: FormData) {
  const name = String(formData.get('name') ?? '')
  const description = String(formData.get('description') ?? '')
  const primaryMetricType = String(formData.get('primaryMetricType') ?? '')
  const videoUrl = String(formData.get('videoUrl') ?? '')

  if (!isValidMetricType(primaryMetricType)) {
    redirect('/trainer/exercises/new?error=metric')
  }

  const result = await createExercise({
    name,
    description,
    primaryMetricType,
    videoUrl,
  })

  if (!result.ok) {
    redirect(`/trainer/exercises/new?error=${encodeURIComponent(result.message)}`)
  }

  redirect('/trainer/exercises?created=1')
}
