export type RoleNavItem = {
  href: string
  label: string
  exact?: boolean
}

export type RoleNavGroup = {
  label: string
  items: RoleNavItem[]
}

export function isNavItemActive(pathname: string, href: string, exact = false) {
  return pathname === href || (!exact && href !== '/' && pathname.startsWith(`${href}/`))
}
