import { PlaceholderPanel } from '@/components/ui/placeholder-panel'

import { changeStudentPasswordAction } from './actions'

type StudentChangePasswordPageProps = {
  searchParams?: Promise<{
    error?: string
  }>
}

export default async function StudentChangePasswordPage({ searchParams }: StudentChangePasswordPageProps) {
  const params = (await searchParams) ?? {}

  return (
    <div className="stack">
      <PlaceholderPanel
        title="Cambiar contraseña"
        description="Tu clave fue reseteada. Elegí una nueva para seguir usando la app."
        titleAs="h1"
      />

      {params.error ? <span className="status status--error">{decodeURIComponent(params.error)}</span> : null}

      <section className="card stack">
        <form action={changeStudentPasswordAction} className="stack">
          <label className="field">
            <span>Nueva contraseña</span>
            <input name="password" type="password" minLength={8} placeholder="Mínimo 8 caracteres" required />
          </label>

          <button className="button button-primary" type="submit">
            Guardar y volver a entrar
          </button>
        </form>
      </section>
    </div>
  )
}
