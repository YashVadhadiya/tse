import { useMemo, useState } from 'react'
import { Search, Star } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { getIcon } from '@/components/icon/FunctionIcon'
import { IconTile } from '@/components/ui/icon-tile'
import functionTemplates from '@/data/functions.json'
import type { FunctionTemplate } from '@/types'

interface AddFunctionDialogProps {
  trigger: React.ReactNode
  onAdd: (type?: string) => void
}

const templates = functionTemplates as FunctionTemplate[]

export function AddFunctionDialog({ trigger, onAdd }: AddFunctionDialogProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return templates
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q),
    )
  }, [query])

  const pick = (type?: string) => {
    onAdd(type)
    setOpen(false)
    setQuery('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a Function</DialogTitle>
          <DialogDescription>
            Every event has one or more functions. Pick a template or create a
            custom function.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search functions… e.g. haldi, garba, reception"
            className="h-10 pl-9"
          />
        </div>

        <ScrollArea className="h-72 -mr-1 pr-1">
          <div className="grid gap-2 sm:grid-cols-2">
            {filtered.map((t) => {
              const Icon = getIcon(t.icon)
              return (
                <button
                  key={t.type}
                  onClick={() => pick(t.type)}
                  className="group flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-left transition-all hover:border-violet-300 hover:bg-violet-50/50 hover:shadow-sm cursor-pointer"
                >
                  <IconTile icon={Icon} size="sm" className="transition-transform group-hover:scale-105" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {t.description}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-violet-600">
                      {t.services.length} default services
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => pick(undefined)}
        >
          <Star />
          Add Custom Function
        </Button>
      </DialogContent>
    </Dialog>
  )
}
