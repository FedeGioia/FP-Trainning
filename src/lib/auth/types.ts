export type AppRole = 'admin' | 'trainer' | 'student'

export type AuthUser = {
  id: string
  email: string
  name?: string | null
  role: AppRole
}

export type SessionLike = {
  user: AuthUser
  expiresAt?: string
}
