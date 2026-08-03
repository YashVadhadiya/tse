import { useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import {
  CalendarCheck,
  FileDown,
  GripVertical,
  ListChecks,
  Plus,
  ReceiptText,
  RefreshCw,
  Sparkles,
  UserRound,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Toaster } from '@/components/ui/sonner'
import { ClientInfoForm } from '@/components/client/ClientInfoForm'
import { AddFunctionDialog } from '@/components/functions/AddFunctionDialog'
import { FunctionCard } from '@/components/functions/FunctionCard'
import { SummaryPanel } from '@/components/summary/SummaryPanel'
import { PreviewModal } from '@/components/preview/PreviewModal'
import { PrintArea } from '@/components/preview/PrintArea'
import { useQuotationContext, QuotationProvider } from '@/hooks/useQuotation'
import { cn } from '@/utils/cn'
import { computeTotals, formatINRFull } from '@/utils/format'
import type { FunctionSection } from '@/types'

const steps = [
  { id: 'client', label: 'Client', icon: UserRound },
  { id: 'functions', label: 'Functions', icon: ListChecks },
  { id: 'summary', label: 'Summary', icon: ReceiptText },
  { id: 'preview', label: 'Preview', icon: CalendarCheck },
]

export default function App() {
  return (
    <QuotationProvider>
      <div id="app-shell">
        <BuilderPage />
      </div>
      <PrintAreaHost />
      <PreviewModal />
      <Toaster />
    </QuotationProvider>
  )
}

function PrintAreaHost() {
  const { quotation, displayMode } = useQuotationContext()
  return (
    <div id="print-area">
      <PrintArea quotation={quotation} detailed={displayMode === 'detailed'} />
    </div>
  )
}

function BuilderPage() {
  const q = useQuotationContext()
  const { quotation } = q
  const [resetOpen, setResetOpen] = useState(false)
  const totals = computeTotals(quotation)

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const goToStep = (stepId: string) => {
    if (stepId === 'preview') {
      q.openPreview()
      return
    }
    scrollTo(`section-${stepId}`)
  }

  const handleExport = () => {
    q.requestExport()
    q.openPreview()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 shadow-sm">
              <Sparkles className="size-4.5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight">
                Quotation Studio
              </p>
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                Event quotations in minutes, not hours
              </p>
            </div>
          </div>

          <nav className="mx-auto hidden items-center gap-1 md:flex">
            {steps.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={s.id} className="flex items-center gap-1">
                  {i > 0 && (
                    <span className="mx-0.5 h-px w-6 bg-slate-300" />
                  )}
                  <button
                    onClick={() => goToStep(s.id)}
                    className="group flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"
                  >
                    <Icon className="size-3.5 text-violet-500 transition-transform group-hover:scale-110" />
                    {s.label}
                  </button>
                </div>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setResetOpen(true)}
              className="hidden sm:inline-flex"
            >
              <RefreshCw className="size-3.5" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <FileDown className="size-3.5" />
              Export PDF
            </Button>
            <Button size="sm" onClick={q.openPreview}>
              Preview
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Build a professional quotation
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Client details → functions → services → pricing → ready PDF in
              under 5 minutes.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50/60 px-3.5 py-2">
            <ReceiptText className="size-4 text-violet-600" />
            <div className="text-xs leading-tight">
              <p className="text-muted-foreground">Grand total</p>
              <p className="font-bold text-violet-700">
                {formatINRFull(totals.finalPayable)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <ClientInfoForm
              key={quotation.id}
              client={quotation.client}
              updateClient={q.updateClient}
              onOpenPreview={q.openPreview}
            />

            <Card id="section-functions" className="scroll-mt-24">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700 ring-1 ring-violet-100">
                      <span className="flex size-4 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                        2
                      </span>
                      Functions & Services
                    </div>
                    <CardTitle className="text-lg">
                      Plan the functions of the event
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Add functions, prepare the included-services checklist and
                      choose how to price each one.
                    </p>
                  </div>
                  <AddFunctionDialog
                    onAdd={q.addFunction}
                    trigger={
                      <Button className="shrink-0">
                        <Plus />
                        Add Function
                      </Button>
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                {quotation.functions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-12 text-center">
                    <ListChecks className="mx-auto size-8 text-slate-300" />
                    <p className="mt-3 text-sm font-semibold">
                      No functions yet
                    </p>
                    <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
                      Every event is a series of functions — Haldi, Mehendi,
                      Sangeet, Wedding, Reception and more. Add your first one.
                    </p>
                    <AddFunctionDialog
                      onAdd={q.addFunction}
                      trigger={
                        <Button className="mt-4">
                          <Plus />
                          Add your first function
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <Reorder.Group
                    axis="y"
                    values={quotation.functions}
                    onReorder={q.reorderFunctions}
                    className="space-y-3"
                  >
                    {quotation.functions.map((fn, i) => (
                      <DraggableFunction
                        key={fn.id}
                        fn={fn}
                        index={i}
                        total={quotation.functions.length}
                        actions={q}
                      />
                    ))}
                  </Reorder.Group>
                )}
              </CardContent>
            </Card>
          </div>

          <SummaryPanel
            quotation={quotation}
            updateSummary={q.updateSummary}
            onOpenPreview={q.openPreview}
            onExportPdf={handleExport}
            exporting={false}
          />
        </div>

        <footer className="mt-10 border-t border-slate-200 py-6 text-center text-xs text-muted-foreground">
          Quotation Studio · Data stays in your browser — no login, no server ·
          Built as a live demo for event management companies
        </footer>
      </main>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Start fresh?</DialogTitle>
            <DialogDescription>
              This clears the current quotation and starts a new blank one. You
              can load the demo data again anytime.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                q.resetAll()
                setResetOpen(false)
              }}
            >
              Start Fresh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DraggableFunction({
  fn,
  index,
  total,
  actions,
}: {
  fn: FunctionSection
  index: number
  total: number
  actions: ReturnType<typeof useQuotationContext>
}) {
  const controls = useDragControls()
  return (
    <Reorder.Item
      value={fn}
      dragListener={false}
      dragControls={controls}
      layout
      className="list-none"
    >
      <FunctionCard
        fn={fn}
        index={index}
        total={total}
        quotation={actions.quotation}
        dragHandle={
          <GripVertical
            onPointerDown={(e) => {
              controls.start(e)
              e.stopPropagation()
            }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'size-4 shrink-0 cursor-grab text-slate-300 select-none hover:text-slate-500 active:cursor-grabbing',
            )}
          />
        }
        actions={actions}
      />
    </Reorder.Item>
  )
}
