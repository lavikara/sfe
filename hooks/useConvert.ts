'use client'

import { useCallback, useState } from 'react'
import type { Conversion, Currency } from '@/types/api'
import { convert } from '@/lib/api/endpoints'

export function useConvert() {
  const [result, setResult] = useState<Conversion | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleConvert = useCallback(
    async (from: Currency, to: Currency, amount: number): Promise<Conversion | null> => {
      if (amount <= 0 || from === to || submitting) return null

      setError('')
      setSubmitting(true)
      try {
        const response = await convert({ from, to, amount })
        setResult(response.data)
        return response.data
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
        return null
      } finally {
        setSubmitting(false)
      }
    },
    [submitting],
  )

  return { result, error, submitting, handleConvert }
}
