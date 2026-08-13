import type { HTMLAttributes, ReactNode } from 'react'

import { trainerClassNames } from './class-names'

type TrainerNoticeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode
  tone?: 'ok' | 'error'
}

export function TrainerNotice({ children, className, tone = 'ok', ...props }: TrainerNoticeProps) {
  return <span className={trainerClassNames('trainer-notice', `trainer-notice--${tone}`, className)} {...props}>{children}</span>
}
