import { Icon } from '../Icon'
import styles from './EmptyState.module.css'

export interface NoTransactionsMatchProps {
  onClearFilters: () => void
}

export function NoTransactionsMatch({ onClearFilters }: NoTransactionsMatchProps) {
  return (
    <section className={styles.panel} aria-labelledby="no-transactions-match-title">
      <div className={styles.content}>
        <span className={styles.iconCircle} aria-hidden="true">
          <Icon name="search" size={30} />
        </span>
        <h2 id="no-transactions-match-title" className={styles.title}>
          No transactions match your filters
        </h2>
        <p className={styles.description}>Try a different search term or remove some filters.</p>
        <button type="button" className={styles.secondaryButton} onClick={onClearFilters}>
          Clear filters
        </button>
      </div>
    </section>
  )
}
