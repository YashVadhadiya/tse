import { getIcon } from '@/components/icon/FunctionIcon'
import company from '@/data/company.json'
import terms from '@/data/terms.json'
import { cn } from '@/utils/cn'
import {
  computeTotals,
  formatDate,
  formatDateShort,
  formatINRFull,
  functionTotal,
} from '@/utils/format'
import type {
  ClientInfo,
  CompanyInfo,
  FunctionSection,
  Quotation,
  SummaryFields,
} from '@/types'

const companyInfo = company as CompanyInfo

export const PAGE_CLASS = 'pdf-page'
export const MAX_ITEMS_PER_PAGE = 15

export interface FunctionPageChunk {
  fn: FunctionSection
  fnIndex: number
  chunkIndex: number
  chunkCount: number
  items: FunctionSection['services']
}

export interface PageModel {
  kind: 'cover' | 'function' | 'summary' | 'terms'
  chunk?: FunctionPageChunk
}

export function buildPageModel(functions: FunctionSection[]): PageModel[] {
  const pages: PageModel[] = [{ kind: 'cover' }]
  functions.forEach((fn, fnIndex) => {
    const items = fn.services.filter((s) => s.included !== false)
    const chunkCount = Math.max(1, Math.ceil(items.length / MAX_ITEMS_PER_PAGE))
    for (let c = 0; c < chunkCount; c++) {
      pages.push({
        kind: 'function',
        chunk: {
          fn,
          fnIndex,
          chunkIndex: c,
          chunkCount,
          items: items.slice(
            c * MAX_ITEMS_PER_PAGE,
            (c + 1) * MAX_ITEMS_PER_PAGE,
          ),
        },
      })
    }
  })
  pages.push({ kind: 'summary' })
  pages.push({ kind: 'terms' })
  return pages
}

function CompanyMark({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 font-serif font-bold text-white',
        size === 'sm' ? 'size-8 text-base' : 'size-12 text-2xl',
      )}
    >
      {companyInfo.name.charAt(0)}
    </div>
  )
}

function Footer({ page, total }: { page: number; total: number }) {
  return (
    <div className="absolute inset-x-0 bottom-0">
      <div className="mx-8 mb-7 flex items-end justify-between border-t border-slate-200 pt-3">
        <p className="text-[9px] leading-relaxed text-slate-400">
          {companyInfo.name} · {companyInfo.phone} · {companyInfo.email}
        </p>
        <p className="text-[9px] tracking-wide text-slate-400">
          Page {page} of {total}
        </p>
        <p className="text-[9px] text-slate-400">{companyInfo.website}</p>
      </div>
    </div>
  )
}

function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'relative h-[1123px] w-[794px] overflow-hidden bg-white text-slate-900',
        PAGE_CLASS,
      )}
    >
      <div className="pointer-events-none absolute inset-0 p-5">
        <div className="pointer-events-none h-full w-full border border-slate-200" />
      </div>
      <div className="relative flex h-full flex-col px-12 pt-12 pb-16">
        {children}
      </div>
    </div>
  )
}

function PageHeader({ page, total }: { page: number; total: number }) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <CompanyMark size="sm" />
        <div>
          <p className="font-serif text-sm leading-tight font-semibold">
            {companyInfo.name}
          </p>
          <p className="text-[9px] text-slate-400">{companyInfo.city}</p>
        </div>
      </div>
      <p className="text-[9px] tracking-wide text-slate-400">
        Page {page} of {total}
      </p>
    </div>
  )
}

function MetaGrid({ client }: { client: ClientInfo }) {
  const items = [
    { label: 'Event', value: client.eventName || '—' },
    { label: 'Venue', value: client.venue || '—' },
    { label: 'Date', value: formatDateShort(client.eventDate) || '—' },
    { label: 'Guests', value: client.guestCount || '—' },
  ]
  return (
    <div className="mb-7 grid grid-cols-4 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200">
      {items.map((it) => (
        <div key={it.label} className="bg-slate-50 px-3 py-2.5">
          <p className="text-[8px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            {it.label}
          </p>
          <p className="mt-0.5 truncate text-[11px] font-medium">{it.value}</p>
        </div>
      ))}
    </div>
  )
}

function Diamond() {
  return (
    <span className="mx-3 inline-block size-1.5 rotate-45 bg-violet-300" />
  )
}

