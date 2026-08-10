import { db } from '@/lib/db'
import { exerciseMetricOptions } from '@/lib/constants/exercise-metrics'

import type {
  CreateCategoryInput,
  CreateCategoryResult,
  CreateExerciseInput,
  CreateExerciseResult,
  DeleteCategoryResult,
  ExerciseCategoryNode,
  ExerciseMetricType,
  ExerciseSummary,
} from './types'

type CategoryRecord = { id: string; name: string; parentId: string | null }

export const BACKFILL_CATEGORY_NAME = 'Sin categoría'

export function normalizeCategoryName(name: string) {
  return name.trim().normalize('NFC').toLocaleLowerCase('es')
}

export function requireCategoryId(categoryId: string | null | undefined): string | null {
  const normalizedCategoryId = categoryId?.trim()
  return normalizedCategoryId || null
}

async function getBackfillCategoryId(): Promise<string> {
  const category = await db.exerciseCategory.findFirst({
    where: { name: BACKFILL_CATEGORY_NAME, parentId: null },
    select: { id: true },
  })
  if (category) return category.id

  const created = await db.exerciseCategory.create({
    data: { name: BACKFILL_CATEGORY_NAME, parentId: null },
    select: { id: true },
  })
  return created.id
}

export function buildCategoryTree(categories: CategoryRecord[]): ExerciseCategoryNode[] {
  const nodes = new Map<string, ExerciseCategoryNode>()
  const roots: ExerciseCategoryNode[] = []

  for (const category of categories) {
    nodes.set(category.id, { ...category, path: category.name, children: [] })
  }

  for (const category of categories) {
    const node = nodes.get(category.id)!
    const parent = category.parentId ? nodes.get(category.parentId) : undefined
    if (parent && parent !== node) parent.children.push(node)
    else roots.push(node)
  }

  const assignPaths = (node: ExerciseCategoryNode, parentPath?: string, visited = new Set<string>()) => {
    if (visited.has(node.id)) return
    visited.add(node.id)
    node.path = parentPath ? `${parentPath} / ${node.name}` : node.name
    node.children.sort((a, b) => a.name.localeCompare(b.name, 'es'))
    for (const child of node.children) assignPaths(child, node.path, new Set(visited))
  }

  roots.sort((a, b) => a.name.localeCompare(b.name, 'es'))
  for (const root of roots) assignPaths(root)
  return roots
}

function flattenCategoryTree(nodes: ExerciseCategoryNode[]): ExerciseCategoryNode[] {
  return nodes.flatMap((node) => [node, ...flattenCategoryTree(node.children)])
}

export async function listExercises(): Promise<ExerciseSummary[]> {
  return listExercisesWithCategoryPaths()
}

export async function createCategory(input: CreateCategoryInput): Promise<CreateCategoryResult> {
  const name = input.name.trim().normalize('NFC')
  if (!name) return { ok: false, message: 'El nombre de la categoría es obligatorio.' }

  try {
    if (input.parentId) {
      const parent = await db.exerciseCategory.findUnique({ where: { id: input.parentId } })
      if (!parent) return { ok: false, message: 'La categoría padre ya no existe.' }
    }

    const siblings = await db.exerciseCategory.findMany({
      where: { parentId: input.parentId || null },
      select: { name: true },
    })
    if (siblings.some((sibling) => normalizeCategoryName(sibling.name) === normalizeCategoryName(name))) {
      return { ok: false, message: 'Ya existe una categoría con ese nombre en esta carpeta.' }
    }

    const category = await db.exerciseCategory.create({
      data: { name, parentId: input.parentId || null, createdById: input.createdById ?? null },
    })
    return { ok: true, categoryId: category.id }
  } catch {
    return { ok: false, message: 'No se pudo crear la categoría.' }
  }
}

export async function listCategoryTree(): Promise<ExerciseCategoryNode[]> {
  try {
    const categories = await db.exerciseCategory.findMany({
      select: { id: true, name: true, parentId: true },
      orderBy: { name: 'asc' },
    })
    return buildCategoryTree(categories)
  } catch {
    return []
  }
}

