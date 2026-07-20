import { redirect } from 'next/navigation'
import { AuthError } from 'next-auth'

import { signIn } from '@/auth'

type LoginFormProps = {
  callbackUrl?: string
}

export function LoginForm({ callbackUrl = '/' }: LoginFormProps) {
  return (
    <form
      className="card stack login-form"
      action={async (formData) => {
        'use server'

        try {
          await signIn('credentials', formData, { redirectTo: callbackUrl })
        } catch (error) {
          if (error instanceof AuthError) {
            redirect('/login?error=auth')
          }

          throw error
        }
      }}
    >
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div className="stack" style={{ gap: '0.35rem' }}>
        <h2 className="section-title">Ingresá a tu cuenta</h2>
        <p className="muted">Usá una cuenta local o tus credenciales reales.</p>
      </div>

      <label className="field">
        <span>Email</span>
        <input name="email" type="email" autoComplete="username" placeholder="trainer@fptraining.local" required />
      </label>

      <label className="field">
        <span>Password</span>
        <input name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
      </label>

      <button className="button button-primary" type="submit">
        Ingresar
      </button>
    </form>
  )
}