function QuoteRow({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-slate-400">{label}</span>
      <span
        className={cn(
          'text-[12px] font-semibold tabular-nums',
          strong && 'text-[13px]',
        )}
      >
        {value}
      </span>
    </div>
  )
}

export function CoverPage({
  page,
  total,
  client,
  quoteNumber,
  date,
}: {
  page: number
  total: number
  client: ClientInfo
  quoteNumber: string
  date: string
}) {
  return (
    <PageFrame>
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[650px] -translate-x-1/2 rounded-full bg-violet-100/60 blur-3xl" />
      <div className="relative flex h-full flex-col items-center text-center">
        <div className="mt-4 flex flex-col items-center gap-3">
          <CompanyMark />
          <div>
            <p className="font-serif text-[26px] font-bold tracking-tight">
              {companyInfo.name}
            </p>
            <p className="mt-1 text-[10px] tracking-[0.22em] text-slate-400 uppercase">
              {companyInfo.tagline}
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center">
          <p className="text-[11px] font-semibold tracking-[0.55em] text-violet-600 uppercase">
            Quotation
          </p>
          <div className="mt-5 flex w-full items-center justify-center">
            <span className="h-px w-24 bg-gradient-to-r from-transparent to-violet-300" />
            <Diamond />
            <span className="h-px w-24 bg-gradient-to-l from-transparent to-violet-300" />
          </div>
        </div>

        <div className="mt-10">
          <p className="text-[11px] tracking-[0.2em] text-slate-400 uppercase">
            Prepared for
          </p>
          <p className="mt-3 font-serif text-[38px] leading-tight font-bold">
            {client.clientName || '—'}
          </p>
          {client.eventName && (
            <p className="mx-auto mt-3 max-w-md font-serif text-[22px] italic text-slate-500">
              {client.eventName}
            </p>
          )}
        </div>

        <div className="mt-10 grid w-full max-w-lg grid-cols-3 gap-3">
          {[
            { label: 'Venue', value: client.venue || '—' },
            {
              label: 'Date',
              value: formatDate(client.eventDate) || '—',
            },
            { label: 'City', value: client.city || '—' },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5"
            >
              <p className="text-[8px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                {m.label}
              </p>
              <p className="mt-0.5 truncate text-[12px] font-medium">
                {m.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-auto w-full max-w-md rounded-xl border border-violet-100 bg-violet-50/50 p-4">
          <div className="space-y-1.5">
            <QuoteRow label="Quotation Number" value={quoteNumber} strong />
            <QuoteRow label="Issue Date" value={formatDate(date) || '—'} />
            <QuoteRow
              label="Valid Until"
              value={formatDate(addDays(date, 15))}
            />
            <QuoteRow
              label="GSTIN"
              value={companyInfo.gstin}
            />
          </div>
        </div>

        <p className="mt-6 mb-2 text-[10px] tracking-wide text-slate-400">
          {companyInfo.phone} · {companyInfo.email} · {companyInfo.website}
        </p>
      </div>
      <Footer page={page} total={total} />
    </PageFrame>
  )
}

function addDays(iso: string, days: number): string {
  if (!iso) return iso
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function FunctionPage({
  chunk,
  page,
  total,
  quoteNumber,
  client,
  detailed,
}: {
  chunk: FunctionPageChunk
  page: number
  total: number
  quoteNumber: string
  client: ClientInfo
  detailed: boolean
}) {
  const { fn, fnIndex, chunkIndex, chunkCount, items } = chunk
  const Icon = getIcon(fn.icon)
  const isPackage = fn.pricingMode === 'package'
  const showItems = detailed && !isPackage
  const funcTotal = functionTotal(fn)

  return (
    <PageFrame>
      <PageHeader page={page} total={total} />
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-[9px] font-bold tracking-[0.18em] text-violet-700 uppercase ring-1 ring-violet-100">
          Function {String(fnIndex + 1).padStart(2, '0')}
          {chunkCount > 1 && (
            <span className="font-medium text-violet-400">
              · part {chunkIndex + 1}/{chunkCount}
            </span>
          )}
        </span>
        <span className="text-[9px] text-slate-400">Quote: {quoteNumber}</span>
      </div>

      <div className="mt-3 mb-6 flex items-center gap-3">
        <Icon className="size-5 text-violet-600" />
        <h2 className="font-serif text-[26px] leading-tight font-bold">
          {fn.name}
        </h2>
      </div>

      <MetaGrid client={client} />

      {fn.notes && (
        <p className="mb-6 rounded-lg border-l-2 border-violet-200 bg-slate-50 px-3 py-2 font-serif text-[11px] italic text-slate-500">
          {fn.notes}
        </p>
      )}

      <div className="flex-1">
        {showItems ? (
          <>
            <div className="grid grid-cols-[1.5fr_1.3fr_0.4fr_0.6fr] border-b-2 border-slate-300 pb-2 text-[8px] font-bold tracking-[0.16em] text-slate-400 uppercase">
              <span>Service</span>
              <span>Description</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Amount</span>
            </div>
            <div>
              {items.map((s) => (
                <div
                  key={s.id}
                  className="grid grid-cols-[1.5fr_1.3fr_0.4fr_0.6fr] items-center border-b border-slate-100 py-[9px]"
                >
                  <span className="flex items-center gap-2 text-[11px] font-medium">
                    <span className="inline-flex size-3 shrink-0 items-center justify-center rounded-full bg-violet-100">
                      <span className="size-1 rounded-full bg-violet-600" />
                    </span>
                    {s.name}
                  </span>
                  <span className="pr-3 text-[10px] text-slate-400">
                    {s.description}
                  </span>
                  <span className="text-right text-[10px] text-slate-500">
                    ×{s.qty || 1}
                  </span>
                  <span className="text-right text-[11px] font-semibold tabular-nums">
                    {formatINRFull((s.price || 0) * Math.max(1, s.qty || 1))}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-end gap-8">
              <span className="text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                Subtotal
              </span>
              <span className="font-serif text-[20px] font-bold text-violet-700">
                {formatINRFull(funcTotal)}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="border-b-2 border-slate-300 pb-2 text-[8px] font-bold tracking-[0.16em] text-slate-400 uppercase">
              Services Included
            </div>
            <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              {items.map((s) => (
                <div
                  key={s.id}
                  className="flex items-baseline gap-2 border-b border-slate-100 py-[7px]"
                >
                  <span className="inline-flex size-3.5 shrink-0 translate-y-0.5 items-center justify-center rounded-full bg-violet-600 text-[8px] font-bold text-white">
                    ✓
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium">{s.name}</p>
                    {s.description && (
                      <p className="truncate text-[9px] text-slate-400">
                        {s.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-end gap-8">
              <span className="text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                {isPackage ? 'Package Price' : 'Total'}
              </span>
              <span className="font-serif text-[20px] font-bold text-violet-700">
                {formatINRFull(funcTotal)}
              </span>
            </div>
          </>
        )}
      </div>

      <Footer page={page} total={total} />
    </PageFrame>
  )
}

export function SummaryPage({
  page,
  total,
  quotation,
  quoteNumber,
}: {
  page: number
  total: number
  quotation: Quotation
  quoteNumber: string
}) {
  const t = computeTotals(quotation)
  const s: SummaryFields = quotation.summary
  const bank = companyInfo.bankDetails

  return (
    <PageFrame>
      <PageHeader page={page} total={total} />
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-[26px] font-bold">
          Quotation Summary
        </h2>
        <span className="text-[9px] text-slate-400">Quote: {quoteNumber}</span>
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-6">
        <div>
          <div className="mb-2 grid grid-cols-[1fr_auto] border-b-2 border-slate-300 pb-2 text-[8px] font-bold tracking-[0.16em] text-slate-400 uppercase">
            <span>Function</span>
            <span className="text-right">Amount</span>
          </div>
          <div>
            {quotation.functions.map((fn) => (
              <div
                key={fn.id}
                className="flex items-center justify-between border-b border-slate-100 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex size-5 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white">
                    {quotation.functions.indexOf(fn) + 1}
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold">{fn.name}</p>
                    <p className="text-[9px] text-slate-400">
                      {fn.pricingMode === 'package'
                        ? 'Package price'
                        : `${fn.services.filter((x) => x.included !== false).length} services`}
                    </p>
                  </div>
                </div>
                <span className="text-[12px] font-semibold tabular-nums">
                  {formatINRFull(functionTotal(fn))}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2">
            <QuoteRow
              label="Subtotal (Functions)"
              value={formatINRFull(t.functionsTotal)}
            />
            {s.additionalCharges && (
              <QuoteRow
                label={`Additional Charges (${s.additionalCharges})`}
                value={`+ ${formatINRFull(s.additionalChargesAmount)}`}
              />
            )}
            {s.discount > 0 && (
              <QuoteRow
                label="Discount"
                value={`− ${formatINRFull(s.discount)}`}
              />
            )}
            {s.gstEnabled && (
              <QuoteRow
                label={`GST @ ${s.gstPercent}%`}
                value={`+ ${formatINRFull(t.gst)}`}
              />
            )}
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
              <span className="text-[12px] font-bold">Grand Total</span>
              <span className="font-serif text-[18px] font-bold text-violet-700">
                {formatINRFull(t.finalPayable)}
              </span>
            </div>
            <QuoteRow
              label="Advance Payment"
              value={`− ${formatINRFull(s.advance)}`}
            />
            <div className="flex items-center justify-between rounded-lg border border-violet-200 bg-violet-50 px-3 py-3">
              <span className="text-[12px] font-bold text-violet-800">
                Balance Amount
              </span>
              <span className="font-serif text-[20px] font-bold text-violet-700">
                {formatINRFull(t.balance)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="mb-2 text-[9px] font-bold tracking-[0.16em] text-slate-400 uppercase">
              Payment Details
            </p>
            <div className="space-y-1 text-[11px]">
              <p>
                <span className="text-slate-400">Account: </span>
                <span className="font-medium">{bank.accountName}</span>
              </p>
              <p>
                <span className="text-slate-400">A/C No: </span>
                <span className="font-medium tabular-nums">
                  {bank.accountNumber}
                </span>
              </p>
              <p>
                <span className="text-slate-400">IFSC: </span>
                <span className="font-medium">{bank.ifsc}</span>
              </p>
              <p>
                <span className="text-slate-400">Bank: </span>
                <span className="font-medium">{bank.bank}</span>
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <p className="mb-2 text-[9px] font-bold tracking-[0.16em] text-slate-400 uppercase">
              Advance Payment
            </p>
            <p className="text-[11px] leading-relaxed text-slate-500">
              50% advance to confirm the booking. Balance to be settled before
              the event date.
            </p>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 p-4 text-white">
            <p className="font-serif text-[14px] italic">
              “Thank you for choosing {companyInfo.name}. We look forward to
              creating your most memorable celebration.”
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <p className="mb-4 text-[9px] font-bold tracking-[0.16em] text-slate-400 uppercase">
              Acceptance
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-1 flex h-10 items-end justify-center">
                  <p className="font-serif text-[14px] italic text-slate-400">
                    For {companyInfo.name}
                  </p>
                </div>
                <div className="border-t border-slate-300 pt-1 text-center text-[9px] text-slate-400">
                  Authorised Signatory
                </div>
              </div>
              <div>
                <div className="mb-1 flex h-10 items-end justify-center">
                  <p className="font-serif text-[14px] italic text-slate-400">
                    {quotation.client.clientName || 'Client'}
                  </p>
                </div>
                <div className="border-t border-slate-300 pt-1 text-center text-[9px] text-slate-400">
                  Client Acceptance
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer page={page} total={total} />
    </PageFrame>
  )
}

export function TermsPage({
  page,
  total,
  quoteNumber,
}: {
  page: number
  total: number
  quoteNumber: string
}) {
  return (
    <PageFrame>
      <PageHeader page={page} total={total} />
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-[26px] font-bold">
          Terms &amp; Conditions
        </h2>
        <span className="text-[9px] text-slate-400">Quote: {quoteNumber}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
        {(terms as string[]).map((term, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-violet-50 text-[9px] font-bold text-violet-700 ring-1 ring-violet-100">
              {i + 1}
            </span>
            <p className="text-[11px] leading-relaxed text-slate-500">{term}</p>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
          <p className="mb-1 text-[9px] font-bold tracking-[0.16em] text-slate-400 uppercase">
            Office Address
          </p>
          <p className="text-[11px] text-slate-600">
            {companyInfo.address}, {companyInfo.city}
          </p>
          <p className="mt-1 text-[11px] text-slate-600">
            {companyInfo.phone} · {companyInfo.email} · {companyInfo.website}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            GSTIN: {companyInfo.gstin}
          </p>
        </div>
      </div>

      <Footer page={page} total={total} />
    </PageFrame>
  )
}
