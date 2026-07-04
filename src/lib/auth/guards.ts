import { authConfig } from './config'
import type { AppRole, SessionLike } from './types'

export function hasRequiredRole(session: SessionLike | null, role: AppRole) {
  return session?.user.role === role
}

export function getDefaultRedirect(role: AppRole) {
  return authConfig.defaultRedirectByRole[role]
}
