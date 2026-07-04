export const authConfig = {
  signInPath: '/login',
  defaultRedirectByRole: {
    admin: '/admin',
    trainer: '/trainer',
    student: '/student',
  },
} as const
