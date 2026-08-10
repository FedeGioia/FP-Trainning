import { db } from '@/lib/db'
import { templateSectionOptions } from '@/lib/constants/template-sections'

import type { CreateTemplateInput, CreateTemplateResult, TemplateSummary } from './types'

type NormalizedTemplateSection = {
  title: string
  type: string
  exercises: Array<{
    exerciseId: string
    metricType: string
    prescriptionValue: string
    strengthSeries: number | null
    strengthRepetitions: number | null
    strengthWeight: number | null
    restLabel: string | null
    methodLabel: string | null
    notes: string | null
  }>
}

function hasAnyExerciseContent(exercise: {
    exerciseId: string
    metricType?: string
  prescriptionValue: string
  strengthSeries?: string
  strengthRepetitions?: string
  strengthWeight?: string
  restLabel?: string
  methodLabel?: string
  notes?: string
}) {
  return [
    exercise.exerciseId,
    exercise.prescriptionValue,
    exercise.strengthSeries,
    exercise.strengthRepetitions,
    exercise.strengthWeight,
    exercise.restLabel,
    exercise.methodLabel,
    exercise.notes,
  ]
    .some((value) => String(value ?? '').trim().length > 0)
}

function parseOptionalNumber(value?: string) {
  const normalized = String(value ?? '').trim()

  if (!normalized) {
    return null
  }

  const parsed = Number(normalized.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function formatStrengthPrescription(series: number | null, repetitions: number | null, weight: number | null) {
  const base = [series ? `${series}` : null, repetitions ? `${repetitions}` : null].filter(Boolean).join('x')
  const weightPart = weight !== null ? ` @ ${weight}kg` : ''

  return `${base}${weightPart}`.trim()
}

function formatPrescriptionPayload(payload: unknown) {
  if (payload && typeof payload === 'object') {
    const jsonPayload = payload as Record<string, unknown>

    if ('series' in jsonPayload || 'repetitions' in jsonPayload || 'weight' in jsonPayload) {
      const series = typeof jsonPayload.series === 'number' ? jsonPayload.series : null
      const repetitions = typeof jsonPayload.repetitions === 'number' ? jsonPayload.repetitions : null
      const weight = typeof jsonPayload.weight === 'number' ? jsonPayload.weight : null

      return formatStrengthPrescription(series, repetitions, weight)
    }

    if ('value' in jsonPayload) {
      return String(jsonPayload.value ?? '')
    }
  }

  return ''
}

export async function listTemplates(): Promise<TemplateSummary[]> {
  try {
    const templates = await db.routineTemplate.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        program: true,
        sections: {
          orderBy: { sectionOrder: 'asc' },
          include: {
            exercises: {
              orderBy: { exerciseOrder: 'asc' },
              include: {
                exercise: true,
              },
            },
          },
        },
      },
      take: 24,
    })

    return templates.map((template) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      programCode: template.program.code,
      sections: template.sections.map((section) => ({
        id: section.id,
        title: section.title,
        sectionType: section.sectionType,
        order: section.sectionOrder,
        exercises: section.exercises.map((exercise) => ({
          id: exercise.id,
          name: exercise.exercise.name,
          metricType: exercise.metricType,
          prescriptionValue: formatPrescriptionPayload(exercise.prescriptionPayload),
          restLabel: exercise.restLabel,
          methodLabel: exercise.methodLabel,
          notes: exercise.notes,
          order: exercise.exerciseOrder,
        })),
      })),
    }))
  } catch {
    return []
  }
}

export function isValidTemplateSectionType(value: string) {
  return templateSectionOptions.some((option) => option.value === value)
}

