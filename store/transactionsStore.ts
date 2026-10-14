import { create } from 'zustand'
import type { Transaction, PageMeta } from '@/types/api'
import { getTransactions, type TransactionQuery } from '@/lib/api/endpoints'

interface TransactionState {
  transactions: Transaction[] | null
  transactionsMeta: PageMeta
  transactionsLoading: boolean
  fetchTransactions: (query?: TransactionQuery) => Promise<void>
}

export const useTransactionsStore = create<TransactionState>((set) => {
  let latestRequest = 0

  return {
    transactions: null,
    transactionsMeta: { page: 1, limit: 20, total: 0,totalPages: 0 },
    transactionsLoading: true,

    fetchTransactions: async (query = {}) => {
      const requestId = ++latestRequest
      set({ transactionsLoading: true })
      try {
        const response = await getTransactions(query)
        if (requestId !== latestRequest) return

        set({
          transactions: response.data,
          transactionsMeta: response.meta,
          transactionsLoading: false,
        })
      } catch (err) {
        console.error('Error fetching transactions:', err)
        if (requestId === latestRequest) set({ transactionsLoading: false })
      }
    },
  }
})
