import Link from 'next/link'
import type { ReactNode } from 'react'

import { auth } from '@/auth'
import { SignOutForm } from '@/components/auth/sign-out-form'

type NavItem = {
  href: string
  label: string
}

type RoleShellProps = {
  role: 'admin' | 'trainer' | 'student'
  title: string
  description: string
  navItems: NavItem[]
  children: ReactNode
}

export async function RoleShell({ role, title, description, navItems, children }: RoleShellProps) {
  const session = await auth()

  return (
    <div className={`role-shell role-shell--${role}`}>
      {role !== 'student' ? (
        <header className="role-header">
          <div className="container role-header-inner">
            <div className="role-header-panel">
              <div className="stack" style={{ gap: '0.45rem' }}>
                <span className="eyebrow">{role}</span>
                <div className="stack" style={{ gap: '0.3rem' }}>
                  <strong className="role-title">{title}</strong>
                  <p className="muted" style={{ margin: 0 }}>
                    {description}
                  </p>
                </div>
              </div>

              <div className="role-header-chip">
                <span className="muted">Modo</span>
                <strong>{session?.user?.name ?? role}</strong>
              </div>
            </div>

            <div className="role-nav-card">
              <div className="section-header" style={{ alignItems: 'center' }}>
                <span className="muted">Navegación</span>
                <SignOutForm />
              </div>
              <nav className="role-nav" aria-label={`Navegación ${role}`}>
                <Link className="pill" href="/">
                  Inicio
                </Link>
                {navItems.map((item) => (
                  <Link key={item.href} className="pill" href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </header>
      ) : null}

      <main className="role-main">
        <div className="container">{children}</div>
      </main>
    </div>
  )
}
