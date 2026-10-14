import { act, renderHook } from '@testing-library/react'
import { convert } from '@/lib/api/endpoints'
import { useConvert } from './useConvert'

vi.mock('@/lib/api/endpoints', () => ({
  convert: vi.fn(),
}))

describe('useConvert', () => {
  it('submits a conversion and returns the result', async () => {
    const conversion = {
      id: 'conversion-1',
      from: 'USD' as const,
      to: 'NGN' as const,
      amount: 1000,
      fee: 15,
      rate: 1500,
      received: 1_500_000,
      status: 'successful' as const,
    }
    vi.mocked(convert).mockResolvedValue({ data: conversion })
    const { result } = renderHook(() => useConvert())

    let converted
    await act(async () => {
      converted = await result.current.handleConvert('USD', 'NGN', 1000)
    })

    expect(convert).toHaveBeenCalledWith({ from: 'USD', to: 'NGN', amount: 1000 })
    expect(converted).toEqual(conversion)
    expect(result.current.result).toEqual(conversion)
    expect(result.current.error).toBe('')
    expect(result.current.submitting).toBe(false)
  })

  it('exposes a request failure as an error message', async () => {
    vi.mocked(convert).mockRejectedValue(new Error('Conversion failed'))
    const { result } = renderHook(() => useConvert())

    await act(async () => {
      await result.current.handleConvert('USD', 'NGN', 1000)
    })

    expect(result.current.error).toBe('Conversion failed')
    expect(result.current.submitting).toBe(false)
  })
})
