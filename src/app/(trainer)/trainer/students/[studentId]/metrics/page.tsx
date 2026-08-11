import { redirect } from 'next/navigation'

type TrainerStudentMetricsPageProps = {
  params: Promise<{ studentId: string }>
}

export default async function TrainerStudentMetricsPage({ params }: TrainerStudentMetricsPageProps) {
  const { studentId } = await params
  redirect(`/trainer/students/${studentId}`)
}
