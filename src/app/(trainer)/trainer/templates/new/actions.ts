'use server'

import { redirect } from 'next/navigation'

import { createTemplate, isValidTemplateSectionType } from '@/modules/templates'

export async function createTemplateAction(formData: FormData) {
  const name = String(formData.get('name') ?? '')
  const description = String(formData.get('description') ?? '')
  const programCode = String(formData.get('programCode') ?? '')
  const firstSectionTitle = String(formData.get('firstSectionTitle') ?? '')
  const firstSectionType = String(formData.get('firstSectionType') ?? '')

  if (!isValidTemplateSectionType(firstSectionType)) {
    redirect('/trainer/templates/new?error=section-type')
  }

  const result = await createTemplate({
    name,
    description,
    programCode,
    firstSectionTitle,
    firstSectionType,
  })

  if (!result.ok) {
    redirect(`/trainer/templates/new?error=${encodeURIComponent(result.message)}`)
  }

  redirect('/trainer/templates?created=1')
}
