import { FileDown, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/utils/cn'
import { computeTotals, formatINRFull } from '@/utils/format'
import type { Quotation, SummaryFields } from '@/types'
import type { QuotationActions } from '@/hooks/useQuotation'

interface SummaryPanelProps {
  quotation: Quotation
  updateSummary: QuotationActions['updateSummary']
  onOpenPreview: () => void
  onExportPdf: () => void
  exporting: boolean
}

function SummaryRow({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-semibold tabular-nums', className)}>{value}</span>
    </div>
  )
}

export function SummaryPanel({
  quotation,
  updateSummary,
  onOpenPreview,
  onExportPdf,
  exporting,
}: SummaryPanelProps) {
  const totals = computeTotals(quotation)
  const s: SummaryFields = quotation.summary

  return (
    <Card className="scroll-mt-20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>Total</span>
          <span className="text-xl font-bold text-violet-700">
            {formatINRFull(totals.finalPayable)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="discount" className="text-sm text-muted-foreground">
            Discount (₹)
          </Label>
          <Input
            id="discount"
            type="number"
            inputMode="numeric"
            min={0}
            value={s.discount || ''}
            onChange={(e) =>
              updateSummary({
                discount: Math.max(0, Number(e.target.value) || 0),
              })
            }
            className="h-9 w-28 text-right text-sm"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="gst" className="text-sm text-muted-foreground">
            GST
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              disabled={!s.gstEnabled}
              value={s.gstPercent || ''}
              onChange={(e) =>
                updateSummary({
                  gstPercent: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className="h-9 w-16 text-right text-sm"
              aria-label="GST percent"
            />
            <span className="text-sm text-muted-foreground">%</span>
            <Switch
              id="gst"
              checked={s.gstEnabled}
              onCheckedChange={(v) => updateSummary({ gstEnabled: v })}
            />
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="advance" className="text-sm text-muted-foreground">
            Advance (₹)
          </Label>
          <Input
            id="advance"
            type="number"
            inputMode="numeric"
            min={0}
            value={s.advance || ''}
            onChange={(e) =>
              updateSummary({
                advance: Math.max(0, Number(e.target.value) || 0),
              })
            }
            className="h-9 w-28 text-right text-sm"
          />
        </div>

        <SummaryRow
          label="Balance"
          value={formatINRFull(totals.balance)}
          className="font-bold text-slate-900"
        />

        <div className="grid gap-2 pt-1">
          <Button onClick={onOpenPreview} className="w-full">
            <FileText />
            Preview
          </Button>
          <Button
            variant="outline"
            onClick={onExportPdf}
            disabled={exporting}
            className="w-full"
          >
            <FileDown />
            {exporting ? 'Preparing PDF…' : 'Download PDF'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}