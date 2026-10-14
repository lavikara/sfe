import { CURRENCIES } from '@/types/api'
import styles from './EmptyState.module.css'

export function WalletCardsLoading() {
  return (
    <div className={styles.walletLoadingGrid} aria-label="Loading wallets" aria-busy="true">
      {CURRENCIES.map((currency) => (
        <article className={styles.walletSkeleton} key={currency} aria-hidden="true">
          <span className={`${styles.skeleton} ${styles.walletLabelSkeleton}`} />
          <span className={`${styles.skeleton} ${styles.walletBalanceSkeleton}`} />
        </article>
      ))}
      <span className="visually-hidden" role="status">
        Loading wallets
      </span>
    </div>
  )
}
