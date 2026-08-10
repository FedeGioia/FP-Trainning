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
      description="Alumnos, rutinas y seguimiento."
      navGroups={[
        {
          label: 'Operación',
          items: [
            { href: '/trainer', label: 'Dashboard', exact: true },
            { href: '/trainer/assignments', label: 'Asignaciones' },
            { href: '/trainer/students', label: 'Alumnos' },
          ],
        },
        {
          label: 'Biblioteca',
          items: [
            { href: '/trainer/exercises', label: 'Ejercicios' },
            { href: '/trainer/templates', label: 'Plantillas' },
          ],
        },
      ]}
      quickActions={[
        { href: '/trainer/students/new', label: 'Nuevo alumno' },
        { href: '/trainer/assignments/new', label: 'Asignar rutina' },
        { href: '/trainer/templates/new', label: 'Nueva plantilla' },
        { href: '/trainer/exercises/new', label: 'Nuevo ejercicio' },
      ]}
    >
      {children}
    </RoleShell>
  )
}
