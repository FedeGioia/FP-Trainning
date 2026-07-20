import Link from 'next/link'

import { auth } from '@/auth'
import { SectionIntro } from '@/components/ui/section-intro'
import { StatCard } from '@/components/ui/stat-card'
import { ProgramBadge } from '@/components/ui/program-badge'
import { listUsers } from '@/modules/users'

import { adminResetStudentPasswordAction, adminToggleUserStatusAction } from './actions'

type AdminUsersPageProps = {
  searchParams?: Promise<{
    error?: string
    reset?: string
    status?: string
  }>
}

function roleLabel(role: string) {
  switch (role) {
    case 'admin':
      return 'Admin'
    case 'trainer':
      return 'Trainer'
    default:
      return 'Student'
  }
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const params = (await searchParams) ?? {}
  const users = await listUsers()
  const session = await auth()
  const totalUsers = users.length
  const activeUsers = users.filter((user) => user.status === 'ACTIVE').length
  const studentUsers = users.filter((user) => user.role === 'student').length

  return (
    <div className="stack">
      <SectionIntro
        eyebrow="Control"
        title="Usuarios"
        description="Revisá perfiles, estados y contraseñas en un solo lugar."
        actions={
          <Link className="button button-secondary" href="/admin">
            Volver al dashboard
          </Link>
        }
      />

      {params.reset ? <span className="status status--ok">Contraseña actualizada correctamente.</span> : null}
      {params.status ? <span className="status status--ok">Estado del usuario actualizado correctamente.</span> : null}
      {params.error ? <span className="status status--error">{decodeURIComponent(params.error)}</span> : null}

      <div className="grid cards">
        <StatCard label="Usuarios totales" value={totalUsers} detail="Cuentas visibles en la base" />
        <StatCard label="Activos" value={activeUsers} detail="Cuentas habilitadas para entrar" />
        <StatCard label="Students" value={studentUsers} detail="Alumnos que usan la plataforma" />
      </div>

      <section className="stack">
        <div className="section-header">
          <div>
            <h2 className="section-title">Listado real</h2>
            <p className="muted">Estado, rol y una acción rápida para alumnos.</p>
          </div>
        </div>

        <div className="grid cards">
          {users.map((user) => (
            <article key={user.id} className="card stack" style={{ gap: '0.75rem' }}>
              <div className="stack" style={{ gap: '0.35rem' }}>
                <h3 style={{ margin: 0 }}>{user.name}</h3>
                <p className="muted" style={{ margin: 0 }}>
                  {user.email}
                </p>
              </div>

              <div className="role-nav">
                <span className="status status--ok">{roleLabel(user.role)}</span>
                <span className={user.status === 'ACTIVE' ? 'status status--ok' : 'status status--error'}>{user.status}</span>
                {user.mustChangePassword ? <span className="status status--muted">Debe cambiar contraseña</span> : null}
              </div>

              {user.role === 'student' && user.programCodes.length > 0 ? (
                <div className="role-nav">
                  {user.programCodes.map((programCode) => (
                    <ProgramBadge key={programCode} code={programCode} />
                  ))}
                </div>
              ) : null}

              <p className="muted">Alta: {new Date(user.createdAt).toLocaleDateString('es-AR')}</p>

              {session?.user?.id !== user.id ? (
                <form action={adminToggleUserStatusAction}>
                  <input type="hidden" name="userId" value={user.id} />
                  <button className="button button-secondary" type="submit">
                    {user.status === 'ACTIVE' ? 'Desactivar usuario' : 'Activar usuario'}
                  </button>
                </form>
              ) : (
                <span className="muted">Tu propia cuenta no se puede desactivar.</span>
              )}

              {user.role === 'student' ? (
                <form action={adminResetStudentPasswordAction} className="stack" style={{ gap: '0.5rem' }}>
                  <input type="hidden" name="studentId" value={user.id} />

                  <label className="field">
                    <span>Nueva contraseña</span>
                    <input name="password" type="password" minLength={8} placeholder="Mínimo 8 caracteres" required />
                  </label>

                  <button className="button button-secondary" type="submit">
                    Resetear y forzar cambio
                  </button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
