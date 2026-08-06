export interface ClientInfo {
  clientName: string
  mobile: string
  eventName: string
  venue: string
  city: string
  eventDate: string
  notes: string
}

export interface ServiceItem {
  id: string
  name: string
  price: number
  included?: boolean
}

export interface FunctionSection {
  id: string
  type: string
  name: string
  icon: string
  services: ServiceItem[]
  photos: string[]
  notes: string
  total: number
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
