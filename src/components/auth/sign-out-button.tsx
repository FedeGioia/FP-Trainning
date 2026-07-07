'use client'

import { signOut } from 'next-auth/react'

export function SignOutButton() {
  return (
    <button
      className="button button-primary"
      type="button"
      onClick={() => {
        void signOut({ redirectTo: '/login' })
      }}
    >
      Cerrar sesión
    </button>
  )
}
