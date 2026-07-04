import { db } from '@/lib/db'
import { templateSectionOptions } from '@/lib/constants/template-sections'
import { templateCatalogSeed } from '@/lib/constants/templates'

import type { CreateTemplateInput, CreateTemplateResult, TemplateSummary } from './types'

export async function listTemplates(): Promise<TemplateSummary[]> {
  try {
    const templates = await db.routineTemplate.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        program: true,
        sections: {
          orderBy: { sectionOrder: 'asc' },
        },
      },
      take: 24,
    })

    if (templates.length === 0) {
      return templateCatalogSeed
    }

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
      })),
    }))
  } catch {
    return templateCatalogSeed
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

  if (!input.sections || input.sections.length === 0) {
    return { ok: false, message: 'Debe haber al menos una sección.' }
  }

  try {
    const trainer = await db.user.findFirst({
      where: { role: 'TRAINER', status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    })

    if (!trainer) {
      return {
        ok: false,
        message: 'No hay trainer demo en la base. Corré el seed antes de crear templates reales.',
      }
    }

    const program = await db.program.findUnique({
      where: { code: input.programCode as never },
    })

    if (!program) {
      return { ok: false, message: 'El programa seleccionado no existe todavía en la base.' }
    }

    const template = await db.routineTemplate.create({
      data: {
        name,
        description: input.description?.trim() || null,
        programId: program.id,
        createdById: trainer.id,
        sections: {
          create: input.sections.map((section, sectionIndex) => ({
            title: section.title,
            sectionType: section.type as never,
            sectionOrder: sectionIndex + 1,
            exercises: {
              create: section.exercises.map((exercise, exerciseIndex) => ({
                exerciseId: exercise.exerciseId,
                metricType: exercise.metricType,
                prescriptionPayload: exercise.prescriptionPayload,
                restLabel: exercise.restLabel,
                methodLabel: exercise.methodLabel,
                notes: exercise.notes,
                exerciseOrder: exerciseIndex + 1,
              })).filter(exercise => exercise.exerciseId),
            },
          })).filter(section => section.title),
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
