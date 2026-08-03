export type PricingMode = 'package' | 'itemized'

export interface ClientInfo {
  clientName: string
  mobile: string
  email: string
  eventName: string
  venue: string
  city: string
  eventDate: string
  guestCount: string
  notes: string
}

export interface ServiceItem {
  id: string
  name: string
  description: string
  qty: number
  price: number
  category?: string
  included?: boolean
}

export interface FunctionSection {
  id: string
  type: string
  name: string
  icon: string
  pricingMode: PricingMode
  packagePrice: number
  services: ServiceItem[]
  notes: string
}

export interface SummaryFields {
  discount: number
  additionalCharges: string
  additionalChargesAmount: number
  gstEnabled: boolean
  gstPercent: number
  advance: number
}

export interface Quotation {
  id: string
  quoteNumber: string
  date: string
  client: ClientInfo
  functions: FunctionSection[]
  summary: SummaryFields
}

export interface FunctionTemplate {
  type: string
  name: string
  icon: string
  description: string
  services: Omit<ServiceItem, 'id'>[]
}

export interface ServiceTemplate {
  name: string
  description: string
  price: number
  category: string
}

export interface ServiceCategory {
  id: string
  name: string
  icon: string
}

export interface CompanyInfo {
  name: string
  tagline: string
  address: string
  city: string
  phone: string
  email: string
  website: string
  gstin: string
  quotePrefix: string
  currency: string
  terms: string[]
  bankDetails: {
    accountName: string
    accountNumber: string
    ifsc: string
    bank: string
  }
}

export type ViewMode = 'edit' | 'preview'
export type PricingDisplayMode = 'package' | 'detailed'
