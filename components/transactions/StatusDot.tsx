import type { TransactionStatus } from '@/types/api'
import { cx } from '@/lib/cx'
import { TRANSACTION_STATUS_LABELS } from '@/lib/format'
import styles from './StatusDot.module.css'

export function StatusDot({ status }: { status: TransactionStatus }) {
  const label = TRANSACTION_STATUS_LABELS[status]
  return (
    <span className={cx(styles.badge, styles[status] ?? styles.reversed)}>
      <span className={styles.dot} aria-hidden="true" />
      {label}
    </span>
  )
}
