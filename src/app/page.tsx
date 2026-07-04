import { redirect } from 'next/navigation'
import Link from 'next/link'

import { auth } from '@/auth'
import { FeatureCard } from '@/components/ui/feature-card'
import { appMetadata } from '@/lib/app-metadata'
import { programCatalog } from '@/lib/constants/programs'

const features = [
  {
    title: 'Rutas por rol',
    description: 'Una sola app con experiencia separada para admin, trainer y student.',
  },
  {
    title: 'Plantillas y bloques',
    description: 'Modelo listo para rutinas con secciones internas, snapshot y resultados.',
  },
  {
    title: 'Base para Prisma',
    description: 'Schema inicial alineado al Excel y preparado para crecer sin humo enterprise.',
  },
]

export default async function HomePage() {
  const session = await auth()

  if (session?.user?.role === 'admin') {
    redirect('/admin')
  }

  if (session?.user?.role === 'trainer') {
    redirect('/trainer')
  }

  if (session?.user?.role === 'student') {
    redirect('/student')
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="container stack">
          <span className="eyebrow">MVP bootstrap listo</span>
          <h1 className="headline">{appMetadata.name}</h1>
          <p className="lead">
            Base inicial de la web app para gestión de rutinas, seguimiento de alumnos y operación multi-programa.
          </p>

          <div className="grid cards">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>

          <div className="card stack">
            <h2 className="section-title">Entradas de prueba</h2>
            <p className="muted">Estas rutas son placeholders para seguir implementando por rol.</p>
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
              {programCatalog.map((program) => (
                <FeatureCard key={program.code} title={program.name} description={program.description} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
