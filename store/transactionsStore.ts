import { create } from 'zustand'
import type { Transaction,PageMeta } from '@/types/api'
import { getTransactions } from '@/lib/api/endpoints'

interface TransactionState {
  transactions: Transaction[] | null
  transactionsMeta: PageMeta | null
  transactionsLoading: boolean
  fetchTransactions: () => Promise<void>
}

export const useTransactionsStore = create<TransactionState>((set) => ({
  transactions: null,
  transactionsMeta:null,
  transactionsLoading: true,
    
  fetchTransactions: async () => {
    set({ transactionsLoading: true })
    try {
      const response = await getTransactions()
      set({ transactions: response.data })
      set({ transactionsMeta: response.meta })
      set({ transactionsLoading: false })
    } catch (err) {
      console.error('Error fetching transactions:', err)
      set({ transactionsLoading: false })
    }
  },
}))
