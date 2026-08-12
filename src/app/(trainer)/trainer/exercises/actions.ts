'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { createCategory, deleteCategory, updateExerciseCategory } from '@/modules/exercises'

async function requireTrainer() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'trainer') redirect('/login?error=auth')
  return session.user.id
}

function exercisesUrl(feedback: string, returnCategory: FormDataEntryValue | null) {
  const params = new URLSearchParams(feedback)
  const categoryId = String(returnCategory ?? '').trim()
  if (categoryId) params.set('category', categoryId)
  return `/trainer/exercises?${params}`
}

export async function createCategoryAction(formData: FormData) {
  const createdById = await requireTrainer()
  const result = await createCategory({
    name: String(formData.get('name') ?? ''),
    parentId: String(formData.get('parentId') ?? '') || null,
    createdById,
  })

  if (!result.ok) redirect(exercisesUrl(`categoryError=${encodeURIComponent(result.message)}`, formData.get('returnCategory')))
  revalidatePath('/trainer/exercises')
  revalidatePath('/trainer/exercises/new')
  revalidatePath('/trainer/templates/new')
  revalidatePath('/trainer/assignments/manual')
  redirect(exercisesUrl('categoryCreated=1', formData.get('returnCategory')))
}

export async function deleteCategoryAction(formData: FormData) {
  await requireTrainer()
  const result = await deleteCategory(String(formData.get('categoryId') ?? ''))
  if (!result.ok) redirect(exercisesUrl(`categoryError=${encodeURIComponent(result.message)}`, formData.get('returnCategory')))
  revalidatePath('/trainer/exercises')
  revalidatePath('/trainer/exercises/new')
  revalidatePath('/trainer/templates/new')
  revalidatePath('/trainer/assignments/manual')
  redirect(exercisesUrl('categoryDeleted=1', formData.get('returnCategory')))
}

export async function updateExerciseCategoryAction(formData: FormData) {
  await requireTrainer()
  const result = await updateExerciseCategory(
    String(formData.get('exerciseId') ?? ''),
    String(formData.get('categoryId') ?? ''),
  )
  if (!result.ok) redirect(exercisesUrl(`categoryError=${encodeURIComponent(result.message)}`, formData.get('returnCategory')))
  revalidatePath('/trainer/exercises')
  revalidatePath('/trainer/templates/new')
  revalidatePath('/trainer/assignments/manual')
  redirect(exercisesUrl('exerciseCategoryUpdated=1', formData.get('returnCategory')))
}
