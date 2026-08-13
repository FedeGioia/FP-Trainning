import type { HTMLAttributes, ReactNode } from 'react'

import { trainerClassNames } from './class-names'

type TrainerMetricCardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
  as?: 'article' | 'div'
}

export function TrainerMetricCard({ as: Tag = 'article', children, className, ...props }: TrainerMetricCardProps) {
  return <Tag className={trainerClassNames('trainer-metric-card', className)} {...props}>{children}</Tag>
}
