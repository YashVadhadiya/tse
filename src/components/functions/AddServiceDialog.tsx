import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
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
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { getIcon } from '@/components/icon/FunctionIcon'
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
  const [category, setCategory] = useState('all')
  const [tab, setTab] = useState<'catalog' | 'custom'>('catalog')
  const [custom, setCustom] = useState({ name: '', description: '', price: '' })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return catalog.services.filter((s) => {
      const matchQ =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q)
      const matchC = category === 'all' || s.category === category
      return matchQ && matchC
    })
  }, [query, category])

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
            Pick from the service catalog or create a custom service.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-1 flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          {(['catalog', 'custom'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
                tab === t
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t === 'catalog' ? 'Service Catalog' : 'Custom Service'}
            </button>
          ))}
        </div>

        {tab === 'catalog' ? (
          <>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services… e.g. stage, DJ, mandap"
                className="h-10 pl-9"
              />
            </div>
            <ScrollArea className="h-48 -mr-1 pr-1">
              <div className="flex flex-wrap gap-1.5 pb-2">
                <Badge
                  variant={category === 'all' ? 'default' : 'secondary'}
                  className={cn('cursor-pointer', category !== 'all' && 'hover:bg-slate-200')}
                  onClick={() => setCategory('all')}
                >
                  All
                </Badge>
                {catalog.categories.map((c) => {
                  const Icon = getIcon(c.icon)
                  return (
                    <Badge
                      key={c.id}
                      variant={category === c.id ? 'default' : 'secondary'}
                      className={cn(
                        'gap-1 cursor-pointer',
                        category !== c.id && 'hover:bg-slate-200',
                      )}
                      onClick={() => setCategory(c.id)}
                    >
                      <Icon className="size-3" />
                      {c.name}
                    </Badge>
                  )
                })}
              </div>
              <div className="space-y-1">
                {filtered.map((s) => (
                  <div
                    key={s.name}
                    className="group flex cursor-pointer items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 transition-colors hover:border-violet-200 hover:bg-violet-50/50"
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
                    <span className="flex size-6 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                      <Plus className="size-3.5" />
                    </span>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No services match “{query}”. Try a custom service.
                  </p>
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="custom-name">Service Name *</Label>
              <Input
                id="custom-name"
                value={custom.name}
                onChange={(e) => setCustom({ ...custom, name: e.target.value })}
                placeholder="e.g. Garba Stick Distribution"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="custom-desc">Short Description</Label>
              <Input
                id="custom-desc"
                value={custom.description}
                onChange={(e) => setCustom({ ...custom, description: e.target.value })}
                placeholder="e.g. Dandiya sticks for all guests"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="custom-price">Price (₹)</Label>
              <Input
                id="custom-price"
                type="number"
                min={0}
                value={custom.price}
                onChange={(e) => setCustom({ ...custom, price: e.target.value })}
                placeholder="e.g. 8000"
              />
            </div>
            <Button onClick={handleCustom} disabled={!custom.name.trim()} className="w-full">
              <Plus />
              Add Custom Service
            </Button>
          </div>
        )}

        <Separator />
        <p className="text-center text-xs text-muted-foreground">
          Tip: use{" "}
          <button
            onClick={() => setTab('catalog')}
            className="font-medium text-violet-600 hover:underline"
          >
            the catalog
          </button>{" "}
          for standard services — prices can be edited after adding.
        </p>
      </DialogContent>
    </Dialog>
  )
}
