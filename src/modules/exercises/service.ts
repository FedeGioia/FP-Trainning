import { db } from '@/lib/db'
import { exerciseMetricOptions } from '@/lib/constants/exercise-metrics'

import type { CreateExerciseInput, CreateExerciseResult, ExerciseMetricType, ExerciseSummary } from './types'

export async function listExercises(): Promise<ExerciseSummary[]> {
  try {
    const exercises = await db.exercise.findMany({
      orderBy: { createdAt: 'desc' },
      include: { media: true },
      take: 24,
    })

    return exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      description: exercise.description,
      primaryMetricType: exercise.primaryMetricType,
      hasVideo: exercise.media.length > 0,
    }))
  } catch {
    return []
  }
}

export function isValidMetricType(value: string): value is ExerciseMetricType {
  return exerciseMetricOptions.some((option) => option.value === value)
}

export async function createExercise(input: CreateExerciseInput): Promise<CreateExerciseResult> {
  const name = input.name.trim()

  if (!name) {
    return { ok: false, message: 'El nombre del ejercicio es obligatorio.' }
  }

  if (!isValidMetricType(input.primaryMetricType)) {
    return { ok: false, message: 'El tipo de métrica no es válido.' }
  }

  try {
    const exercise = await db.exercise.create({
      data: {
        name,
        description: input.description?.trim() || null,
        primaryMetricType: input.primaryMetricType,
        createdById: input.createdById ?? null,
        media: input.videoUrl?.trim()
          ? {
              create: {
                url: input.videoUrl.trim(),
              },
            }
          : undefined,
      },
    })

    return { ok: true, exerciseId: exercise.id }
  } catch {
    return {
      ok: false,
      message:
        'No se pudo crear el ejercicio. Verificá que PostgreSQL esté arriba y que las migraciones estén aplicadas.',
    }
  }
}
