import { render, screen } from '@testing-library/react'
import { WalletCardsLoading } from './WalletCardsLoading'

describe('WalletCardsLoading', () => {
  it('renders one loading card for each supported currency', () => {
    const { container } = render(<WalletCardsLoading />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading wallets')
    expect(container.querySelectorAll('article')).toHaveLength(3)
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
  })
})
