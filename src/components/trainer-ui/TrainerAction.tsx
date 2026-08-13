import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { trainerClassNames } from './class-names'

type TrainerActionVariant = 'primary' | 'secondary' | 'quiet'

type TrainerActionBaseProps = {
  children: ReactNode
  className?: string
  variant?: TrainerActionVariant
}

type TrainerActionLinkProps = TrainerActionBaseProps & {
  href: string
}

type TrainerActionButtonProps = TrainerActionBaseProps & ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: never
}

export type TrainerActionProps = TrainerActionLinkProps | TrainerActionButtonProps

export function TrainerAction({ children, className, variant = 'secondary', ...props }: TrainerActionProps) {
  const actionClassName = trainerClassNames('trainer-action', `trainer-action--${variant}`, className)

  if ('href' in props && typeof props.href === 'string') {
    return <Link className={actionClassName} href={props.href}>{children}</Link>
  }

  return <button className={actionClassName} {...props}>{children}</button>
}
