'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { isNavItemActive, type RoleNavGroup, type RoleNavItem } from './role-navigation'

type RoleNavigationProps = {
  role: 'admin' | 'trainer'
  navItems?: RoleNavItem[]
  navGroups?: RoleNavGroup[]
  quickActions?: RoleNavItem[]
}

function TrainerNavigationIcon({ href }: { href: string }) {
  const paths: Record<string, string> = {
    '/trainer': 'M4 13h5v7H4v-7Zm6-9h5v16h-5V4Zm6 5h4v11h-4V9Z',
    '/trainer/students': 'M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-2v6m3-3h-6',
    '/trainer/assignments': 'M7 3h9l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm8 0v5h5',
    '/trainer/exercises': 'M6 6a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm12 6a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM8.5 9h7M8.5 15h7',
    '/trainer/templates': 'M6 4h12v16H6V4Zm3 4h6m-6 4h6m-6 4h4',
  }
  return <svg className="role-nav__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={paths[href] ?? paths['/trainer']} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

export function RoleNavigation({ role, navItems = [], navGroups = [], quickActions = [] }: RoleNavigationProps) {
  const pathname = usePathname()
  const trainerNavItems = navGroups.flatMap((group) => group.items)

  const renderLink = (item: RoleNavItem, className = 'pill') => {
    const active = isNavItemActive(pathname, item.href, item.exact)

    return (
      <Link key={item.href} className={`${className}${active ? ' is-active' : ''}`} href={item.href} aria-current={active ? 'page' : undefined}>
        {role === 'trainer' ? <TrainerNavigationIcon href={item.href} /> : null}
        {item.label}
      </Link>
    )
  }

  return (
    <>
      {role === 'trainer' ? (
        <nav className="role-nav role-nav--trainer" aria-label={`Navegación ${role}`}>
          {trainerNavItems.map((item) => renderLink(item))}
        </nav>
      ) : navGroups.length > 0 ? (
        <nav className="role-nav-groups" aria-label={`Navegación ${role}`}>
          {navGroups.map((group) => (
            <section key={group.label} className="role-nav-group" aria-labelledby={`role-nav-group-${group.label}`}>
              <span id={`role-nav-group-${group.label}`} className="role-nav-group__label">
                {group.label}
              </span>
              <div className="role-nav">{group.items.map((item) => renderLink(item))}</div>
            </section>
          ))}
        </nav>
      ) : (
        <nav className="role-nav" aria-label={`Navegación ${role}`}>
          {renderLink({ href: '/', label: 'Inicio' })}
          {navItems.map((item) => renderLink(item))}
        </nav>
      )}

      {quickActions.length > 0 ? (
        <section className="role-quick-actions" aria-labelledby="role-quick-actions-title">
          <span id="role-quick-actions-title" className="role-nav-group__label">
            Acciones rápidas
          </span>
          <div className="role-nav">{quickActions.map((item) => renderLink(item, 'pill role-quick-action'))}</div>
        </section>
      ) : null}
    </>
  )
}
