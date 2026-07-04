import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { RoleShell } from '@/components/layout/role-shell'

export default async function StudentLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login?callbackUrl=/student')
  }

  if (session.user.role !== 'student') {
    redirect(`/${session.user.role}`)
  }

  return (
    <RoleShell
      role="student"
      title="Student"
      description="Experiencia mobile-first para ver bloques del día, ejercicios y resultados."
      navItems={[
        { href: '/student', label: 'Inicio' },
        { href: '/student/today', label: 'Hoy' },
        { href: '/student/history', label: 'Historial' },
      ]}
    >
      {children}
    </RoleShell>
  )
}
