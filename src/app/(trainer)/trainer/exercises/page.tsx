import Link from 'next/link'

import { ExerciseCard } from '@/components/ui/exercise-card'
import { SectionIntro } from '@/components/ui/section-intro'
import { StatCard } from '@/components/ui/stat-card'
import { listExercises } from '@/modules/exercises'

type TrainerExercisesPageProps = {
  searchParams?: Promise<{
    created?: string
  }>
}

export default async function TrainerExercisesPage({ searchParams }: TrainerExercisesPageProps) {
  const params = (await searchParams) ?? {}
  const exercises = await listExercises()
  const withVideo = exercises.filter((exercise) => exercise.hasVideo).length

  return (
    <div className="stack">
      <SectionIntro
        eyebrow="Biblioteca"
        title="Ejercicios"
        description="Centralizá los ejercicios que usás en cada programa para reutilizarlos al crear plantillas y bloques."
        actions={
          <>
            <Link className="button button-primary" href="/trainer/exercises/new">
              Nuevo ejercicio
            </Link>
            <Link className="button button-secondary" href="/trainer">
              Volver al dashboard
            </Link>
          </>
        }
      />

      {params.created ? <span className="status status--ok">Ejercicio creado correctamente.</span> : null}

      <div className="grid cards">
        <StatCard label="Ejercicios visibles" value={exercises.length} detail="Catálogo actual disponible" />
        <StatCard label="Con video" value={withVideo} detail="Útiles para guía del alumno" />
        <StatCard label="Tipos activos" value="4" detail="Strength, duration, distance y custom" />
      </div>

      <section className="stack">
        <div className="section-header">
          <div>
            <h2 className="section-title">Catálogo visible</h2>
            <p className="muted">Revisá tu biblioteca actual y sumá nuevos ejercicios cuando lo necesites.</p>
          </div>
        </div>

        <div className="grid cards">
          {exercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      </section>
    </div>
  )
}
