import Link from 'next/link'

import { listCategoryTree, listExercisesWithCategoryPaths } from '@/modules/exercises'
import { listProgramCatalog } from '@/modules/programs'
import { listStudents } from '@/modules/users'
import { ManualAssignmentForm } from './ManualAssignmentForm'

type TrainerManualAssignmentPageProps = { searchParams?: Promise<{ studentId?: string }> }

export default async function TrainerManualAssignmentPage({ searchParams }: TrainerManualAssignmentPageProps) {
  const [students, programs, exercises, categories] = await Promise.all([listStudents(), listProgramCatalog(), listExercisesWithCategoryPaths(), listCategoryTree()])
  const params = (await searchParams) ?? {}

  return (
    <div className="stack">
      <section className="section-header"><div className="stack" style={{ gap: '0.35rem' }}><h1 className="section-title">Nueva rutina manual</h1><p className="muted">Armá una rutina personalizada ejercicio por ejercicio para un alumno sin depender de una plantilla.</p></div><Link className="pill" href="/trainer/assignments">Volver al listado</Link></section>
      <ManualAssignmentForm students={students} programs={programs} exercises={exercises} categories={categories} initialStudentId={params.studentId} />
    </div>
  )
}
