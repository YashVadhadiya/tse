import { useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import {
  ChevronDown,
  Copy,
  CopyPlus,
  EllipsisVertical,
  GripVertical,
  Plus,
  Trash2,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import type { FunctionSection, Quotation, ServiceItem } from '@/types'
import type { QuotationActions } from '@/hooks/useQuotation'

interface FunctionCardProps {
  fn: FunctionSection
  index: number
  total: number
  quotation: Quotation
  dragHandle?: React.ReactNode
  actions: Pick<
    QuotationActions,
    | 'renameFunction'
    | 'duplicateFunction'
    | 'removeFunction'
    | 'setFunctionNotes'
    | 'copyServicesFrom'
    | 'setFunctionPricingMode'
    | 'setPackagePrice'
    | 'updateService'
    | 'removeService'
    | 'addService'
    | 'reorderServices'
  >
}

export function FunctionCard({
  fn,
  index,
  total,
  quotation,
  dragHandle,
  actions,
}: FunctionCardProps) {
  const [open, setOpen] = useState(index === 0)
  const Icon = getIcon(fn.icon)
  const totalAmount = functionTotal(fn)
  const items = serviceCount(fn)
  const showPricing = fn.pricingMode === 'itemized'

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        className={cn(
          'flex items-center gap-3 border-b px-4 py-3 cursor-pointer transition-colors',
          open ? 'border-slate-200 bg-slate-50/70' : 'border-transparent hover:bg-slate-50',
        )}
        onClick={() => setOpen((v) => !v)}
      >
        {dragHandle}
        <IconTile icon={Icon} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Input
              value={fn.name}
              onChange={(e) => actions.renameFunction(fn.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="h-7 w-auto min-w-24 max-w-64 border-transparent bg-transparent px-1 text-sm font-semibold shadow-none hover:border-slate-200 focus-visible:bg-white"
            />
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {index + 1} of {total}
            </Badge>
          </div>
          <p className="px-1 text-xs text-muted-foreground">
            {items} services ·{' '}
            {fn.pricingMode === 'package' ? 'Package price' : 'Item-wise pricing'} ·{' '}
            <span className="font-semibold text-slate-700">
              {formatINR(totalAmount)}
            </span>
          </p>
        </div>
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
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Services Included
              </p>
              <AddServiceDialog
                fnId={fn.id}
                addService={actions.addService}
                trigger={
                  <button className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-violet-600 hover:bg-violet-50">
                    <Plus className="size-3.5" />
                    Add Service
                  </button>
                }
              />
            </div>

            {fn.services.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  No services yet
                </p>
                <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground/80">
                  Add services from the catalog or create custom ones. Tip:
                  duplicate a previous function and edit.
                </p>
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={fn.services}
                onReorder={(ordered) => actions.reorderServices(fn.id, ordered)}
                className="space-y-0.5"
              >
                {fn.services.map((s) => (
                  <DraggableService
                    key={s.id}
                    service={s}
                    showPricing={showPricing}
                    actions={actions}
                    fnId={fn.id}
                  />
                ))}
              </Reorder.Group>
            )}
          </div>

          <Separator />

          <div className="flex flex-wrap items-start justify-between gap-3">
            <Textarea
              value={fn.notes}
              onChange={(e) => actions.setFunctionNotes(fn.id, e.target.value)}
              placeholder="Notes for this function (timings, themes, venue details)…"
              rows={2}
              className="max-w-md text-xs"
            />
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-slate-50">
                    <EllipsisVertical className="size-3.5" />
                    More
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Function actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => actions.duplicateFunction(fn.id)}
                  >
                    <CopyPlus className="size-4" />
                    Duplicate Function
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Copy className="size-4" />
                      Copy services from…
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {quotation.functions
                        .filter((f) => f.id !== fn.id)
                        .map((f) => (
                          <DropdownMenuItem
                            key={f.id}
                            onClick={() => actions.copyServicesFrom(fn.id, f.id)}
                          >
                            {f.name} ({f.services.length})
                          </DropdownMenuItem>
                        ))}
                      {quotation.functions.filter((f) => f.id !== fn.id)
                        .length === 0 && (
                        <DropdownMenuItem disabled>
                          No other functions
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => actions.removeFunction(fn.id)}
                  >
                    <Trash2 className="size-4" />
                    Delete Function
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DraggableService({
  service,
  showPricing,
  fnId,
  actions,
}: {
  service: ServiceItem
  showPricing: boolean
  fnId: string
  actions: FunctionCardProps['actions']
}) {
  const controls = useDragControls()
  return (
    <Reorder.Item
      value={service}
      dragListener={false}
      dragControls={controls}
      layout
    >
      <ServiceRow
        service={service}
        showPricing={showPricing}
        dragHandle={
          <GripVertical
            onPointerDown={(e) => {
              controls.start(e)
            }}
            className="size-4 shrink-0 cursor-grab text-slate-200 select-none hover:text-slate-400 active:cursor-grabbing"
          />
        }
        onUpdate={(patch) => actions.updateService(fnId, service.id, patch)}
        onRemove={() => actions.removeService(fnId, service.id)}
      />
    </Reorder.Item>
  )
}
