import { create } from 'zustand'
import type { Rate, Currency } from '@/types/api'
import { getRate } from '@/lib/api/endpoints'

interface RateState {
  rate: Rate | null
  ratesLoading: boolean
  ratesError: boolean
  fetchRates: (
    query: { from: Currency; to: Currency } | Array<{ from: Currency; to: Currency }>
  ) => Promise<Rate[] | null>
}

export const useRatesStore = create<RateState>((set) => {
  let latestRequest = 0

  return {
    rate: null,
    ratesLoading: true,
    ratesError: false,

    fetchRates: async (query) => {
      const requestId = ++latestRequest
      const queries = Array.isArray(query) ? query : [query]
      set({ ratesLoading: true, ratesError: false })
      try {
        const responses = await Promise.all(queries.map(({ from, to }) => getRate(from, to)))
        const rates = responses.map((response) => response.data)
        if (requestId === latestRequest) {
          set({ rate: rates[0] ?? null, ratesLoading: false, ratesError: false })
        }

        return rates
      } catch (err) {
        console.error('Error fetching rate:', err)
        if (requestId === latestRequest) {
          set({ ratesLoading: false, ratesError: true })
        }
        return null
      }
    },
  }
})
