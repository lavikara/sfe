import { fireEvent, render, screen } from '@testing-library/react'
import type { PageMeta } from '@/types/api'
import { Pagination } from './Pagination'

const pagination: PageMeta = {
  page: 12,
  limit: 10,
  total: 500,
  totalPages: 50,
}

describe('Pagination', () => {
  it('moves back exactly one page from page twelve', () => {
    const onPageChange = vi.fn()
    render(<Pagination pagination={pagination} onPageChange={onPageChange} />)

    fireEvent.click(screen.getByRole('button', { name: /previous/i }))

    expect(onPageChange).toHaveBeenCalledOnce()
    expect(onPageChange).toHaveBeenCalledWith(11)
  })

  it('keeps the previous-page action one page at a time after rerender', () => {
    const onPageChange = vi.fn()
    const { rerender } = render(<Pagination pagination={pagination} onPageChange={onPageChange} />)

    fireEvent.click(screen.getByRole('button', { name: /previous/i }))
    rerender(
      <Pagination
        pagination={{ ...pagination, page: onPageChange.mock.calls[0][0] }}
        onPageChange={onPageChange}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /previous/i }))

    expect(onPageChange.mock.calls).toEqual([[11], [10]])
  })
})
