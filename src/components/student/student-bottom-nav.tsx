'use client'

import type { ReactElement } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type IconProps = {
  className?: string
}

type StudentNavItem = {
  href: string
  label: string
  icon: (props: IconProps) => ReactElement
}

function HomeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 11.5 12 5l8 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 10.8V20h11V10.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TodayIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function ProfileIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="9" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6.5 19a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function isActivePath(pathname: string, href: string) {
  if (href === '/student') {
    return pathname === '/student'
  }

  return pathname.startsWith(href)
}

export function StudentBottomNav() {
  const pathname = usePathname()
  const navItems: StudentNavItem[] = [
    { href: '/student', label: 'Inicio', icon: HomeIcon },
    { href: '/student/today', label: 'Hoy', icon: TodayIcon },
    { href: '/student/profile', label: 'Perfil', icon: ProfileIcon },
  ]

  return (
    <nav className="student-bottom-nav" aria-label="Navegación student">
      {navItems.map((item) => {
        const active = isActivePath(pathname, item.href)

        return (
          <Link key={item.href} className={`student-bottom-nav__item${active ? ' is-active' : ''}`} href={item.href}>
            <span className="student-bottom-nav__icon" aria-hidden="true">
              <item.icon className="student-bottom-nav__svg" />
            </span>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