export async function deleteCategory(id: string): Promise<DeleteCategoryResult> {
  try {
    const category = await db.exerciseCategory.findUnique({
      where: { id },
      select: { id: true, name: true, parentId: true, _count: { select: { children: true } } },
    })
    if (!category) return { ok: false, message: 'La categoría no existe.' }
    if (category.name === BACKFILL_CATEGORY_NAME && category.parentId === null) {
      return { ok: false, message: 'No podés eliminar la categoría obligatoria Sin categoría.' }
    }
    if (category._count.children > 0) return { ok: false, message: 'No podés eliminar una categoría que tiene subcategorías.' }

    const backfillCategoryId = await getBackfillCategoryId()

    await db.$transaction([
      db.exercise.updateMany({ where: { categoryId: id }, data: { categoryId: backfillCategoryId } }),
      db.exerciseCategory.delete({ where: { id } }),
    ])
    return { ok: true }
  } catch {
    return { ok: false, message: 'No se pudo eliminar la categoría.' }
  }
}

export async function updateExerciseCategory(exerciseId: string, categoryId: string | null | undefined): Promise<DeleteCategoryResult> {
  const requiredCategoryId = requireCategoryId(categoryId)
  if (!requiredCategoryId) return { ok: false, message: 'Tenés que elegir una categoría.' }

  try {
    const category = await db.exerciseCategory.findUnique({ where: { id: requiredCategoryId }, select: { id: true } })
    if (!category) return { ok: false, message: 'La categoría elegida ya no existe.' }

    const exercise = await db.exercise.updateMany({
      where: { id: exerciseId },
      data: { categoryId: requiredCategoryId },
    })
    if (exercise.count === 0) return { ok: false, message: 'El ejercicio no existe.' }
    return { ok: true }
  } catch {
    return { ok: false, message: 'No se pudo actualizar la categoría del ejercicio.' }
  }
}

export async function listExercisesWithCategoryPaths(): Promise<ExerciseSummary[]> {
  try {
    const [exercises, tree] = await Promise.all([
      db.exercise.findMany({
        where: { active: true },
        orderBy: { name: 'asc' },
        include: { media: true, category: true },
      }),
      listCategoryTree(),
    ])
    const categories = flattenCategoryTree(tree)
    const paths = new Map(categories.map((category) => [category.id, category.path]))
    const categoryOrder = new Map(categories.map((category, index) => [category.id, index]))
    const backfillCategoryId = categories.find((category) => category.name === BACKFILL_CATEGORY_NAME && category.parentId === null)?.id
    return exercises.flatMap((exercise) => {
      const categoryId = exercise.categoryId ?? backfillCategoryId
      if (!categoryId) return []

      return [{
        id: exercise.id,
        name: exercise.name,
        description: exercise.description,
        primaryMetricType: exercise.primaryMetricType,
        hasVideo: exercise.media.length > 0,
        categoryId,
        categoryPath: paths.get(categoryId) ?? BACKFILL_CATEGORY_NAME,
      }]
    }).sort((a, b) => {
      const categoryComparison = (categoryOrder.get(a.categoryId) ?? Number.MAX_SAFE_INTEGER)
        - (categoryOrder.get(b.categoryId) ?? Number.MAX_SAFE_INTEGER)
      return categoryComparison || a.name.localeCompare(b.name, 'es') || a.id.localeCompare(b.id)
    })
  } catch {
    return []
  }
}

export function isValidMetricType(value: string): value is ExerciseMetricType {
  return exerciseMetricOptions.some((option) => option.value === value)
}

export async function createExercise(input: CreateExerciseInput): Promise<CreateExerciseResult> {
  const name = input.name.trim()
  const categoryId = requireCategoryId(input.categoryId)

  if (!name) {
    return { ok: false, message: 'El nombre del ejercicio es obligatorio.' }
  }

  if (!isValidMetricType(input.primaryMetricType)) {
    return { ok: false, message: 'El tipo de métrica no es válido.' }
  }

  if (!categoryId) {
    return { ok: false, message: 'Tenés que elegir una categoría.' }
  }

  try {
    const category = await db.exerciseCategory.findUnique({ where: { id: categoryId } })
    if (!category) return { ok: false, message: 'La categoría elegida ya no existe.' }
    const exercise = await db.exercise.create({
      data: {
        name,
        description: input.description?.trim() || null,
        primaryMetricType: input.primaryMetricType,
        createdById: input.createdById ?? null,
        categoryId,
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
