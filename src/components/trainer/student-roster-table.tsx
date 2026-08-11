import Link from 'next/link'

import type { TrainerStudentRosterRow } from '@/modules/trainer-students'
import { ProgramBadge } from '@/components/ui/program-badge'

type StudentRosterTableProps = {
  students: TrainerStudentRosterRow[]
}

function MetricsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 19V10M12 19V5M19 19v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ManualAssignmentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function TemplateAssignmentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8" y="7" width="11" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
              <th className="student-roster-table__email-column">Email</th>
              <th className="student-roster-table__programs-column">Programas</th>
              <th className="student-roster-table__workouts-column">Semana actual</th>
              <th className="student-roster-table__actions-column">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              return (
                <tr key={student.id}>
                  <td className="student-roster-table__student student-roster-table__name-column">
                    <Link
                      className="student-roster-table__student-trigger"
                      href={`/trainer/students/${student.id}`}
                    >
                      {student.name}
                    </Link>
                  </td>
                  <td className="muted student-roster-table__email-column">{student.email}</td>
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
                        : `${student.weekly.completedCount}/${student.weekly.scheduledCount} completadas esta semana · objetivo: ${student.weekly.completedCount}/${student.weekly.goalTarget}`}
                    >
                      {student.weekly.completedCount}/{student.weekly.scheduledCount}
                    </strong>
                  </td>
                  <td className="student-roster-table__actions-column">
                    <div className="student-roster-table__actions">
                      <Link
                        className="student-roster-table__action"
                        href={`/trainer/students/${student.id}`}
                        aria-label={`Ver detalle y seguimiento de ${student.name}`}
                        title="Ver detalle"
                      >
                        <MetricsIcon />
                      </Link>
                      <Link
                        className="student-roster-table__action student-roster-table__action--primary"
                        href={`/trainer/assignments/manual?studentId=${student.id}`}
                        aria-label={`Asignar rutina manualmente a ${student.name}`}
                        title="Asignar manualmente"
                      >
                        <ManualAssignmentIcon />
                      </Link>
                      <Link
                        className="student-roster-table__action"
                        href={`/trainer/assignments/new?studentId=${student.id}`}
                        aria-label={`Asignar plantilla a ${student.name}`}
                        title="Usar plantilla"
                      >
                        <TemplateAssignmentIcon />
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
