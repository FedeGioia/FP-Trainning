import type { HTMLAttributes, ReactNode } from 'react'

import { trainerClassNames } from './class-names'

type TrainerSurfaceProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
  as?: 'article' | 'aside' | 'div' | 'section'
}

export function TrainerSurface({ as: Tag = 'section', children, className, ...props }: TrainerSurfaceProps) {
  return <Tag className={trainerClassNames('trainer-surface', className)} {...props}>{children}</Tag>
}
