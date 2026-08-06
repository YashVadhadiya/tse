import { useState } from 'react'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { ServiceRow } from '@/components/functions/ServiceRow'
import { FunctionPhotos } from '@/components/functions/FunctionPhotos'
import { cn } from '@/utils/cn'
import { formatINRFull } from '@/utils/format'
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
    | 'setFunctionPhotos'
    | 'setFunctionTotal'
    | 'updateService'
    | 'removeService'
    | 'addService'
  >
}

export function FunctionCard({ fn, index, actions }: FunctionCardProps) {
  const [open, setOpen] = useState(index === 0)
  const [autoFocusId, setAutoFocusId] = useState<string | null>(null)
  const hasPrice = fn.services.some((s) => (s.price || 0) > 0)
  const autoTotal = fn.services.reduce((sum, s) => sum + (s.price || 0), 0)

  const handleAddService = () => {
    const id = actions.addService(fn.id, {
      name: '',
      price: 0,
      included: true,
    })
    setAutoFocusId(id)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        className={cn(
          'flex cursor-pointer items-center gap-3 border-b px-4 py-3 transition-colors',
          open ? 'border-slate-200 bg-slate-50/70' : 'border-transparent hover:bg-slate-50',
        )}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0 flex-1">
          <Input
            value={fn.name}
            onChange={(e) => actions.renameFunction(fn.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="h-8 w-auto min-w-24 max-w-full border-transparent bg-transparent px-1 text-base font-semibold shadow-none focus-visible:bg-white"
          />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            actions.removeFunction(fn.id)
          }}
          className="rounded-md p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
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
          <div>
            <FunctionPhotos
              photos={fn.photos}
              onAdd={(dataUrls) =>
                actions.setFunctionPhotos(fn.id, [...fn.photos, ...dataUrls])
              }
              onRemove={(index) =>
                actions.setFunctionPhotos(
                  fn.id,
                  fn.photos.filter((_, i) => i !== index),
                )
              }
            />
          </div>

          <Separator />

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">
              Services
            </p>

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
                    showPricing
                    autoFocus={s.id === autoFocusId}
                    onUpdate={(patch) => actions.updateService(fn.id, s.id, patch)}
                    onRemove={() => actions.removeService(fn.id, s.id)}
                  />
                ))}
              </div>
            )}

            <button
              onClick={handleAddService}
              className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 py-2 text-sm font-semibold text-violet-600 transition-colors hover:border-violet-300 hover:bg-violet-50"
            >
              <Plus className="size-4" />
              Add
            </button>
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

          <Separator />

          <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
            <span className="text-base font-semibold text-slate-700">
              Total
            </span>
            {hasPrice ? (
              <span className="text-lg font-bold text-violet-700">
                {formatINRFull(autoTotal)}
              </span>
            ) : (
              <div className="relative w-40">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-base font-semibold text-muted-foreground">
                  ₹
                </span>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={fn.total || ''}
                  onChange={(e) =>
                    actions.setFunctionTotal(
                      fn.id,
                      Math.max(0, Number(e.target.value) || 0),
                    )
                  }
                  placeholder="0"
                  className="h-10 w-full bg-white pr-3 pl-8 text-right text-base font-bold"
                  aria-label="Manual total"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}