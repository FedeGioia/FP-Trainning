import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { auth } from '@/auth'
import { ProgramBadge } from '@/components/ui/program-badge'
import { listProgramCatalog } from '@/modules/programs'
import { getTrainerStudentDetail } from '@/modules/trainer-students'

import { resetStudentPasswordAction, updateStudentProfileAction } from '../actions'

type TrainerStudentDetailPageProps = {
  params: Promise<{ studentId: string }>
  searchParams?: Promise<{ updated?: string; reset?: string; error?: string }>
}

export default async function TrainerStudentDetailPage({ params, searchParams }: TrainerStudentDetailPageProps) {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'trainer') {
    redirect('/login?error=auth')
  }

  const { studentId } = await params
  const feedback = (await searchParams) ?? {}
  const [student, programs] = await Promise.all([
    getTrainerStudentDetail(session.user.id, studentId),
    listProgramCatalog(),
  ])

  if (!student) {
    notFound()
  }

  const goalPercentage = student.weekly.goalCompletionRate === null
    ? null
    : Math.round(student.weekly.goalCompletionRate * 100)
  const scheduledProgress = student.weekly.scheduledCount === 0
    ? 0
    : Math.round((student.weekly.completedCount / student.weekly.scheduledCount) * 100)
  const scheduledProgressWidth = `${Math.min(scheduledProgress, 100)}%`

  return (
    <div className="trainer-students stack">
      <header className="trainer-student-detail__header">
        <Link className="trainer-student-detail__back" href="/trainer/students">
          ← Volver al listado
        </Link>
        <div className="trainer-student-detail__identity">
          <div>
            <span className="eyebrow">Alumno</span>
            <h1>{student.name}</h1>
            <p>{student.email}</p>
          </div>
          <div className="trainer-student-detail__programs" aria-label="Programas activos">
            {student.programCodes.map((programCode) => <ProgramBadge key={programCode} code={programCode} />)}
          </div>
        </div>
      </header>

      {feedback.updated || feedback.reset || feedback.error ? (
        <div className="trainer-students__feedback" aria-live="polite">
          {feedback.updated ? <span className="trainer-students__notice trainer-students__notice--ok">Datos del alumno actualizados correctamente.</span> : null}
          {feedback.reset ? <span className="trainer-students__notice trainer-students__notice--ok">Contraseña actualizada correctamente. El alumno deberá cambiarla al iniciar sesión.</span> : null}
          {feedback.error ? <span className="trainer-students__notice trainer-students__notice--error">{decodeURIComponent(feedback.error)}</span> : null}
        </div>
      ) : null}

      <section className="trainer-student-detail__actions" aria-label="Acciones del alumno">
        <div>
          <span className="eyebrow">Acciones</span>
          <h2>Planificá la próxima sesión</h2>
          <p>Elegí cómo cargar una rutina para {student.name}.</p>
        </div>
        <div className="trainer-student-detail__action-list">
          <Link className="trainer-student-detail__action trainer-student-detail__action--primary" href={`/trainer/assignments/manual?studentId=${student.id}`}>
            <span>Rutina manual</span>
            <strong>Crear desde cero</strong>
            <small>Definí ejercicios y prescripción para este alumno.</small>
          </Link>
          <Link className="trainer-student-detail__action" href={`/trainer/assignments/new?studentId=${student.id}`}>
            <span>Desde plantilla</span>
            <strong>Usar una rutina guardada</strong>
            <small>Partí de una plantilla existente y asignala al alumno.</small>
          </Link>
        </div>
      </section>

      <div className="trainer-student-detail__content">
        <section className="trainer-student-detail__adherence" aria-labelledby="weekly-adherence-title">
          <div className="trainer-student-detail__section-heading">
            <div>
              <span className="eyebrow">Semana actual</span>
              <h2 id="weekly-adherence-title">Adherencia semanal</h2>
            </div>
            <span className="trainer-student-detail__history">{student.assignmentHistoryCount} asignaciones históricas</span>
          </div>

          <div className="trainer-student-detail__adherence-summary">
            <div>
              <span>Completadas</span>
              <strong>{student.weekly.completedCount}</strong>
              <small>de {student.weekly.scheduledCount} programadas</small>
            </div>
            <div>
              <span>Aún no completadas</span>
              <strong>{student.weekly.pendingCount}</strong>
              <small>de las programadas esta semana</small>
            </div>
            <div>
              <span>Objetivo semanal</span>
              <strong>{student.weekly.goalTarget ?? '—'}</strong>
              <small>{goalPercentage === null ? 'Sin objetivo definido' : `${goalPercentage}% alcanzado`}</small>
            </div>
          </div>

          <div className="trainer-student-detail__progress" aria-label={`${student.weekly.completedCount} de ${student.weekly.scheduledCount} rutinas programadas completadas esta semana`}>
            <div className="trainer-student-detail__progress-copy">
              <strong>{student.weekly.scheduledCount === 0 ? 'Sin rutinas programadas esta semana' : `${scheduledProgress}% de las programadas completado`}</strong>
              <span>{student.weekly.scheduledCount === 0 ? 'Asigná una rutina para empezar el seguimiento.' : `${student.weekly.completedCount} completadas · ${student.weekly.pendingCount} aún no completadas`}</span>
            </div>
            <div className="trainer-student-detail__progress-track" aria-hidden="true">
              <span className="trainer-student-detail__progress-value" style={{ width: scheduledProgressWidth }} />
            </div>
          </div>
        </section>

        <div className="trainer-student-detail__management">
          <section className="card stack trainer-student-detail__profile" aria-labelledby="student-profile-title">
            <div>
              <span className="eyebrow">Perfil</span>
              <h2 id="student-profile-title">Datos y programas</h2>
            </div>
            <form className="stack" action={updateStudentProfileAction} style={{ gap: '0.85rem' }}>
              <input type="hidden" name="studentId" value={student.id} />
              <input type="hidden" name="returnTo" value={`/trainer/students/${student.id}`} />

              <label className="field">
                <span>Nombre</span>
                <input name="name" type="text" defaultValue={student.name} required />
              </label>

              <label className="field">
                <span>Email</span>
                <input name="email" type="email" defaultValue={student.email} required />
              </label>

              <label className="field">
                <span>Rutinas esperadas por semana</span>
                <input name="expectedWorkoutsPerWeek" type="number" min={0} step={1} defaultValue={student.expectedWorkoutsPerWeek} required />
                <small>Objetivo global del alumno. Usá 0 si todavía no definiste uno.</small>
              </label>

              <fieldset className="student-modal__programs" aria-describedby="student-programs-help">
                <legend>Programas</legend>
                <div className="student-modal__program-grid">
                  {programs.map((program) => (
                    <label key={program.code} className="check-card student-modal__program-option">
                      <input name="programCodes" type="checkbox" value={program.code} defaultChecked={student.programCodes.includes(program.code)} />
                      <span className="stack" style={{ gap: '0.2rem' }}>
                        <strong>{program.name}</strong>
                        {program.description ? <span className="muted">{program.description}</span> : null}
                      </span>
                    </label>
                  ))}
                </div>
                <span id="student-programs-help" className="muted">Si elegís Training, Stretching o Running, se agrega FP-Home automáticamente según la regla actual del negocio.</span>
              </fieldset>

              <div className="trainer-student-detail__save">
                <span>Los cambios se aplican al perfil y objetivo semanal del alumno.</span>
                <button className="button button-primary" type="submit">Guardar perfil</button>
              </div>
            </form>
          </section>

          <section className="card stack trainer-student-detail__access" aria-labelledby="student-access-title">
            <div>
              <span className="eyebrow">Acceso</span>
              <h2 id="student-access-title">Resetear contraseña</h2>
              <p className="muted">Definí una contraseña temporal. El alumno deberá cambiarla al iniciar sesión.</p>
            </div>
            <form className="stack" action={resetStudentPasswordAction} style={{ gap: '0.85rem' }}>
              <input type="hidden" name="studentId" value={student.id} />
              <input type="hidden" name="returnTo" value={`/trainer/students/${student.id}`} />
              <label className="field">
                <span>Nueva contraseña</span>
                <input name="password" type="password" placeholder="Mínimo 8 caracteres" minLength={8} required />
              </label>
              <div className="trainer-student-detail__save">
                <span>Esta acción reemplaza la contraseña actual.</span>
                <button className="button button-secondary" type="submit">Resetear y forzar cambio</button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
