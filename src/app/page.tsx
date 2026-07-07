import { redirect } from 'next/navigation'
import Link from 'next/link'

import { auth } from '@/auth'
import { FeatureCard } from '@/components/ui/feature-card'
import { appMetadata } from '@/lib/app-metadata'
import { listProgramCatalog } from '@/modules/programs'

const features = [
  {
    title: 'Rutinas por rol',
    description: 'Cada perfil entra directo a lo que necesita: gestión, planificación o entrenamiento.',
  },
  {
    title: 'Bloques y seguimiento',
    description: 'Plantillas reutilizables, asignaciones por horario y carga de resultados del alumno.',
  },
  {
    title: 'Multi-programa',
    description: 'Training, stretching, running y home conviven en una sola experiencia.',
  },
]

export default async function HomePage() {
  const session = await auth()
  const programs = await listProgramCatalog()

  if (session?.user?.role === 'admin') {
    redirect('/admin')
  }

  if (session?.user?.role === 'trainer') {
    redirect('/trainer')
  }

  if (session?.user?.role === 'student') {
    redirect(session.user.mustChangePassword ? '/student/change-password' : '/student')
  }

  return (
    <main className="page-shell page-shell--public">
      <section className="hero">
        <div className="container stack">
          <span className="eyebrow">Plataforma de entrenamiento</span>
          <h1 className="headline">{appMetadata.name}</h1>
          <p className="lead">
            Organizá rutinas, seguí alumnos y llevá cada programa en una experiencia simple para trainer, student y admin.
          </p>

          <div className="grid cards">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>

          <div className="card stack">
            <h2 className="section-title">Ingresá a la plataforma</h2>
            <p className="muted">Entrá con tu perfil para gestionar el día, revisar rutinas o seguir a tus alumnos.</p>
            <div className="role-nav">
              <Link className="pill" href="/login">
                Login
              </Link>
              <Link className="pill" href="/admin">
                Admin
              </Link>
              <Link className="pill" href="/trainer">
                Trainer
              </Link>
              <Link className="pill" href="/student">
                Student
              </Link>
            </div>
          </div>

          <div className="card stack">
            <h2 className="section-title">Programas base</h2>
            <div className="grid cards">
              {programs.map((program) => (
                <FeatureCard key={program.code} title={program.name} description={program.description ?? undefined} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
