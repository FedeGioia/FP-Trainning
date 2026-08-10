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

export async function createCategoryAction(formData: FormData) {
  const createdById = await requireTrainer()
  const result = await createCategory({
    name: String(formData.get('name') ?? ''),
    parentId: String(formData.get('parentId') ?? '') || null,
    createdById,
  })

  if (!result.ok) redirect(`/trainer/exercises?categoryError=${encodeURIComponent(result.message)}`)
  revalidatePath('/trainer/exercises')
  revalidatePath('/trainer/exercises/new')
  revalidatePath('/trainer/templates/new')
  revalidatePath('/trainer/assignments/manual')
  redirect('/trainer/exercises?categoryCreated=1')
}

export async function deleteCategoryAction(formData: FormData) {
  await requireTrainer()
  const result = await deleteCategory(String(formData.get('categoryId') ?? ''))
  if (!result.ok) redirect(`/trainer/exercises?categoryError=${encodeURIComponent(result.message)}`)
  revalidatePath('/trainer/exercises')
  revalidatePath('/trainer/exercises/new')
  revalidatePath('/trainer/templates/new')
  revalidatePath('/trainer/assignments/manual')
  redirect('/trainer/exercises?categoryDeleted=1')
}

export async function updateExerciseCategoryAction(formData: FormData) {
  await requireTrainer()
  const result = await updateExerciseCategory(
    String(formData.get('exerciseId') ?? ''),
    String(formData.get('categoryId') ?? ''),
  )
  if (!result.ok) redirect(`/trainer/exercises?categoryError=${encodeURIComponent(result.message)}`)
  revalidatePath('/trainer/exercises')
  revalidatePath('/trainer/templates/new')
  revalidatePath('/trainer/assignments/manual')
  redirect('/trainer/exercises?exerciseCategoryUpdated=1')
}
