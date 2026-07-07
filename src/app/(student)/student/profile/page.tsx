import { auth } from '@/auth'
import Link from 'next/link'
import { ProgramBadge, getProgramToneClass } from '@/components/ui/program-badge'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { programCodes } from '@/lib/domain/program-codes'
import { getStudentProfile } from '@/modules/users'

type StudentProfilePageProps = {
  searchParams?: Promise<{
    profile?: string
    password?: string
    error?: string
  }>
}

export default async function StudentProfilePage({ searchParams }: StudentProfilePageProps) {
  const session = await auth()
  const params = (await searchParams) ?? {}
  const profile = await getStudentProfile(session?.user?.id || session?.user?.email || undefined)
  const enrolledProgramCodes = new Set(profile?.programCodes ?? [])

  if (!profile) {
    return (
      <div className="stack">
        <section className="student-day-hero stack">
          <span className="eyebrow">Perfil</span>
          <h1 className="student-title">No pudimos cargar tu perfil</h1>
          <p className="student-subtitle">Volvé a intentar en un momento.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="student-day-view stack">
      <section className="student-day-hero stack">
        <span className="eyebrow">Perfil</span>
        <div className="stack" style={{ gap: '0.25rem' }}>
          <h1 className="student-title">{profile.name}</h1>
          <p className="student-subtitle">{profile.email}</p>
        </div>

        {params.profile ? <span className="status status--ok">Perfil actualizado correctamente.</span> : null}
        {params.password ? <span className="status status--ok">Contraseña actualizada correctamente.</span> : null}
        {params.error ? <span className="status status--error">{decodeURIComponent(params.error)}</span> : null}
      </section>

      <section className="student-day-list">
        <article className="student-day-card" style={{ paddingBottom: '1.35rem' }}>
          <div className="student-day-card__top">
            <div className="stack" style={{ gap: '0.2rem' }}>
              <span className="muted">Datos de cuenta</span>
              <strong>Editar nombre o email</strong>
            </div>
          </div>

          <div className="stack">
            <div className="stack" style={{ gap: '0.15rem' }}>
              <span className="muted">Nombre</span>
              <strong>{profile.name}</strong>
            </div>
            <div className="stack" style={{ gap: '0.15rem' }}>
              <span className="muted">Email</span>
              <strong>{profile.email}</strong>
            </div>
            <Link href="/student/profile/edit" className="button button-primary">
              Editar perfil
            </Link>
          </div>
        </article>

        <article className="student-day-card">
          <div className="student-day-card__top">
            <div className="stack" style={{ gap: '0.2rem' }}>
              <span className="muted">Seguridad</span>
              <strong>Cambiar contraseña</strong>
            </div>
          </div>

          <div className="stack">
            <Link href="/student/profile/password" className="button button-secondary">
              Cambiar contraseña
            </Link>
          </div>
        </article>

        <article className="student-day-card">
          <div className="student-day-card__top">
            <div className="stack" style={{ gap: '0.2rem' }}>
              <span className="muted">Membresías</span>
              <strong>{profile.programCodes.length} activas</strong>
            </div>
          </div>

          <ul className="program-membership-list">
            {programCodes.map((program) => {
              const isEnrolled = enrolledProgramCodes.has(program.code)

              return (
                <li
                  key={program.code}
                  className={`program-membership-list__item ${getProgramToneClass(program.code)}${isEnrolled ? ' is-active' : ' is-inactive'}`}
                >
                  <span
                    className={`program-membership-list__icon${isEnrolled ? ' is-active' : ' is-inactive'}`}
                    aria-hidden="true"
                  >
                    {isEnrolled ? '✓' : '✕'}
                  </span>

                  <div className="stack" style={{ gap: '0.2rem', flex: 1 }}>
                    <div className="role-nav" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong>{program.name}</strong>
                      <ProgramBadge code={program.code} />
                    </div>
                    <span className="muted">{program.description}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </article>

        <article className="student-day-card">
          <div className="student-day-card__top">
            <div className="stack" style={{ gap: '0.2rem' }}>
              <span className="muted">Cuenta</span>
              <strong>Salir de la app</strong>
            </div>
          </div>

          <SignOutButton />
        </article>

      </section>
    </div>
  )
}
