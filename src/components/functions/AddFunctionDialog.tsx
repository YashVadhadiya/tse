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
import { Button } from '@/components/ui/button'

interface AddFunctionDialogProps {
  trigger: React.ReactNode
  onAdd: () => void
}

export function AddFunctionDialog({ trigger, onAdd }: AddFunctionDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a Function</DialogTitle>
          <DialogDescription>
            Create a new function for your event.
          </DialogDescription>
        </DialogHeader>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            onAdd()
            setOpen(false)
          }}
        >
          <Star />
          Add Custom Function
        </Button>
      </DialogContent>
    </Dialog>
  )
}
