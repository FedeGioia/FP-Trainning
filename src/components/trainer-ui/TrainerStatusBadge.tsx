import type { HTMLAttributes, ReactNode } from 'react'

import { trainerClassNames } from './class-names'

type TrainerStatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode
}

export function TrainerStatusBadge({ children, className, ...props }: TrainerStatusBadgeProps) {
  return <span className={trainerClassNames('trainer-status', className)} {...props}>{children}</span>
}
