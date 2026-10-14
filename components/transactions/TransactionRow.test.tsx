import { render, screen } from '@testing-library/react'
import type { Transaction } from '@/types/api'
import { formatTime } from '@/lib/format'
import { TransactionRow } from './TransactionRow'

const transaction: Transaction = {
  id: 'transaction-1',
  reference: 'ref-1',
  type: 'transfer_in',
  status: 'successful',
  currency: 'NGN',
  amount: 150050,
  fee: 0,
  narration: 'Transfer from Ada Okafor',
  counterparty: 'Ada Okafor',
  createdAt: '2026-10-13T09:03:00.000Z',
}

describe('TransactionRow', () => {
  it('shows counterparty initials, status, signed amount, and time', () => {
    render(<TransactionRow transaction={transaction} />)

    expect(screen.getByText('AO')).toBeInTheDocument()
    expect(screen.getByText('Successful')).toBeInTheDocument()
    expect(screen.getByText('+₦1,500.50')).toBeInTheDocument()
    expect(screen.getByText(formatTime(transaction.createdAt))).toBeInTheDocument()
  })
})
