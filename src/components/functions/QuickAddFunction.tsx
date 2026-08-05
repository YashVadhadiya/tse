import { useState } from 'react'
import { Check, Plus, RotateCcw, Wand2 } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import quickFunctions from '@/data/quickFunctions.json'
import type { QuotationActions } from '@/hooks/useQuotation'

interface QuickAddFunctionProps {
  onAdd: QuotationActions['addFunction']
  addedNames: string[]
  onSamplePriced: () => void
  onSampleTotal: () => void
  onClearAll: () => void
}

const chips = quickFunctions as { name: string; icon: string }[]

export function QuickAddFunction({
  onAdd,
  addedNames,
  onSamplePriced,
  onSampleTotal,
  onClearAll,
}: QuickAddFunctionProps) {
  const [custom, setCustom] = useState('')

  const addCustom = () => {
    const name = custom.trim()
    if (!name) return
    onAdd(name, 'Star')
    setCustom('')
  }

  const isAdded = (name: string) =>
    addedNames.some((n) => n.trim().toLowerCase() === name.trim().toLowerCase())

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
        Quick Add
      </p>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => {
          const added = isAdded(c.name)
          return (
            <button
              key={c.name}
              onClick={() => !added && onAdd(c.name, c.icon)}
              disabled={added}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                added
                  ? 'cursor-default border-violet-600 bg-violet-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700',
              )}
            >
              {added ? (
                <Check className="size-3.5" />
              ) : (
                <Plus className="size-3.5 text-violet-600" />
              )}
              {c.name}
            </button>
          )
        })}
      </div>
      <div className="mt-3 flex gap-2">
        <Input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addCustom()
          }}
          placeholder="Type a custom function name…"
          className="h-9 bg-white text-sm"
        />
        <Button
          size="sm"
          onClick={addCustom}
          disabled={!custom.trim()}
          className="h-9 shrink-0"
        >
          <Plus className="size-4" />
          Add
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-200 pt-3">
        <span className="mr-1 text-xs font-medium text-slate-400">Sample:</span>
        <button
          onClick={onSamplePriced}
          className="flex cursor-pointer items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
        >
          <Wand2 className="size-3.5" />
          Item Prices
        </button>
        <button
          onClick={onSampleTotal}
          className="flex cursor-pointer items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 transition-colors hover:bg-sky-100"
        >
          <Wand2 className="size-3.5" />
          Fixed Total
        </button>
        <button
          onClick={onClearAll}
          className="flex cursor-pointer items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100"
        >
          <RotateCcw className="size-3.5" />
          Clear All Data
        </button>
      </div>
    </div>
  )
}
