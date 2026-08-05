import { useState } from 'react'
import { FileDown, ListChecks, Plus, RefreshCw, Sparkles } from 'lucide-react'

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
import { QuickAddFunction } from '@/components/functions/QuickAddFunction'
import { FunctionCard } from '@/components/functions/FunctionCard'
import { SummaryPanel } from '@/components/summary/SummaryPanel'
import { PreviewModal } from '@/components/preview/PreviewModal'
import { PrintArea } from '@/components/preview/PrintArea'
import { useQuotationContext, QuotationProvider } from '@/hooks/useQuotation'
import { computeTotals, formatINRFull } from '@/utils/format'

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
  const { quotation } = useQuotationContext()
  return (
    <div id="print-area">
      <PrintArea quotation={quotation} />
    </div>
  )
}

function BuilderPage() {
  const q = useQuotationContext()
  const { quotation } = q
  const [resetOpen, setResetOpen] = useState(false)
  const totals = computeTotals(quotation)

  const handleExport = () => {
    q.requestExport()
    q.openPreview()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 shadow-sm">
              <Sparkles className="size-4 text-white" />
            </div>
            <p className="text-sm font-bold tracking-tight">Quotation Studio</p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="iconSm"
              onClick={() => setResetOpen(true)}
              aria-label="Start a new quotation"
              title="Start fresh"
            >
              <RefreshCw className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={q.openPreview}
              className="hidden sm:inline-flex"
            >
              Preview
            </Button>
            <Button size="sm" onClick={handleExport}>
              <FileDown className="size-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-5 pb-32 md:pb-10">
        <div className="space-y-4">
          <ClientInfoForm
            key={quotation.id}
            client={quotation.client}
            updateClient={q.updateClient}
          />

          <Card className="scroll-mt-20">
            <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <ListChecks className="size-4 text-violet-600" />
                Functions
              </CardTitle>
              <AddFunctionDialog
                onAdd={q.addFunction}
                trigger={
                  <Button className="h-10">
                    <Plus className="size-4" />
                    Add Function
                  </Button>
                }
              />
            </CardHeader>
            <CardContent>
              <QuickAddFunction
                onAdd={q.addFunction}
                addedNames={quotation.functions.map((f) => f.name)}
                onSamplePriced={q.loadSamplePriced}
                onSampleTotal={q.loadSampleTotal}
                onClearAll={q.resetAll}
              />
              {quotation.functions.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-10 text-center">
                  <ListChecks className="mx-auto size-8 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-muted-foreground">
                    No functions yet
                  </p>
                  <AddFunctionDialog
                    onAdd={q.addFunction}
                    trigger={
                      <Button className="mt-4">
                        <Plus className="size-4" />
                        Add your first function
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {quotation.functions.map((fn, i) => (
                    <FunctionCard
                      key={fn.id}
                      fn={fn}
                      index={i}
                      actions={q}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <SummaryPanel
            quotation={quotation}
            updateSummary={q.updateSummary}
            onOpenPreview={q.openPreview}
            onExportPdf={handleExport}
            exporting={false}
          />
        </div>
      </main>

      <footer className="hidden border-t border-slate-200 py-6 text-center text-xs text-muted-foreground md:block">
        Data stays in your browser — no login, no server
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0 leading-tight">
            <p className="text-[11px] text-muted-foreground">Total</p>
            <p className="truncate text-base font-bold text-slate-900">
              {formatINRFull(totals.finalPayable)}
            </p>
          </div>
          <Button onClick={q.openPreview} className="h-11 shrink-0 px-5">
            <FileDown className="size-4" />
            Preview & Download
          </Button>
        </div>
      </div>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Start fresh?</DialogTitle>
            <DialogDescription>
              This clears the current quotation and starts a new blank one.
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