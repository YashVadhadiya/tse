import { BadgeIndianRupee, ListChecks } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'
import type { PricingMode } from '@/types'

interface PricingEditorProps {
  mode: PricingMode
  packagePrice: number
  itemCount: number
  onChangeMode: (mode: PricingMode) => void
  onChangePackagePrice: (price: number) => void
}

const modes: { id: PricingMode; label: string; icon: typeof ListChecks }[] = [
  { id: 'itemized', label: 'Item-wise', icon: ListChecks },
  { id: 'package', label: 'Package', icon: BadgeIndianRupee },
]

export function PricingEditor({
  mode,
  packagePrice,
  itemCount,
  onChangeMode,
  onChangePackagePrice,
}: PricingEditorProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
      <div className="flex items-center gap-1 rounded-lg bg-slate-200/60 p-1">
        {modes.map((m) => {
          const Icon = m.icon
          const active = mode === m.id
          return (
            <button
              key={m.id}
              onClick={() => onChangeMode(m.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
                active
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              {m.label}
              {active && m.id === 'itemized' && (
                <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[11px] font-semibold text-violet-700">
                  {itemCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {mode === 'package' && (
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-base font-semibold text-muted-foreground">
            ₹
          </span>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            value={packagePrice || ''}
            onChange={(e) =>
              onChangePackagePrice(Math.max(0, Number(e.target.value) || 0))
            }
            className="h-10 w-40 pl-8 text-base font-semibold"
            aria-label="Package price"
          />
        </div>
      )}
    </div>
  )
}