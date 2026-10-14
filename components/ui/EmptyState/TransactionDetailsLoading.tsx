import { Icon } from '../Icon'
import styles from './EmptyState.module.css'

export interface TransactionDetailsLoadingProps {
  onClose: () => void
}

export function TransactionDetailsLoading({ onClose }: TransactionDetailsLoadingProps) {
  return (
    <section
      className={`${styles.panel} ${styles.detailsPanel}`}
      aria-label="Loading transaction details"
      aria-busy="true"
    >
      <header className={styles.detailsHeader}>
        <h2>Transaction details</h2>
        <button
          type="button"
          className={styles.closeButton}
          aria-label="Close transaction details"
          onClick={onClose}
        >
          <Icon name="close" size={22} />
        </button>
      </header>
      <div className={styles.detailsSkeleton}>
        <span className={`${styles.skeleton} ${styles.avatarSkeleton}`} />
        <span className={`${styles.skeleton} ${styles.shortCenteredSkeleton}`} />
        <span className={`${styles.skeleton} ${styles.wideCenteredSkeleton}`} />
        <span className={`${styles.skeleton} ${styles.pillSkeleton}`} />
      </div>
      <div className={styles.detailsRows} aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div className={styles.detailsSkeletonRow} key={index}>
            <span className={`${styles.skeleton} ${styles.detailLabelSkeleton}`} />
            <span className={`${styles.skeleton} ${styles.detailValueSkeleton}`} />
          </div>
        ))}
      </div>
      <span className="visually-hidden" role="status">
        Loading transaction details
      </span>
    </section>
  )
}
