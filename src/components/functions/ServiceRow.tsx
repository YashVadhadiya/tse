import { Trash2 } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/utils/cn'
import type { ServiceItem } from '@/types'

interface ServiceRowProps {
  service: ServiceItem
  showPricing: boolean
  autoFocus?: boolean
  onUpdate: (patch: Partial<ServiceItem>) => void
  onRemove: () => void
}

export function ServiceRow({
  service,
  showPricing,
  autoFocus,
  onUpdate,
  onRemove,
}: ServiceRowProps) {
  return (
    <div
      className={cn(
        'space-y-2 rounded-xl border border-slate-100 bg-white p-2.5',
        service.included === false && 'opacity-45',
      )}
    >
      <Textarea
        value={service.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        rows={2}
        placeholder="Type your note here…"
        aria-label="Service note"
        autoFocus={autoFocus}
        className="min-h-[52px] text-sm"
      />
      {showPricing ? (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
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
              className="h-9 w-32 pl-6 text-right text-sm font-semibold"
              placeholder="0"
              aria-label="Price"
            />
          </div>
          <button
            onClick={onRemove}
            className="ml-auto rounded-md p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
            aria-label="Remove service"
          >
            <Trash2 className="size-5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-end">
          <button
            onClick={onRemove}
            className="rounded-md p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
            aria-label="Remove service"
          >
            <Trash2 className="size-5" />
          </button>
        </div>
      )}
    </div>
  )
}
