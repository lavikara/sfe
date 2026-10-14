'use client'
import { useEffect, useMemo, useState } from 'react'
import type { Currency, Rate, Wallet } from '@/types/api'
import { CURRENCIES } from '@/types/api'
import { Button, Card, Money } from '@/components/ui'
import { useRatesStore } from '@/store/rateStore'
import styles from './BalanceSummary.module.css'

interface RateRequest {
  currencyKey: string
  rates: Partial<Record<Currency, Rate>>
  status: 'ready' | 'error'
}

export function BalanceSummary({ wallets }: { wallets: Wallet[] | null }) {
  const [hidden, setHidden] = useState(false)
  const [rateRequest, setRateRequest] = useState<RateRequest | null>(null)
  const fetchRates = useRatesStore((state) => state.fetchRates)
  const currencies = useMemo(
    () =>
      CURRENCIES.filter(
        (currency) => currency !== 'NGN' && (wallets ?? []).some((wallet) => wallet.currency === currency)
      ),
    [wallets]
  )
  const currencyKey = currencies.join(',')

  useEffect(() => {
    let active = true

    if (!currencyKey) return

    void fetchRates(currencies.map((from) => ({ from, to: 'NGN' }))).then((rates) => {
      if (!active) return
      if (!rates) {
        setRateRequest({ currencyKey, rates: {}, status: 'error' })
        return
      }
      setRateRequest({
        currencyKey,
        rates: rates.reduce<Partial<Record<Currency, Rate>>>((ratesByCurrency, rate) => {
          ratesByCurrency[rate.from] = rate
          return ratesByCurrency
        }, {}),
        status: 'ready',
      })
    })

    return () => {
      active = false
    }
  }, [currencies, currencyKey, fetchRates])

  const currentRateRequest = rateRequest?.currencyKey === currencyKey ? rateRequest : null
  const rates = currentRateRequest?.rates ?? {}
  const rateStatus = currencyKey ? (currentRateRequest?.status ?? 'loading') : 'ready'
  const total =
    wallets?.reduce((sum, wallet) => {
      if (wallet.currency === 'NGN') return sum + wallet.balance
      const rate = rates[wallet.currency]?.rate
      return rate === undefined ? sum : sum + Math.round(wallet.balance * rate)
    }, 0) ?? 0
  const hasAllRequiredRates =
    wallets?.every((wallet) => wallet.currency === 'NGN' || rates[wallet.currency] !== undefined) ?? false
  const canDisplayTotal = rateStatus === 'ready' && hasAllRequiredRates
  const isCalculating = wallets === null || (rateStatus === 'loading' && !canDisplayTotal)

  return (
    <Card className={styles.card}>
      <div>
        <p className={styles.label}>Total balance</p>
        <p className={styles.total}>
          {hidden ? (
            '••••••'
          ) : canDisplayTotal ? (
            <Money amount={total} currency="NGN" />
          ) : isCalculating ? (
            <span className={styles.spinner} role="status" aria-label="Calculating total balance">
              <span className={styles.spinnerDot} aria-hidden="true" />
              <span className={`${styles.spinnerDot} ${styles.spinnerDotCenter}`} aria-hidden="true" />
              <span className={`${styles.spinnerDot} ${styles.spinnerDotLast}`} aria-hidden="true" />
            </span>
          ) : (
            '—'
          )}
        </p>
        {!hidden && rateStatus === 'error' && (
          <p className={styles.error} role="alert">
            Unable to calculate total balance. Please try again later.
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className={styles.toggleButton}
        iconLeft={hidden ? 'eye' : 'eye-off'}
        onClick={() => setHidden(!hidden)}
      >
        <span className={styles.toggleLabel}>{hidden ? 'Show' : 'Hide'}</span>
      </Button>
    </Card>
  )
}
