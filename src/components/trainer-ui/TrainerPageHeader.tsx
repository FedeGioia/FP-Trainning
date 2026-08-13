import type { HTMLAttributes, ReactNode } from 'react'

import { trainerClassNames } from './class-names'

type TrainerPageHeaderProps = HTMLAttributes<HTMLDivElement> & {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  titleAs?: 'h1' | 'h2'
}

export function TrainerPageHeader({ eyebrow, title, description, actions, className, titleAs: Title = 'h1', ...props }: TrainerPageHeaderProps) {
  return (
    <div className={trainerClassNames('trainer-page-header', className)} {...props}>
      <div className="trainer-page-header__content">
        {eyebrow ? <span className="eyebrow trainer-page-header__eyebrow">{eyebrow}</span> : null}
        <Title className="trainer-page-header__title">{title}</Title>
        {description ? <p className="trainer-page-header__description">{description}</p> : null}
      </div>
      {actions ? <div className="trainer-page-header__actions">{actions}</div> : null}
    </div>
  )
}
