import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { RoleShell } from '@/components/layout/role-shell'

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin')
  }

  if (session.user.role !== 'admin') {
    redirect(`/${session.user.role}`)
  }

  return (
    <RoleShell
      role="admin"
      title="Admin"
      description="Gestión operativa global de usuarios, programas y catálogo base."
      navItems={[
        { href: '/admin', label: 'Dashboard' },
        { href: '/admin/users', label: 'Usuarios' },
        { href: '/admin/programs', label: 'Programas' },
      ]}
    >
      {children}
    </RoleShell>
  )
}
