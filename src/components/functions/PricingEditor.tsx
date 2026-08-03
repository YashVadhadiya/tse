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

const modes: { id: PricingMode; label: string; hint: string; icon: typeof ListChecks }[] = [
  { id: 'package', label: 'Package Price', hint: 'Single price for the whole function', icon: BadgeIndianRupee },
  { id: 'itemized', label: 'Item-wise Pricing', hint: 'Price of every service', icon: ListChecks },
]

export function PricingEditor({
  mode,
  packagePrice,
  itemCount,
  onChangeMode,
  onChangePackagePrice,
}: PricingEditorProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {modes.map((m) => {
          const Icon = m.icon
          const active = mode === m.id
          return (
            <button
              key={m.id}
              onClick={() => onChangeMode(m.id)}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-all cursor-pointer',
                active
                  ? 'border-violet-300 bg-white text-violet-700 shadow-sm ring-1 ring-violet-200'
                  : 'border-slate-200 bg-white/60 text-muted-foreground hover:border-slate-300 hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              {m.label}
              {active && m.id === 'itemized' && (
                <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">
                  {itemCount} items
                </span>
              )}
            </button>
          )
        })}
      </div>

      {mode === 'package' ? (
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
              ₹
            </span>
            <Input
              type="number"
              min={0}
              value={packagePrice || ''}
              placeholder="0"
              onChange={(e) =>
                onChangePackagePrice(Math.max(0, Number(e.target.value) || 0))
              }
              className="h-11 w-48 pl-8 text-lg font-semibold"
            />
          </div>
          <div className="text-xs leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">Package Price</p>
            <p>
              The PDF shows the included services and a single price. Ideal when
              the client asks only for the final package price.
            </p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Enter a price for every service below. The PDF shows the item-wise
          breakdown with the function subtotal. All service prices can be edited
          inline.
        </p>
      )}
    </div>
  )
}
