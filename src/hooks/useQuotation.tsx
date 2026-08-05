import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type {
  ClientInfo,
  FunctionSection,
  Quotation,
  ServiceItem,
  SummaryFields,
} from '@/types'
import { uid } from '@/utils/format'

const STORAGE_KEY = 'event-quotation-builder-v3'

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
      total: fn.total ?? 0,
      services: (fn.services ?? []).map((s) => ({ ...s, id: s.id ?? uid('svc') })),
    })),
  }
}

function emptyClient(): ClientInfo {
  return {
    clientName: '',
    mobile: '',
    eventName: '',
    venue: '',
    city: '',
    eventDate: '',
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

function sampleClient(): ClientInfo {
  return {
    clientName: 'Rahul & Priya',
    mobile: '+91 98765 43210',
    eventName: 'Wedding + Reception',
    venue: 'Green Meadows Resort',
    city: 'Rajkot',
    eventDate: '2026-11-20',
    notes: 'Include fresh flowers and warm ambience lighting.',
  }
}

export function buildSamplePriced(): Quotation {
  const base = buildNewQuotation()
  base.quoteNumber = 'Q/2026/101'
  base.date = '2026-08-06'
  base.client = sampleClient()
  base.functions = [
    {
      id: uid('fn'),
      type: 'custom',
      name: 'Wedding Mandap',
      icon: 'Heart',
      notes: 'Traditional floral mandap with full stage styling.',
      total: 0,
      services: [
        { id: uid('svc'), name: 'Floral Mandap Setup', price: 45000, included: true },
        { id: uid('svc'), name: 'Varmala / Couple Backdrop', price: 12000, included: true },
        { id: uid('svc'), name: 'Guest Seating Arrangement', price: 8000, included: true },
        { id: uid('svc'), name: 'Ambience Lighting', price: 15000, included: true },
        { id: uid('svc'), name: 'Sound System with Mics', price: 10000, included: true },
      ],
    },
    {
      id: uid('fn'),
      type: 'custom',
      name: 'Reception',
      icon: 'PartyPopper',
      notes: 'Evening reception with round-table seating.',
      total: 0,
      services: [
        { id: uid('svc'), name: 'Reception Stage Décor', price: 60000, included: true },
        { id: uid('svc'), name: 'LED Wall Visuals', price: 30000, included: true },
        { id: uid('svc'), name: 'DJ & Sound Setup', price: 25000, included: true },
      ],
    },
  ]
  base.summary = {
    discount: 10000,
    additionalCharges: 'GST & service tax',
    additionalChargesAmount: 0,
    gstEnabled: true,
    gstPercent: 18,
    advance: 50000,
  }
  return base
}

export function buildSampleTotal(): Quotation {
  const base = buildNewQuotation()
  base.quoteNumber = 'Q/2026/102'
  base.date = '2026-08-06'
  base.client = sampleClient()
  base.functions = [
    {
      id: uid('fn'),
      type: 'custom',
      name: 'Haldi Function',
      icon: 'Sun',
      notes: 'Morning haldi function at the venue lawn.',
      total: 55000,
      services: [
        { id: uid('svc'), name: 'Haldi Stage with Yellow Theme', price: 0, included: true },
        { id: uid('svc'), name: 'Fresh Marigold Décor & Tubs', price: 0, included: true },
        { id: uid('svc'), name: 'Welcome Board & Sound Setup', price: 0, included: true },
        { id: uid('svc'), name: 'Seating & Balloon Arch', price: 0, included: true },
      ],
    },
    {
      id: uid('fn'),
      type: 'custom',
      name: 'Reception',
      icon: 'PartyPopper',
      notes: 'Grand reception with full styling.',
      total: 125000,
      services: [
        { id: uid('svc'), name: 'Reception Stage & Backdrop', price: 0, included: true },
        { id: uid('svc'), name: 'Entry Décor & Floral Setup', price: 0, included: true },
        { id: uid('svc'), name: 'DJ, Sound & Photo Corner', price: 0, included: true },
      ],
    },
  ]
  base.summary = {
    discount: 15000,
    additionalCharges: '',
    additionalChargesAmount: 0,
    gstEnabled: true,
    gstPercent: 18,
    advance: 80000,
  }
  return base
}

function loadInitial(): Quotation {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return normalizeQuotation(JSON.parse(raw) as Quotation)
  } catch {
    /* ignore corrupted storage */
  }
  return buildNewQuotation()
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

  const addFunction = useCallback((name?: string, icon?: string) => {
    setQuotation((q) => {
      const fn: FunctionSection = {
        id: uid('fn'),
        type: 'custom',
        name: name || 'New Function',
        icon: icon || 'Star',
        services: [],
        notes: '',
        total: 0,
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

  const setFunctionTotal = useCallback((id: string, total: number) => {
    setQuotation((q) => ({
      ...q,
      functions: q.functions.map((f) => (f.id === id ? { ...f, total } : f)),
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

  const addService = useCallback(
    (fnId: string, service: Omit<ServiceItem, 'id'>): string => {
      const id = uid('svc')
      setQuotation((q) => ({
        ...q,
        functions: q.functions.map((f) =>
          f.id === fnId
            ? { ...f, services: [...f.services, { ...service, id }] }
            : f,
        ),
      }))
      return id
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

  const loadSamplePriced = useCallback(() => {
    setQuotation(buildSamplePriced())
  }, [])

  const loadSampleTotal = useCallback(() => {
    setQuotation(buildSampleTotal())
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
      setFunctionTotal,
      reorderFunctions,
      copyServicesFrom,
      addService,
      addServicesBulk,
      updateService,
      removeService,
      reorderServices,
      resetAll,
      loadSamplePriced,
      loadSampleTotal,
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
      setFunctionTotal,
      reorderFunctions,
      copyServicesFrom,
      addService,
      addServicesBulk,
      updateService,
      removeService,
      reorderServices,
      resetAll,
      loadSamplePriced,
      loadSampleTotal,
    ],
  )
}

export type QuotationActions = ReturnType<typeof useQuotation>

interface QuotationContextValue extends QuotationActions {
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
  const [previewOpen, setPreviewOpen] = useState(false)
  const [exportRequested, setExportRequested] = useState(false)

  const value = useMemo<QuotationContextValue>(
    () => ({
      ...q,
      previewOpen,
      openPreview: () => setPreviewOpen(true),
      closePreview: () => setPreviewOpen(false),
      exportRequested,
      requestExport: () => setExportRequested(true),
      clearExportRequest: () => setExportRequested(false),
    }),
    [q, previewOpen, exportRequested],
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
