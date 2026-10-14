import { fireEvent, render, screen } from '@testing-library/react'
import { Drawer } from './Drawer'

describe('Drawer', () => {
  it('renders an accessible dialog and closes with the close button', () => {
    const onClose = vi.fn()
    render(
      <Drawer open title="Transaction details" onClose={onClose}>
        Drawer content
      </Drawer>
    )

    expect(screen.getByRole('dialog', { name: 'Transaction details' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closes on Escape without treating clicks inside the drawer as backdrop clicks', () => {
    const onClose = vi.fn()
    render(
      <Drawer open title="Transaction details" onClose={onClose}>
        Drawer content
      </Drawer>
    )

    fireEvent.click(screen.getByText('Drawer content'))
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })
})
