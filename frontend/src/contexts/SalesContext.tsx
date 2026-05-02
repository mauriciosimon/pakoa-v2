import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { getUserSales as getMockUserSales, getAllSales as getMockAllSales, type Sale, type FunnelStatus } from '@/data/mockData'

const STORAGE_KEY = 'pakoa.sales.added'

export interface NewSaleInput {
  userId: string
  customerName: string
  customerPhone: string
  productType: string
  amount: number
  funnelStatus?: FunnelStatus
  campaignId?: string | null
  notes?: string | null
  salesNumber?: string
}

interface SalesContextType {
  getSalesForUser: (userId: string) => Sale[]
  getAllSales: () => Sale[]
  addSale: (input: NewSaleInput) => Sale
  resetAddedSales: () => void
  hasAddedSales: boolean
}

const SalesContext = createContext<SalesContextType | undefined>(undefined)

function readStored(): Sale[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Sale[]) : []
  } catch {
    return []
  }
}

function writeStored(sales: Sale[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sales))
  } catch {
    // ignore
  }
}

export function SalesProvider({ children }: { children: ReactNode }) {
  const [addedSales, setAddedSales] = useState<Sale[]>(() => readStored())

  useEffect(() => {
    writeStored(addedSales)
  }, [addedSales])

  const getSalesForUser = useCallback(
    (userId: string): Sale[] => {
      const mock = getMockUserSales(userId)
      const added = addedSales.filter((s) => s.userId === userId)
      // newest first so added sales appear at top
      return [...added, ...mock]
    },
    [addedSales]
  )

  const getAllSales = useCallback((): Sale[] => {
    return [...addedSales, ...getMockAllSales()]
  }, [addedSales])

  const addSale = useCallback((input: NewSaleInput): Sale => {
    const now = new Date().toISOString()
    const sale: Sale = {
      id: `sale-added-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: input.userId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      productType: input.productType,
      amount: input.amount,
      funnelStatus: input.funnelStatus ?? 'PROSPECTO',
      capturedAt: now,
      quotedAt: null,
      scheduledAt: null,
      installedAt: null,
      cancelledAt: null,
      notes: input.notes ?? null,
      salesNumber: input.salesNumber,
    }
    setAddedSales((prev) => [sale, ...prev])
    return sale
  }, [])

  const resetAddedSales = useCallback(() => {
    setAddedSales([])
  }, [])

  const value = useMemo<SalesContextType>(
    () => ({
      getSalesForUser,
      getAllSales,
      addSale,
      resetAddedSales,
      hasAddedSales: addedSales.length > 0,
    }),
    [getSalesForUser, getAllSales, addSale, resetAddedSales, addedSales.length]
  )

  return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>
}

export function useSales() {
  const ctx = useContext(SalesContext)
  if (!ctx) throw new Error('useSales must be used within a SalesProvider')
  return ctx
}
