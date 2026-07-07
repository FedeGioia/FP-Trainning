'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { signIn } from 'next-auth/react'

type LoginFormProps = {
  callbackUrl?: string
}

export function LoginForm({ callbackUrl = '/' }: LoginFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  return (
    <form
      className="card stack login-form"
      onSubmit={(event) => {
        event.preventDefault()
        setError(null)

        const formData = new FormData(event.currentTarget)
        const email = String(formData.get('email') ?? '')
        const password = String(formData.get('password') ?? '')

        startTransition(async () => {
          const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
            redirectTo: callbackUrl,
          })

          if (result?.error) {
            setError('Credenciales inválidas o usuario sin acceso.')
            return
          }

          router.push(result?.url || callbackUrl)
          router.refresh()
        })
      }}
    >
      <div className="stack" style={{ gap: '0.35rem' }}>
        <h2 className="section-title">Ingresá a tu cuenta</h2>
        <p className="muted">Usá una cuenta local o tus credenciales reales.</p>
      </div>

      {error ? <span className="status status--error">{error}</span> : null}

      <label className="field">
        <span>Email</span>
        <input name="email" type="email" placeholder="trainer@fptraining.local" required />
      </label>

      <label className="field">
        <span>Password</span>
        <input name="password" type="password" placeholder="••••••••" required />
      </label>

      <button className="button button-primary" type="submit" disabled={isPending}>
        {isPending ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )
}