export async function createTemplate(input: CreateTemplateInput): Promise<CreateTemplateResult> {
  const name = input.name.trim()

  if (!name) {
    return { ok: false, message: 'El nombre de la plantilla es obligatorio.' }
  }

  const requestedExerciseIds = [...new Set(input.sections.flatMap((section) => section.exercises.map((exercise) => exercise.exerciseId.trim()).filter(Boolean)))]
  let metricTypesByExerciseId = new Map<string, string>()
  if (requestedExerciseIds.length > 0) {
    try {
      const exercises = await db.exercise.findMany({ where: { id: { in: requestedExerciseIds }, active: true }, select: { id: true, primaryMetricType: true } })
      metricTypesByExerciseId = new Map(exercises.map((exercise) => [exercise.id, exercise.primaryMetricType]))
    } catch {
      return { ok: false, message: 'No se pudieron validar los ejercicios elegidos.' }
    }
  }

  const normalizedSections: Array<NormalizedTemplateSection | { error: string } | null> = input.sections
    .map((section, sectionIndex) => {
      const title = section.title.trim()
      const sectionHasAnyContent =
        title.length > 0 || section.exercises.some((exercise) => hasAnyExerciseContent(exercise))

      if (!sectionHasAnyContent) {
        return null
      }

      if (!title) {
        return { error: `La sección ${sectionIndex + 1} necesita un título.` as const }
      }

      if (!isValidTemplateSectionType(section.type)) {
        return { error: `El tipo de la sección ${sectionIndex + 1} no es válido.` as const }
      }

      const normalizedExercises: NormalizedTemplateSection['exercises'] = []

      for (const [exerciseIndex, exercise] of section.exercises.entries()) {
        const exerciseId = exercise.exerciseId.trim()
        const metricType = metricTypesByExerciseId.get(exerciseId) ?? ''
        const prescriptionValue = exercise.prescriptionValue.trim()
        const strengthSeries = parseOptionalNumber(exercise.strengthSeries)
        const strengthRepetitions = parseOptionalNumber(exercise.strengthRepetitions)
        const strengthWeight = parseOptionalNumber(exercise.strengthWeight)
        const restLabel = exercise.restLabel?.trim() || null
        const methodLabel = exercise.methodLabel?.trim() || null
        const notes = exercise.notes?.trim() || null

        if (!hasAnyExerciseContent({ ...exercise, exerciseId, metricType, prescriptionValue, restLabel: restLabel ?? '', methodLabel: methodLabel ?? '', notes: notes ?? '' })) {
          continue
        }

        if (!exerciseId) {
          return { error: `El ejercicio ${exerciseIndex + 1} de la sección ${sectionIndex + 1} necesita un ejercicio.` as const }
        }

        if (!metricType) {
          return { error: `El ejercicio ${exerciseIndex + 1} de la sección ${sectionIndex + 1} ya no existe o no está disponible.` as const }
        }

        if (metricType === 'STRENGTH') {
          if (Number.isNaN(strengthSeries) || Number.isNaN(strengthRepetitions) || Number.isNaN(strengthWeight)) {
            return { error: `Series, repeticiones y peso del ejercicio ${exerciseIndex + 1} de la sección ${sectionIndex + 1} deben ser números válidos.` as const }
          }

          if (strengthSeries === null || strengthRepetitions === null || strengthWeight === null) {
            return { error: `El ejercicio ${exerciseIndex + 1} de la sección ${sectionIndex + 1} necesita series, repeticiones y peso.` as const }
          }
        } else if (!prescriptionValue) {
          return { error: `La prescripción del ejercicio ${exerciseIndex + 1} de la sección ${sectionIndex + 1} es obligatoria.` as const }
        }

        normalizedExercises.push({
          exerciseId,
          metricType,
          prescriptionValue: metricType === 'STRENGTH' ? formatStrengthPrescription(strengthSeries, strengthRepetitions, strengthWeight) : prescriptionValue,
          strengthSeries,
          strengthRepetitions,
          strengthWeight,
          restLabel,
          methodLabel,
          notes,
        })
      }

      if (normalizedExercises.length === 0) {
        return { error: `La sección ${sectionIndex + 1} debe tener al menos un ejercicio válido.` as const }
      }

      return {
        title,
        type: section.type.trim(),
        exercises: normalizedExercises,
      }
    })

  const normalizationError = normalizedSections.find(
    (section): section is { error: string } => Boolean(section && 'error' in section),
  )
  if (normalizationError) {
    return { ok: false, message: normalizationError.error }
  }

  const sectionsToCreate = normalizedSections.filter(
    (section): section is NormalizedTemplateSection => Boolean(section && !('error' in section)),
  )

  if (sectionsToCreate.length === 0) {
    return { ok: false, message: 'Necesitás al menos una sección con ejercicios válidos.' }
  }

  try {
    const trainer = await db.user.findUnique({
      where: { id: input.createdById },
    })

    if (!trainer || trainer.role !== 'TRAINER' || trainer.status !== 'ACTIVE') {
      return {
        ok: false,
        message: 'No encontramos un trainer activo para crear la plantilla.',
      }
    }

    const program = await db.program.findUnique({
      where: { code: input.programCode as never },
    })

    if (!program) {
      return { ok: false, message: 'El programa seleccionado no existe todavía en la base.' }
    }

    const requestedExerciseIds = [...new Set(sectionsToCreate.flatMap((section) => section.exercises.map((exercise) => exercise.exerciseId)))]
    const availableExercises = await db.exercise.findMany({
      where: { id: { in: requestedExerciseIds } },
      select: { id: true },
    })
    const availableExerciseIds = new Set(availableExercises.map((exercise) => exercise.id))

    const missingExercise = requestedExerciseIds.find((exerciseId) => !availableExerciseIds.has(exerciseId))
    if (missingExercise) {
      return {
        ok: false,
        message: 'Alguno de los ejercicios elegidos no existe en la base real. Crealo primero antes de usar esta plantilla.',
      }
    }

    const template = await db.routineTemplate.create({
      data: {
        name,
        description: input.description?.trim() || null,
        programId: program.id,
        createdById: trainer.id,
        sections: {
          create: sectionsToCreate.map((section, sectionIndex) => ({
            title: section.title,
            sectionType: section.type as never,
            sectionOrder: sectionIndex + 1,
            exercises: {
              create: section.exercises.map((exercise, exerciseIndex) => ({
                exerciseId: exercise.exerciseId,
                metricType: exercise.metricType as never,
                prescriptionPayload:
                  exercise.metricType === 'STRENGTH'
                    ? {
                        series: exercise.strengthSeries,
                        repetitions: exercise.strengthRepetitions,
                        weight: exercise.strengthWeight,
                      }
                    : { value: exercise.prescriptionValue },
                restLabel: exercise.restLabel,
                methodLabel: exercise.methodLabel,
                notes: exercise.notes,
                exerciseOrder: exerciseIndex + 1,
              })),
            },
          })),
        },
      },
    })

    return { ok: true, templateId: template.id }
  } catch {
    return {
      ok: false,
      message: 'No se pudo crear la plantilla. Verificá la base, migraciones y seed.',
    }
  }
}
