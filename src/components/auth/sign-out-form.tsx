import { signOut } from '@/auth'

type SignOutFormProps = {
  className?: string
}

export function SignOutForm({ className }: SignOutFormProps) {
  return (
    <form
      action={async () => {
        'use server'
        await signOut({ redirectTo: '/login' })
      }}
      >
      <button className={`button button-secondary${className ? ` ${className}` : ''}`} type="submit">
        Cerrar sesión
      </button>
    </form>
  )
}
