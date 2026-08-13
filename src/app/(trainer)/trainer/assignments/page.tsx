import { listAssignments } from '@/modules/assignments'
import { PlaceholderPanel } from '@/components/ui/placeholder-panel'
import { AssignmentRosterTable } from '@/components/trainer/assignment-roster-table'
import { TrainerAction, TrainerNotice, TrainerPageHeader, TrainerSurface } from '@/components/trainer-ui'

type TrainerAssignmentsPageProps = {
  searchParams?: Promise<{
    created?: string
  }>
}

export default async function TrainerAssignmentsPage({ searchParams }: TrainerAssignmentsPageProps) {
  const params = (await searchParams) ?? {}
  const assignments = await listAssignments()

  return (
    <div className="trainer-assignments stack">
      {params.created ? <TrainerNotice className="trainer-assignments__notice" role="status">Asignación creada correctamente.</TrainerNotice> : null}

      <TrainerSurface className="trainer-assignments__content stack" aria-label="Asignaciones de rutinas">
        <TrainerPageHeader className="trainer-assignments__intro" eyebrow="Asignaciones" title="Gestión de rutinas" />

        <section className="assignment-roster-toolbar">
          <div className="assignment-roster-toolbar__controls">
            <label className="field assignment-roster-toolbar__field">
              <span className="sr-only">Buscar por alumno o rutina</span>
              <input aria-label="Buscar por alumno o rutina" placeholder="Buscar" type="search" />
            </label>

            <div className="assignment-roster-toolbar__actions">
              <TrainerAction href="/trainer/assignments/manual">Rutina manual</TrainerAction>
              <TrainerAction href="/trainer/assignments/new" variant="primary"><span aria-hidden="true">+</span> Desde plantilla</TrainerAction>
            </div>
          </div>

          <span className="muted assignment-roster-toolbar__helper">Revisá qué tiene cada alumno, cuándo le toca y cómo viene avanzando.</span>
        </section>

        {assignments.length === 0 ? (
          <PlaceholderPanel
            className="trainer-empty-state"
            title="Todavía no hay asignaciones visibles"
            description="Creá una rutina desde una plantilla o cargala manualmente."
          />
        ) : (
          <AssignmentRosterTable assignments={assignments} />
        )}
      </TrainerSurface>
    </div>
  )
}
