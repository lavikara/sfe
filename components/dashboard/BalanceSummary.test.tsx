import { render, screen, waitFor } from '@testing-library/react'
import { getRate } from '@/lib/api/endpoints'
import { BalanceSummary } from './BalanceSummary'

vi.mock('@/lib/api/endpoints', () => ({
  getRate: vi.fn(),
}))

describe('BalanceSummary', () => {
  beforeEach(() => {
    vi.mocked(getRate).mockReset()
  })

  it('shows a single NGN wallet without requesting an exchange rate', async () => {
    render(<BalanceSummary wallets={[{ currency: 'NGN', balance: 124583050 }]} />)

    expect(await screen.findByText('₦1,245,830.50')).toBeInTheDocument()
    expect(getRate).not.toHaveBeenCalled()
  })

  it('converts a single foreign-currency wallet to NGN', async () => {
    vi.mocked(getRate).mockResolvedValue({
      data: {
        from: 'USD',
        to: 'NGN',
        rate: 1530.25,
        updatedAt: '2026-10-14T00:00:00.000Z',
      },
    })
    render(<BalanceSummary wallets={[{ currency: 'USD', balance: 234075 }]} />)

    expect(await screen.findByText('₦3,581,932.69')).toBeInTheDocument()
    expect(getRate).toHaveBeenCalledWith('USD', 'NGN')
  })

  it('shows an accessible spinner while waiting for exchange rates', async () => {
    let resolveRate!: (response: Awaited<ReturnType<typeof getRate>>) => void
    vi.mocked(getRate).mockReturnValue(
      new Promise((resolve) => {
        resolveRate = resolve
      }),
    )
    render(<BalanceSummary wallets={[{ currency: 'USD', balance: 234075 }]} />)

    expect(screen.getByRole('status', { name: 'Calculating total balance' })).toBeInTheDocument()

    resolveRate({
      data: {
        from: 'USD',
        to: 'NGN',
        rate: 1530.25,
        updatedAt: '2026-10-14T00:00:00.000Z',
      },
    })
    expect(await screen.findByText('₦3,581,932.69')).toBeInTheDocument()
  })

  it('converts and totals wallets for each distinct non-NGN currency', async () => {
    vi.mocked(getRate).mockImplementation(async (from, to) => ({
      data: {
        from,
        to,
        rate: from === 'USD' ? 1530.25 : 98.4,
        updatedAt: '2026-10-14T00:00:00.000Z',
      },
    }))
    render(
      <BalanceSummary
        wallets={[
          { currency: 'NGN', balance: 124583050 },
          { currency: 'USD', balance: 234075 },
          { currency: 'GHS', balance: 85020 },
          { currency: 'USD', balance: 100 },
        ]}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('₦4,912,953.12')).toBeInTheDocument()
    })
    expect(getRate).toHaveBeenCalledTimes(2)
    expect(getRate).toHaveBeenCalledWith('USD', 'NGN')
    expect(getRate).toHaveBeenCalledWith('GHS', 'NGN')
  })
})
