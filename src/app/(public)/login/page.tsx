import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { LoginForm } from '@/components/auth/login-form'

type LoginPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string
    passwordChanged?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth()
  const params = (await searchParams) ?? {}

  if (session?.user?.role === 'admin') {
    redirect('/admin')
  }

  if (session?.user?.role === 'trainer') {
    redirect('/trainer')
  }

  if (session?.user?.role === 'student') {
    redirect(session.user.mustChangePassword ? '/student/change-password' : '/student')
  }

  return (
    <main className="page-shell page-shell--public page-shell--auth">
      <div className="container hero stack">
        <span className="eyebrow">Acceso</span>
        <h1 className="headline">Entrá a FP-Training</h1>
        <p className="lead">Autenticación con credenciales, roles y redirección automática según tu perfil.</p>

        {params.passwordChanged ? <span className="status status--ok">Contraseña actualizada. Volvé a ingresar con la nueva clave.</span> : null}

        <div className="grid cards login-layout">
          <LoginForm callbackUrl={params.callbackUrl} />

          <div className="card stack">
            <h2 className="section-title">Cuentas locales</h2>
            <div className="list">
              <div className="list-item">
                <div>
                  <strong>Admin</strong>
                  <p className="muted">admin@fptraining.local / admin1234</p>
                </div>
              </div>
              <div className="list-item">
                <div>
                  <strong>Trainer</strong>
                  <p className="muted">trainer@fptraining.local / trainer1234</p>
                </div>
              </div>
              <div className="list-item">
                <div>
                  <strong>Student</strong>
                  <p className="muted">student@fptraining.local / student1234</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
