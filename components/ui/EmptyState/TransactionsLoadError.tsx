import { Icon } from '../Icon'
import styles from './EmptyState.module.css'

export interface TransactionsLoadErrorProps {
  onRetry: () => void
}

export function TransactionsLoadError({ onRetry }: TransactionsLoadErrorProps) {
  return (
    <section className={styles.panel} aria-labelledby="transactions-load-error-title" role="alert">
      <div className={styles.content}>
        <span className={`${styles.iconCircle} ${styles.dangerIcon}`} aria-hidden="true">
          <Icon name="alert" size={30} />
        </span>
        <h2 id="transactions-load-error-title" className={styles.title}>
          We couldn’t load your transactions
        </h2>
        <p className={styles.description}>Check your connection and try again.</p>
        <button type="button" className={styles.primaryButton} onClick={onRetry}>
          <Icon name="refresh" size={20} />
          Try again
        </button>
      </div>
    </section>
  )
}
