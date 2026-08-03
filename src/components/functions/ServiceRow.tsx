import { Trash2 } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'
import { formatINR, serviceSubtotal } from '@/utils/format'
import type { ServiceItem } from '@/types'

interface ServiceRowProps {
  service: ServiceItem
  showPricing: boolean
  dragHandle?: React.ReactNode
  onUpdate: (patch: Partial<ServiceItem>) => void
  onRemove: () => void
}

export function ServiceRow({
  service,
  showPricing,
  dragHandle,
  onUpdate,
  onRemove,
}: ServiceRowProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 transition-colors hover:border-slate-200 hover:bg-slate-50/70',
        service.included === false && 'opacity-45',
      )}
    >
      {dragHandle}
      <Checkbox
        checked={service.included !== false}
        onCheckedChange={(v) => onUpdate({ included: v !== false })}
        aria-label="Include in quotation"
      />
      <div className="grid min-w-0 flex-1 grid-cols-1 gap-0.5 sm:grid-cols-[1.2fr_1fr]">
        <Input
          value={service.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Service name"
          className="h-7 border-transparent bg-transparent px-1 text-sm font-medium shadow-none hover:border-slate-200 focus-visible:bg-white"
        />
        <Input
          value={service.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Short description"
          className="hidden h-7 border-transparent bg-transparent px-1 text-xs text-muted-foreground shadow-none hover:border-slate-200 focus-visible:bg-white sm:block"
        />
      </div>
      {showPricing && (
        <>
          <div className="flex w-20 items-center gap-1 text-muted-foreground">
            <span className="text-[10px] font-semibold uppercase">Qty</span>
            <Input
              type="number"
              min={1}
              value={service.qty || 1}
              onChange={(e) =>
                onUpdate({ qty: Math.max(1, Number(e.target.value) || 1) })
              }
              className="h-7 w-14 px-1 text-center text-xs"
            />
          </div>
          <div className="relative hidden items-center sm:flex">
            <span className="pointer-events-none absolute left-2 text-xs text-muted-foreground">
              ₹
            </span>
            <Input
              type="number"
              min={0}
              value={service.price || ''}
              placeholder="0"
              onChange={(e) =>
                onUpdate({ price: Math.max(0, Number(e.target.value) || 0) })
              }
              className="h-7 w-28 pl-6 text-right text-xs font-semibold"
            />
          </div>
          <span className="hidden w-24 text-right text-sm font-semibold tabular-nums md:block">
            {service.included === false
              ? '—'
              : formatINR(serviceSubtotal(service))}
          </span>
        </>
      )}
      <button
        onClick={onRemove}
        className="rounded-md p-1.5 text-slate-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        aria-label="Remove service"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  )
}
