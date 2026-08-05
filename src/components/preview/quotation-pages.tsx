import { getIcon } from '@/components/icon/FunctionIcon'
import company from '@/data/company.json'
import terms from '@/data/terms.json'
import { cn } from '@/utils/cn'
import {
  computeTotals,
  formatDate,
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
export const MAX_ITEMS_PER_PAGE = 12

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
        size === 'sm' ? 'size-9 text-lg' : 'size-14 text-3xl',
      )}
    >
      {companyInfo.name.charAt(0)}
    </div>
  )
}

function Footer({ page, total }: { page: number; total: number }) {
  return (
    <div className="absolute inset-x-0 bottom-0">
      <div className="mx-8 mb-7 flex items-end justify-between gap-4 border-t border-slate-200 pt-3">
        <p className="text-[12px] leading-relaxed text-slate-400">
          {companyInfo.name} · {companyInfo.phone}
        </p>
        <p className="shrink-0 text-[12px] tracking-wide text-slate-400">
          Page {page} of {total}
        </p>
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
      <div className="pointer-events-none absolute inset-0 p-6">
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
      <div className="flex items-center gap-3">
        <CompanyMark size="sm" />
        <div>
          <p className="font-serif text-base leading-tight font-semibold">
            {companyInfo.name}
          </p>
          <p className="text-[12px] text-slate-400">{companyInfo.city}</p>
        </div>
      </div>
      <p className="text-[12px] tracking-wide text-slate-400">
        Page {page} of {total}
      </p>
    </div>
  )
}

function Diamond() {
  return (
    <span className="mx-3 inline-block size-2 rotate-45 bg-violet-300" />
  )
}

function QuoteRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[14px] text-slate-400">{label}</span>
      <span className="text-[15px] font-semibold tabular-nums">{value}</span>
    </div>
  )
}

