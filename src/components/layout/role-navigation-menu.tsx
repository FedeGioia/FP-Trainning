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

export function RoleNavigation({ role, navItems = [], navGroups = [], quickActions = [] }: RoleNavigationProps) {
  const pathname = usePathname()

  const renderLink = (item: RoleNavItem, className = 'pill') => {
    const active = isNavItemActive(pathname, item.href, item.exact)

    return (
      <Link key={item.href} className={`${className}${active ? ' is-active' : ''}`} href={item.href} aria-current={active ? 'page' : undefined}>
        {item.label}
      </Link>
    )
  }

  return (
    <>
      {navGroups.length > 0 ? (
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
