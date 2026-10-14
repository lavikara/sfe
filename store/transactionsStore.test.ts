import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTransactionsStore } from './transactionsStore'
import { getTransactions } from '@/lib/api/endpoints'

vi.mock('@/lib/api/endpoints', () => ({
  getTransactions: vi.fn(),
}))

describe('transactions store', () => {
  beforeEach(() => {
    useTransactionsStore.setState({
      transactions: null,
      transactionsMeta: { page: 1, limit: 20, total: 0, totalPages: 0 },
      transactionsLoading: true,
      transactionsError: false,
    })
    vi.mocked(getTransactions).mockResolvedValue({
      data: [],
      meta: { page: 3, limit: 20, total: 0, totalPages: 1 },
    })
  })

  it('passes the current filters and pagination to the transactions API', async () => {
    const query = {
      page: 3,
      limit: 20,
      q: 'coffee',
      type: 'deposit' as const,
      status: 'successful' as const,
    }

    await useTransactionsStore.getState().fetchTransactions(query)

    expect(getTransactions).toHaveBeenCalledWith(query)
  })

  it('sets an error state on failure and clears it after a successful retry', async () => {
    const error = new Error('Service unavailable')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(getTransactions).mockRejectedValueOnce(error)

    await useTransactionsStore.getState().fetchTransactions({ limit: 5 })

    expect(useTransactionsStore.getState().transactionsLoading).toBe(false)
    expect(useTransactionsStore.getState().transactionsError).toBe(true)
    expect(consoleError).toHaveBeenCalledWith('Error fetching transactions:', error)

    await useTransactionsStore.getState().fetchTransactions({ limit: 5 })

    expect(useTransactionsStore.getState().transactionsError).toBe(false)
    consoleError.mockRestore()
  })

  it('does not let an older query response replace newer results', async () => {
    let resolveFirst!: (response: Awaited<ReturnType<typeof getTransactions>>) => void
    let resolveSecond!: (response: Awaited<ReturnType<typeof getTransactions>>) => void
    const firstResponse = new Promise<Awaited<ReturnType<typeof getTransactions>>>((resolve) => {
      resolveFirst = resolve
    })
    const secondResponse = new Promise<Awaited<ReturnType<typeof getTransactions>>>((resolve) => {
      resolveSecond = resolve
    })
    vi.mocked(getTransactions)
      .mockReturnValueOnce(firstResponse)
      .mockReturnValueOnce(secondResponse)

    const firstRequest = useTransactionsStore.getState().fetchTransactions({ q: 'older' })
    const secondRequest = useTransactionsStore.getState().fetchTransactions({ q: 'newer' })
    resolveSecond({ data: [], meta: { page: 1, limit: 20, total: 2, totalPages: 1 } })
    await secondRequest
    resolveFirst({ data: [], meta: { page: 1, limit: 20, total: 1, totalPages: 1 } })
    await firstRequest

    expect(useTransactionsStore.getState().transactionsMeta?.total).toBe(2)
  })
})
