import { render, screen } from '@testing-library/react'
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
})
