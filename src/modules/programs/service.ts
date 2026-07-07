import { db } from '@/lib/db'

import type { ProgramSummary } from './types'

export async function listProgramCatalog(): Promise<ProgramSummary[]> {
  try {
    const programs = await db.program.findMany({
      orderBy: { name: 'asc' },
    })

    return programs.map((program) => ({
      id: program.id,
      code: program.code,
      name: program.name,
      description: program.description,
      active: program.active,
    }))
  } catch {
    return []
  }
}
