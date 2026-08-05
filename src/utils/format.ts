import type {
  FunctionSection,
  Quotation,
} from '@/types'

export function formatINR(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return '₹0'
  return '₹' + Math.round(amount).toLocaleString('en-IN')
}

export function formatINRFull(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0'
  const sign = amount < 0 ? '-' : ''
  const abs = Math.abs(Math.round(amount))
  return sign + '₹' + abs.toLocaleString('en-IN')
}

export function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateShort(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

export function functionTotal(fn: FunctionSection): number {
  const hasPrice = fn.services.some((s) => (s.price || 0) > 0)
  if (hasPrice) return fn.services.reduce((sum, s) => sum + (s.price || 0), 0)
  return fn.total || 0
}

export interface Totals {
  functionsTotal: number
  taxable: number
  gst: number
  grandTotal: number
  finalPayable: number
  balance: number
}

export function computeTotals(q: Quotation): Totals {
  const functionsTotal = q.functions.reduce(
    (sum, fn) => sum + functionTotal(fn),
    0,
  )
  const additional = q.summary.additionalChargesAmount || 0
  const discount = Math.min(q.summary.discount || 0, functionsTotal + additional)
  const taxable = Math.max(0, functionsTotal + additional - discount)
  const gst = q.summary.gstEnabled ? (taxable * (q.summary.gstPercent || 0)) / 100 : 0
  const finalPayable = taxable + gst
  const advance = Math.min(q.summary.advance || 0, finalPayable)
  const balance = Math.max(0, finalPayable - advance)
  return { functionsTotal, taxable, gst, grandTotal: taxable + gst, finalPayable, balance }
}

export function plural(n: number, word: string, pluralWord = word + 's'): string {
  return n === 1 ? `${n} ${word}` : `${n} ${pluralWord}`
}
