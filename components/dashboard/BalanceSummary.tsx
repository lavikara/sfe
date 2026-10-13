'use client'
import { useState } from 'react'
import type { Wallet } from '@/types/api'
import { Button, Card, Money } from '@/components/ui'
import styles from './BalanceSummary.module.css'

export function BalanceSummary({ wallets }: { wallets: Wallet[] | null }) {
  const [hidden, setHidden] = useState(false)
  const total = wallets?.reduce((sum, wallet) => sum + wallet.balance, 0) ?? 0

  return (
    <Card className={styles.card}>
      <div>
        <p className={styles.label}>Total balance</p>
        <p className={styles.total}>{hidden ? '••••••' : <Money amount={total} currency="NGN" />}</p>
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
