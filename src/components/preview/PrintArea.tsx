import {
  buildPageModel,
  CoverPage,
  FunctionPage,
  SummaryPage,
  TermsPage,
} from '@/components/preview/quotation-pages'
import type { Quotation } from '@/types'

export function PrintArea({
  quotation,
  detailed,
}: {
  quotation: Quotation
  detailed: boolean
}) {
  const model = buildPageModel(quotation.functions)
  const totalPages = model.length

  return (
    <div id="print-area" className="hidden">
      {model.map((m, i) => {
        const key = `${m.kind}-${i}`
        const common = { page: i + 1, total: totalPages }
        return (
          <div key={key} className="print-page">
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
                client={quotation.client}
                detailed={detailed}
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
          </div>
        )
      })}
    </div>
  )
}
