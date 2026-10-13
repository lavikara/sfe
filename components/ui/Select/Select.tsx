'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent, type SelectHTMLAttributes } from 'react'
import { cx } from '@/lib/cx'
import { Field } from '../Field'
import { Icon } from '../Icon'
import styles from './Select.module.css'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label: string
  hideLabel?: boolean
  options: readonly SelectOption[]
  fieldClassName?: string
}

export function Select({
  label,
  hideLabel,
  options,
  fieldClassName,
  className,
  value,
  defaultValue,
  disabled = false,
  onChange,
  ...rest
}: SelectProps) {
  const generatedId = useId()
  const listboxId = `${generatedId}-listbox`
  const rootRef = useRef<HTMLDivElement>(null)
  const selectRef = useRef<HTMLSelectElement>(null)
  const [uncontrolledValue, setUncontrolledValue] = useState(
    String(defaultValue ?? options[0]?.value ?? ''),
  )
  const [open, setOpen] = useState(false)

  const requestedValue = value === undefined ? uncontrolledValue : String(value)
  const requestedIndex = options.findIndex((option) => option.value === requestedValue)
  const firstEnabledIndex = options.findIndex((option) => !option.disabled)
  const selectedIndex = requestedIndex !== -1 ? requestedIndex : firstEnabledIndex
  const selectedOption = options[selectedIndex]
  const selectedValue = selectedOption?.value ?? ''

  const [activeIndex, setActiveIndex] = useState(0)
  const activeOptionIndex = Math.max(0, Math.min(activeIndex, options.length - 1))

  useEffect(() => {
    if (!open) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [open])

  const openMenu = (index = 0) => {
    setActiveIndex(index)
    setOpen(true)
  }

  const selectOption = (option: SelectOption) => {
    if (option.disabled || disabled) return

    setUncontrolledValue(option.value)
    const select = selectRef.current
    if (select) {
      const valueSetter = Object.getOwnPropertyDescriptor(
        HTMLSelectElement.prototype,
        'value',
      )?.set
      valueSetter?.call(select, option.value)
      select.dispatchEvent(new Event('change', { bubbles: true }))
    }
    setOpen(false)
  }

  const moveActiveOption = (direction: number) => {
    if (!options.length) return

    let nextIndex = activeOptionIndex
    for (let index = 0; index < options.length; index += 1) {
      nextIndex = (nextIndex + direction + options.length) % options.length
      if (!options[nextIndex].disabled) {
        setActiveIndex(nextIndex)
        return
      }
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        openMenu()
      } else {
        moveActiveOption(event.key === 'ArrowDown' ? 1 : -1)
      }
      return
    }

    if (event.key === 'Home' || event.key === 'End') {
      if (!open) return
      event.preventDefault()
      const direction = event.key === 'Home' ? 1 : -1
      let index = event.key === 'Home' ? 0 : options.length - 1
      while (options[index]?.disabled && index >= 0 && index < options.length) index += direction
      if (index >= 0 && index < options.length) setActiveIndex(index)
      return
    }

    if (event.key === 'Escape' && open) {
      event.preventDefault()
      setOpen(false)
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!open) {
        openMenu()
      } else {
        const option = options[activeOptionIndex]
        if (option) selectOption(option)
      }
    }
  }

  return (
    <Field label={label} hideLabel={hideLabel} className={fieldClassName}>
      <div className={styles.control} ref={rootRef}>
        <select
          {...rest}
          ref={selectRef}
          className={styles.nativeSelect}
          value={selectedValue}
          disabled={disabled}
          onChange={(event) => onChange?.(event)}
          tabIndex={-1}
          aria-hidden="true"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={cx(styles.select, className)}
          role="combobox"
          aria-label={label}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={open ? `${listboxId}-option-${activeOptionIndex}` : undefined}
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : openMenu())}
          onKeyDown={handleKeyDown}
        >
          <span>{selectedOption?.label ?? ''}</span>
          <Icon name="chevron-down" size={16} className={styles.chevron} />
        </button>
        <div id={listboxId} className={styles.listbox} role="listbox" hidden={!open}>
          {options.map((option, index) => (
            <div
              key={option.value}
              id={`${listboxId}-option-${index}`}
              className={cx(
                styles.option,
                option.value === selectedValue && styles.activeOption,
                option.disabled && styles.disabledOption,
              )}
              role="option"
              aria-selected={option.value === selectedValue}
              aria-disabled={option.disabled || undefined}
              onMouseEnter={() => !option.disabled && setActiveIndex(index)}
              onClick={() => selectOption(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      </div>
    </Field>
  )
}