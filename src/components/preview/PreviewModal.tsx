import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FileDown, LoaderCircle, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useQuotationContext } from '@/hooks/useQuotation'
import {
  buildPageModel,
  CoverPage,
  FunctionPage,
  SummaryPage,
  TermsPage,
} from '@/components/preview/quotation-pages'

export function PreviewModal() {
  const {
    quotation,
    previewOpen,
    closePreview,
    exportRequested,
    clearExportRequest,
  } = useQuotationContext()
  const [exporting, setExporting] = useState(false)
  const ranAutoExport = useRef(false)

  useEffect(() => {
    if (!previewOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreview()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [previewOpen, closePreview])

  const model = useMemo(
    () => buildPageModel(quotation.functions),
    [quotation.functions],
  )
  const totalPages = model.length

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const container = document.getElementById('preview-pages')
      if (!container) throw new Error('Preview container not found')
      const safeName =
        quotation.client.clientName?.trim().replace(/[^\w\d-]+/g, '_') ||
        'quotation'
      const number = quotation.quoteNumber.replace(/[/\\]/g, '-')
      const { exportPagesToPdf } = await import('@/pdf/exportPdf')
      await exportPagesToPdf(container, `${safeName}-${number}.pdf`)
      toast.success('PDF exported successfully')
    } catch (err) {
      console.error(err)
      toast.error('PDF export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    if (previewOpen && exportRequested && !ranAutoExport.current) {
      ranAutoExport.current = true
      const t = setTimeout(() => {
        void handleExport()
        clearExportRequest()
      }, 400)
      return () => clearTimeout(t)
    }
    if (!previewOpen) ranAutoExport.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewOpen, exportRequested])

  return (
    <AnimatePresence>
      {previewOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col bg-slate-950/60 backdrop-blur-sm"
        >
          <div
            data-testid="preview-toolbar"
            className="flex items-center justify-between gap-4 border-b border-white/10 bg-slate-950/80 px-4 py-3 sm:px-6"
          >
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={closePreview}
                className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close preview"
              >
                <X className="size-5" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  Quotation Preview
                </p>
                <p className="truncate text-xs text-slate-400">
                  {quotation.quoteNumber} · {totalPages} pages ·{' '}
                  {quotation.functions.length} functions
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                onClick={handleExport}
                disabled={exporting}
                className="bg-violet-600 text-white hover:bg-violet-700"
              >
                {exporting ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <FileDown />
                )}
                {exporting ? 'Exporting…' : 'Download PDF'}
              </Button>
            </div>
          </div>

          <div
            id="preview-pages"
            className="preview-scroll relative flex-1 overflow-y-auto px-4 py-6"
          >
            <div className="mx-auto w-fit space-y-8">
              {model.map((m, i) => {
                const key = `${m.kind}-${i}`
                const common = { page: i + 1, total: totalPages }
                const page = (
                  <>
                    {m.kind === 'cover' && (
                      <CoverPage
                        {...common}
                        client={quotation.client}
                        date={quotation.date}
                      />
                    )}
                    {m.kind === 'function' && m.chunk && (
                      <FunctionPage
                        {...common}
                        chunk={m.chunk}
                      />
                    )}
                    {m.kind === 'summary' && (
                      <SummaryPage
                        {...common}
                        quotation={quotation}
                      />
                    )}
                    {m.kind === 'terms' && (
                      <TermsPage {...common} />
                    )}
                  </>
                )
                return exporting ? (
                  <div
                    key={key}
                    className="overflow-hidden rounded-md shadow-2xl shadow-slate-950/40 ring-1 ring-black/10"
                  >
                    {page}
                  </div>
                ) : (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: Math.min(i * 0.06, 0.5),
                      duration: 0.35,
                    }}
                    className="overflow-hidden rounded-md shadow-2xl shadow-slate-950/40 ring-1 ring-black/10"
                  >
                    {page}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}