import { Icon } from '../Icon'
import styles from './EmptyState.module.css'

export interface TransactionNotFoundProps {
  onBackToTransactions: () => void
}

export function TransactionNotFound({ onBackToTransactions }: TransactionNotFoundProps) {
  return (
    <section className={`${styles.panel} ${styles.notFoundPanel}`} aria-labelledby="transaction-not-found-title">
      <div className={styles.content}>
        <span className={styles.iconCircle} aria-hidden="true">
          <Icon name="search" size={30} />
        </span>
        <h2 id="transaction-not-found-title" className={styles.title}>
          Transaction not found
        </h2>
        <p className={styles.description}>It may have been removed, or the link is wrong.</p>
        <button type="button" className={styles.secondaryButton} onClick={onBackToTransactions}>
          Back to transactions
        </button>
      </div>
    </section>
  )
}
