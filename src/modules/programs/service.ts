import { db } from '@/lib/db'
import { programCatalog } from '@/lib/constants/programs'

import type { ProgramSummary } from './types'

export async function listProgramCatalog(): Promise<ProgramSummary[]> {
  try {
    const programs = await db.program.findMany({
      orderBy: { name: 'asc' },
    })

    if (programs.length === 0) {
      throw new Error('empty-programs')
    }

    return programs.map((program) => ({
      id: program.id,
      code: program.code,
      name: program.name,
      description: program.description,
      active: program.active,
    }))
  } catch {
    return programCatalog.map((program) => ({
      id: program.code,
      code: program.code,
      name: program.name,
      description: program.description,
      active: true,
    }))
  }
}
