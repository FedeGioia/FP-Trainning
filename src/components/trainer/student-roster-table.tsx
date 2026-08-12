import Link from 'next/link'

import type { TrainerStudentRosterRow } from '@/modules/trainer-students'
import { ProgramBadge } from '@/components/ui/program-badge'

type StudentRosterTableProps = {
  students: TrainerStudentRosterRow[]
}

function getWeeklyGoalDotState(weekly: TrainerStudentRosterRow['weekly']) {
  if (weekly.goalTarget === null) return 'untracked'
  if (weekly.scheduledCount === 0) return 'empty'
  if (weekly.scheduledCount >= weekly.goalTarget) return 'met'
  return 'in-progress'
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m14.5 5.5 4 4M4 20l4.4-1 10.3-10.3a2.8 2.8 0 0 0-4-4L4.4 14.9 4 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MetricsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 19V10M12 19V5M19 19v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function StudentRosterTable({ students }: StudentRosterTableProps) {
  return (
    <div className="student-roster">
      <div className="student-roster-table-wrap">
        <table className="student-roster-table">
          <thead>
            <tr>
              <th className="student-roster-table__name-column">Alumno</th>
              <th className="student-roster-table__programs-column">Programas</th>
              <th className="student-roster-table__workouts-column">Entrenamientos</th>
              <th className="student-roster-table__actions-column">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const weeklyGoalDotState = getWeeklyGoalDotState(student.weekly)

              return (
                <tr key={student.id}>
                  <td className="student-roster-table__student student-roster-table__name-column">
                    <Link
                      className="student-roster-table__student-trigger"
                      href={`/trainer/students/${student.id}`}
                    >
                      <span className="student-roster-table__avatar" aria-hidden="true">{student.name.slice(0, 1)}</span>
                      {student.name}
                    </Link>
                  </td>
                  <td className="student-roster-table__programs-column">
                    <div className="student-roster-table__badges">
                      {student.programCodes.map((programCode) => (
                        <ProgramBadge key={programCode} code={programCode} />
                      ))}
                    </div>
                  </td>
                  <td className="student-roster-table__workouts-column">
                    <strong
                      className="student-roster-table__assigned-workouts"
                      aria-label={`${student.weekly.completedCount} de ${student.weekly.scheduledCount} rutinas programadas completadas esta semana`}
                      title={student.weekly.goalTarget === null
                        ? `${student.weekly.completedCount}/${student.weekly.scheduledCount} completadas esta semana · sin objetivo semanal definido`
                        : `${student.weekly.completedCount}/${student.weekly.scheduledCount} completadas esta semana · carga semanal: ${student.weekly.scheduledCount}/${student.weekly.goalTarget} rutinas asignadas`}
                    >
                      <span
                        className={`student-roster-table__weekly-goal-dot student-roster-table__weekly-goal-dot--${weeklyGoalDotState}`}
                        aria-hidden="true"
                      />
                      {student.weekly.completedCount}/{student.weekly.scheduledCount}
                    </strong>
                  </td>
                  <td className="student-roster-table__actions-column">
                    <div className="student-roster-table__actions">
                      <Link
                        className="student-roster-table__action"
                        href={`/trainer/students/${student.id}`}
                        aria-label={`Editar alumno ${student.name}`}
                        title="Editar alumno"
                      >
                        <EditIcon />
                      </Link>
                      <Link
                        className="student-roster-table__action"
                        href={`/trainer/assignments/new?studentId=${student.id}`}
                        aria-label={`Asignar una plantilla a ${student.name}`}
                        title="Asignar rutina"
                      >
                        <MessageIcon />
                      </Link>
                      <Link
                        className="student-roster-table__action"
                        href={`/trainer/students/${student.id}/metrics`}
                        aria-label={`Ver métricas de ${student.name}`}
                        title="Ver métricas"
                      >
                        <MetricsIcon />
                      </Link>

                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </div>
  )
}
