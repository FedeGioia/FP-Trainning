import type { StudentSummary } from '@/modules/users'

type StudentCardProps = {
  student: StudentSummary
}

export function StudentCard({ student }: StudentCardProps) {
  return (
    <article className="card stack" style={{ gap: '0.75rem' }}>
      <div className="stack" style={{ gap: '0.35rem' }}>
        <h2 style={{ margin: 0 }}>{student.name}</h2>
        <p className="muted" style={{ margin: 0 }}>
          {student.email}
        </p>
      </div>

      <div className="role-nav">
        {student.programCodes.map((programCode) => (
          <span key={programCode} className="status status--ok">
            {programCode}
          </span>
        ))}
      </div>
    </article>
  )
}
