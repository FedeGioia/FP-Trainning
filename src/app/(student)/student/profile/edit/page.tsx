import Link from 'next/link'

import { auth } from '@/auth'
import { getStudentProfile } from '@/modules/users'

import { updateStudentProfileAction } from '../actions'

type StudentProfileEditPageProps = {
  searchParams?: Promise<{
    error?: string
  }>
}

export default async function StudentProfileEditPage({ searchParams }: StudentProfileEditPageProps) {
  const session = await auth()
  const params = (await searchParams) ?? {}
  const profile = await getStudentProfile(session?.user?.id || session?.user?.email || undefined)

  if (!profile) {
    return (
      <div className="stack">
        <section className="student-day-hero stack">
          <span className="eyebrow">Editar Perfil</span>
          <h1 className="student-title">No pudimos cargar tu perfil</h1>
          <p className="student-subtitle">Volvé a intentar en un momento.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="student-day-view stack">
      <section className="student-day-hero stack">
        <span className="eyebrow">Editar Perfil</span>
        <h1 className="student-title">Actualizar información</h1>
        <p className="student-subtitle">Modificá tu nombre o email</p>
        {params.error ? <span className="status status--error">{decodeURIComponent(params.error)}</span> : null}
      </section>

      <section className="student-day-list">
        <article className="student-day-card">
          <form action={updateStudentProfileAction} className="stack">
            <input type="hidden" name="redirectTo" value="/student/profile/edit" />
            <label className="field">
              <span>Nombre</span>
              <input name="name" type="text" defaultValue={profile.name} required />
            </label>

            <label className="field">
              <span>Email</span>
              <input name="email" type="email" defaultValue={profile.email} required />
            </label>

            <button className="button button-primary" type="submit">
              Guardar cambios
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
