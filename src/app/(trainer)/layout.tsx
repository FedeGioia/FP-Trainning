import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { RoleShell } from '@/components/layout/role-shell'

export default async function TrainerLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login?callbackUrl=/trainer')
  }

  if (session.user.role !== 'trainer') {
    redirect(`/${session.user.role}`)
  }

  return (
    <RoleShell
      role="trainer"
      title="Trainer"
      description="Experiencia desktop-first para alumnos, ejercicios, plantillas y seguimiento."
      navItems={[
        { href: '/trainer', label: 'Dashboard' },
        { href: '/trainer/students', label: 'Alumnos' },
        { href: '/trainer/exercises', label: 'Ejercicios' },
        { href: '/trainer/templates', label: 'Plantillas' },
        { href: '/trainer/assignments', label: 'Asignaciones' },
      ]}
    >
      {children}
    </RoleShell>
  )
}
