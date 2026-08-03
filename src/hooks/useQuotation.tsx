import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import demoQuotation from '@/data/demoQuotation.json'
import functionTemplates from '@/data/functions.json'
import type {
  ClientInfo,
  FunctionSection,
  FunctionTemplate,
  PricingDisplayMode,
  PricingMode,
  Quotation,
  ServiceItem,
  SummaryFields,
} from '@/types'
import { uid } from '@/utils/format'

const STORAGE_KEY = 'event-quotation-builder-v1'

export function cloneServices(
  services: ServiceItem[],
  prefix = 'svc',
): ServiceItem[] {
  return services.map((s) => ({ ...s, id: uid(prefix) }))
}

function normalizeQuotation(raw: Quotation): Quotation {
  return {
    ...raw,
    functions: raw.functions.map((fn) => ({
      ...fn,
      id: fn.id ?? uid('fn'),
      services: (fn.services ?? []).map((s) => ({ ...s, id: s.id ?? uid('svc') })),
    })),
  }
}

function emptyClient(): ClientInfo {
  return {
    clientName: '',
    mobile: '',
    email: '',
    eventName: '',
    venue: '',
    city: '',
    eventDate: '',
    guestCount: '',
    notes: '',
  }
}

function emptySummary(): SummaryFields {
  return {
    discount: 0,
    additionalCharges: '',
    additionalChargesAmount: 0,
    gstEnabled: false,
    gstPercent: 18,
    advance: 0,
  }
}

export function buildDemoQuotation(): Quotation {
  const demo = demoQuotation as unknown as Quotation
  return normalizeQuotation({
    ...demo,
    client: { ...emptyClient(), ...demo.client },
    summary: { ...emptySummary(), ...demo.summary },
  })
}

export function buildNewQuotation(): Quotation {
  const today = new Date().toISOString().slice(0, 10)
  return {
    id: uid('quo'),
    quoteNumber: `Q/${new Date().getFullYear()}/${String(
      Math.floor(100 + Math.random() * 900),
    )}`,
    date: today,
    client: emptyClient(),
    functions: [],
    summary: emptySummary(),
  }
}

function loadInitial(): Quotation {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return normalizeQuotation(JSON.parse(raw) as Quotation)
  } catch {
    /* ignore corrupted storage */
  }
  return buildDemoQuotation()
}

export function templateById(type: string): FunctionTemplate | undefined {
  return (functionTemplates as FunctionTemplate[]).find((t) => t.type === type)
}

