import { Trash2 } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'
import { formatINR, serviceSubtotal } from '@/utils/format'
import type { ServiceItem } from '@/types'

interface ServiceRowProps {
  service: ServiceItem
  showPricing: boolean
  onUpdate: (patch: Partial<ServiceItem>) => void
  onRemove: () => void
}

export function ServiceRow({
  service,
  showPricing,
  onUpdate,
  onRemove,
}: ServiceRowProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-slate-100 bg-white p-2.5 sm:flex-row sm:items-center sm:gap-3',
        service.included === false && 'opacity-45',
      )}
    >
      <Input
        value={service.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        className="h-9 flex-1 border-slate-200 text-sm font-medium"
        aria-label="Service name"
      />
      <div className="flex items-center gap-2">
        {showPricing && (
          <>
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400">Qty</span>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                value={service.qty || 1}
                onChange={(e) =>
                  onUpdate({ qty: Math.max(1, Number(e.target.value) || 1) })
                }
                className="h-9 w-16 px-1 text-center text-sm"
                aria-label="Quantity"
              />
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-sm text-slate-400">
                ₹
              </span>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                value={service.price || ''}
                onChange={(e) =>
                  onUpdate({ price: Math.max(0, Number(e.target.value) || 0) })
                }
                className="h-9 w-28 pl-6 text-right text-sm font-semibold"
                aria-label="Price"
              />
            </div>
            <span className="w-20 text-right text-sm font-semibold tabular-nums text-slate-700">
              {service.included === false
                ? '—'
                : formatINR(serviceSubtotal(service))}
            </span>
          </>
        )}
        <button
          onClick={onRemove}
          className="ml-auto rounded-md p-2 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500 sm:ml-0"
          aria-label="Remove service"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  )
}