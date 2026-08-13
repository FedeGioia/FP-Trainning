import type { HTMLAttributes, ReactNode } from 'react'

import { trainerClassNames } from './class-names'

type TrainerEmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function TrainerEmptyState({ children, className, ...props }: TrainerEmptyStateProps) {
  return <div className={trainerClassNames('trainer-empty-state', className)} {...props}>{children}</div>
}
