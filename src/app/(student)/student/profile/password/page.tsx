import Link from 'next/link'

import { auth } from '@/auth'
import { getStudentProfile } from '@/modules/users'

import { changeStudentPasswordAction } from '../actions'

type StudentProfilePasswordPageProps = {
  searchParams?: Promise<{
    error?: string
  }>
}

export default async function StudentProfilePasswordPage({ searchParams }: StudentProfilePasswordPageProps) {
  const session = await auth()
  const params = (await searchParams) ?? {}
  const profile = await getStudentProfile(session?.user?.id || session?.user?.email || undefined)

  if (!profile) {
    return (
      <div className="stack">
        <section className="student-day-hero stack">
          <span className="eyebrow">Cambiar Contraseña</span>
          <h1 className="student-title">No pudimos cargar tu perfil</h1>
          <p className="student-subtitle">Volvé a intentar en un momento.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="student-day-view stack">
      <section className="student-day-hero stack">
        <span className="eyebrow">Cambiar Contraseña</span>
        <h1 className="student-title">Actualizar contraseña</h1>
        <p className="student-subtitle">Ingresá tu contraseña actual y la nueva</p>
        {params.error ? <span className="status status--error">{decodeURIComponent(params.error)}</span> : null}
      </section>

      <section className="student-day-list">
        <article className="student-day-card">
          <form action={changeStudentPasswordAction} className="stack">
            <input type="hidden" name="redirectTo" value="/student/profile/password" />
            <label className="field">
              <span>Contraseña actual</span>
              <input name="currentPassword" type="password" required />
            </label>

            <label className="field">
              <span>Nueva contraseña</span>
              <input name="newPassword" type="password" minLength={8} required />
            </label>

            <label className="field">
              <span>Confirmar nueva contraseña</span>
              <input name="confirmPassword" type="password" minLength={8} required />
            </label>

            <button className="button button-primary" type="submit">
              Actualizar contraseña
            </button>

            <Link className="button button-secondary" href="/student/profile">
              Volver al perfil
            </Link>
          </form>
        </article>
      </section>
    </div>
  )
}
