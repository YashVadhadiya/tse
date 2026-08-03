import { BadgeIndianRupee, FileDown, FileText } from 'lucide-react'

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
      <span className={cn('font-medium tabular-nums', className)}>{value}</span>
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
    <Card className="sticky top-24 shadow-lg">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-base">
          <BadgeIndianRupee className="size-4 text-violet-600" />
          Quotation Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <SummaryRow
            label={`Function Total (${quotation.functions.length} functions)`}
            value={formatINRFull(totals.functionsTotal)}
          />
          <div className="space-y-1.5">
            <Label htmlFor="discount" className="text-xs text-muted-foreground">
              Discount (₹)
            </Label>
            <Input
              id="discount"
              type="number"
              min={0}
              value={s.discount || ''}
              placeholder="0"
              onChange={(e) =>
                updateSummary({
                  discount: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="additional-charges"
              className="text-xs text-muted-foreground"
            >
              Additional Charges (description)
            </Label>
            <Input
              id="additional-charges"
              value={s.additionalCharges}
              onChange={(e) => updateSummary({ additionalCharges: e.target.value })}
              placeholder="e.g. Transportation & logistics"
              className="h-8 text-xs"
            />
            <Input
              type="number"
              min={0}
              value={s.additionalChargesAmount || ''}
              placeholder="Amount ₹"
              onChange={(e) =>
                updateSummary({
                  additionalChargesAmount: Math.max(
                    0,
                    Number(e.target.value) || 0,
                  ),
                })
              }
              className="h-8 text-xs"
            />
          </div>
          <Separator />
          <SummaryRow
            label="Subtotal"
            value={formatINRFull(totals.taxable)}
            className="font-semibold"
          />
          <div className="flex items-center justify-between">
            <Label htmlFor="gst" className="text-sm text-muted-foreground">
              GST
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                disabled={!s.gstEnabled}
                value={s.gstPercent || ''}
                placeholder="18"
                onChange={(e) =>
                  updateSummary({
                    gstPercent: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="h-8 w-16 text-right text-xs"
              />
              <span className="text-xs text-muted-foreground">%</span>
              <Switch
                id="gst"
                checked={s.gstEnabled}
                onCheckedChange={(v) => updateSummary({ gstEnabled: v })}
              />
            </div>
          </div>
          {s.gstEnabled && (
            <SummaryRow
              label={`GST @ ${s.gstPercent}%`}
              value={`+ ${formatINRFull(totals.gst)}`}
            />
          )}
        </div>

        <div className="space-y-2 rounded-xl bg-violet-50/70 p-4 ring-1 ring-violet-100">
          <SummaryRow
            label="Final Payable Amount"
            value={formatINRFull(totals.finalPayable)}
            className="text-lg font-bold text-violet-700"
          />
          <div className="space-y-1.5">
            <Label htmlFor="advance" className="text-xs text-muted-foreground">
              Advance Payment (₹)
            </Label>
            <Input
              id="advance"
              type="number"
              min={0}
              value={s.advance || ''}
              placeholder="0"
              onChange={(e) =>
                updateSummary({
                  advance: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className="h-9 bg-white text-sm font-semibold"
            />
          </div>
          <Separator className="bg-violet-200/70" />
          <SummaryRow
            label="Balance Amount"
            value={formatINRFull(totals.balance)}
            className="font-bold"
          />
        </div>

        <div className="grid gap-2">
          <Button onClick={onOpenPreview} className="w-full">
            <FileText />
            Preview Quotation
          </Button>
          <Button
            variant="outline"
            onClick={onExportPdf}
            disabled={exporting}
            className="w-full"
          >
            <FileDown />
            {exporting ? 'Preparing PDF…' : 'Export PDF'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
