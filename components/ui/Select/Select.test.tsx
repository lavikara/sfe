import { fireEvent, render, screen } from '@testing-library/react'
import { Select } from './Select'

const options = [
  { value: 'USD', label: 'US dollars' },
  { value: 'NGN', label: 'Nigerian naira' },
]

const optionsWithDisabled = [
  { value: 'USD', label: 'US dollars' },
  { value: 'GBP', label: 'British pounds', disabled: true },
  { value: 'NGN', label: 'Nigerian naira' },
]

describe('Select', () => {
  it('selects an option and preserves native select change events', () => {
    const onChange = vi.fn()
    render(<Select label="Currency" options={options} defaultValue="USD" onChange={onChange} />)

    fireEvent.click(screen.getByRole('combobox', { name: 'Currency' }))
    fireEvent.click(screen.getByRole('option', { name: 'Nigerian naira' }))

    expect(screen.getByRole('combobox', { name: 'Currency' })).toHaveTextContent('Nigerian naira')
    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange.mock.calls[0][0].target.value).toBe('NGN')
  })

  it('starts the highlight on the first option when opened, even if another is selected', () => {
    render(<Select label="Currency" options={options} defaultValue="NGN" />)
    const trigger = screen.getByRole('combobox', { name: 'Currency' })

    fireEvent.click(trigger)

    expect(trigger).toHaveTextContent('Nigerian naira')
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'US dollars' }).id
    )
    expect(screen.getByRole('option', { name: 'Nigerian naira' })).toHaveAttribute('aria-selected', 'true')
  })

  it('does not change the displayed value in controlled mode until the parent updates it', () => {
    const onChange = vi.fn()
    const { rerender } = render(<Select label="Currency" options={options} value="USD" onChange={onChange} />)
    const trigger = screen.getByRole('combobox', { name: 'Currency' })

    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('option', { name: 'Nigerian naira' }))

    expect(onChange).toHaveBeenCalledOnce()
    expect(trigger).toHaveTextContent('US dollars')

    rerender(<Select label="Currency" options={options} value="NGN" onChange={onChange} />)
    expect(trigger).toHaveTextContent('Nigerian naira')
  })

  it('supports keyboard navigation and selection', () => {
    render(<Select label="Currency" options={options} defaultValue="USD" />)
    const trigger = screen.getByRole('combobox', { name: 'Currency' })

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(screen.getByRole('listbox')).toBeVisible()
    expect(trigger).toHaveAttribute('aria-activedescendant')

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(trigger).toHaveTextContent('Nigerian naira')
    expect(screen.getByRole('listbox', { hidden: true })).toHaveAttribute('hidden')
  })

  it('skips disabled options during keyboard navigation', () => {
    render(<Select label="Currency" options={optionsWithDisabled} defaultValue="USD" />)
    const trigger = screen.getByRole('combobox', { name: 'Currency' })

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.keyDown(trigger, { key: 'Enter' })

    expect(trigger).toHaveTextContent('Nigerian naira')
  })

  it('jumps to the first and last enabled options with Home and End', () => {
    render(<Select label="Currency" options={optionsWithDisabled} defaultValue="USD" />)
    const trigger = screen.getByRole('combobox', { name: 'Currency' })

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.keyDown(trigger, { key: 'End' })
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Nigerian naira' }).id
    )

    fireEvent.keyDown(trigger, { key: 'Home' })
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'US dollars' }).id
    )
  })

  it('does not select a disabled option when clicked', () => {
    const onChange = vi.fn()
    render(<Select label="Currency" options={optionsWithDisabled} defaultValue="USD" onChange={onChange} />)
    const trigger = screen.getByRole('combobox', { name: 'Currency' })

    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('option', { name: 'British pounds' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(trigger).toHaveTextContent('US dollars')
    expect(screen.getByRole('listbox')).toBeVisible()
  })

  it('closes on Escape without changing the selection', () => {
    render(<Select label="Currency" options={options} defaultValue="USD" />)
    const trigger = screen.getByRole('combobox', { name: 'Currency' })

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(trigger, { key: 'Escape' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveTextContent('US dollars')
  })

  it('closes when clicking outside', () => {
    render(<Select label="Currency" options={options} defaultValue="USD" />)
    const trigger = screen.getByRole('combobox', { name: 'Currency' })

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    fireEvent.pointerDown(document.body)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})
