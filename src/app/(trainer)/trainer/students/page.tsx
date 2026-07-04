import Link from 'next/link'

import { SectionIntro } from '@/components/ui/section-intro'
import { StatCard } from '@/components/ui/stat-card'
import { StudentCard } from '@/components/ui/student-card'
import { listStudents } from '@/modules/users'

type TrainerStudentsPageProps = {
  searchParams?: Promise<{
    created?: string
  }>
}

export default async function TrainerStudentsPage({ searchParams }: TrainerStudentsPageProps) {
  const params = (await searchParams) ?? {}
  const students = await listStudents()
  const totalMemberships = students.reduce((acc, student) => acc + student.programCodes.length, 0)

  return (
    <div className="stack">
      <SectionIntro
        eyebrow="People"
        title="Alumnos"
        description="Base inicial de alumnos con memberships visibles por programa."
        actions={
          <>
            <Link className="button button-primary" href="/trainer/students/new">
              Nuevo alumno
            </Link>
            <Link className="button button-secondary" href="/trainer">
              Volver al dashboard
            </Link>
          </>
        }
      />

      {params.created ? <span className="status status--ok">Alumno creado correctamente.</span> : null}

      <div className="grid cards">
        <StatCard label="Alumnos visibles" value={students.length} detail="Semilla o lectura real desde Prisma" />
        <StatCard label="Membresías totales" value={totalMemberships} detail="Programas activos por alumno" />
        <StatCard label="Promedio" value={students.length ? (totalMemberships / students.length).toFixed(1) : '0'} detail="Programas por alumno" />
      </div>

      <section className="stack">
        <div className="section-header">
          <div>
            <h2 className="section-title">Alumnos activos</h2>
            <p className="muted">Vista rápida de alumnos y de cómo se distribuyen entre programas.</p>
          </div>
        </div>

        <div className="grid cards">
          {students.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      </section>
    </div>
  )
}
