import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { compare } from 'bcryptjs'

import { db } from '@/lib/db'

type AppRole = 'admin' | 'trainer' | 'student'

function mapDbRoleToAppRole(role: 'ADMIN' | 'TRAINER' | 'STUDENT'): AppRole {
  switch (role) {
    case 'ADMIN':
      return 'admin'
    case 'TRAINER':
      return 'trainer'
    case 'STUDENT':
      return 'student'
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? '').trim().toLowerCase()
        const password = String(credentials?.password ?? '')

        if (!email || !password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email },
        })

        if (!user || !user.passwordHash || user.status !== 'ACTIVE') {
          return null
        }

        const isValid = await compare(password, user.passwordHash)
        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: mapDbRoleToAppRole(user.role),
          mustChangePassword: user.mustChangePassword,
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.role = user.role
        token.mustChangePassword = user.mustChangePassword
      }

      const userId = token.id ?? token.sub

      if (userId) {
        const dbUser = await db.user.findUnique({
          where: { id: userId },
        })

        if (dbUser) {
          token.name = dbUser.name
          token.email = dbUser.email
          token.role = mapDbRoleToAppRole(dbUser.role)
        }
      }

      return token
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id ?? token.sub ?? ''
        session.user.name = token.name ?? session.user.name ?? null
        session.user.email = token.email ?? session.user.email ?? null
        session.user.role = (token.role as 'admin' | 'trainer' | 'student') ?? 'student'
        session.user.mustChangePassword = token.mustChangePassword ?? false
      }

      return session
    },
  },
})
