import type { LucideIcon } from 'lucide-react'

import { cn } from '@/utils/cn'

interface IconTileProps {
  icon: LucideIcon
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function IconTile({ icon: Icon, className, size = 'md' }: IconTileProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 ring-1 ring-violet-100',
        size === 'sm' && 'size-7 [&_svg]:size-3.5',
        size === 'md' && 'size-9 [&_svg]:size-4',
        size === 'lg' && 'size-12 [&_svg]:size-6',
        className,
      )}
    >
      <Icon />
    </div>
  )
}
