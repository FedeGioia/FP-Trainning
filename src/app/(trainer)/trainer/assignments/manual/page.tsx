import Link from 'next/link'

import { listExercisesWithCategoryPaths } from '@/modules/exercises'
import { listProgramCatalog } from '@/modules/programs'
import { listStudents } from '@/modules/users'
import { ManualAssignmentForm } from './ManualAssignmentForm'

export default async function TrainerManualAssignmentPage() {
  const [students, programs, exercises] = await Promise.all([listStudents(), listProgramCatalog(), listExercisesWithCategoryPaths()])

  return (
    <div className="stack">
      <section className="section-header"><div className="stack" style={{ gap: '0.35rem' }}><h1 className="section-title">Nueva rutina manual</h1><p className="muted">Armá una rutina personalizada ejercicio por ejercicio para un alumno sin depender de una plantilla.</p></div><Link className="pill" href="/trainer/assignments">Volver al listado</Link></section>
      <ManualAssignmentForm students={students} programs={programs} exercises={exercises} />
    </div>
  )
}