export function useQuotation() {
  const [quotation, setQuotation] = useState<Quotation>(loadInitial)
  const [loadedFromStorage, setLoadedFromStorage] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        setQuotation(normalizeQuotation(JSON.parse(raw) as Quotation))
      }
    } catch {
      /* ignore */
    }
    setLoadedFromStorage(true)
  }, [])

  useEffect(() => {
    if (!loadedFromStorage) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotation))
    } catch {
      /* storage full — ignore */
    }
  }, [quotation, loadedFromStorage])

  const updateClient = useCallback((patch: Partial<ClientInfo>) => {
    setQuotation((q) => ({ ...q, client: { ...q.client, ...patch } }))
  }, [])

  const updateSummary = useCallback((patch: Partial<SummaryFields>) => {
    setQuotation((q) => ({ ...q, summary: { ...q.summary, ...patch } }))
  }, [])

  const setQuoteNumber = useCallback((quoteNumber: string) => {
    setQuotation((q) => ({ ...q, quoteNumber }))
  }, [])

  const setQuoteDate = useCallback((date: string) => {
    setQuotation((q) => ({ ...q, date }))
  }, [])

  const addFunction = useCallback((type?: string) => {
    setQuotation((q) => {
      const tpl = type ? templateById(type) : undefined
      const fn: FunctionSection = tpl
        ? {
            id: uid('fn'),
            type: tpl.type,
            name: tpl.name,
            icon: tpl.icon,
            pricingMode: 'itemized',
            packagePrice: 0,
            services: cloneServices(tpl.services as ServiceItem[]),
            notes: '',
          }
        : {
            id: uid('fn'),
            type: 'custom',
            name: 'New Function',
            icon: 'Star',
            pricingMode: 'itemized',
            packagePrice: 0,
            services: [],
            notes: '',
          }
      return { ...q, functions: [...q.functions, fn] }
    })
  }, [])

  const duplicateFunction = useCallback((id: string) => {
    setQuotation((q) => {
      const idx = q.functions.findIndex((f) => f.id === id)
      if (idx === -1) return q
      const src = q.functions[idx]
      const copy: FunctionSection = {
        ...src,
        id: uid('fn'),
        name: `${src.name} (Copy)`,
        services: cloneServices(src.services),
      }
      const functions = [...q.functions]
      functions.splice(idx + 1, 0, copy)
      return { ...q, functions }
    })
  }, [])

  const removeFunction = useCallback((id: string) => {
    setQuotation((q) => ({
      ...q,
      functions: q.functions.filter((f) => f.id !== id),
    }))
  }, [])

  const renameFunction = useCallback((id: string, name: string) => {
    setQuotation((q) => ({
      ...q,
      functions: q.functions.map((f) => (f.id === id ? { ...f, name } : f)),
    }))
  }, [])

  const setFunctionNotes = useCallback((id: string, notes: string) => {
    setQuotation((q) => ({
      ...q,
      functions: q.functions.map((f) => (f.id === id ? { ...f, notes } : f)),
    }))
  }, [])

  const reorderFunctions = useCallback((ordered: FunctionSection[]) => {
    setQuotation((q) => ({ ...q, functions: ordered }))
  }, [])

  const copyServicesFrom = useCallback((targetId: string, sourceId: string) => {
    setQuotation((q) => {
      const source = q.functions.find((f) => f.id === sourceId)
      if (!source) return q
      return {
        ...q,
        functions: q.functions.map((f) =>
          f.id === targetId
            ? { ...f, services: cloneServices(source.services) }
            : f,
        ),
      }
    })
  }, [])

  const setFunctionPricingMode = useCallback((id: string, mode: PricingMode) => {
    setQuotation((q) => ({
      ...q,
      functions: q.functions.map((f) => (f.id === id ? { ...f, pricingMode: mode } : f)),
    }))
  }, [])

  const setPackagePrice = useCallback((id: string, packagePrice: number) => {
    setQuotation((q) => ({
      ...q,
      functions: q.functions.map((f) => (f.id === id ? { ...f, packagePrice } : f)),
    }))
  }, [])

  const addService = useCallback(
    (fnId: string, service: Omit<ServiceItem, 'id'>) => {
      setQuotation((q) => ({
        ...q,
        functions: q.functions.map((f) =>
          f.id === fnId
            ? { ...f, services: [...f.services, { ...service, id: uid('svc') }] }
            : f,
        ),
      }))
    },
    [],
  )

  const addServicesBulk = useCallback(
    (fnId: string, services: Omit<ServiceItem, 'id'>[]) => {
      setQuotation((q) => ({
        ...q,
        functions: q.functions.map((f) =>
          f.id === fnId
            ? {
                ...f,
                services: [
                  ...f.services,
                  ...services.map((s) => ({ ...s, id: uid('svc') })),
                ],
              }
            : f,
        ),
      }))
    },
    [],
  )

  const updateService = useCallback(
    (fnId: string, serviceId: string, patch: Partial<ServiceItem>) => {
      setQuotation((q) => ({
        ...q,
        functions: q.functions.map((f) =>
          f.id === fnId
            ? {
                ...f,
                services: f.services.map((s) =>
                  s.id === serviceId ? { ...s, ...patch } : s,
                ),
              }
            : f,
        ),
      }))
    },
    [],
  )

  const removeService = useCallback((fnId: string, serviceId: string) => {
    setQuotation((q) => ({
      ...q,
      functions: q.functions.map((f) =>
        f.id === fnId
          ? { ...f, services: f.services.filter((s) => s.id !== serviceId) }
          : f,
      ),
    }))
  }, [])

  const reorderServices = useCallback(
    (fnId: string, ordered: ServiceItem[]) => {
      setQuotation((q) => ({
        ...q,
        functions: q.functions.map((f) => (f.id === fnId ? { ...f, services: ordered } : f)),
      }))
    },
    [],
  )

  const resetAll = useCallback(() => {
    const fresh = buildNewQuotation()
    setQuotation(fresh)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const loadDemo = useCallback(() => {
    const demo = buildDemoQuotation()
    setQuotation(demo)
  }, [])

  return useMemo(
    () => ({
      quotation,
      updateClient,
      updateSummary,
      setQuoteNumber,
      setQuoteDate,
      addFunction,
      duplicateFunction,
      removeFunction,
      renameFunction,
      setFunctionNotes,
      reorderFunctions,
      copyServicesFrom,
      setFunctionPricingMode,
      setPackagePrice,
      addService,
      addServicesBulk,
      updateService,
      removeService,
      reorderServices,
      resetAll,
      loadDemo,
    }),
    [
      quotation,
      updateClient,
      updateSummary,
      setQuoteNumber,
      setQuoteDate,
      addFunction,
      duplicateFunction,
      removeFunction,
      renameFunction,
      setFunctionNotes,
      reorderFunctions,
      copyServicesFrom,
      setFunctionPricingMode,
      setPackagePrice,
      addService,
      addServicesBulk,
      updateService,
      removeService,
      reorderServices,
      resetAll,
      loadDemo,
    ],
  )
}

export type QuotationActions = ReturnType<typeof useQuotation>

interface QuotationContextValue extends QuotationActions {
  displayMode: PricingDisplayMode
  setDisplayMode: (mode: PricingDisplayMode) => void
  previewOpen: boolean
  openPreview: () => void
  closePreview: () => void
  exportRequested: boolean
  requestExport: () => void
  clearExportRequest: () => void
}

const QuotationContext = createContext<QuotationContextValue | null>(null)

export function QuotationProvider({ children }: { children: ReactNode }) {
  const q = useQuotation()
  const [displayMode, setDisplayMode] =
    useState<PricingDisplayMode>('detailed')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [exportRequested, setExportRequested] = useState(false)

  const value = useMemo<QuotationContextValue>(
    () => ({
      ...q,
      displayMode,
      setDisplayMode,
      previewOpen,
      openPreview: () => setPreviewOpen(true),
      closePreview: () => setPreviewOpen(false),
      exportRequested,
      requestExport: () => setExportRequested(true),
      clearExportRequest: () => setExportRequested(false),
    }),
    [q, displayMode, previewOpen, exportRequested],
  )

  return (
    <QuotationContext.Provider value={value}>
      {children}
    </QuotationContext.Provider>
  )
}

export function useQuotationContext(): QuotationContextValue {
  const ctx = useContext(QuotationContext)
  if (!ctx) {
    throw new Error(
      'useQuotationContext must be used within a QuotationProvider',
    )
  }
  return ctx
}
