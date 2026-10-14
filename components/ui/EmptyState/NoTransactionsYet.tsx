import { Icon } from '../Icon'
import styles from './EmptyState.module.css'

export function NoTransactionsYet() {
  return (
    <section className={styles.panel} aria-labelledby="no-transactions-title">
      <div className={styles.content}>
        <span className={styles.iconCircle} aria-hidden="true">
          <Icon name="inbox" size={30} />
        </span>
        <h2 id="no-transactions-title" className={styles.title}>
          No transactions yet
        </h2>
        <p className={styles.description}>
          When you add money, send a transfer or pay with your card, it will show up here.
        </p>
      </div>
    </section>
  )
}
