import { useState } from 'react'
import { Star } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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

  const pick = (type?: string) => {
    onAdd(type)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a Function</DialogTitle>
          <DialogDescription>
            Pick the function for your event.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-72 -mr-1 pr-1">
          <div className="grid gap-2 sm:grid-cols-2">
            {templates.map((t) => {
              const Icon = getIcon(t.icon)
              return (
                <button
                  key={t.type}
                  onClick={() => pick(t.type)}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-violet-300 hover:bg-violet-50/50"
                >
                  <IconTile icon={Icon} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {t.description}
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