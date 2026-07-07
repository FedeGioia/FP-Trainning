import type { StudentSummary } from '@/modules/users'
import Link from 'next/link'

import { resetStudentPasswordAction } from '@/app/(trainer)/trainer/students/actions'
import { ProgramBadge } from './program-badge'

type StudentCardProps = {
  student: StudentSummary
}

export function StudentCard({ student }: StudentCardProps) {
  return (
    <article className="card stack student-card">
      <div className="student-card__header">
        <div className="stack" style={{ gap: '0.3rem' }}>
          <h3 className="student-card__name">{student.name}</h3>
          <p className="muted" style={{ margin: 0 }}>
            {student.email}
          </p>
        </div>

        <span className="status status--muted">{student.programCodes.length} programas</span>
      </div>

      <div className="student-card__programs">
        {student.programCodes.map((programCode) => (
          <ProgramBadge key={programCode} code={programCode} />
        ))}
      </div>

      <div className="student-card__actions">
        <Link className="pill" href={`/trainer/assignments/manual?studentId=${student.id}`}>
          Asignar manual
        </Link>
        <Link className="pill" href={`/trainer/assignments/new?studentId=${student.id}`}>
          Asignar plantilla
        </Link>
      </div>

      <details className="reveal-toggle student-card__reset">
        <summary>Resetear contraseña</summary>
        <form className="stack reveal-toggle__body" action={resetStudentPasswordAction} style={{ gap: '0.6rem' }}>
          <input type="hidden" name="studentId" value={student.id} />

          <label className="field">
            <span>Nueva contraseña</span>
            <input name="password" type="password" placeholder="Mínimo 8 caracteres" minLength={8} required />
          </label>

          <button className="button button-secondary" type="submit">
            Resetear y forzar cambio
          </button>

          <span className="muted">El alumno va a tener que cambiarla en el próximo login.</span>
        </form>
      </details>
    </article>
  )
}
