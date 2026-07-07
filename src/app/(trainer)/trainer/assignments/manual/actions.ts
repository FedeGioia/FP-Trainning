'use server'

import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { createManualAssignment } from '@/modules/assignments'

const SECTION_SLOTS = 3

function parseOptionalNumber(value: FormDataEntryValue | null) {
  const normalized = String(value ?? '').trim()

  if (!normalized) {
    return undefined
  }

  const parsed = Number(normalized.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : undefined
}

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

export async function createManualAssignmentAction(formData: FormData) {
  const session = await auth()
  const studentId = String(formData.get('studentId') ?? '')
  const programId = String(formData.get('programId') ?? '')
  const scheduledAt = String(formData.get('scheduledAt') ?? '')
  const title = String(formData.get('title') ?? '')
  const notes = String(formData.get('notes') ?? '')

  if (!session?.user?.id || session.user.role !== 'trainer') {
    redirect('/login?error=auth')
  }

  const sections = Array.from({ length: SECTION_SLOTS }, (_, sectionIndex) => {
    const sectionTitle = String(formData.get(`sections.${sectionIndex}.title`) ?? '')
    const exerciseIndices = getExerciseIndices(formData, sectionIndex)

    return {
      title: sectionTitle,
      exercises: exerciseIndices.map((exerciseIndex) => ({
        exerciseId: String(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.exerciseId`) ?? ''),
        metricType: String(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.metricType`) ?? ''),
        restLabel: String(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.restLabel`) ?? ''),
        methodLabel: String(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.methodLabel`) ?? ''),
        prescription: {
          value: String(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.prescriptionValue`) ?? ''),
          series: parseOptionalNumber(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.strengthSeries`)),
          repetitions: parseOptionalNumber(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.strengthRepetitions`)),
          weight: parseOptionalNumber(formData.get(`sections.${sectionIndex}.exercises.${exerciseIndex}.strengthWeight`)),
        },
      })),
    }
  })

  const result = await createManualAssignment({
    studentId,
    programId,
    scheduledAt,
    title,
    notes,
    trainerId: session.user.id,
    sections,
  })

  if (!result.ok) {
    redirect(`/trainer/assignments/manual?error=${encodeURIComponent(result.message)}`)
  }

  redirect('/trainer/assignments?created=1')
}
