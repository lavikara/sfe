import { fireEvent, render, screen } from '@testing-library/react'
import {
  NoTransactionsMatch,
  NoTransactionsYet,
  TransactionDetailsLoading,
  TransactionNotFound,
  TransactionsLoadError,
  TransactionsLoading,
} from './index'

describe('transaction empty states', () => {
  it('renders the filter-empty state and invokes clear filters', () => {
    const onClearFilters = vi.fn()
    render(<NoTransactionsMatch onClearFilters={onClearFilters} />)

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))

    expect(screen.getByText('No transactions match your filters')).toBeInTheDocument()
    expect(onClearFilters).toHaveBeenCalledOnce()
  })

  it('renders the load error and invokes retry', () => {
    const onRetry = vi.fn()
    render(<TransactionsLoadError onRetry={onRetry} />)

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(screen.getByRole('alert')).toHaveTextContent('We couldn’t load your transactions')
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('renders the no-transactions state', () => {
    render(<NoTransactionsYet />)

    expect(screen.getByText('No transactions yet')).toBeInTheDocument()
  })

  it('renders accessible transaction detail loading state', () => {
    render(<TransactionDetailsLoading onClose={vi.fn()} />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading transaction details')
    expect(screen.getByRole('button', { name: 'Close transaction details' })).toBeInTheDocument()
  })

  it('renders the requested number of transaction loading rows', () => {
    const { container } = render(<TransactionsLoading count={3} />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading transactions')
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(3)
  })

  it('renders the not-found state and invokes the back action', () => {
    const onBackToTransactions = vi.fn()
    render(<TransactionNotFound onBackToTransactions={onBackToTransactions} />)

    fireEvent.click(screen.getByRole('button', { name: 'Back to transactions' }))

    expect(screen.getByText('Transaction not found')).toBeInTheDocument()
    expect(onBackToTransactions).toHaveBeenCalledOnce()
  })
})
