import type { ExerciseSummary } from '@/modules/exercises'

type ExerciseCardProps = {
  exercise: ExerciseSummary
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  return (
    <article className="card stack" style={{ gap: '0.75rem' }}>
      <div className="stack" style={{ gap: '0.35rem' }}>
        <span className="eyebrow">{exercise.primaryMetricType}</span>
        <h2 style={{ margin: 0 }}>{exercise.name}</h2>
      </div>

      <p className="muted">{exercise.description ?? 'Sin descripción todavía.'}</p>

      <div className="role-nav">
        <span className={exercise.hasVideo ? 'status status--ok' : 'status status--muted'}>
          {exercise.hasVideo ? 'Con video' : 'Sin video'}
        </span>
      </div>
    </article>
  )
}