export function CoverPage({
  page,
  total,
  client,
  date,
}: {
  page: number
  total: number
  client: ClientInfo
  date: string
}) {
  return (
    <PageFrame>
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[650px] -translate-x-1/2 rounded-full bg-violet-100/60 blur-3xl" />
      <div className="relative flex h-full flex-col items-center text-center">
        <div className="mt-4 flex flex-col items-center gap-3">
          <CompanyMark />
          <div>
            <p className="font-serif text-[32px] font-bold tracking-tight">
              {companyInfo.name}
            </p>
            <p className="mt-1 text-[13px] tracking-[0.2em] text-slate-400 uppercase">
              {companyInfo.tagline}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center">
          <p className="text-[14px] font-semibold tracking-[0.5em] text-violet-600 uppercase">
            Quotation
          </p>
          <div className="mt-5 flex w-full items-center justify-center">
            <span className="h-px w-24 bg-gradient-to-r from-transparent to-violet-300" />
            <Diamond />
            <span className="h-px w-24 bg-gradient-to-l from-transparent to-violet-300" />
          </div>
        </div>

        <div className="mt-10">
          <p className="text-[14px] tracking-[0.18em] text-slate-400 uppercase">
            Prepared for
          </p>
          <p className="mt-3 font-serif text-[44px] leading-tight font-bold">
            {client.clientName || '—'}
          </p>
          {client.eventName && (
            <p className="mx-auto mt-3 max-w-md font-serif text-[26px] italic text-slate-500">
              {client.eventName}
            </p>
          )}
        </div>

        <div className="mt-12 mx-auto w-full max-w-xl overflow-hidden rounded-xl border border-slate-200">
          {[
            { label: 'Venue', value: client.venue || '—' },
            {
              label: 'Date',
              value: formatDate(client.eventDate) || '—',
            },
            { label: 'City', value: client.city || '—' },
          ].map((m, i) => (
            <div
              key={m.label}
              className={cn(
                'flex items-center justify-between gap-8 px-6 py-4',
                i > 0 && 'border-t border-slate-200',
                i % 2 === 0 ? 'bg-white/70' : 'bg-slate-50/80',
              )}
            >
              <span className="text-[12px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                {m.label}
              </span>
              <span className="text-[18px] font-semibold tabular-nums">
                {m.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-auto mb-2 w-full max-w-md rounded-xl border border-violet-100 bg-violet-50/50 p-5">
          <QuoteRow label="Issue Date" value={formatDate(date) || '—'} />
        </div>

        <p className="text-[13px] tracking-wide text-slate-400">
          {companyInfo.phone}
        </p>
      </div>
      <Footer page={page} total={total} />
    </PageFrame>
  )
}

export function FunctionPage({
  chunk,
  page,
  total,
}: {
  chunk: FunctionPageChunk
  page: number
  total: number
}) {
  const { fn, fnIndex, chunkIndex, chunkCount, items } = chunk
  const Icon = getIcon(fn.icon)
  const funcTotal = functionTotal(fn)
  const hasPrice = fn.services.some((s) => (s.price || 0) > 0)

  return (
    <PageFrame>
      <PageHeader page={page} total={total} />
      <div className="flex items-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-[12px] font-bold tracking-[0.16em] text-violet-700 uppercase ring-1 ring-violet-100">
          Function {String(fnIndex + 1).padStart(2, '0')}
          {chunkCount > 1 && (
            <span className="font-medium text-violet-400">
              · part {chunkIndex + 1}/{chunkCount}
            </span>
          )}
        </span>
      </div>

      <div className="mt-3 mb-6 flex items-center gap-3">
        <Icon className="size-6 text-violet-600" />
        <h2 className="font-serif text-[30px] leading-tight font-bold">
          {fn.name}
        </h2>
      </div>

      {fn.notes && (
        <p className="mb-6 rounded-lg border-l-2 border-violet-200 bg-slate-50 px-3 py-2.5 font-serif text-[14px] italic text-slate-500">
          {fn.notes}
        </p>
      )}

      <div className="flex-1">
        {hasPrice ? (
          <>
            <div className="grid grid-cols-[1fr_auto] border-b-2 border-slate-300 pb-2 text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">
              <span>Service</span>
              <span className="text-right">Amount</span>
            </div>
            <div>
              {items.map((s) => (
                <div
                  key={s.id}
                  className="grid grid-cols-[1fr_auto] items-center border-b border-slate-100 py-2.5"
                >
                  <span className="flex items-center gap-2 text-[14px] font-medium">
                    <span className="inline-flex size-3.5 shrink-0 items-center justify-center rounded-full bg-violet-100">
                      <span className="size-1.5 rounded-full bg-violet-600" />
                    </span>
                    <span className="text-[14px] leading-snug">{s.name}</span>
                  </span>
                  <span className="text-right text-[14px] font-semibold tabular-nums">
                    {formatINRFull(s.price || 0)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-end gap-8">
              <span className="text-[12px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                Subtotal
              </span>
              <span className="font-serif text-[24px] font-bold text-violet-700">
                {formatINRFull(funcTotal)}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="border-b-2 border-slate-300 pb-2 text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">
              Services
            </div>
            {items.length === 0 ? (
              <p className="py-6 text-[14px] text-slate-400">No services</p>
            ) : (
              <div>
                {items.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-baseline gap-2.5 border-b border-slate-100 py-[9px]"
                  >
                    <span className="inline-flex size-3.5 shrink-0 items-center justify-center rounded-full bg-violet-100">
                      <span className="size-1.5 rounded-full bg-violet-600" />
                    </span>
                    <span className="text-[14px] leading-snug">{s.name}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-center justify-end gap-8">
              <span className="text-[12px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                Total
              </span>
              <span className="font-serif text-[24px] font-bold text-violet-700">
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
}: {
  page: number
  total: number
  quotation: Quotation
}) {
  const t = computeTotals(quotation)
  const s: SummaryFields = quotation.summary

  return (
    <PageFrame>
      <PageHeader page={page} total={total} />
      <div className="mb-6">
        <h2 className="font-serif text-[30px] font-bold">
          Quotation Summary
        </h2>
      </div>

      <div className="space-y-6">
        <div>
          <div className="mb-2 grid grid-cols-[1fr_auto] border-b-2 border-slate-300 pb-2 text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">
            <span>Function</span>
            <span className="text-right">Amount</span>
          </div>
          <div>
            {quotation.functions.map((fn, idx) => (
              <div
                key={fn.id}
                className="flex items-center justify-between border-b border-slate-100 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-violet-600 text-[11px] font-bold text-white">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold">{fn.name}</p>
                  </div>
                </div>
                <span className="text-[15px] font-semibold tabular-nums">
                  {formatINRFull(functionTotal(fn))}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2.5">
            <QuoteRow
              label="Subtotal (Functions)"
              value={formatINRFull(t.functionsTotal)}
            />
            {s.additionalCharges && s.additionalChargesAmount > 0 && (
              <QuoteRow
                label={`Additional Charges (${s.additionalCharges})`}
                value={`+ ${formatINRFull(s.additionalChargesAmount)}`}
              />
            )}
            {s.discount > 0 && (
              <QuoteRow label="Discount" value={`− ${formatINRFull(s.discount)}`} />
            )}
            {s.gstEnabled && (
              <QuoteRow label={`GST @ ${s.gstPercent}%`} value={`+ ${formatINRFull(t.gst)}`} />
            )}
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3">
              <span className="text-[15px] font-bold">Grand Total</span>
              <span className="font-serif text-[22px] font-bold text-violet-700">
                {formatINRFull(t.finalPayable)}
              </span>
            </div>
            <QuoteRow label="Advance Payment" value={`− ${formatINRFull(s.advance)}`} />
            <div className="flex items-center justify-between rounded-lg border border-violet-200 bg-violet-50 px-3 py-3">
              <span className="text-[15px] font-bold text-violet-800">
                Balance Amount
              </span>
              <span className="font-serif text-[24px] font-bold text-violet-700">
                {formatINRFull(t.balance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
        <p className="mb-1.5 text-[12px] font-bold tracking-[0.14em] text-slate-400 uppercase">
          Advance Payment
        </p>
        <p className="text-[14px] leading-relaxed text-slate-500">
          50% advance to confirm the booking. Balance to be settled before the
          event date.
        </p>
      </div>

      <Footer page={page} total={total} />
    </PageFrame>
  )
}

export function TermsPage({
  page,
  total,
}: {
  page: number
  total: number
}) {
  return (
    <PageFrame>
      <PageHeader page={page} total={total} />
      <div className="mb-6">
        <h2 className="font-serif text-[30px] font-bold">
          Terms &amp; Conditions
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        {(terms as string[]).map((term, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-violet-50 text-[12px] font-bold text-violet-700 ring-1 ring-violet-100">
              {i + 1}
            </span>
            <p className="text-[14px] leading-relaxed text-slate-500">{term}</p>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
          <p className="mb-1.5 text-[12px] font-bold tracking-[0.14em] text-slate-400 uppercase">
            Office Address
          </p>
          <p className="text-[14px] text-slate-600">
            {companyInfo.address}, {companyInfo.city}
          </p>
          <p className="text-[14px] text-slate-600">
            {companyInfo.phone}
          </p>
        </div>
      </div>

      <Footer page={page} total={total} />
    </PageFrame>
  )
}