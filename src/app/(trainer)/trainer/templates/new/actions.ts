'use server'

import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { createTemplate } from '@/modules/templates'

const SECTION_SLOTS = 3

function getExerciseIndices(formData: FormData, sectionIndex: number) {
  const indices = new Set<number>()
  const pattern = new RegExp(`^sections\\.${sectionIndex}\\.exercises\\.(\\d+)\\.exerciseId$`)

  for (const key of formData.keys()) {
    const match = key.match(pattern)
    if (match) {
      indices.add(Number(match[1]))
    }
  }

  return Array.from(indices).sort((a, b) => a - b)
}

export async function createTemplateAction(formData: FormData) {
  const session = await auth()
  const name = String(formData.get('name') ?? '')
  const description = String(formData.get('description') ?? '')
  const programCode = String(formData.get('programCode') ?? '')

  if (!session?.user?.id || session.user.role !== 'trainer') {
    redirect('/login?error=auth')
  }

  const sections = Array.from({ length: SECTION_SLOTS }, (_, sectionIndex) => {
    const sectionTitle = String(formData.get(`sections.${sectionIndex}.title`) ?? '')
    const sectionType = String(formData.get(`sections.${sectionIndex}.type`) ?? '')
    const exerciseIndices = getExerciseIndices(formData, sectionIndex)

    return {
      title: sectionTitle,
      type: sectionType,
      exercises: exerciseIndices.map((exerciseIndex) => ({
        exerciseId: String(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.exerciseId`) ?? ''),
        methodLabel: String(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.methodLabel`) ?? ''),
        prescriptionValue: String(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.prescriptionValue`) ?? ''),
        strengthSeries: String(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.strengthSeries`) ?? ''),
        strengthRepetitions: String(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.strengthRepetitions`) ?? ''),
        strengthWeight: String(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.strengthWeight`) ?? ''),
        restLabel: String(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.restLabel`) ?? ''),
      })),
    }
  })

  const result = await createTemplate({
    name,
    description,
    programCode,
    createdById: session.user.id,
    sections,
  })

  if (!result.ok) {
    redirect(`/trainer/templates/new?error=${encodeURIComponent(result.message)}`)
  }

  redirect('/trainer/templates?created=1')
}
