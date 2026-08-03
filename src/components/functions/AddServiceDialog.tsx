import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import servicesCatalog from '@/data/services.json'
import { cn } from '@/utils/cn'
import { formatINR } from '@/utils/format'
import type { QuotationActions } from '@/hooks/useQuotation'

interface AddServiceDialogProps {
  fnId: string
  addService: QuotationActions['addService']
  trigger: React.ReactNode
}

const catalog = servicesCatalog as {
  categories: { id: string; name: string; icon: string }[]
  services: { name: string; description: string; price: number; category: string }[]
}

export function AddServiceDialog({ fnId, addService, trigger }: AddServiceDialogProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'catalog' | 'custom'>('catalog')
  const [custom, setCustom] = useState({ name: '', description: '', price: '' })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return catalog.services
    return catalog.services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q),
    )
  }, [query])

  const handleAdd = (s: (typeof catalog.services)[number]) => {
    addService(fnId, {
      name: s.name,
      description: s.description,
      price: s.price,
      qty: 1,
      category: s.category,
      included: true,
    })
    toast.success(`Added "${s.name}"`)
  }

  const handleCustom = () => {
    if (!custom.name.trim()) return
    addService(fnId, {
      name: custom.name.trim(),
      description: custom.description.trim(),
      price: Math.max(0, Number(custom.price) || 0),
      qty: 1,
      included: true,
    })
    toast.success('Custom service added')
    setCustom({ name: '', description: '', price: '' })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Services</DialogTitle>
          <DialogDescription>
            Pick a service or add your own.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-1 flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          {(['catalog', 'custom'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                tab === t
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t === 'catalog' ? 'Catalog' : 'Custom'}
            </button>
          ))}
        </div>

        {tab === 'catalog' ? (
          <>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 pl-9"
              />
            </div>
            <ScrollArea className="h-72 -mr-1 pr-1">
              <div className="space-y-1">
                {filtered.map((s) => (
                  <div
                    key={s.name}
                    className="group flex cursor-pointer items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5 transition-colors hover:border-violet-200 hover:bg-violet-50/50"
                    onClick={() => handleAdd(s)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.name}</p>
                      {s.description && (
                        <p className="truncate text-xs text-muted-foreground">
                          {s.description}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-violet-700">
                      {formatINR(s.price)}
                    </span>
                    <span className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                      <Plus className="size-4" />
                    </span>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No matching services.
                  </p>
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="custom-name" className="text-sm text-slate-600">
                Service Name *
              </Label>
              <Input
                id="custom-name"
                value={custom.name}
                onChange={(e) => setCustom({ ...custom, name: e.target.value })}
                className="h-11 text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="custom-desc" className="text-sm text-slate-600">
                Short Description
              </Label>
              <Input
                id="custom-desc"
                value={custom.description}
                onChange={(e) => setCustom({ ...custom, description: e.target.value })}
                className="h-11 text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="custom-price" className="text-sm text-slate-600">
                Price (₹)
              </Label>
              <Input
                id="custom-price"
                type="number"
                inputMode="numeric"
                min={0}
                value={custom.price}
                onChange={(e) => setCustom({ ...custom, price: e.target.value })}
                className="h-11 text-base"
              />
            </div>
            <Button onClick={handleCustom} disabled={!custom.name.trim()} className="w-full">
              <Plus />
              Add Custom Service
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}