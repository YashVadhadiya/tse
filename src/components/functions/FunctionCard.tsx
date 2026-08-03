import { useState } from 'react'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { getIcon } from '@/components/icon/FunctionIcon'
import { IconTile } from '@/components/ui/icon-tile'
import { AddServiceDialog } from '@/components/functions/AddServiceDialog'
import { ServiceRow } from '@/components/functions/ServiceRow'
import { PricingEditor } from '@/components/functions/PricingEditor'
import { cn } from '@/utils/cn'
import { formatINR, functionTotal, serviceCount } from '@/utils/format'
import type { FunctionSection } from '@/types'
import type { QuotationActions } from '@/hooks/useQuotation'

interface FunctionCardProps {
  fn: FunctionSection
  index: number
  actions: Pick<
    QuotationActions,
    | 'renameFunction'
    | 'removeFunction'
    | 'setFunctionNotes'
    | 'setFunctionPricingMode'
    | 'setPackagePrice'
    | 'updateService'
    | 'removeService'
    | 'addService'
  >
}

export function FunctionCard({ fn, index, actions }: FunctionCardProps) {
  const [open, setOpen] = useState(index === 0)
  const Icon = getIcon(fn.icon)
  const totalAmount = functionTotal(fn)
  const items = serviceCount(fn)
  const showPricing = fn.pricingMode === 'itemized'

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        className={cn(
          'flex cursor-pointer items-center gap-3 border-b px-4 py-3 transition-colors',
          open ? 'border-slate-200 bg-slate-50/70' : 'border-transparent hover:bg-slate-50',
        )}
        onClick={() => setOpen((v) => !v)}
      >
        <IconTile icon={Icon} size="sm" />
        <div className="min-w-0 flex-1">
          <Input
            value={fn.name}
            onChange={(e) => actions.renameFunction(fn.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="h-8 w-auto min-w-24 max-w-full border-transparent bg-transparent px-1 text-base font-semibold shadow-none focus-visible:bg-white"
          />
          <p className="px-1 text-sm text-muted-foreground">
            {items} services ·{' '}
            <span className="font-semibold text-slate-700">
              {formatINR(totalAmount)}
            </span>
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            actions.removeFunction(fn.id)
          }}
          className="rounded-md p-2 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
          aria-label="Delete function"
        >
          <Trash2 className="size-4" />
        </button>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </div>

      {open && (
        <div className="space-y-4 p-4">
          <PricingEditor
            mode={fn.pricingMode}
            packagePrice={fn.packagePrice}
            itemCount={items}
            onChangeMode={(m) => actions.setFunctionPricingMode(fn.id, m)}
            onChangePackagePrice={(p) => actions.setPackagePrice(fn.id, p)}
          />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">
                Services
              </p>
              <AddServiceDialog
                fnId={fn.id}
                addService={actions.addService}
                trigger={
                  <button className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold text-violet-600 hover:bg-violet-50">
                    <Plus className="size-4" />
                    Add Service
                  </button>
                }
              />
            </div>

            {fn.services.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No services yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {fn.services.map((s) => (
                  <ServiceRow
                    key={s.id}
                    service={s}
                    showPricing={showPricing}
                    onUpdate={(patch) => actions.updateService(fn.id, s.id, patch)}
                    onRemove={() => actions.removeService(fn.id, s.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">
              Notes
            </p>
            <Textarea
              value={fn.notes}
              onChange={(e) => actions.setFunctionNotes(fn.id, e.target.value)}
              rows={2}
              className="text-sm"
            />
          </div>
        </div>
      )}
    </div>
  )
}