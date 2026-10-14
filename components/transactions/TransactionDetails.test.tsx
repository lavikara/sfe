import { act, fireEvent, render, screen } from '@testing-library/react'
import type { Transaction } from '@/types/api'
import { TransactionDetails } from './TransactionDetails'

const transaction: Transaction = {
  id: 'transaction-1',
  reference: 'ACM-48213377',
  type: 'transfer_out',
  status: 'successful',
  currency: 'GHS',
  amount: 120000,
  fee: 1200,
  narration: 'Transfer to Kwame Mensah',
  counterparty: 'Kwame Mensah',
  createdAt: '2026-10-05T10:15:00.000Z',
}

describe('TransactionDetails', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    Reflect.deleteProperty(document, 'execCommand')
  })

  it('renders the overview, detail rows, and amount summary', () => {
    const { container } = render(<TransactionDetails transaction={transaction} />)

    expect(screen.getByText('KM')).toBeInTheDocument()
    expect(container.querySelector('.heroAmount')).toHaveTextContent(/-\s*GH₵1,200\.00/)
    expect(screen.getByText('ACM-48213377')).toBeInTheDocument()
    expect(screen.getByText('Counterparty')).toBeInTheDocument()
    expect(screen.getAllByText('Transfer to Kwame Mensah')).toHaveLength(2)
    expect(screen.getByText('GH₵1,200.00')).toBeInTheDocument()
    expect(screen.getByText('GH₵12.00')).toBeInTheDocument()
    expect(screen.getByText('GH₵1,212.00')).toBeInTheDocument()
  })

  it('shows a green success message and clears it after three seconds', async () => {
    vi.useFakeTimers()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
    const { container } = render(<TransactionDetails transaction={transaction} />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy transaction reference' }))
    })
    expect(screen.getByText('Reference copied')).toHaveClass('copyMessageSuccess')

    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.queryByText('Reference copied')).not.toBeInTheDocument()
    expect(container.querySelector('[aria-live="polite"]')).toBeEmptyDOMElement()
  })

  it('shows a red error message and clears it after three seconds', async () => {
    vi.useFakeTimers()
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('Clipboard unavailable')) },
    })
    render(<TransactionDetails transaction={transaction} />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy transaction reference' }))
    })
    expect(screen.getByText('Unable to copy reference')).toHaveClass('copyMessageError')

    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.queryByText('Unable to copy reference')).not.toBeInTheDocument()
  })

  it('copies using the fallback when clipboard access is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    })
    const execCommand = vi.fn().mockReturnValue(true)
    Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand })
    render(<TransactionDetails transaction={transaction} />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy transaction reference' }))
    })

    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(screen.getByText('Reference copied')).toHaveClass('copyMessageSuccess')
  })

  it('falls back to selection-based copying when clipboard access is rejected', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('Clipboard permission denied')) },
    })
    const execCommand = vi.fn().mockReturnValue(true)
    Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand })
    render(<TransactionDetails transaction={transaction} />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy transaction reference' }))
    })

    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(screen.getByText('Reference copied')).toHaveClass('copyMessageSuccess')
  })
})
