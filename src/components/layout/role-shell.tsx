import type { ReactNode } from 'react'

import { auth } from '@/auth'
import { SignOutForm } from '@/components/auth/sign-out-form'
import { RoleNavigation } from '@/components/layout/role-navigation-menu'
import type { RoleNavGroup, RoleNavItem } from '@/components/layout/role-navigation'

type RoleShellProps = {
  role: 'admin' | 'trainer' | 'student'
  title: string
  description: string
  navItems?: RoleNavItem[]
  navGroups?: RoleNavGroup[]
  quickActions?: RoleNavItem[]
  children: ReactNode
}

export async function RoleShell({ role, title, description, navItems, navGroups, quickActions, children }: RoleShellProps) {
  const session = await auth()

  return (
    <div className={`role-shell role-shell--${role}`}>
      {role !== 'student' ? (
        <header className="role-header">
          <div className="container role-header-inner">
            <div className="role-header-panel">
              <div className="role-header-brand">
                <span className="eyebrow">{role}</span>
                <div className="role-header-copy">
                  <strong className="role-title">{title}</strong>
                  <p className="muted role-description">
                    {description}
                  </p>
                </div>
              </div>

              {role !== 'trainer' ? (
                <div className="role-header-chip">
                  <span className="muted">Modo</span>
                  <strong>{session?.user?.name ?? role}</strong>
                </div>
              ) : null}
            </div>

            <div className="role-nav-card">
              {role !== 'trainer' ? (
                <div className="section-header" style={{ alignItems: 'center' }}>
                  <span className="muted">Navegación</span>
                  <SignOutForm />
                </div>
              ) : null}
              <RoleNavigation role={role} navItems={navItems} navGroups={navGroups} quickActions={quickActions} />
            </div>

            {role === 'trainer' ? (
              <div className="role-sidebar-profile">
                <span className="role-sidebar-profile__label">Profesor</span>
                <strong className="role-sidebar-profile__name">{session?.user?.name ?? role}</strong>
                <SignOutForm className="role-sign-out" />
              </div>
            ) : null}
          </div>
        </header>
      ) : null}

      <main className="role-main">
        <div className="container">{children}</div>
      </main>
    </div>
  )
}
